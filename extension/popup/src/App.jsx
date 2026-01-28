import React, { useState, useEffect } from 'react';

/**
 * Chrome Extension Popup Component
 * Displays real-time tracking statistics
 */
function App() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch stats from background script
  useEffect(() => {
    try {
      chrome.runtime.sendMessage({ action: 'getStats' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Message error:', chrome.runtime.lastError);
          setError('Extension error. Try reloading.');
          setLoading(false);
          return;
        }
        if (response) {
          setStats(response);
        } else {
          setError('No response from background');
        }
        setLoading(false);
      });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
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

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>⏱️ TimeTrack</h1>
        </div>
        <div style={styles.card}>
          <div style={styles.errorText}>{error}</div>
          <button 
            style={styles.button}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>⏱️ TimeTrack</h1>
        </div>
        <div style={styles.card}>
          <div style={styles.errorText}>No stats available</div>
        </div>
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
    background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
    height: '550px',
    width: '380px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    textAlign: 'center',
    marginBottom: '12px',
    paddingBottom: '10px',
    borderBottom: '2px solid #374151'
  },
  title: {
    fontSize: '22px',
    fontWeight: 'bold',
    margin: '0 0 4px 0',
    color: '#f9fafb',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    fontSize: '11px',
    color: '#9ca3af',
    margin: 0,
    fontWeight: '500'
  },
  loading: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#9ca3af',
    fontSize: '14px'
  },
  card: {
    background: '#374151',
    borderRadius: '12px',
    padding: '14px',
    marginBottom: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    border: '1px solid #4b5563'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px'
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#10b981',
    marginRight: '8px',
    animation: 'pulse 2s infinite',
    boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.3)'
  },
  cardTitle: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.8px'
  },
  currentDomain: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#f9fafb',
    marginBottom: '8px',
    wordBreak: 'break-word',
    lineHeight: '1.3'
  },
  category: {
    marginTop: '8px'
  },
  categoryBadge: {
    display: 'inline-block',
    padding: '5px 12px',
    borderRadius: '14px',
    fontSize: '10px',
    fontWeight: '600',
    color: 'white',
    textTransform: 'capitalize',
    letterSpacing: '0.3px'
  },
  noSession: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: '6px'
  },
  noSessionText: {
    fontSize: '12px',
    color: '#6b7280',
    textAlign: 'center'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginBottom: '10px'
  },
  statBox: {
    background: '#374151',
    borderRadius: '12px',
    padding: '12px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    border: '1px solid #4b5563'
  },
  statValue: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#f9fafb',
    marginBottom: '4px'
  },
  statLabel: {
    fontSize: '10px',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    fontWeight: '600'
  },
  topDomainsSection: {
    background: '#374151',
    borderRadius: '12px',
    padding: '12px',
    marginBottom: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    border: '1px solid #4b5563',
    maxHeight: '150px',
    overflowY: 'auto',
    flex: '1 1 auto',
    scrollbarWidth: 'thin',
    scrollbarColor: '#4b5563 #374151'
  },
  sectionTitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#f9fafb',
    margin: '0 0 10px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.6px'
  },
  domainRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
    borderBottom: '1px solid #4b5563',
    '&:last-child': {
      borderBottom: 'none'
    }
  },
  domainInfo: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    minWidth: 0
  },
  domainRank: {
    width: '20px',
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#6b7280',
    flexShrink: 0
  },
  domainName: {
    fontSize: '12px',
    color: '#d1d5db',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: '500'
  },
  domainTime: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#9ca3af',
    marginLeft: '12px',
    flexShrink: 0
  },
  footer: {
    display: 'flex',
    gap: '8px',
    marginTop: 'auto',
    paddingTop: '10px',
    flexShrink: 0
  },
  dashboardButton: {
    flex: 1,
    padding: '10px 14px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.5)',
    letterSpacing: '0.3px'
  },
  clearButton: {
    flex: 1,
    padding: '10px 14px',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.5)',
    letterSpacing: '0.3px'
  },
  deviceId: {
    textAlign: 'center',
    fontSize: '9px',
    color: '#6b7280',
    paddingTop: '8px',
    fontWeight: '500',
    flexShrink: 0
  },
  errorText: {
    textAlign: 'center',
    color: '#ef4444',
    fontSize: '14px',
    marginBottom: '12px'
  },
  button: {
    display: 'block',
    width: '100%',
    padding: '10px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};

export default App;
