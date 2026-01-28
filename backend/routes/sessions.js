/**
 * Sessions API Routes
 * Handles session creation, retrieval, and management
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db.js';

const router = express.Router();

/**
 * Convert ISO datetime to MySQL format
 */
function toMySQLDateTime(isoString) {
  if (!isoString) return null;
  return new Date(isoString).toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * POST /api/sessions/batch
 * Save multiple sessions at once (for sync)
 * Body: { deviceId, sessions: [...] }
 */
router.post('/batch', async (req, res) => {
  try {
    const { deviceId, sessions } = req.body;

    if (!deviceId || !sessions || !Array.isArray(sessions)) {
      return res.status(400).json({ error: 'Missing or invalid fields' });
    }

    const connection = await pool.getConnection();

    for (const session of sessions) {
      const sessionId = uuidv4();
      await connection.query(
        `INSERT INTO sessions (id, device_id, domain, url, start_time, end_time, duration_seconds, category, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          sessionId,
          deviceId,
          session.domain,
          session.url || null,
          toMySQLDateTime(session.startTime),
          toMySQLDateTime(session.endTime),
          session.durationSeconds || 0,
          session.category || 'neutral'
        ]
      );
    }

    connection.release();
    res.json({ message: 'Sessions synced', count: sessions.length });
  } catch (error) {
    console.error('Batch session save error:', error);
    res.status(500).json({ error: 'Failed to sync sessions' });
  }
});

/**
 * POST /api/sessions
 * Save a new session
 * Body: { deviceId, domain, url, startTime, endTime, durationSeconds, category }
 */
router.post('/', async (req, res) => {
  try {
    const { deviceId, domain, url, startTime, endTime, durationSeconds, category } = req.body;

    // Validate required fields
    if (!deviceId || !domain || !startTime) {
      return res.status(400).json({ error: 'Missing required fields: deviceId, domain, startTime' });
    }

    const sessionId = uuidv4();
    const connection = await pool.getConnection();

    await connection.query(
      `INSERT INTO sessions (id, device_id, domain, url, start_time, end_time, duration_seconds, category, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        sessionId,
        deviceId,
        domain,
        url || null,
        toMySQLDateTime(startTime),
        toMySQLDateTime(endTime),
        durationSeconds || 0,
        category || 'neutral'
      ]
    );

    connection.release();
    res.status(201).json({ message: 'Session saved', sessionId });
  } catch (error) {
    console.error('Session save error:', error);
    res.status(500).json({ error: 'Failed to save session' });
  }
});

/**
 * GET /api/sessions/:deviceId
 * Get sessions for a device
 * Query params: ?limit=50&offset=0&days=7
 */
router.get('/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { limit = 50, offset = 0, days = 7 } = req.query;

    const connection = await pool.getConnection();

    const dateFilter = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const [sessions] = await connection.query(
      `SELECT id, device_id, domain, url, start_time, end_time, duration_seconds, category, created_at
       FROM sessions
       WHERE device_id = ? AND start_time >= ?
       ORDER BY start_time DESC
       LIMIT ? OFFSET ?`,
      [deviceId, dateFilter, parseInt(limit), parseInt(offset)]
    );

    const [[{ total }]] = await connection.query(
      `SELECT COUNT(*) as total FROM sessions WHERE device_id = ? AND start_time >= ?`,
      [deviceId, dateFilter]
    );

    connection.release();

    res.json({
      sessions,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      }
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

/**
 * DELETE /api/sessions/:deviceId
 * Clear sessions for a device
 */
router.delete('/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const connection = await pool.getConnection();

    const [result] = await connection.query(
      'DELETE FROM sessions WHERE device_id = ?',
      [deviceId]
    );

    connection.release();

    res.json({ message: 'Sessions deleted', count: result.affectedRows });
  } catch (error) {
    console.error('Delete sessions error:', error);
    res.status(500).json({ error: 'Failed to delete sessions' });
  }
});

export default router;
