/*
 * Suraxit — ESP32 Relay Node (Node B)
 * ────────────────────────────────────
 * Listens for ESP-NOW emergency & heartbeat packets from Node A.
 * If this node has Wi-Fi, it relays the emergency to the Flask server
 * which then pushes an "Orphan Transaction" to Solana.
 * If Wi-Fi is also down here, it re-broadcasts with hop_count++ (mesh hop).
 *
 * ⚠️  Change WIFI_SSID, WIFI_PASS, SERVER_IP below for your network.
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <esp_now.h>
#include <esp_wifi.h>

#include "../protocol.h"

#define WIFI_SSID   "KP"
#define WIFI_PASS   "987654321"
#define SERVER_IP   "172.18.235.57"
#define SERVER_PORT 5000

#define LED_PIN     2   

unsigned long lastHeartbeatSend = 0;
bool espNowReady = false;

uint8_t broadcastMAC[] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF};

DeduplicateEntry dedupTable[DEDUP_TABLE_SIZE];
int dedupIndex = 0;

volatile unsigned long lastPacketTime     = 0;
volatile unsigned long lastHeartbeatRecv  = 0;
volatile int           totalRelayed       = 0;
volatile int           totalHeartbeats    = 0;


bool isDuplicate(const uint8_t *mac, uint32_t ts) {
    for (int i = 0; i < DEDUP_TABLE_SIZE; i++) {
        if (memcmp(dedupTable[i].mac, mac, 6) == 0 && dedupTable[i].timestamp == ts) {
            return true;
        }
    }
    memcpy(dedupTable[dedupIndex].mac, mac, 6);
    dedupTable[dedupIndex].timestamp = ts;
    dedupIndex = (dedupIndex + 1) % DEDUP_TABLE_SIZE;
    return false;
}


bool relayToServer(const EmergencyPacket *pkt) {
    if (WiFi.status() != WL_CONNECTED) return false;

    HTTPClient http;
    String url = String("http://") + SERVER_IP + ":" + SERVER_PORT + "/api/emergency/relay";
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(5000);

    // Convert MAC to string
    char originMAC[18];
    snprintf(originMAC, sizeof(originMAC), "%02X:%02X:%02X:%02X:%02X:%02X",
             pkt->origin_mac[0], pkt->origin_mac[1], pkt->origin_mac[2],
             pkt->origin_mac[3], pkt->origin_mac[4], pkt->origin_mac[5]);

    char relayMAC[18];
    uint8_t myMAC[6];
    WiFi.macAddress(myMAC);
    snprintf(relayMAC, sizeof(relayMAC), "%02X:%02X:%02X:%02X:%02X:%02X",
             myMAC[0], myMAC[1], myMAC[2], myMAC[3], myMAC[4], myMAC[5]);

    String json = "{";
    json += "\"origin_mac\":\"" + String(originMAC) + "\",";
    json += "\"relay_mac\":\"" + String(relayMAC) + "\",";
    json += "\"alert_type\":" + String(pkt->alert_type) + ",";
    json += "\"fall_prob\":" + String(pkt->fall_prob, 4) + ",";
    json += "\"spo2\":" + String(pkt->spo2) + ",";
    json += "\"heart_rate\":" + String(pkt->heart_rate) + ",";
    json += "\"gas_ppm\":" + String(pkt->gas_ppm, 1) + ",";
    json += "\"accel_magnitude\":" + String(pkt->accel_magnitude, 4) + ",";
    json += "\"hop_count\":" + String(pkt->hop_count) + ",";
    json += "\"timestamp\":" + String(pkt->timestamp) + ",";
    json += "\"is_orphan\":true";
    json += "}";

    int code = http.POST(json);
    http.end();

    Serial.printf("[RELAY] HTTP POST → %d\n", code);
    return (code >= 200 && code < 300);
}


void onDataRecv(const uint8_t *mac_addr, const uint8_t *data, int len) {
    if (len < 1) return;

    uint8_t pktType = data[0];

    // ── Handle Heartbeat ──
    if (pktType == PKT_HEARTBEAT && len >= (int)sizeof(HeartbeatPacket)) {
        HeartbeatPacket hb;
        memcpy(&hb, data, sizeof(HeartbeatPacket));
        lastHeartbeatRecv = millis();
        totalHeartbeats++;

        char macStr[18];
        snprintf(macStr, sizeof(macStr), "%02X:%02X:%02X:%02X:%02X:%02X",
                 hb.origin_mac[0], hb.origin_mac[1], hb.origin_mac[2],
                 hb.origin_mac[3], hb.origin_mac[4], hb.origin_mac[5]);
        Serial.printf("[ESP-NOW] Heartbeat from %s (wifi=%d)\n", macStr, hb.wifi_connected);

        // Also notify server about heartbeat
        if (WiFi.status() == WL_CONNECTED) {
            HTTPClient http;
            String url = String("http://") + SERVER_IP + ":" + SERVER_PORT + "/api/mesh/heartbeat";
            http.begin(url);
            http.addHeader("Content-Type", "application/json");
            http.setTimeout(2000);

            String json = "{\"node\":\"sensor\",\"mac\":\"" + String(macStr) + "\",";
            json += "\"wifi\":" + String(hb.wifi_connected) + ",";
            json += "\"battery\":" + String(hb.battery_pct) + "}";
            http.POST(json);
            http.end();
        }

        // Blink LED — yellow flash for heartbeat
        digitalWrite(LED_PIN, HIGH);
        delay(50);
        digitalWrite(LED_PIN, LOW);
        return;
    }

    // ── Handle Emergency ──
    if (pktType == PKT_EMERGENCY && len >= (int)sizeof(EmergencyPacket)) {
        EmergencyPacket pkt;
        memcpy(&pkt, data, sizeof(EmergencyPacket));

        // Deduplicate
        if (isDuplicate(pkt.origin_mac, pkt.timestamp)) {
            Serial.println("[ESP-NOW] Duplicate emergency — skipping");
            return;
        }

        // Hop count check
        if (pkt.hop_count >= MAX_HOP_COUNT) {
            Serial.println("[ESP-NOW] Max hops reached — dropping");
            return;
        }

        lastPacketTime = millis();

        char macStr[18];
        snprintf(macStr, sizeof(macStr), "%02X:%02X:%02X:%02X:%02X:%02X",
                 pkt.origin_mac[0], pkt.origin_mac[1], pkt.origin_mac[2],
                 pkt.origin_mac[3], pkt.origin_mac[4], pkt.origin_mac[5]);

        Serial.printf("\n[ESP-NOW] *** EMERGENCY from %s ***\n", macStr);
        Serial.printf("  Alert: %d | Fall: %.2f | SpO2: %d | HR: %d | Gas: %.1f\n",
                       pkt.alert_type, pkt.fall_prob, pkt.spo2,
                       pkt.heart_rate, pkt.gas_ppm);
        Serial.printf("  Hops: %d | AccelMag: %.2f\n", pkt.hop_count, pkt.accel_magnitude);

        // RAPID LED blink — emergency
        for (int i = 0; i < 10; i++) {
            digitalWrite(LED_PIN, HIGH); delay(50);
            digitalWrite(LED_PIN, LOW);  delay(50);
        }

        // Try to relay to server
        if (relayToServer(&pkt)) {
            Serial.println("[RELAY] ✓ Emergency relayed to server (Orphan Tx path)");
            totalRelayed++;

            // Send ACK back to sensor node
            uint8_t ack = PKT_ACK;
            esp_now_send(mac_addr, &ack, 1);
        } else {
            // Wi-Fi down here too — re-broadcast with incremented hop
            Serial.println("[RELAY] Wi-Fi down — re-broadcasting (mesh hop)");
            pkt.hop_count++;
            WiFi.macAddress(pkt.relay_mac);
            esp_now_send(broadcastMAC, (uint8_t *)&pkt, sizeof(pkt));
        }
    }
}

// ═══════════════════════════════════════════
//  ESP-NOW send callback
// ═══════════════════════════════════════════
void onDataSent(const uint8_t *mac_addr, esp_now_send_status_t status) {
    // Silent
}

// ═══════════════════════════════════════════
//  SETUP
// ═══════════════════════════════════════════
void setup() {
    Serial.begin(115200);
    pinMode(LED_PIN, OUTPUT);
    digitalWrite(LED_PIN, LOW);

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
        Serial.println("\n[WiFi] Failed — will relay via mesh only");
    }

    // ── ESP-NOW ──
    if (esp_now_init() != ESP_OK) {
        Serial.println("[ESP-NOW] Init FAILED");
        return;
    }
    esp_now_register_recv_cb(onDataRecv);
    esp_now_register_send_cb(onDataSent);

    // Add broadcast peer for re-broadcasting
    esp_now_peer_info_t peer;
    memset(&peer, 0, sizeof(peer));
    memcpy(peer.peer_addr, broadcastMAC, 6);
    peer.channel = 0;
    peer.encrypt = false;
    esp_now_add_peer(&peer);

    espNowReady = true;

    // Clear dedup table
    memset(dedupTable, 0, sizeof(dedupTable));

    Serial.println("\n=== Suraxit Relay Node Ready ===");
    Serial.println("Listening for ESP-NOW packets...\n");

    // Startup LED pattern
    for (int i = 0; i < 3; i++) {
        digitalWrite(LED_PIN, HIGH); delay(200);
        digitalWrite(LED_PIN, LOW);  delay(200);
    }
}

// ═══════════════════════════════════════════
//  LOOP
// ═══════════════════════════════════════════
void loop() {
    unsigned long now = millis();

    // ── Send own heartbeat (every 5 s) ──
    if (now - lastHeartbeatSend >= HEARTBEAT_INTERVAL_MS) {
        lastHeartbeatSend = now;

        HeartbeatPacket hb;
        memset(&hb, 0, sizeof(hb));
        hb.packet_type    = PKT_HEARTBEAT;
        WiFi.macAddress(hb.origin_mac);
        hb.timestamp      = (uint32_t)(now / 1000);
        hb.battery_pct    = 0xFF;
        hb.wifi_connected = (WiFi.status() == WL_CONNECTED) ? 1 : 0;

        esp_now_send(broadcastMAC, (uint8_t *)&hb, sizeof(hb));

        // Also report own status to server
        if (WiFi.status() == WL_CONNECTED) {
            HTTPClient http;
            String url = String("http://") + SERVER_IP + ":" + SERVER_PORT + "/api/mesh/heartbeat";
            http.begin(url);
            http.addHeader("Content-Type", "application/json");
            http.setTimeout(2000);

            char mac[18];
            uint8_t m[6];
            WiFi.macAddress(m);
            snprintf(mac, sizeof(mac), "%02X:%02X:%02X:%02X:%02X:%02X",
                     m[0], m[1], m[2], m[3], m[4], m[5]);

            String json = "{\"node\":\"relay\",\"mac\":\"" + String(mac) + "\",";
            json += "\"wifi\":1,\"battery\":255,";
            json += "\"total_relayed\":" + String(totalRelayed) + ",";
            json += "\"total_heartbeats\":" + String(totalHeartbeats) + "}";
            http.POST(json);
            http.end();
        }

        // Gentle LED blink
        digitalWrite(LED_PIN, HIGH);
        delay(30);
        digitalWrite(LED_PIN, LOW);
    }

    // ── Wi-Fi reconnect attempt every 15 s ──
    static unsigned long lastReconnect = 0;
    if (WiFi.status() != WL_CONNECTED && (now - lastReconnect >= 15000)) {
        lastReconnect = now;
        Serial.println("[WiFi] Attempting reconnect...");
        WiFi.disconnect();
        WiFi.begin(WIFI_SSID, WIFI_PASS);
    }

    delay(10);  // yield
}
