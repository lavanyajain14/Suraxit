const express = require('express');
const SensorReading = require('../models/SensorReading');

const router = express.Router();

// ─── Fall detection (threshold-based) ─────────────────────────
function predictFall(ax, ay, az) {
  const magnitude = Math.sqrt(ax * ax + ay * ay + az * az);
  let probability;
  if (magnitude > 2.5) probability = 0.85;
  else if (magnitude > 1.8) probability = 0.30;
  else probability = 0.05;
  return { probability: Math.round(probability * 10000) / 10000, detected: probability > 0.5, magnitude };
}

// ─── Activity classification ──────────────────────────────────
function classifyActivity(magnitude) {
  if (magnitude < 0.5) return 'Stationary';
  if (magnitude < 1.2) return 'Stable';
  if (magnitude < 2.0) return 'Walking';
  return 'High Motion';
}

// ─── SPO2 status ──────────────────────────────────────────────
function spo2Status(val) {
  if (val >= 95) return 'Normal Range';
  if (val >= 90) return 'Low — Monitor';
  return 'Critical — Alert';
}

// ═══════════════════════════════════════════════════════════════
//  POST /api/sensors/push   — ESP32 pushes {ax, ay, az, hr, spo2}
// ═══════════════════════════════════════════════════════════════
router.post('/api/sensors/push', async (req, res) => {
  try {
    const { ax, ay, az, hr, spo2 } = req.body;

    if (ax == null || ay == null || az == null) {
      return res.status(400).json({ error: 'Missing accelerometer fields (ax, ay, az)' });
    }

    const fall = predictFall(ax, ay, az);

    const doc = await SensorReading.findOneAndUpdate(
      { _id: 'current' },
      {
        $set: {
          ax: Number(ax),
          ay: Number(ay),
          az: Number(az),
          hr: Number(hr || 0),
          spo2: Number(spo2 || 0),
          receivedAt: new Date(),
        },
        $inc: { pushCount: 1 },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(
      `[HW] Push #${doc.pushCount}: ax=${ax} ay=${ay} az=${az} hr=${hr} spo2=${spo2} ` +
      `fall=${fall.probability}${fall.detected ? '  *** FALL ***' : ''}`
    );

    res.json({
      status: 'ok',
      push_count: doc.pushCount,
      fall_probability: fall.probability,
      fall_detected: fall.detected,
    });
  } catch (err) {
    console.error('[ERROR] /api/sensors/push:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Backward-compatible: ESP32 code that POSTs to "/" directly
router.post('/', async (req, res) => {
  // Reuse the same handler by forwarding
  req.url = '/api/sensors/push';
  router.handle(req, res);
});

// ═══════════════════════════════════════════════════════════════
//  GET /api/sensors   — Dashboard polls this every 1.5s
// ═══════════════════════════════════════════════════════════════
router.get('/api/sensors', async (req, res) => {
  try {
    const doc = await SensorReading.findById('current').lean();

    // No data yet, or data is stale (>5s old)
    if (!doc || !doc.receivedAt || (Date.now() - new Date(doc.receivedAt).getTime()) > 5000) {
      return res.json({
        data_source: 'waiting',
        hardware_online: false,
        message: 'No ESP32 data received yet. Waiting for hardware...',
        push_count: doc?.pushCount || 0,
        timestamp: Date.now() / 1000,
      });
    }

    const { ax, ay, az, hr, spo2 } = doc;
    const fall = predictFall(ax, ay, az);
    const activity = classifyActivity(fall.magnitude);
    const spo2Val = Math.round(spo2);
    const hrVal = Math.round(hr);

    res.json({
      data_source: 'hardware',
      spo2: {
        value: spo2Val,
        status: spo2Status(spo2Val),
        unit: '%',
      },
      heart_rate: {
        value: hrVal,
        unit: 'bpm',
      },
      accelerometer: {
        x: Math.round(ax * 10000) / 10000,
        y: Math.round(ay * 10000) / 10000,
        z: Math.round(az * 10000) / 10000,
        magnitude: Math.round(fall.magnitude * 10000) / 10000,
        activity,
      },
      fall_detection: {
        probability: fall.probability,
        detected: fall.detected,
        status: fall.detected ? 'Fall Detected!' : 'No Falls',
        sensitivity: 'High',
      },
      timestamp: Date.now() / 1000,
    });
  } catch (err) {
    console.error('[ERROR] /api/sensors:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ═══════════════════════════════════════════════════════════════
//  GET /api/health   — Quick health check
// ═══════════════════════════════════════════════════════════════
router.get('/api/health', async (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: Math.round(process.uptime()),
  });
});

module.exports = router;
