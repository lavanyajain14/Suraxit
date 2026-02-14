const mongoose = require('mongoose');

const sensorReadingSchema = new mongoose.Schema(
  {
    _id: { type: String, default: 'current' },
    ax: { type: Number, required: true },
    ay: { type: Number, required: true },
    az: { type: Number, required: true },
    hr: { type: Number, required: true },
    spo2: { type: Number, required: true },
    receivedAt: { type: Date, default: Date.now },
    pushCount: { type: Number, default: 0 },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

module.exports = mongoose.model('SensorReading', sensorReadingSchema, 'sensor_readings');
