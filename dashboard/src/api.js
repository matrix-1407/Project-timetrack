/**
 * API Service for TimeTrack Dashboard
 * Handles all backend communication
 */

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Format time in seconds to human-readable format
 */
export function formatTime(seconds) {
  if (!seconds) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

/**
 * Fetch analytics data for a device
 */
export async function fetchAnalytics(deviceId, days = 7) {
  try {
    const timestamp = Date.now();
    const response = await fetch(`${API_BASE_URL}/analytics/${deviceId}?days=${days}&_t=${timestamp}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    throw error;
  }
}

/**
 * Fetch sessions for a device
 */
export async function fetchSessions(deviceId, limit = 50, days = 7) {
  try {
    const timestamp = Date.now();
    const response = await fetch(`${API_BASE_URL}/sessions/${deviceId}?limit=${limit}&days=${days}&_t=${timestamp}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
    throw error;
  }
}

/**
 * Get device ID from localStorage (set by extension)
 */
export function getDeviceId() {
  // For testing, use a default device ID
  // In production, this would come from the extension
  const stored = localStorage.getItem('timetrack_device_id');
  return stored || 'test-device-001';
}

/**
 * Set device ID in localStorage
 */
export function setDeviceId(deviceId) {
  localStorage.setItem('timetrack_device_id', deviceId);
}
