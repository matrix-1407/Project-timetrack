/**
 * Background Service Worker (Manifest V3)
 * Handles tab tracking and activity monitoring
 */

console.log('TimeTrack background service worker loaded');

// ============================================
// State Management
// ============================================
let currentSession = null;
let deviceId = null;

// ============================================
// Utility Functions
// ============================================

/**
 * Generate unique device ID using UUID v4
 */
function generateDeviceId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Extract domain from URL
 */
function getDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return 'unknown';
  }
}

/**
 * Generate session ID
 */
function generateSessionId() {
  return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Categorize domain (basic categorization)
 */
function categorizeDomain(domain) {
  const productive = ['github.com', 'stackoverflow.com', 'docs.google.com', 'linkedin.com', 'medium.com'];
  const unproductive = ['youtube.com', 'facebook.com', 'twitter.com', 'instagram.com', 'reddit.com', 'netflix.com'];
  
  if (productive.some(d => domain.includes(d))) return 'productive';
  if (unproductive.some(d => domain.includes(d))) return 'unproductive';
  return 'neutral';
}

// ============================================
// Session Management
// ============================================

/**
 * Start tracking a new session
 */
async function startSession(tab) {
  if (!tab || !tab.url) return;
  
  // Ignore chrome:// and extension pages
  if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
    return;
  }
  
  const domain = getDomain(tab.url);
  const now = new Date();
  
  currentSession = {
    id: generateSessionId(),
    deviceId: deviceId,
    domain: domain,
    url: tab.url,
    startTime: now.toISOString(),
    endTime: null,
    durationSeconds: 0,
    category: categorizeDomain(domain),
    tabId: tab.id
  };
  
  console.log('Session started:', currentSession);
}

/**
 * End current session and save it
 */
async function endSession() {
  if (!currentSession) return;
  
  const now = new Date();
  const startTime = new Date(currentSession.startTime);
  const durationSeconds = Math.floor((now - startTime) / 1000);
  
  currentSession.endTime = now.toISOString();
  currentSession.durationSeconds = durationSeconds;
  
  // Save session to storage
  await saveSession(currentSession);
  
  console.log('Session ended:', currentSession);
  currentSession = null;
}

/**
 * Save session to chrome.storage.local
 */
async function saveSession(session) {
  try {
    // Get existing sessions
    const result = await chrome.storage.local.get(['sessions']);
    const sessions = result.sessions || [];
    
    // Add new session
    sessions.push(session);
    
    // Keep only last 1000 sessions to avoid storage limits
    const trimmedSessions = sessions.slice(-1000);
    
    // Save back to storage
    await chrome.storage.local.set({ sessions: trimmedSessions });
    
    console.log('Session saved. Total sessions:', trimmedSessions.length);
    
    // TODO (Commit-3): Sync to backend
    // syncToBackend(session);
  } catch (error) {
    console.error('Error saving session:', error);
  }
}

/**
 * Get today's sessions for stats
 */
async function getTodaysSessions() {
  try {
    const result = await chrome.storage.local.get(['sessions']);
    const sessions = result.sessions || [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return sessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= today;
    });
  } catch (error) {
    console.error('Error getting today sessions:', error);
    return [];
  }
}

// ============================================
// Event Listeners
// ============================================

/**
 * Handle tab activation (user switches tabs)
 */
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  console.log('Tab activated:', activeInfo.tabId);
  
  // End current session
  await endSession();
  
  // Start new session for activated tab
  const tab = await chrome.tabs.get(activeInfo.tabId);
  await startSession(tab);
});

/**
 * Handle tab updates (URL changes within same tab)
 */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only track when URL changes and tab is active
  if (changeInfo.url && tab.active) {
    console.log('Tab URL updated:', changeInfo.url);
    
    const newDomain = getDomain(changeInfo.url);
    
    // If domain changed, end current session and start new one
    if (currentSession && currentSession.domain !== newDomain) {
      await endSession();
      await startSession(tab);
    } else if (!currentSession) {
      // Start session if none exists
      await startSession(tab);
    }
  }
});

/**
 * Handle window focus changes
 */
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Browser lost focus, end current session
    console.log('Browser lost focus');
    await endSession();
  } else {
    // Browser gained focus, start tracking active tab
    console.log('Browser gained focus');
    const [tab] = await chrome.tabs.query({ active: true, windowId: windowId });
    if (tab) {
      await startSession(tab);
    }
  }
});

/**
 * Handle tab removal
 */
chrome.tabs.onRemoved.addListener(async (tabId) => {
  if (currentSession && currentSession.tabId === tabId) {
    console.log('Active tab closed');
    await endSession();
  }
});

// ============================================
// Initialization
// ============================================

/**
 * Initialize extension on install or startup
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Extension installed/updated:', details.reason);
  
  // Generate or retrieve device ID
  const result = await chrome.storage.local.get(['deviceId']);
  
  if (result.deviceId) {
    deviceId = result.deviceId;
    console.log('Existing device ID:', deviceId);
  } else {
    deviceId = generateDeviceId();
    await chrome.storage.local.set({ deviceId: deviceId });
    console.log('New device ID generated:', deviceId);
    
    // TODO (Commit-3): Register device with backend
    // registerDevice(deviceId);
  }
  
  // Start tracking current active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    await startSession(tab);
  }
});

/**
 * Initialize on service worker startup
 */
chrome.runtime.onStartup.addListener(async () => {
  console.log('Browser started');
  
  // Retrieve device ID
  const result = await chrome.storage.local.get(['deviceId']);
  deviceId = result.deviceId;
  
  // Start tracking current active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    await startSession(tab);
  }
});

// ============================================
// Periodic Sync (every 5 minutes)
// ============================================

// TODO (Commit-3): Implement backend sync
// chrome.alarms.create('syncToBackend', { periodInMinutes: 5 });
// chrome.alarms.onAlarm.addListener((alarm) => {
//   if (alarm.name === 'syncToBackend') {
//     syncAllSessions();
//   }
// });

// ============================================
// Message Handler for Popup
// ============================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStats') {
    getTodaysSessions().then(sessions => {
      const totalTime = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);
      const domainStats = {};
      
      sessions.forEach(session => {
        if (!domainStats[session.domain]) {
          domainStats[session.domain] = {
            domain: session.domain,
            time: 0,
            category: session.category,
            visits: 0
          };
        }
        domainStats[session.domain].time += session.durationSeconds;
        domainStats[session.domain].visits += 1;
      });
      
      const topDomains = Object.values(domainStats)
        .sort((a, b) => b.time - a.time)
        .slice(0, 5);
      
      sendResponse({
        deviceId: deviceId,
        currentSession: currentSession,
        totalSessions: sessions.length,
        totalTimeSeconds: totalTime,
        topDomains: topDomains
      });
    });
    
    return true; // Will respond asynchronously
  }
  
  if (request.action === 'clearData') {
    // Clear all data and reset current session
    currentSession = null;
    chrome.storage.local.set({ sessions: [] }).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});

console.log('TimeTrack background service worker initialized');
