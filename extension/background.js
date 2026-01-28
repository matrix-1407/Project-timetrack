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

// ============================================
// Smart Domain Categorization System
// ============================================

// Extensive lists of known domains
const PRODUCTIVE_DOMAINS = [
  // Development & Programming
  'github.com', 'gitlab.com', 'bitbucket.org', 'stackoverflow.com', 'stackexchange.com',
  'developer.mozilla.org', 'w3schools.com', 'freecodecamp.org', 'codecademy.com',
  'codepen.io', 'jsfiddle.net', 'replit.com', 'codesandbox.io', 'glitch.com',
  'npmjs.com', 'pypi.org', 'crates.io', 'rubygems.org', 'packagist.org',
  'docker.com', 'kubernetes.io', 'aws.amazon.com', 'cloud.google.com', 'azure.microsoft.com',
  'vercel.com', 'netlify.com', 'heroku.com', 'digitalocean.com', 'linode.com',
  
  // Documentation & Learning
  'docs.google.com', 'notion.so', 'confluence.atlassian.com', 'gitbook.io',
  'readthedocs.io', 'devdocs.io', 'dash.plotly.com',
  'coursera.org', 'udemy.com', 'edx.org', 'pluralsight.com', 'skillshare.com',
  'lynda.com', 'treehouse.com', 'egghead.io', 'frontendmasters.com',
  'khanacademy.org', 'brilliant.org', 'duolingo.com', 'memrise.com',
  
  // Professional & Productivity
  'linkedin.com', 'glassdoor.com', 'indeed.com', 'angel.co', 'wellfound.com',
  'trello.com', 'asana.com', 'monday.com', 'basecamp.com', 'clickup.com',
  'slack.com', 'teams.microsoft.com', 'zoom.us', 'meet.google.com',
  'calendar.google.com', 'outlook.com', 'mail.google.com',
  'drive.google.com', 'dropbox.com', 'box.com', 'onedrive.live.com',
  'sheets.google.com', 'airtable.com', 'smartsheet.com',
  'figma.com', 'sketch.com', 'canva.com', 'adobe.com', 'invisionapp.com',
  'miro.com', 'lucidchart.com', 'draw.io', 'whimsical.com',
  
  // Research & Information
  'wikipedia.org', 'arxiv.org', 'scholar.google.com', 'researchgate.net',
  'medium.com', 'dev.to', 'hashnode.com', 'hackernoon.com',
  'news.ycombinator.com', 'lobste.rs', 'slashdot.org',
  'techcrunch.com', 'wired.com', 'arstechnica.com', 'theverge.com',
  
  // Finance & Business
  'bloomberg.com', 'reuters.com', 'wsj.com', 'ft.com',
  'quickbooks.intuit.com', 'xero.com', 'freshbooks.com',
  'stripe.com', 'paypal.com', 'square.com',
  
  // AI & Tools
  'chat.openai.com', 'claude.ai', 'bard.google.com', 'copilot.microsoft.com',
  'huggingface.co', 'kaggle.com', 'jupyter.org',
  'grammarly.com', 'hemingwayapp.com'
];

const UNPRODUCTIVE_DOMAINS = [
  // Social Media
  'facebook.com', 'instagram.com', 'twitter.com', 'x.com', 'tiktok.com',
  'snapchat.com', 'pinterest.com', 'tumblr.com', 'weibo.com',
  'vk.com', 'ok.ru', 'myspace.com',
  
  // Entertainment & Streaming
  'youtube.com', 'netflix.com', 'hulu.com', 'disneyplus.com', 'hbomax.com',
  'primevideo.com', 'peacocktv.com', 'paramountplus.com', 'crunchyroll.com',
  'twitch.tv', 'kick.com', 'dailymotion.com', 'vimeo.com',
  'spotify.com', 'soundcloud.com', 'pandora.com', 'deezer.com',
  
  // Gaming
  'store.steampowered.com', 'epicgames.com', 'gog.com', 'origin.com',
  'battle.net', 'roblox.com', 'minecraft.net', 'ea.com',
  'ign.com', 'gamespot.com', 'kotaku.com', 'polygon.com',
  'chess.com', 'lichess.org',
  
  // Forums & Communities (entertainment-focused)
  'reddit.com', '9gag.com', 'imgur.com', 'buzzfeed.com',
  'boredpanda.com', 'digg.com', 'fark.com',
  
  // News & Gossip (non-business)
  'tmz.com', 'eonline.com', 'people.com', 'usmagazine.com',
  'dailymail.co.uk', 'thesun.co.uk',
  
  // Dating
  'tinder.com', 'bumble.com', 'hinge.com', 'match.com', 'okcupid.com',
  
  // Shopping (non-essential)
  'amazon.com', 'ebay.com', 'aliexpress.com', 'wish.com', 'etsy.com',
  'walmart.com', 'target.com', 'bestbuy.com'
];

// Keywords that suggest productivity
const PRODUCTIVE_KEYWORDS = [
  'docs', 'documentation', 'api', 'learn', 'tutorial', 'course', 'education',
  'developer', 'development', 'programming', 'code', 'coding', 'software',
  'research', 'study', 'academic', 'university', 'college', 'school',
  'work', 'business', 'professional', 'enterprise', 'corporate',
  'productivity', 'tool', 'dashboard', 'analytics', 'admin', 'console',
  'project', 'manage', 'organize', 'collaborate', 'team'
];

// Keywords that suggest unproductivity
const UNPRODUCTIVE_KEYWORDS = [
  'game', 'gaming', 'play', 'stream', 'watch', 'video', 'movie', 'tv',
  'social', 'chat', 'meme', 'funny', 'entertainment', 'fun',
  'gossip', 'celebrity', 'dating', 'shop', 'deal', 'discount',
  'porn', 'xxx', 'adult', 'casino', 'gambling', 'bet'
];

// TLDs that hint at productivity
const PRODUCTIVE_TLDS = ['.edu', '.gov', '.org', '.ac.', '.edu.'];
const UNPRODUCTIVE_TLDS = ['.xxx', '.adult'];

// User custom categories (loaded from storage)
let userCategories = { productive: [], unproductive: [] };

// Load user categories from storage
async function loadUserCategories() {
  try {
    const result = await chrome.storage.local.get(['userCategories']);
    if (result.userCategories) {
      userCategories = result.userCategories;
    }
  } catch (e) {
    console.log('No custom categories found');
  }
}

// Save user category
async function saveUserCategory(domain, category) {
  if (category === 'productive') {
    if (!userCategories.productive.includes(domain)) {
      userCategories.productive.push(domain);
      userCategories.unproductive = userCategories.unproductive.filter(d => d !== domain);
    }
  } else if (category === 'unproductive') {
    if (!userCategories.unproductive.includes(domain)) {
      userCategories.unproductive.push(domain);
      userCategories.productive = userCategories.productive.filter(d => d !== domain);
    }
  }
  await chrome.storage.local.set({ userCategories });
}

/**
 * Smart domain categorization with multiple heuristics
 */
function categorizeDomain(domain) {
  const lowerDomain = domain.toLowerCase();
  
  // 1. Check user custom categories first (highest priority)
  if (userCategories.productive.some(d => lowerDomain.includes(d))) return 'productive';
  if (userCategories.unproductive.some(d => lowerDomain.includes(d))) return 'unproductive';
  
  // 2. Check against known domain lists
  if (PRODUCTIVE_DOMAINS.some(d => lowerDomain.includes(d))) return 'productive';
  if (UNPRODUCTIVE_DOMAINS.some(d => lowerDomain.includes(d))) return 'unproductive';
  
  // 3. Check TLDs
  if (PRODUCTIVE_TLDS.some(tld => lowerDomain.includes(tld))) return 'productive';
  if (UNPRODUCTIVE_TLDS.some(tld => lowerDomain.includes(tld))) return 'unproductive';
  
  // 4. Keyword analysis in domain
  const domainParts = lowerDomain.replace(/[.-]/g, ' ');
  
  const productiveScore = PRODUCTIVE_KEYWORDS.filter(kw => domainParts.includes(kw)).length;
  const unproductiveScore = UNPRODUCTIVE_KEYWORDS.filter(kw => domainParts.includes(kw)).length;
  
  if (productiveScore > unproductiveScore && productiveScore > 0) return 'productive';
  if (unproductiveScore > productiveScore && unproductiveScore > 0) return 'unproductive';
  
  // 5. Default to neutral
  return 'neutral';
}

// Load user categories on startup
loadUserCategories();

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
    
    // Auto-sync if we have many sessions (20+)
    if (trimmedSessions.length >= 20) {
      await syncSessions();
    }
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
    
    // Register device with backend
    registerDevice(deviceId);
  }
  
  // Start tracking current active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    await startSession(tab);
  }
  
  // Set up periodic sync alarm
  chrome.alarms.create('syncSessions', { periodInMinutes: 5 });
});

/**
 * Initialize on service worker startup
 */
chrome.runtime.onStartup.addListener(async () => {
  console.log('Browser started');
  
  // Retrieve device ID
  const result = await chrome.storage.local.get(['deviceId']);
  if (result.deviceId) {
    deviceId = result.deviceId;
  }
  
  // Start tracking current active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    await startSession(tab);
  }
  
  // Set up periodic sync alarm (in case it wasn't created)
  chrome.alarms.create('syncSessions', { periodInMinutes: 5 });
});

// ============================================
// Periodic Sync (every 5 minutes)
// ============================================

const API_BASE_URL = 'http://localhost:5000/api';
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Register device with backend
 */
async function registerDevice(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: id })
    });
    
    if (response.ok) {
      console.log('✅ Device registered:', id);
    } else {
      console.warn('Device registration failed:', response.status);
    }
  } catch (error) {
    console.error('Device registration error:', error);
  }
}

/**
 * Sync sessions with backend
 */
async function syncSessions() {
  try {
    // Ensure deviceId is loaded
    if (!deviceId) {
      const result = await chrome.storage.local.get(['deviceId']);
      deviceId = result.deviceId;
      if (!deviceId) {
        console.warn('No device ID available for sync');
        return;
      }
    }

    const { sessions } = await chrome.storage.local.get(['sessions']);
    
    if (!sessions || sessions.length === 0) {
      console.log('No sessions to sync');
      return;
    }

    console.log(`Syncing ${sessions.length} sessions to backend...`);

    const response = await fetch(`${API_BASE_URL}/sessions/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: deviceId,
        sessions: sessions.map(s => ({
          domain: s.domain,
          url: s.url,
          startTime: s.startTime,
          endTime: s.endTime,
          durationSeconds: s.durationSeconds,
          category: s.category
        }))
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Synced ${data.count || sessions.length} sessions`);
      
      // Clear synced sessions from local storage
      await chrome.storage.local.set({ sessions: [] });
    } else {
      const errorData = await response.text();
      console.warn('Session sync failed:', response.status, errorData);
    }
  } catch (error) {
    console.error('Session sync error:', error);
  }
}


/**
 * Handle periodic sync alarm
 */
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'syncSessions') {
    syncSessions();
  }
});

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
  
  if (request.action === 'setCategory') {
    // Allow user to set custom category for a domain
    saveUserCategory(request.domain, request.category).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'getCategories') {
    // Return current categories for display
    sendResponse({
      userCategories: userCategories,
      productiveCount: PRODUCTIVE_DOMAINS.length + userCategories.productive.length,
      unproductiveCount: UNPRODUCTIVE_DOMAINS.length + userCategories.unproductive.length
    });
    return true;
  }
});

console.log('TimeTrack background service worker initialized');
