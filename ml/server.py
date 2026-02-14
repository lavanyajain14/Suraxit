

from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
import os
import time
import math
import threading
import json

# TensorFlow is optional — works without it using threshold-based detection
try:
    import tensorflow as tf
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False
    print("[INFO] TensorFlow not installed — using threshold-based fall detection")

app = Flask(__name__)
CORS(app)

# ── Load TFLite model ──
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.tflite")

interpreter = None
input_details = None
output_details = None

def load_model():
    global interpreter, input_details, output_details
    if not TF_AVAILABLE:
        print("[INFO] Skipping model load — TensorFlow not available")
        return
    if os.path.exists(MODEL_PATH):
        interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
        interpreter.allocate_tensors()
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        print(f"[OK] TFLite model loaded — input shape: {input_details[0]['shape']}")
    else:
        print(f"[WARN] model.tflite not found at {MODEL_PATH}")

load_model()


# ── Simulated sensor state ──
class SensorState:
    """Simulates realistic sensor readings that drift over time."""
    def __init__(self):
        self.start = time.time()

    def get_readings(self):
        t = time.time() - self.start

        # Accelerometer — gentle sway for a walking/standing person
        ax = round(0.02 * math.sin(t * 0.5) + np.random.normal(0, 0.005), 4)
        ay = round(-0.01 * math.cos(t * 0.3) + np.random.normal(0, 0.005), 4)
        az = round(1.0 + 0.005 * math.sin(t * 0.7) + np.random.normal(0, 0.002), 4)

        # Gyroscope (degrees/s)
        gx = round(np.random.normal(0, 0.3), 2)
        gy = round(np.random.normal(0, 0.3), 2)
        gz = round(np.random.normal(0, 0.15), 2)

        # SPO2 — stable around 96-99%
        spo2 = int(np.clip(97 + np.random.normal(0, 0.8), 90, 100))

        # Heart rate — resting 65-80 bpm
        heart_rate = int(np.clip(72 + np.random.normal(0, 3), 55, 120))

        # Gas / air quality (ppm) — safe zone
        gas_ppm = round(np.clip(12.0 + np.random.normal(0, 2), 0, 100), 1)

        # Temperature (°C) from device
        temperature = round(np.clip(28.5 + np.random.normal(0, 0.5), 20, 50), 1)

        # Humidity (%)
        humidity = round(np.clip(55 + np.random.normal(0, 3), 20, 100), 1)

        return {
            "accelerometer": {"x": ax, "y": ay, "z": az},
            "gyroscope": {"x": gx, "y": gy, "z": gz},
            "spo2": spo2,
            "heart_rate": heart_rate,
            "gas_ppm": gas_ppm,
            "temperature": temperature,
            "humidity": humidity,
            "timestamp": time.time()
        }

sensors = SensorState()


# ── Hardware data store (receives real ESP32 pushes) ──
class HardwareDataStore:
    """Stores the latest reading pushed by a real ESP32 over HTTP."""
    def __init__(self):
        self.lock = threading.Lock()
        self.latest = None       # dict with ax, ay, az, gx, gy, gz, hr, spo2, gas
        self.received_at = 0     # time.time() when last received
        self.push_count = 0

    def update(self, data):
        with self.lock:
            self.latest = data
            self.received_at = time.time()
            self.push_count += 1

    def get(self, max_age=5.0):
        """Return latest reading if fresh (< max_age seconds), else None."""
        with self.lock:
            if self.latest and (time.time() - self.received_at) < max_age:
                return self.latest
            return None

    @property
    def is_online(self):
        with self.lock:
            return self.latest is not None and (time.time() - self.received_at) < 10.0

hardware = HardwareDataStore()


# ── Mesh network state ──
class MeshState:
    """Tracks ESP-NOW mesh network nodes, heartbeats, and emergency relays."""
    def __init__(self):
        self.lock = threading.Lock()
        self.nodes = {}               # mac -> {node, mac, wifi, battery, last_seen, ...}
        self.emergency_history = []    # list of emergency events
        self.blackout_mode = False
        self.blackout_until = 0       # timestamp when blackout simulation ends

    def update_heartbeat(self, data):
        with self.lock:
            mac = data.get("mac", "unknown")
            self.nodes[mac] = {
                "node_type": data.get("node", "unknown"),
                "mac": mac,
                "wifi": data.get("wifi", 0),
                "battery": data.get("battery", 255),
                "last_seen": time.time(),
                "total_relayed": data.get("total_relayed", 0),
                "total_heartbeats": data.get("total_heartbeats", 0),
            }

    def add_emergency(self, data):
        with self.lock:
            event = {
                **data,
                "server_received_at": time.time(),
                "solana_tx": None,       # filled after chain submission
                "acknowledged": False,
            }
            self.emergency_history.append(event)
            # Keep last 50
            if len(self.emergency_history) > 50:
                self.emergency_history = self.emergency_history[-50:]
            return event

    def get_status(self):
        with self.lock:
            now = time.time()
            # Check if blackout simulation is still active
            if self.blackout_mode and now > self.blackout_until:
                self.blackout_mode = False

            node_list = []
            for mac, info in self.nodes.items():
                node_list.append({
                    **info,
                    "online": (now - info["last_seen"]) < 15.0,
                    "seconds_ago": round(now - info["last_seen"], 1),
                })

            return {
                "nodes": node_list,
                "mesh_active": any(n["online"] for n in node_list),
                "blackout_mode": self.blackout_mode,
                "blackout_remaining": max(0, round(self.blackout_until - now, 1)) if self.blackout_mode else 0,
                "total_emergencies": len(self.emergency_history),
                "recent_emergencies": self.emergency_history[-5:][::-1],
            }

    def start_blackout(self, duration=30):
        with self.lock:
            self.blackout_mode = True
            self.blackout_until = time.time() + duration

    def stop_blackout(self):
        with self.lock:
            self.blackout_mode = False
            self.blackout_until = 0

mesh = MeshState()


def predict_fall(accel_data):
    """Run fall detection inference on accelerometer features."""
    if interpreter is None:
        # Fallback: simple threshold-based detection
        magnitude = math.sqrt(
            accel_data["x"]**2 + accel_data["y"]**2 + accel_data["z"]**2
        )
        # Normal gravity ≈ 1g; a fall produces a spike > 2g
        if magnitude > 2.5:
            return 0.85
        elif magnitude > 1.8:
            return 0.3
        return 0.05

    # Build 561-feature vector (pad with sensor data)
    num_features = input_details[0]['shape'][1]
    features = np.zeros((1, num_features), dtype=np.float32)

    # Place accelerometer readings in first features (matches training data layout)
    features[0, 0] = accel_data["x"]
    features[0, 1] = accel_data["y"]
    features[0, 2] = accel_data["z"]

    interpreter.set_tensor(input_details[0]['index'], features)
    interpreter.invoke()
    output = interpreter.get_tensor(output_details[0]['index'])

    return float(output[0][0])


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": interpreter is not None,
        "uptime": round(time.time() - sensors.start, 1)
    })


@app.route("/api/sensors", methods=["GET"])
def get_sensor_data():
    """Returns all current sensor readings + ML prediction.
    Uses real ESP32 hardware data when available, falls back to simulation."""

    hw = hardware.get(max_age=5.0)

    if not hw:
        return jsonify({
            "data_source": "waiting",
            "hardware_online": False,
            "message": "No ESP32 data received yet. Waiting for hardware...",
            "push_count": hardware.push_count,
            "timestamp": time.time()
        })

    data_source = "hardware"

    # ── Real hardware data from ESP32 (only ax, ay, az, hr, spo2) ──
    accel = {"x": hw.get("ax", 0), "y": hw.get("ay", 0), "z": hw.get("az", 0)}
    spo2_val   = int(hw.get("spo2", 0))
    hr_val     = int(hw.get("hr", 0))

   
    fall_probability = predict_fall(accel)
    fall_detected = fall_probability > 0.5
    accel_magnitude = math.sqrt(accel["x"]**2 + accel["y"]**2 + accel["z"]**2)

    # Activity classification
    if accel_magnitude < 0.5:
        activity = "Stationary"
    elif accel_magnitude < 1.2:
        activity = "Stable"
    elif accel_magnitude < 2.0:
        activity = "Walking"
    else:
        activity = "High Motion"

    # SPO2 status
    if spo2_val >= 95:
        spo2_status = "Normal Range"
    elif spo2_val >= 90:
        spo2_status = "Low — Monitor"
    else:
        spo2_status = "Critical — Alert"

    mesh_status = mesh.get_status()

    return jsonify({
        "data_source": data_source,
        "spo2": {
            "value": spo2_val,
            "status": spo2_status,
            "unit": "%"
        },
        "heart_rate": {
            "value": hr_val,
            "unit": "bpm"
        },
        "accelerometer": {
            "x": round(accel["x"], 4),
            "y": round(accel["y"], 4),
            "z": round(accel["z"], 4),
            "magnitude": round(accel_magnitude, 4),
            "activity": activity
        },
        "fall_detection": {
            "probability": round(fall_probability, 4),
            "detected": fall_detected,
            "status": "Fall Detected!" if fall_detected else "No Falls",
            "sensitivity": "High"
        },
        "mesh": {
            "active": mesh_status["mesh_active"],
            "blackout": mesh_status["blackout_mode"],
            "node_count": len(mesh_status["nodes"]),
        },
        "timestamp": time.time()
    })


@app.route("/api/predict", methods=["GET"])
def predict():
    """Standalone fall prediction endpoint."""
    readings = sensors.get_readings()
    prob = predict_fall(readings["accelerometer"])
    return jsonify({
        "fall_probability": round(prob, 4),
        "fall_detected": prob > 0.5,
        "accelerometer": readings["accelerometer"]
    })




@app.route("/api/sensors/push", methods=["POST"])
def push_sensor_data():
    """Receives real sensor data from ESP32 sensor node.
    Expected JSON: {ax, ay, az, gx, gy, gz, hr, spo2, gas}
    """
    # Check if blackout simulation is active (reject to simulate Wi-Fi failure)
    if mesh.blackout_mode and time.time() < mesh.blackout_until:
        return jsonify({"error": "blackout_simulation", "message": "Simulated Wi-Fi failure"}), 503

    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify({"error": "invalid JSON"}), 400

    hardware.update(data)

    accel = {"x": data.get("ax", 0), "y": data.get("ay", 0), "z": data.get("az", 0)}
    fall_prob = predict_fall(accel)
    fall_detected = fall_prob > 0.5

    print(f"[HW] Push #{hardware.push_count}: ax={accel['x']:.3f} ay={accel['y']:.3f} az={accel['z']:.3f} "
          f"hr={data.get('hr', 0):.0f} spo2={data.get('spo2', 0):.0f} "
          f"fall={fall_prob:.2f}{'  *** FALL ***' if fall_detected else ''}")

    return jsonify({
        "status": "ok",
        "push_count": hardware.push_count,
        "fall_probability": round(fall_prob, 4),
        "fall_detected": fall_detected
    })


@app.route("/", methods=["POST"])
def push_sensor_data_root():
    """Backward-compatible endpoint — same as /api/sensors/push."""
    return push_sensor_data()


@app.route("/api/emergency/relay", methods=["POST"])
def emergency_relay():
    """Receives emergency packets from relay node (Orphan Transaction path).
    This is the key Blackout Protocol endpoint — when a relay node picks
    up an ESP-NOW emergency and forwards it here via its own Wi-Fi.
    """
    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify({"error": "invalid JSON"}), 400

    event = mesh.add_emergency(data)

    print(f"\n{'='*60}")
    print(f"  *** EMERGENCY RELAY — ORPHAN TRANSACTION ***")
    print(f"  Origin: {data.get('origin_mac', '?')}")
    print(f"  Relay:  {data.get('relay_mac', '?')}")
    print(f"  Alert:  {data.get('alert_type', '?')} | Hops: {data.get('hop_count', 0)}")
    print(f"  Fall:   {data.get('fall_prob', 0):.2f} | SpO2: {data.get('spo2', 0)}")
    print(f"  Orphan: {data.get('is_orphan', False)}")
    print(f"{'='*60}\n")


    event["solana_tx"] = None  

    return jsonify({
        "status": "received",
        "emergency_id": len(mesh.emergency_history),
        "solana_tx": event["solana_tx"],
        "message": "Emergency relayed — Orphan Transaction path"
    })


@app.route("/api/mesh/heartbeat", methods=["POST"])
def mesh_heartbeat():
    """Receives heartbeat reports from mesh nodes."""
    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify({"error": "invalid JSON"}), 400

    mesh.update_heartbeat(data)
    return jsonify({"status": "ok"})


@app.route("/api/mesh/status", methods=["GET"])
def mesh_status_endpoint():
    """Returns current mesh network state for the dashboard."""
    status = mesh.get_status()
    status["sensor_node"] = {
        "online": hardware.is_online,
        "last_push": hardware.push_count,
        "data_source": "hardware" if hardware.is_online else "simulated"
    }
    return jsonify(status)


@app.route("/api/emergency/history", methods=["GET"])
def emergency_history():
    """Returns all emergency relay events."""
    status = mesh.get_status()
    return jsonify({
        "total": status["total_emergencies"],
        "events": status["recent_emergencies"]
    })


@app.route("/api/simulate/blackout", methods=["POST"])
def simulate_blackout():
    """Simulates a Wi-Fi blackout for demo purposes.
    The server rejects ESP32 pushes for `duration` seconds,
    forcing the ESP-NOW fallback path."""
    data = request.get_json(force=True, silent=True) or {}
    duration = data.get("duration", 30)

    if mesh.blackout_mode:
        mesh.stop_blackout()
        print("[SIM] Blackout simulation STOPPED")
        return jsonify({"status": "stopped", "blackout": False})

    mesh.start_blackout(duration)
    print(f"[SIM] *** BLACKOUT SIMULATION START — {duration}s ***")
    return jsonify({
        "status": "started",
        "blackout": True,
        "duration": duration,
        "message": f"Server will reject ESP32 pushes for {duration}s"
    })


@app.route("/api/simulate/fall", methods=["POST"])
def simulate_fall():
    """Injects a simulated fall event for demo purposes."""
    fake_hw = {
        "ax": 0.5, "ay": -1.8, "az": 3.2,
        "gx": 45.0, "gy": -30.0, "gz": 12.0,
        "hr": 110, "spo2": 88, "gas": 8.0
    }
    hardware.update(fake_hw)

    print("[SIM] *** FALL SIMULATED — injected high-accel data ***")
    return jsonify({
        "status": "fall_simulated",
        "message": "Injected fall data — dashboard will show alert on next poll"
    })


if __name__ == "__main__":
    print("\n  Suraxit ML API Server + Mesh Gateway")
    print("  ────────────────────────────────────")
    print("  Sensor data   : http://localhost:3000/api/sensors")
    print("  ESP32 push    : POST http://localhost:3000/api/sensors/push")
    print("  Mesh status   : http://localhost:3000/api/mesh/status")
    print("  Emergency     : POST http://localhost:3000/api/emergency/relay")
    print("  Sim blackout  : POST http://localhost:3000/api/simulate/blackout")
    print("  Sim fall      : POST http://localhost:3000/api/simulate/fall")
    print()
    app.run(host="0.0.0.0", port=3000, debug=True)
