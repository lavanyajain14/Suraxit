/*
 * Suraxit — ESP32 Sensor Node (Node A)
 * ─────────────────────────────────────
 * Reads MPU6050 (accel/gyro), MAX30105 (SpO2), gas sensor (analog).
 * Normal mode  : HTTP POST JSON to Flask server every 1 s.
 * Blackout mode: If Wi-Fi fails 3× in a row, broadcasts an ESP-NOW
 *                emergency packet so a nearby relay node can forward it.
 *
 * ESP-NOW and Wi-Fi coexist — no mode switching required.
 *
 * Wiring (default):
 *   MPU6050  → SDA=21, SCL=22
 *   MAX30105 → same I2C bus
 *   SSD1306  → same I2C bus, addr 0x3C
 *   MQ-135   → A0 (GPIO 36)
 *   Buzzer   → GPIO 25
 *
 * ⚠️  Change WIFI_SSID, WIFI_PASS, SERVER_IP below for your network.
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <MPU6050.h>
#include "MAX30105.h"
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <esp_now.h>
#include <esp_wifi.h>

#include "../protocol.h"   // shared packet definitions

// ═══════════════════════════════════════════
//  USER CONFIG — change these for your setup
// ═══════════════════════════════════════════
#define WIFI_SSID     "KP"
#define WIFI_PASS     "987654321"
#define SERVER_IP     "172.18.235.57"
#define SERVER_PORT   5000
#define SERVER_PATH   "/api/sensors/push"

// Pin assignments
#define GAS_PIN       36   // analog (MQ-135 AO pin)
#define BUZZER_PIN    25
#define SCREEN_WIDTH  128
#define SCREEN_HEIGHT 64

// ═══════════════════════════════════════════
//  Globals
// ═══════════════════════════════════════════
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
MPU6050 mpu;
MAX30105 particleSensor;

unsigned long lastPush       = 0;
unsigned long lastOLED       = 0;
unsigned long lastHeartbeat  = 0;
unsigned long lastReconnect  = 0;
unsigned long startTime;

float simulatedHR = 72.0;
float baseHR      = 72.0;

// ── Blackout / ESP-NOW state ──
bool   blackoutMode     = false;
int    wifiFailCount    = 0;
bool   espNowReady      = false;

// Broadcast address (all peers) — replace with relay MAC for unicast
uint8_t broadcastMAC[] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF};

// ═══════════════════════════════════════════
//  ESP-NOW send callback
// ═══════════════════════════════════════════
void onDataSent(const uint8_t *mac_addr, esp_now_send_status_t status) {
    Serial.printf("[ESP-NOW] Send %s\n",
                  status == ESP_NOW_SEND_SUCCESS ? "OK" : "FAIL");
}

// ═══════════════════════════════════════════
//  ESP-NOW receive callback (for ACKs)
// ═══════════════════════════════════════════
void onDataRecv(const uint8_t *mac_addr, const uint8_t *data, int len) {
    if (len < 1) return;
    uint8_t pkt_type = data[0];
    if (pkt_type == PKT_ACK) {
        Serial.println("[ESP-NOW] Received ACK from relay");
    } else if (pkt_type == PKT_HEARTBEAT) {
        Serial.println("[ESP-NOW] Relay heartbeat received — mesh alive");
    }
}

// ═══════════════════════════════════════════
//  Init ESP-NOW (runs alongside Wi-Fi)
// ═══════════════════════════════════════════
void initESPNow() {
    if (esp_now_init() != ESP_OK) {
        Serial.println("[ESP-NOW] Init FAILED");
        return;
    }
    esp_now_register_send_cb(onDataSent);
    esp_now_register_recv_cb(onDataRecv);

    // Add broadcast peer
    esp_now_peer_info_t peer;
    memset(&peer, 0, sizeof(peer));
    memcpy(peer.peer_addr, broadcastMAC, 6);
    peer.channel = 0;  // use current Wi-Fi channel
    peer.encrypt = false;

    if (esp_now_add_peer(&peer) == ESP_OK) {
        espNowReady = true;
        Serial.println("[ESP-NOW] Ready — broadcast peer added");
    }
}

// ═══════════════════════════════════════════
//  Build & send emergency packet via ESP-NOW
// ═══════════════════════════════════════════
void broadcastEmergency(uint8_t alertType, float fallProb, uint8_t spo2Val,
                        uint16_t hr, float gasPpm, float accelMag) {
    if (!espNowReady) return;

    EmergencyPacket pkt;
    memset(&pkt, 0, sizeof(pkt));
    pkt.packet_type    = PKT_EMERGENCY;
    WiFi.macAddress(pkt.origin_mac);
    pkt.timestamp      = (uint32_t)(millis() / 1000);
    pkt.alert_type     = alertType;
    pkt.fall_prob      = fallProb;
    pkt.spo2           = spo2Val;
    pkt.heart_rate     = hr;
    pkt.gas_ppm        = gasPpm;
    pkt.accel_magnitude = accelMag;
    pkt.hop_count      = 0;
    memset(pkt.relay_mac, 0, 6);

    esp_err_t result = esp_now_send(broadcastMAC, (uint8_t *)&pkt, sizeof(pkt));
    Serial.printf("[ESP-NOW] Emergency broadcast %s (alert=%d, fall=%.2f)\n",
                  result == ESP_OK ? "SENT" : "FAIL", alertType, fallProb);

    // Buzzer alert
    tone(BUZZER_PIN, 2000, 500);
}

// ═══════════════════════════════════════════
//  Send heartbeat via ESP-NOW
// ═══════════════════════════════════════════
void sendHeartbeat() {
    if (!espNowReady) return;

    HeartbeatPacket hb;
    memset(&hb, 0, sizeof(hb));
    hb.packet_type    = PKT_HEARTBEAT;
    WiFi.macAddress(hb.origin_mac);
    hb.timestamp      = (uint32_t)(millis() / 1000);
    hb.battery_pct    = 0xFF;  // unknown
    hb.wifi_connected = (WiFi.status() == WL_CONNECTED) ? 1 : 0;

    esp_now_send(broadcastMAC, (uint8_t *)&hb, sizeof(hb));
}

// ═══════════════════════════════════════════
//  SETUP
// ═══════════════════════════════════════════
void setup() {
    Serial.begin(115200);
    Wire.begin();

    // ── Wi-Fi ──
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    Serial.print("[WiFi] Connecting");
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    if (WiFi.status() == WL_CONNECTED) {
        Serial.printf("\n[WiFi] Connected — IP: %s\n", WiFi.localIP().toString().c_str());
    } else {
        Serial.println("\n[WiFi] Connection failed — starting in blackout mode");
        blackoutMode = true;
    }

    // ── ESP-NOW (coexists with Wi-Fi) ──
    initESPNow();

    // ── MPU6050 ──
    mpu.initialize();
    if (mpu.testConnection()) {
        Serial.println("[MPU6050] Connected");
    } else {
        Serial.println("[MPU6050] Connection FAILED");
    }

    // ── MAX30105 SpO2 ──
    if (particleSensor.begin(Wire, I2C_SPEED_FAST)) {
        byte ledBrightness = 30;
        byte sampleAverage = 4;
        byte ledMode       = 2;
        int  sampleRate    = 100;
        int  pulseWidth    = 411;
        int  adcRange      = 32768;
        particleSensor.setup(ledBrightness, sampleAverage, ledMode,
                             sampleRate, pulseWidth, adcRange);
        Serial.println("[MAX30105] Connected");
    } else {
        Serial.println("[MAX30105] Not found — SpO2 will be 0");
    }

    // ── OLED ──
    if (display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
        display.clearDisplay();
        display.setTextColor(WHITE);
        display.setTextSize(1);
        display.setCursor(0, 0);
        display.println("Suraxit Sensor Node");
        display.println("Initializing...");
        display.display();
        Serial.println("[OLED] Ready");
    }

    // ── Gas sensor pin ──
    pinMode(GAS_PIN, INPUT);

    // ── Buzzer ──
    pinMode(BUZZER_PIN, OUTPUT);

    randomSeed(analogRead(0));
    startTime = millis();

    Serial.println("\n=== Suraxit Sensor Node Ready ===\n");
}

// ═══════════════════════════════════════════
//  LOOP
// ═══════════════════════════════════════════
void loop() {
    unsigned long now = millis();

    // ── 1. Read MPU6050 (accel + gyro) ──
    int16_t ax_raw, ay_raw, az_raw, gx_raw, gy_raw, gz_raw;
    mpu.getMotion6(&ax_raw, &ay_raw, &az_raw, &gx_raw, &gy_raw, &gz_raw);

    float ax_g = ax_raw / 16384.0;
    float ay_g = ay_raw / 16384.0;
    float az_g = az_raw / 16384.0;
    float gx_dps = gx_raw / 131.0;  // degrees per second
    float gy_dps = gy_raw / 131.0;
    float gz_dps = gz_raw / 131.0;

    float accelMag = sqrt(ax_g * ax_g + ay_g * ay_g + az_g * az_g);

    // ── 2. Read SpO2 ──
    long irValue  = particleSensor.getIR();
    long redValue = particleSensor.getRed();
    float spo2 = 0;

    if (irValue > 15000) {
        float ratio = (float)redValue / (float)irValue;
        spo2 = 110 - (25 * ratio);
        spo2 = constrain(spo2, 0, 100);
    }

    // ── 3. Simulated HR (breathing pattern + HRV noise) ──
    float t = (now - startTime) / 1000.0;
    float breathingEffect = 2.0 * sin(2 * PI * 0.2 * t);
    float hrvNoise = random(-5, 6) * 0.05;
    simulatedHR = baseHR + breathingEffect + hrvNoise;
    simulatedHR = constrain(simulatedHR, 60, 110);

    // ── 4. Read gas sensor (analog → ppm estimate) ──
    int gasRaw = analogRead(GAS_PIN);
    float gasPpm = gasRaw * (100.0 / 4095.0);  // rough 0–100 ppm mapping

    // ── 5. Fall detection (threshold) ──
    float fallProb = 0.05;
    if (accelMag > FALL_ACCEL_THRESHOLD) {
        fallProb = 0.85;
    } else if (accelMag > FALL_ACCEL_WARNING) {
        fallProb = 0.30;
    }
    bool fallDetected = (fallProb > 0.5);

    // ── 6. Determine alert type (if any) ──
    uint8_t alertType = 0;
    if (fallDetected) {
        alertType = ALERT_FALL;
    } else if (spo2 > 0 && spo2 < SPO2_CRITICAL) {
        alertType = ALERT_LOW_SPO2;
    } else if (gasPpm > GAS_HAZARDOUS) {
        alertType = ALERT_GAS;
    }

    // ── 7. Push data to Flask server (every 1 s) ──
    if (now - lastPush >= DATA_PUSH_INTERVAL_MS) {
        lastPush = now;

        if (WiFi.status() == WL_CONNECTED) {
            HTTPClient http;
            String url = String("http://") + SERVER_IP + ":" + SERVER_PORT + SERVER_PATH;
            http.begin(url);
            http.addHeader("Content-Type", "application/json");
            http.setTimeout(3000);

            // Build JSON matching the server's expected format
            String json = "{";
            json += "\"ax\":" + String(ax_g, 4) + ",";
            json += "\"ay\":" + String(ay_g, 4) + ",";
            json += "\"az\":" + String(az_g, 4) + ",";
            json += "\"gx\":" + String(gx_dps, 2) + ",";
            json += "\"gy\":" + String(gy_dps, 2) + ",";
            json += "\"gz\":" + String(gz_dps, 2) + ",";
            json += "\"hr\":" + String(simulatedHR, 1) + ",";
            json += "\"spo2\":" + String(spo2, 1) + ",";
            json += "\"gas\":" + String(gasPpm, 1);
            json += "}";

            int code = http.POST(json);

            if (code > 0) {
                Serial.printf("[HTTP] POST OK (%d)\n", code);
                wifiFailCount = 0;
                if (blackoutMode) {
                    blackoutMode = false;
                    Serial.println("[MODE] Wi-Fi restored — exiting blackout");
                }
            } else {
                wifiFailCount++;
                Serial.printf("[HTTP] POST FAIL (%s) — fail count: %d\n",
                              http.errorToString(code).c_str(), wifiFailCount);
                if (wifiFailCount >= BLACKOUT_THRESHOLD) {
                    blackoutMode = true;
                    Serial.println("[MODE] *** BLACKOUT MODE ACTIVATED ***");
                }
            }
            http.end();
        } else {
            wifiFailCount++;
            if (wifiFailCount >= BLACKOUT_THRESHOLD && !blackoutMode) {
                blackoutMode = true;
                Serial.println("[MODE] *** BLACKOUT — Wi-Fi disconnected ***");
            }
        }

        // ── Emergency in blackout → ESP-NOW broadcast ──
        if (blackoutMode && alertType > 0) {
            Serial.printf("[BLACKOUT] Emergency detected (alert=%d) — ESP-NOW broadcast\n", alertType);
            broadcastEmergency(alertType, fallProb, (uint8_t)spo2,
                               (uint16_t)simulatedHR, gasPpm, accelMag);
        }

        // ── Also broadcast emergency via ESP-NOW even when Wi-Fi is up ──
        //    (redundant path for extra reliability)
        if (!blackoutMode && alertType == ALERT_FALL) {
            broadcastEmergency(alertType, fallProb, (uint8_t)spo2,
                               (uint16_t)simulatedHR, gasPpm, accelMag);
        }
    }

    // ── 8. Heartbeat via ESP-NOW (every 5 s) ──
    if (now - lastHeartbeat >= HEARTBEAT_INTERVAL_MS) {
        lastHeartbeat = now;
        sendHeartbeat();
    }

    // ── 9. Wi-Fi reconnect attempt (every 10 s in blackout) ──
    if (blackoutMode && (now - lastReconnect >= 10000)) {
        lastReconnect = now;
        Serial.println("[WiFi] Attempting reconnect...");
        WiFi.disconnect();
        WiFi.begin(WIFI_SSID, WIFI_PASS);
    }

    // ── 10. OLED display update (every 500 ms) ──
    if (now - lastOLED >= 500) {
        lastOLED = now;

        display.clearDisplay();
        display.setCursor(0, 0);
        display.setTextSize(1);

        if (blackoutMode) {
            display.println("!! BLACKOUT MODE !!");
            display.println("ESP-NOW Mesh Active");
            display.println("");
        } else {
            display.println("Suraxit - Live");
            display.print("WiFi: ");
            display.println(WiFi.localIP().toString());
        }

        display.print("AX:"); display.print(ax_g, 2);
        display.print(" AY:"); display.println(ay_g, 2);
        display.print("AZ:"); display.print(az_g, 2);
        display.print(" M:"); display.println(accelMag, 2);
        display.print("HR:"); display.print(simulatedHR, 0);
        display.print(" SpO2:"); display.println(spo2, 0);
        display.print("Gas:"); display.print(gasPpm, 0);
        display.print("ppm");

        if (fallDetected) {
            display.println("");
            display.println("*** FALL DETECTED ***");
        }

        display.display();
    }

    // ── Buzzer on emergency ──
    if (fallDetected) {
        tone(BUZZER_PIN, 2000, 200);
    }

    delay(10);  // yield
}
