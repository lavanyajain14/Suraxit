require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const sensorRoutes = require('./routes/sensors');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────
app.use(sensorRoutes);

// ─── MongoDB connection ──────────────────────────────────────
const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('[FATAL] MONGODB_URI not set in .env');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('');
    console.log('  Suraxit Node.js Backend');
    console.log('  ──────────────────────────────────');
    console.log('  ✓ MongoDB Atlas connected');
    console.log(`  ✓ Database: ${mongoose.connection.db.databaseName}`);
    console.log('');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`  Endpoints:`);
      console.log(`    GET  http://localhost:${PORT}/api/health`);
      console.log(`    GET  http://localhost:${PORT}/api/sensors`);
      console.log(`    POST http://localhost:${PORT}/api/sensors/push`);
      console.log(`    POST http://localhost:${PORT}/              (backward compat)`);
      console.log('');
      console.log(`  Server listening on 0.0.0.0:${PORT}`);
      console.log('  Waiting for ESP32 data...');
      console.log('');
    });
  })
  .catch((err) => {
    console.error('[FATAL] MongoDB connection failed:', err.message);
    process.exit(1);
  });

// ─── Graceful shutdown ───────────────────────────────────────
process.on('SIGINT', async () => {
  console.log('\n  Shutting down...');
  await mongoose.connection.close();
  process.exit(0);
});
