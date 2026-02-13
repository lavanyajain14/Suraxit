"""
Suraxit ML API Server
Serves fall detection predictions and simulated sensor data
for the React dashboard via REST API.
"""

from flask import Flask, jsonify
from flask_cors import CORS
import numpy as np
import os
import time
import math

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
    """Returns all current sensor readings + ML prediction."""
    readings = sensors.get_readings()
    fall_probability = predict_fall(readings["accelerometer"])

    # Determine statuses
    fall_detected = fall_probability > 0.5
    accel_magnitude = math.sqrt(
        readings["accelerometer"]["x"]**2 +
        readings["accelerometer"]["y"]**2 +
        readings["accelerometer"]["z"]**2
    )

    # Activity classification based on acceleration magnitude
    if accel_magnitude < 0.5:
        activity = "Stationary"
    elif accel_magnitude < 1.2:
        activity = "Stable"
    elif accel_magnitude < 2.0:
        activity = "Walking"
    else:
        activity = "High Motion"

    # Air quality status
    gas = readings["gas_ppm"]
    if gas < 25:
        air_quality = "Good"
        air_status = "Safe working conditions"
    elif gas < 50:
        air_quality = "Moderate"
        air_status = "Monitor conditions"
    else:
        air_quality = "Hazardous"
        air_status = "Evacuate immediately"

    # SPO2 status
    spo2 = readings["spo2"]
    if spo2 >= 95:
        spo2_status = "Normal Range"
    elif spo2 >= 90:
        spo2_status = "Low — Monitor"
    else:
        spo2_status = "Critical — Alert"

    return jsonify({
        "spo2": {
            "value": spo2,
            "status": spo2_status,
            "unit": "%"
        },
        "heart_rate": {
            "value": readings["heart_rate"],
            "unit": "bpm"
        },
        "accelerometer": {
            "x": readings["accelerometer"]["x"],
            "y": readings["accelerometer"]["y"],
            "z": readings["accelerometer"]["z"],
            "magnitude": round(accel_magnitude, 4),
            "activity": activity
        },
        "gyroscope": {
            "x": readings["gyroscope"]["x"],
            "y": readings["gyroscope"]["y"],
            "z": readings["gyroscope"]["z"]
        },
        "fall_detection": {
            "probability": round(fall_probability, 4),
            "detected": fall_detected,
            "status": "Fall Detected!" if fall_detected else "No Falls",
            "sensitivity": "High"
        },
        "environment": {
            "gas_ppm": gas,
            "air_quality": air_quality,
            "air_status": air_status,
            "temperature": readings["temperature"],
            "humidity": readings["humidity"]
        },
        "devices": {
            "esp32": {"status": "Online", "connection": "Connected"},
            "mpu6050": {"status": "Active", "connection": "Streaming"},
            "spo2_sensor": {"status": "Active", "connection": f"{spo2}% Ready"},
            "buzzer": {"status": "Standby" if not fall_detected else "ALERT", "connection": "Ready"}
        },
        "timestamp": readings["timestamp"]
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


if __name__ == "__main__":
    print("\n  Suraxit ML API Server")
    print("  http://localhost:5000/api/sensors\n")
    app.run(host="0.0.0.0", port=5000, debug=True)
