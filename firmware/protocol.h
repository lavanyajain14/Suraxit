/*
 * Suraxit — ESP-NOW Mesh Emergency Protocol
 * Shared header for Sensor Node & Relay Node
 *
 * Packet fits within ESP-NOW's 250-byte limit (~62 bytes used).
 */

#ifndef SURAXIT_PROTOCOL_H
#define SURAXIT_PROTOCOL_H

#include <stdint.h>

// ── Packet types ──
#define PKT_EMERGENCY   0x01
#define PKT_ACK         0x02
#define PKT_HEARTBEAT   0x03

// ── Alert types ──
#define ALERT_FALL      0x01
#define ALERT_LOW_SPO2  0x02
#define ALERT_GAS       0x03
#define ALERT_MANUAL    0x04

// ── Thresholds ──
#define FALL_ACCEL_THRESHOLD  2.5f   // g-force spike indicating a fall
#define FALL_ACCEL_WARNING    1.8f   // elevated motion warning
#define SPO2_CRITICAL         90     // below this is critical
#define SPO2_WARNING          95     // below this is a warning
#define GAS_HAZARDOUS         50.0f  // ppm — evacuate
#define GAS_MODERATE          25.0f  // ppm — monitor

// ── ESP-NOW config ──
#define MAX_HOP_COUNT         5
#define HEARTBEAT_INTERVAL_MS 5000
#define BLACKOUT_THRESHOLD    3      // consecutive Wi-Fi failures before blackout
#define DATA_PUSH_INTERVAL_MS 1000
#define DEDUP_TABLE_SIZE      16

// ── Emergency Packet (62 bytes, packed) ──
typedef struct __attribute__((packed)) {
    uint8_t  packet_type;       // PKT_EMERGENCY, PKT_ACK, PKT_HEARTBEAT
    uint8_t  origin_mac[6];     // originator MAC address
    uint32_t timestamp;         // epoch seconds (uint32 wraps in 2106)
    uint8_t  alert_type;        // ALERT_FALL, ALERT_LOW_SPO2, etc.
    float    fall_prob;         // 0.0 – 1.0
    uint8_t  spo2;             // 0 – 100
    uint16_t heart_rate;        // bpm
    float    gas_ppm;           // air quality reading
    float    accel_magnitude;   // g-force at time of alert
    uint8_t  hop_count;         // incremented at each relay
    uint8_t  relay_mac[6];      // last relay node MAC
} EmergencyPacket;

// ── Heartbeat Packet (lighter, 16 bytes) ──
typedef struct __attribute__((packed)) {
    uint8_t  packet_type;       // PKT_HEARTBEAT
    uint8_t  origin_mac[6];     // sender MAC
    uint32_t timestamp;         // epoch seconds
    uint8_t  battery_pct;       // 0–100 (0xFF = unknown)
    uint8_t  wifi_connected;    // 1 = yes, 0 = no
    uint8_t  reserved[2];       // future use
} HeartbeatPacket;

// ── Dedup entry ──
typedef struct {
    uint8_t  mac[6];
    uint32_t timestamp;
} DeduplicateEntry;

#endif // SURAXIT_PROTOCOL_H
