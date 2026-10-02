# TinyML-Based Wearable Safety Monitoring System

A wearable, edge-AI safety monitoring system designed for real-time human activity and health monitoring using an ESP32, multiple sensors, and a lightweight TinyML model.

The system collects motion and physiological data from onboard sensors and performs activity recognition and safety-event detection on the edge, reducing dependence on cloud processing.

## Overview

The project combines embedded systems, TinyML, sensor fusion, and IoT technologies to build a compact wearable safety monitoring device.

The system is designed to recognize activities such as:

- Walking
- Running
- Standing
- Falling

It also monitors physiological parameters such as heart rate and SpO2, providing a foundation for real-time safety and emergency monitoring.

## Key Features

- Real-time human activity recognition
- Fall detection using motion data
- Heart-rate monitoring
- SpO2 monitoring
- Edge inference using TinyML
- ESP32-based embedded implementation
- Multi-sensor data acquisition
- Low-latency local processing
- Web-based monitoring/dashboard concept
- Optional Web3 integration for event logging

## System Architecture

```text
             +---------------------+
             |       Sensors       |
             |                     |
             |  MPU6050            |
             |  MAX30102           |
             |  IR Sensor          |
             +----------+----------+
                        |
                        v
             +---------------------+
             |       ESP32         |
             |                     |
             | Data Acquisition    |
             | Pre-processing      |
             | TinyML Inference    |
             +----------+----------+
                        |
                        v
             +---------------------+
             | Activity / Event    |
             | Detection           |
             |                     |
             | Walking             |
             | Running             |
             | Standing            |
             | Fall                |
             +----------+----------+
                        |
                        v
             +---------------------+
             | Monitoring / Alert  |
             | Dashboard           |
             +---------------------+
```

## Hardware

| Component | Purpose |
|-----------|---------|
| ESP32 | Main microcontroller and TinyML inference platform |
| MPU6050 | Motion sensing using accelerometer and gyroscope |
| MAX30102 | Heart-rate and SpO2 monitoring |
| IR Sensor | Additional sensing for safety and activity monitoring |

## Machine Learning

The system uses a lightweight Multilayer Perceptron (MLP) model designed for deployment on resource-constrained embedded hardware.

The model processes sensor-derived features and performs activity classification on the ESP32.

### Activity Classes

```text
Input Sensor Data
       |
       v
Feature Extraction
       |
       v
TinyML / MLP Model
       |
       v
+-------------------+
| Activity Class    |
+-------------------+
| Walking           |
| Running           |
| Standing          |
| Fall              |
+-------------------+
```

The dataset contains recorded sensor samples corresponding to different activities and safety events.

## Performance

The current implementation achieved a test accuracy of approximately:

**95.45%**

This value corresponds to the test configuration and dataset used during development.

## Sampling

Sensor data is collected at approximately:

```text
Sampling Frequency: 50 Hz
```

The motion and physiological signals are processed to generate features suitable for lightweight edge inference.

## Web3 and Monitoring Integration

The project also includes a Web3-based monitoring concept in which detected safety events can be integrated with a smart-contract-backed dashboard.

Potential applications include:

- Safety-event logging
- Emergency-event tracking
- Tamper-resistant records
- Remote monitoring

The embedded device remains responsible for real-time sensing and inference, while the dashboard can provide higher-level monitoring and visualization.

## Technologies Used

### Embedded Systems

- ESP32
- Arduino IDE
- PlatformIO
- Embedded C/C++

### Sensors

- MPU6050
- MAX30102
- IR Sensor

### Machine Learning

- TinyML
- Multilayer Perceptron (MLP)
- Sensor-based activity classification

### Software and Dashboard

- Python
- Web3
- Smart Contracts
- IoT monitoring

## Project Structure

```text
tinyml-wearable-safety-monitoring/
|
├── backend/
|   └── Backend services and APIs
|
├── firmware/
|   └── ESP32 firmware
|
├── ml/
|   ├── dataset/
|   ├── model/
|   └── training/
|
├── software/
|   └── Monitoring and dashboard components
|
├── LICENSE
└── README.md
```

## How It Works

### 1. Sensor Acquisition

The ESP32 collects motion and physiological information from the connected sensors.

### 2. Data Processing

Raw sensor signals are sampled and converted into features suitable for machine-learning inference.

### 3. TinyML Inference

The lightweight MLP model runs locally on the ESP32 and classifies the user's activity.

### 4. Safety Detection

The system identifies abnormal events such as falls and can trigger the corresponding monitoring or alert mechanism.

### 5. Remote Monitoring

Detected events can be forwarded to the monitoring/dashboard layer for visualization and further processing.

## Applications

The system can serve as a foundation for:

- Wearable safety devices
- Elderly monitoring
- Worker safety systems
- Personal emergency detection
- Healthcare-oriented IoT
- Assisted-living systems
- Edge-AI wearable devices

## Future Improvements

- Improve fall-detection robustness using larger datasets
- Add more activity classes
- Implement personalized activity models
- Optimize TinyML inference latency and memory usage
- Add real-time emergency notifications
- Integrate GPS for location-aware alerts
- Improve physiological signal filtering
- Expand the Web3 monitoring layer
- Develop a custom PCB
- Package the system into a dedicated wearable enclosure

## Author

**Lavanya Jain**

B.Tech — Electronics Engineering  
Specialization: VLSI Design and Technology

## License

This project is available under the terms of the license included in this repository.
