import React, { useState, useEffect } from 'react';

/**
 * Chrome Extension Popup Component
 * Displays real-time tracking statistics
 */
function App() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch stats from background script
  useEffect(() => {
    chrome.runtime.sendMessage({ action: 'getStats' }, (response) => {
      setStats(response);
      setLoading(false);
    });
  }, []);

  // Format seconds to readable time
  const formatTime = (seconds) => {
    if (!seconds) return '0s';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  // Clear all data
  const handleClearData = () => {
    if (confirm('Clear all tracking data?')) {
      chrome.runtime.sendMessage({ action: 'clearData' }, () => {
        window.location.reload();
      });
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>⏱️ TimeTrack</h1>
        <p style={styles.subtitle}>Browsing Activity Tracker</p>
      </div>

      {/* Current Session */}
      {stats.currentSession && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.statusDot}></span>
            <span style={styles.cardTitle}>Tracking Now</span>
          </div>
          <div style={styles.currentDomain}>{stats.currentSession.domain}</div>
          <div style={styles.category}>
            <span style={{
              ...styles.categoryBadge,
              background: getCategoryColor(stats.currentSession.category)
            }}>
              {stats.currentSession.category}
            </span>
          </div>
        </div>
      )}

      {!stats.currentSession && (
        <div style={styles.card}>
          <div style={styles.noSession}>No active session</div>
          <div style={styles.noSessionText}>Open a website to start tracking</div>
        </div>
      )}

      {/* Today's Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statBox}>
          <div style={styles.statValue}>{stats.totalSessions}</div>
          <div style={styles.statLabel}>Sessions</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statValue}>{formatTime(stats.totalTimeSeconds)}</div>
          <div style={styles.statLabel}>Total Time</div>
        </div>
      </div>

      {/* Top Domains */}
      {stats.topDomains && stats.topDomains.length > 0 && (
        <div style={styles.topDomainsSection}>
          <h3 style={styles.sectionTitle}>Top Sites Today</h3>
          {stats.topDomains.map((domain, index) => (
            <div key={domain.domain} style={styles.domainRow}>
              <div style={styles.domainInfo}>
                <span style={styles.domainRank}>{index + 1}</span>
                <span style={styles.domainName}>{domain.domain}</span>
              </div>
              <div style={styles.domainTime}>{formatTime(domain.time)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        <button style={styles.dashboardButton} onClick={() => {
          chrome.tabs.create({ url: 'http://localhost:3000' });
        }}>
          📊 Open Dashboard
        </button>
        <button style={styles.clearButton} onClick={handleClearData}>
          🗑️ Clear Data
        </button>
      </div>

      {/* Device ID */}
      <div style={styles.deviceId}>
        Device: {stats.deviceId?.substring(0, 8)}...
      </div>
    </div>
  );
}

// Helper function for category colors
function getCategoryColor(category) {
  const colors = {
    productive: '#10b981',
    unproductive: '#ef4444',
    neutral: '#6b7280'
  };
  return colors[category] || colors.neutral;
}

// Styles
const styles = {
  container: {
    padding: '16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: '#f9fafb',
    minHeight: '500px',
    width: '350px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 4px 0',
    color: '#111827'
  },
  subtitle: {
    fontSize: '12px',
    color: '#6b7280',
    margin: 0
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#6b7280'
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px'
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#10b981',
    marginRight: '8px',
    animation: 'pulse 2s infinite'
  },
  cardTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  currentDomain: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '8px',
    wordBreak: 'break-all'
  },
  category: {
    marginTop: '8px'
  },
  categoryBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    color: 'white',
    textTransform: 'capitalize'
  },
  noSession: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: '4px'
  },
  noSessionText: {
    fontSize: '12px',
    color: '#9ca3af',
    textAlign: 'center'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '16px'
  },
  statBox: {
    background: 'white',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '4px'
  },
  statLabel: {
    fontSize: '12px',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  topDomainsSection: {
    background: 'white',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 12px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  domainRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #f3f4f6'
  },
  domainInfo: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    minWidth: 0
  },
  domainRank: {
    width: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#9ca3af'
  },
  domainName: {
    fontSize: '13px',
    color: '#374151',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  domainTime: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: '8px'
  },
  footer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px'
  },
  dashboardButton: {
    flex: 1,
    padding: '10px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  clearButton: {
    flex: 1,
    padding: '10px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  deviceId: {
    textAlign: 'center',
    fontSize: '10px',
    color: '#9ca3af',
    marginTop: '8px'
  }
};

export default App;
