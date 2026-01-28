/**
 * Devices API Routes
 * Handles device registration and management
 */

import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

/**
 * POST /api/devices
 * Register or update a device
 * Body: { deviceId }
 */
router.post('/', async (req, res) => {
  try {
    const { deviceId } = req.body;

    if (!deviceId) {
      return res.status(400).json({ error: 'deviceId is required' });
    }

    const connection = await pool.getConnection();

    // Check if device exists
    const [existingDevice] = await connection.query(
      'SELECT id FROM devices WHERE id = ?',
      [deviceId]
    );

    if (existingDevice.length > 0) {
      // Update last_sync
      await connection.query(
        'UPDATE devices SET last_sync = NOW() WHERE id = ?',
        [deviceId]
      );
      connection.release();
      return res.json({ message: 'Device updated', deviceId });
    }

    // Create new device
    await connection.query(
      'INSERT INTO devices (id, created_at, last_sync) VALUES (?, NOW(), NOW())',
      [deviceId]
    );

    connection.release();
    res.status(201).json({ message: 'Device registered', deviceId });
  } catch (error) {
    console.error('Device registration error:', error);
    res.status(500).json({ error: 'Failed to register device' });
  }
});

/**
 * GET /api/devices/:deviceId
 * Get device info
 */
router.get('/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const connection = await pool.getConnection();

    const [devices] = await connection.query(
      'SELECT id, created_at, last_sync FROM devices WHERE id = ?',
      [deviceId]
    );

    connection.release();

    if (devices.length === 0) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.json(devices[0]);
  } catch (error) {
    console.error('Get device error:', error);
    res.status(500).json({ error: 'Failed to get device' });
  }
});

export default router;
