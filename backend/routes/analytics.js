/**
 * Analytics API Routes
 * Provides aggregated data for dashboard visualization
 */

import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

/**
 * GET /api/analytics/:deviceId
 * Get comprehensive analytics for a device
 * Query params: ?days=7
 */
router.get('/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { days = 7 } = req.query;

    const connection = await pool.getConnection();
    const dateFilter = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Top domains by time spent
    const [topDomains] = await connection.query(
      `SELECT domain, SUM(duration_seconds) as totalSeconds, COUNT(*) as sessions
       FROM sessions
       WHERE device_id = ? AND start_time >= ?
       GROUP BY domain
       ORDER BY totalSeconds DESC
       LIMIT 10`,
      [deviceId, dateFilter]
    );

    // Category breakdown
    const [categoryBreakdown] = await connection.query(
      `SELECT category, SUM(duration_seconds) as totalSeconds, COUNT(*) as sessions
       FROM sessions
       WHERE device_id = ? AND start_time >= ?
       GROUP BY category
       ORDER BY totalSeconds DESC`,
      [deviceId, dateFilter]
    );

    // Daily time series
    const [dailyStats] = await connection.query(
      `SELECT DATE(start_time) as date, SUM(duration_seconds) as totalSeconds, COUNT(*) as sessions
       FROM sessions
       WHERE device_id = ? AND start_time >= ?
       GROUP BY DATE(start_time)
       ORDER BY date ASC`,
      [deviceId, dateFilter]
    );

    // Overall stats
    const [[overallStats]] = await connection.query(
      `SELECT 
        SUM(duration_seconds) as totalSeconds,
        COUNT(*) as totalSessions,
        COUNT(DISTINCT domain) as uniqueDomains
       FROM sessions
       WHERE device_id = ? AND start_time >= ?`,
      [deviceId, dateFilter]
    );

    connection.release();

    // Format response
    res.json({
      deviceId,
      period: { days: parseInt(days) },
      overall: {
        totalSeconds: overallStats?.totalSeconds || 0,
        totalSessions: overallStats?.totalSessions || 0,
        uniqueDomains: overallStats?.uniqueDomains || 0
      },
      topDomains: topDomains.map(d => ({
        domain: d.domain,
        seconds: d.totalSeconds || 0,
        sessions: d.sessions || 0
      })),
      categoryBreakdown: categoryBreakdown.map(c => ({
        category: c.category,
        seconds: c.totalSeconds || 0,
        sessions: c.sessions || 0
      })),
      dailyStats: dailyStats.map(d => ({
        date: d.date,
        seconds: d.totalSeconds || 0,
        sessions: d.sessions || 0
      }))
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
