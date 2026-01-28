/**
 * Express Server Entry Point
 * TODO (Commit-3): Set up Express server, middleware, routes
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import sessionsRouter from './routes/sessions.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'TimeTrack backend is running',
    timestamp: new Date().toISOString()
  });
});

// TODO (Commit-3): Uncomment when routes are ready
// app.use('/api/sessions', sessionsRouter);
// app.use('/api/devices', devicesRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 TimeTrack backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});
