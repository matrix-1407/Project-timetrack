/**
 * Express Server Entry Point
 * TimeTrack Backend API
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import devicesRouter from './routes/devices.js';
import sessionsRouter from './routes/sessions.js';
import analyticsRouter from './routes/analytics.js';
import { testConnection } from './db.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Disable caching for all API responses
app.use((req, res, next) => {
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'TimeTrack backend is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/devices', devicesRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/analytics', analyticsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function startServer() {
  // Test database connection
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.log('⚠️ Starting server without database connection');
  }
  
  app.listen(PORT, () => {
    console.log(`🚀 TimeTrack backend running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`📊 API Docs:`);
    console.log(`   POST   /api/devices - Register device`);
    console.log(`   POST   /api/sessions - Save session`);
    console.log(`   POST   /api/sessions/batch - Sync multiple sessions`);
    console.log(`   GET    /api/sessions/:deviceId - Get sessions`);
    console.log(`   DELETE /api/sessions/:deviceId - Clear sessions`);
    console.log(`   GET    /api/analytics/:deviceId - Get analytics`);
  });
}

startServer();
