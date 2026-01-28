import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, Globe, Activity, Trash2, ExternalLink, 
  Loader2, AlertCircle, CheckCircle, XCircle, Minus,
  Zap, TrendingUp, Edit3, ChevronDown
} from 'lucide-react';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300 } }
};

/**
 * Chrome Extension Popup Component
 * Displays real-time tracking statistics with animations
 */
function App() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingDomain, setEditingDomain] = useState(null);

  // Fetch stats from background script
  const fetchStats = () => {
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
  };

  useEffect(() => {
    fetchStats();
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

  // Open dashboard
  const openDashboard = () => {
    chrome.tabs.create({ url: 'http://localhost:3000' });
  };

  // Change domain category
  const handleCategoryChange = (domain, newCategory) => {
    chrome.runtime.sendMessage({ 
      action: 'setCategory', 
      domain: domain,
      category: newCategory 
    }, (response) => {
      if (response?.success) {
        // Update local state immediately
        setStats(prev => ({
          ...prev,
          topDomains: prev.topDomains.map(d => 
            d.domain === domain ? { ...d, category: newCategory } : d
          ),
          currentSession: prev.currentSession?.domain === domain 
            ? { ...prev.currentSession, category: newCategory }
            : prev.currentSession
        }));
        setEditingDomain(null);
      }
    });
  };

  // Get category color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'productive': return '#10b981';
      case 'unproductive': return '#ef4444';
      default: return '#64748b';
    }
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'productive': return <CheckCircle size={12} />;
      case 'unproductive': return <XCircle size={12} />;
      default: return <Minus size={12} />;
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={styles.loadingContainer}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 size={32} color="#3b82f6" />
          </motion.div>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={styles.loadingText}
          >
            Loading...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={styles.header}
        >
          <div style={styles.logoContainer}>
            <Clock size={20} color="white" />
          </div>
          <h1 style={styles.title}>TimeTrack</h1>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.card}
        >
          <AlertCircle size={32} color="#ef4444" style={{ marginBottom: '12px' }} />
          <div style={styles.errorText}>{error}</div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            Retry
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <Clock size={20} color="white" />
          </div>
          <h1 style={styles.title}>TimeTrack</h1>
        </div>
        <div style={styles.card}>
          <div style={styles.errorText}>No stats available</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={styles.container}
    >
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.header}
      >
        <motion.div 
          whileHover={{ scale: 1.05, rotate: 5 }}
          style={styles.logoContainer}
        >
          <Clock size={20} color="white" />
        </motion.div>
        <div>
          <h1 style={styles.title}>TimeTrack</h1>
          <p style={styles.subtitle}>Browsing Activity Tracker</p>
        </div>
      </motion.div>

      {/* Current Session */}
      <AnimatePresence mode="wait">
        {stats.currentSession ? (
          <motion.div 
            key="active"
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, scale: 0.9 }}
            style={styles.card}
          >
            <div style={styles.cardHeader}>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={styles.statusDot}
              />
              <span style={styles.cardTitle}>TRACKING NOW</span>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Activity size={14} color="#10b981" />
              </motion.div>
            </div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={styles.currentDomain}
            >
              <Globe size={16} color="#3b82f6" style={{ marginRight: '8px' }} />
              {stats.currentSession.domain}
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              style={{
                ...styles.categoryBadge,
                background: `${getCategoryColor(stats.currentSession.category)}20`,
                color: getCategoryColor(stats.currentSession.category),
                border: `1px solid ${getCategoryColor(stats.currentSession.category)}40`
              }}
            >
              {getCategoryIcon(stats.currentSession.category)}
              <span style={{ marginLeft: '4px' }}>{stats.currentSession.category}</span>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            key="inactive"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            style={styles.card}
          >
            <div style={styles.noSession}>
              <Zap size={24} color="#64748b" style={{ marginBottom: '8px' }} />
              <div>No active session</div>
            </div>
            <div style={styles.noSessionText}>Open a website to start tracking</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Today's Stats */}
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={styles.statsGrid}
      >
        <motion.div variants={fadeIn} whileHover={{ scale: 1.03, y: -2 }} style={styles.statBox}>
          <div style={styles.statIcon}>
            <TrendingUp size={16} color="#8b5cf6" />
          </div>
          <div style={styles.statValue}>{stats.totalSessions}</div>
          <div style={styles.statLabel}>Sessions</div>
        </motion.div>
        <motion.div variants={fadeIn} whileHover={{ scale: 1.03, y: -2 }} style={styles.statBox}>
          <div style={styles.statIcon}>
            <Clock size={16} color="#3b82f6" />
          </div>
          <div style={styles.statValue}>{formatTime(stats.totalTimeSeconds)}</div>
          <div style={styles.statLabel}>Total Time</div>
        </motion.div>
      </motion.div>

      {/* Top Domains */}
      {stats.topDomains && stats.topDomains.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={styles.topDomainsSection}
        >
          <h3 style={styles.sectionTitle}>
            <Globe size={14} color="#94a3b8" style={{ marginRight: '6px' }} />
            Top Sites Today
          </h3>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            style={styles.domainsList}
          >
            {stats.topDomains.map((domain, index) => (
              <motion.div 
                key={domain.domain} 
                variants={fadeIn}
                whileHover={{ x: 4, backgroundColor: '#334155' }}
                style={styles.domainRow}
              >
                <div style={styles.domainRank}>
                  <span style={{
                    ...styles.rankBadge,
                    background: index < 3 ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : '#475569'
                  }}>
                    {index + 1}
                  </span>
                </div>
                <div style={styles.domainInfo}>
                  <div style={styles.domainName}>{domain.domain}</div>
                  <div style={styles.domainMeta}>
                    {editingDomain === domain.domain ? (
                      <div style={styles.categoryDropdown}>
                        {['productive', 'unproductive', 'neutral'].map(cat => (
                          <motion.button
                            key={cat}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCategoryChange(domain.domain, cat);
                            }}
                            style={{
                              ...styles.categoryOption,
                              background: getCategoryColor(cat),
                              opacity: domain.category === cat ? 1 : 0.6
                            }}
                          >
                            {cat === 'productive' && <CheckCircle size={10} />}
                            {cat === 'unproductive' && <XCircle size={10} />}
                            {cat === 'neutral' && <Minus size={10} />}
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingDomain(domain.domain);
                        }}
                        style={{
                          ...styles.categoryTag,
                          color: getCategoryColor(domain.category),
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}
                      >
                        {getCategoryIcon(domain.category)}
                        <Edit3 size={8} style={{ marginLeft: '2px', opacity: 0.5 }} />
                      </motion.button>
                    )}
                    <span>{domain.visits} visits</span>
                  </div>
                </div>
                <div style={styles.domainTime}>{formatTime(domain.time)}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={styles.actions}
      >
        <motion.button 
          whileHover={{ scale: 1.02, boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)' }}
          whileTap={{ scale: 0.98 }}
          style={styles.dashboardButton}
          onClick={openDashboard}
        >
          <ExternalLink size={14} />
          <span>Open Dashboard</span>
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.02, boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)' }}
          whileTap={{ scale: 0.98 }}
          style={styles.clearButton}
          onClick={handleClearData}
        >
          <Trash2 size={14} />
          <span>Clear</span>
        </motion.button>
      </motion.div>

      {/* Device ID */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.4 }}
        style={styles.deviceId}
      >
        ID: {stats.deviceId ? stats.deviceId.slice(0, 8) + '...' : 'N/A'}
      </motion.div>
    </motion.div>
  );
}

// Styles
const styles = {
  container: {
    padding: '14px',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
    width: '380px',
    height: '550px',
    display: 'flex',
    flexDirection: 'column',
    color: '#f1f5f9',
    overflow: 'hidden',
    boxSizing: 'border-box'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
    paddingBottom: '12px',
    borderBottom: '1px solid #334155',
    flexShrink: 0
  },
  logoContainer: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
    flexShrink: 0
  },
  title: {
    fontSize: '16px',
    fontWeight: '700',
    margin: 0,
    color: '#f1f5f9',
    letterSpacing: '-0.3px'
  },
  subtitle: {
    fontSize: '11px',
    color: '#94a3b8',
    margin: 0,
    fontWeight: '500'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: '12px'
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: '14px',
    margin: 0
  },
  card: {
    background: '#1e293b',
    borderRadius: '12px',
    padding: '12px 14px',
    marginBottom: '10px',
    border: '1px solid #334155',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
    flexShrink: 0
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px'
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#10b981',
    boxShadow: '0 0 8px #10b981'
  },
  cardTitle: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: '1px',
    flex: 1
  },
  currentDomain: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center'
  },
  categoryBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  noSession: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  noSessionText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: '12px',
    marginTop: '4px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginBottom: '10px',
    flexShrink: 0
  },
  statBox: {
    background: '#1e293b',
    borderRadius: '10px',
    padding: '12px',
    textAlign: 'center',
    border: '1px solid #334155',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  statIcon: {
    marginBottom: '4px'
  },
  statValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#f1f5f9',
    letterSpacing: '-0.5px'
  },
  statLabel: {
    fontSize: '10px',
    color: '#94a3b8',
    fontWeight: '500',
    marginTop: '2px'
  },
  topDomainsSection: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '10px',
    overflow: 'hidden'
  },
  sectionTitle: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#94a3b8',
    margin: '0 0 8px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0
  },
  domainsList: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingRight: '4px'
  },
  domainRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 10px',
    borderRadius: '8px',
    marginBottom: '5px',
    background: '#1e293b',
    border: '1px solid #334155',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  },
  domainRank: {
    marginRight: '8px',
    flexShrink: 0
  },
  rankBadge: {
    width: '20px',
    height: '20px',
    borderRadius: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: '700',
    color: '#fff'
  },
  domainInfo: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden'
  },
  domainName: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#f1f5f9',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  domainMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '9px',
    color: '#64748b',
    marginTop: '1px'
  },
  categoryTag: {
    display: 'flex',
    alignItems: 'center'
  },
  domainTime: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#3b82f6',
    marginLeft: '8px',
    flexShrink: 0
  },
  actions: {
    display: 'flex',
    gap: '8px',
    marginTop: 'auto',
    flexShrink: 0
  },
  dashboardButton: {
    flex: 2,
    padding: '10px 14px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
    transition: 'all 0.2s ease'
  },
  clearButton: {
    flex: 1,
    padding: '10px 14px',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
    transition: 'all 0.2s ease'
  },
  retryButton: {
    padding: '10px 20px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px'
  },
  errorText: {
    textAlign: 'center',
    color: '#ef4444',
    fontSize: '13px',
    marginBottom: '8px'
  },
  deviceId: {
    textAlign: 'center',
    fontSize: '9px',
    color: '#64748b',
    paddingTop: '8px',
    fontWeight: '500',
    flexShrink: 0
  },
  categoryDropdown: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center'
  },
  categoryOption: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    padding: 0
  }
};

export default App;
