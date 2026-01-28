import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, BarChart3, Globe, TrendingUp, Sun, Moon, 
  Loader2, AlertCircle, RefreshCw, Calendar, Activity,
  CheckCircle, XCircle, Minus
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Filler } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { fetchAnalytics, getDeviceId, setDeviceId, formatTime } from './api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Filler);

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
};

const pulseAnimation = {
  scale: [1, 1.02, 1],
  transition: { duration: 2, repeat: Infinity }
};

function App() {
  const [theme, setTheme] = useState('dark');
  const [deviceId, setDeviceIdState] = useState(getDeviceId());
  const [days, setDays] = useState(7);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch analytics data
  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAnalytics(deviceId, days);
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [deviceId, days]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleDeviceIdChange = (newId) => {
    setDeviceIdState(newId);
    setDeviceId(newId);
  };

  // Theme colors
  const colors = {
    bg: theme === 'dark' ? '#0f172a' : '#f8fafc',
    cardBg: theme === 'dark' ? '#1e293b' : '#ffffff',
    cardBgHover: theme === 'dark' ? '#334155' : '#f1f5f9',
    text: theme === 'dark' ? '#f1f5f9' : '#0f172a',
    textSecondary: theme === 'dark' ? '#94a3b8' : '#64748b',
    border: theme === 'dark' ? '#334155' : '#e2e8f0',
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444'
  };

  // Chart data
  const topDomainsData = analytics ? {
    labels: analytics.topDomains.slice(0, 10).map(d => d.domain),
    datasets: [{
      label: 'Time Spent (seconds)',
      data: analytics.topDomains.slice(0, 10).map(d => d.seconds),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: '#3b82f6',
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false
    }]
  } : null;

  const categoryData = analytics ? {
    labels: ['Productive', 'Unproductive', 'Neutral'],
    datasets: [{
      data: [
        analytics.categoryBreakdown.find(c => c.category === 'productive')?.seconds || 0,
        analytics.categoryBreakdown.find(c => c.category === 'unproductive')?.seconds || 0,
        analytics.categoryBreakdown.find(c => c.category === 'neutral')?.seconds || 0
      ],
      backgroundColor: ['#10b981', '#ef4444', '#64748b'],
      borderColor: colors.cardBg,
      borderWidth: 4,
      hoverOffset: 8
    }]
  } : null;

  const dailyTrendsData = analytics ? {
    labels: analytics.dailyStats.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [{
      label: 'Hours',
      data: analytics.dailyStats.map(d => (d.seconds / 3600).toFixed(1)),
      fill: true,
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: '#3b82f6',
      tension: 0.4,
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1000, easing: 'easeOutQuart' },
    plugins: {
      legend: { 
        labels: { 
          color: colors.text,
          font: { family: 'Inter, system-ui, sans-serif', weight: '500' }
        }
      },
      tooltip: {
        backgroundColor: colors.cardBg,
        titleColor: colors.text,
        bodyColor: colors.textSecondary,
        borderColor: colors.border,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        ticks: { color: colors.textSecondary, font: { size: 11 } },
        grid: { color: colors.border, drawBorder: false }
      },
      y: {
        ticks: { color: colors.textSecondary, font: { size: 11 } },
        grid: { color: colors.border, drawBorder: false }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1000, easing: 'easeOutQuart' },
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { 
          color: colors.text,
          padding: 20,
          usePointStyle: true,
          font: { family: 'Inter, system-ui, sans-serif', weight: '500' }
        }
      },
      tooltip: {
        backgroundColor: colors.cardBg,
        titleColor: colors.text,
        bodyColor: colors.textSecondary,
        borderColor: colors.border,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8
      }
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: colors.bg, 
      padding: '24px',
      fontFamily: 'Inter, system-ui, sans-serif',
      transition: 'background 0.3s ease'
    }}>
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: '1400px', margin: '0 auto 32px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <motion.div 
            style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
            whileHover={{ scale: 1.02 }}
          >
            <motion.div
              animate={pulseAnimation}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
              }}
            >
              <Clock size={24} color="white" />
            </motion.div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '700', color: colors.text, margin: 0, letterSpacing: '-0.5px' }}>
                TimeTrack
              </h1>
              <p style={{ fontSize: '13px', color: colors.textSecondary, margin: 0 }}>Analytics Dashboard</p>
            </div>
          </motion.div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <motion.input
              whileFocus={{ scale: 1.02, boxShadow: `0 0 0 3px ${colors.primary}33` }}
              type="text"
              value={deviceId}
              onChange={(e) => handleDeviceIdChange(e.target.value)}
              placeholder="Device ID"
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                border: `1px solid ${colors.border}`,
                background: colors.cardBg,
                color: colors.text,
                fontSize: '14px',
                width: '200px',
                outline: 'none',
                transition: 'all 0.2s'
              }}
            />
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              style={{
                ...buttonStyle(colors),
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <motion.div animate={refreshing ? { rotate: 360 } : {}} transition={{ duration: 0.5 }}>
                <RefreshCw size={16} />
              </motion.div>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, rotate: 15 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} 
              style={buttonStyle(colors)}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>
          </div>
        </div>
      </motion.header>

      <main style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Time Period Selector */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center' }}
        >
          <Calendar size={18} color={colors.textSecondary} />
          {[1, 7, 30].map((d, idx) => (
            <motion.button
              key={d}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDays(d)}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                background: days === d 
                  ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                  : colors.cardBg,
                color: days === d ? '#fff' : colors.text,
                boxShadow: days === d 
                  ? '0 4px 14px rgba(59, 130, 246, 0.4)'
                  : `0 2px 8px ${theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)'}`,
                transition: 'all 0.2s'
              }}
            >
              {d === 1 ? 'Today' : `${d} Days`}
            </motion.button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ textAlign: 'center', padding: '80px', color: colors.textSecondary }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ display: 'inline-block', marginBottom: '20px' }}
              >
                <Loader2 size={48} color={colors.primary} />
              </motion.div>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ fontSize: '16px' }}
              >
                Loading analytics...
              </motion.div>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{ ...cardStyle(colors), textAlign: 'center', padding: '60px' }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <AlertCircle size={56} color={colors.danger} style={{ marginBottom: '20px' }} />
              </motion.div>
              <div style={{ color: colors.danger, fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                Error loading data
              </div>
              <div style={{ color: colors.textSecondary, marginBottom: '16px' }}>{error}</div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                style={{
                  ...buttonStyle(colors),
                  background: colors.primary,
                  color: '#fff',
                  padding: '12px 24px'
                }}
              >
                Try Again
              </motion.button>
            </motion.div>
          )}

          {!loading && !error && analytics && (
            <motion.div
              key="content"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {/* Stats Cards */}
              <motion.div 
                variants={staggerContainer}
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
                  gap: '20px', 
                  marginBottom: '28px' 
                }}
              >
                <StatCard 
                  title="Total Time" 
                  value={formatTime(analytics.overall.totalSeconds)} 
                  icon={<Clock size={24} />}
                  color="#3b82f6"
                  colors={colors} 
                />
                <StatCard 
                  title="Total Sessions" 
                  value={analytics.overall.totalSessions} 
                  icon={<BarChart3 size={24} />}
                  color="#8b5cf6"
                  colors={colors} 
                />
                <StatCard 
                  title="Unique Domains" 
                  value={analytics.overall.uniqueDomains} 
                  icon={<Globe size={24} />}
                  color="#10b981"
                  colors={colors} 
                />
                <StatCard 
                  title="Avg per Session" 
                  value={formatTime(Math.floor(analytics.overall.totalSeconds / (analytics.overall.totalSessions || 1)))} 
                  icon={<TrendingUp size={24} />}
                  color="#f59e0b"
                  colors={colors} 
                />
              </motion.div>

              {/* Charts Grid */}
              <motion.div 
                variants={staggerContainer}
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
                  gap: '20px' 
                }}
              >
                <motion.div variants={scaleIn} style={cardStyle(colors)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <Activity size={20} color={colors.primary} />
                    <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '600', color: colors.text }}>Top Domains</h3>
                  </div>
                  <div style={{ height: '300px' }}>
                    {topDomainsData && <Bar data={topDomainsData} options={chartOptions} />}
                  </div>
                </motion.div>

                <motion.div variants={scaleIn} style={cardStyle(colors)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <CheckCircle size={18} color="#10b981" />
                      <XCircle size={18} color="#ef4444" />
                      <Minus size={18} color="#64748b" />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '600', color: colors.text }}>Category Breakdown</h3>
                  </div>
                  <div style={{ height: '300px' }}>
                    {categoryData && <Doughnut data={categoryData} options={doughnutOptions} />}
                  </div>
                </motion.div>

                <motion.div variants={scaleIn} style={{ ...cardStyle(colors), gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <TrendingUp size={20} color={colors.primary} />
                    <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '600', color: colors.text }}>Daily Activity Trends</h3>
                  </div>
                  <div style={{ height: '300px' }}>
                    {dailyTrendsData && <Line data={dailyTrendsData} options={chartOptions} />}
                  </div>
                </motion.div>
              </motion.div>

              {/* Top Domains Table */}
              <motion.div variants={fadeIn} style={{ ...cardStyle(colors), marginTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <Globe size={20} color={colors.primary} />
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '600', color: colors.text }}>Detailed Breakdown</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
                        <th style={tableHeaderStyle(colors)}>Rank</th>
                        <th style={tableHeaderStyle(colors)}>Domain</th>
                        <th style={tableHeaderStyle(colors)}>Time Spent</th>
                        <th style={tableHeaderStyle(colors)}>Sessions</th>
                        <th style={tableHeaderStyle(colors)}>% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.topDomains.slice(0, 10).map((domain, idx) => (
                        <motion.tr 
                          key={domain.domain} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ backgroundColor: colors.cardBgHover }}
                          style={{ 
                            borderBottom: `1px solid ${colors.border}`,
                            transition: 'background 0.2s'
                          }}
                        >
                          <td style={tableCellStyle(colors)}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '28px',
                              height: '28px',
                              borderRadius: '8px',
                              background: idx < 3 ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' : colors.border,
                              color: idx < 3 ? '#fff' : colors.textSecondary,
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              {idx + 1}
                            </span>
                          </td>
                          <td style={{ ...tableCellStyle(colors), fontWeight: '500' }}>{domain.domain}</td>
                          <td style={tableCellStyle(colors)}>{formatTime(domain.seconds)}</td>
                          <td style={tableCellStyle(colors)}>{domain.sessions}</td>
                          <td style={tableCellStyle(colors)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{
                                width: '60px',
                                height: '6px',
                                borderRadius: '3px',
                                background: colors.border,
                                overflow: 'hidden'
                              }}>
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.round((domain.seconds / analytics.overall.totalSeconds) * 100)}%` }}
                                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                                  style={{
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                                    borderRadius: '3px'
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: '12px', color: colors.textSecondary }}>
                                {Math.round((domain.seconds / analytics.overall.totalSeconds) * 100)}%
                              </span>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          maxWidth: '1400px',
          margin: '40px auto 0',
          padding: '20px 0',
          borderTop: `1px solid ${colors.border}`,
          textAlign: 'center',
          color: colors.textSecondary,
          fontSize: '13px'
        }}
      >
        TimeTrack Dashboard • Built with React & Chart.js
      </motion.footer>
    </div>
  );
}

// StatCard component with animations
function StatCard({ title, value, icon, color, colors }) {
  return (
    <motion.div 
      variants={fadeIn}
      whileHover={{ y: -4, boxShadow: `0 12px 40px ${color}22` }}
      style={{
        ...cardStyle(colors),
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <motion.div
          whileHover={{ rotate: 10, scale: 1.1 }}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color
          }}
        >
          {icon}
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 12px ${color}`
          }}
        />
      </div>
      <motion.div 
        style={{ 
          fontSize: '28px', 
          fontWeight: '700', 
          color: colors.text, 
          marginBottom: '4px',
          letterSpacing: '-0.5px'
        }}
      >
        {value}
      </motion.div>
      <div style={{ fontSize: '13px', color: colors.textSecondary, fontWeight: '500' }}>{title}</div>
    </motion.div>
  );
}

// Styles
const cardStyle = (colors) => ({
  background: colors.cardBg,
  padding: '24px',
  borderRadius: '16px',
  border: `1px solid ${colors.border}`,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
});

const buttonStyle = (colors) => ({
  padding: '10px 14px',
  borderRadius: '10px',
  border: `1px solid ${colors.border}`,
  background: colors.cardBg,
  color: colors.text,
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s'
});

const tableHeaderStyle = (colors) => ({
  padding: '14px 16px',
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: '600',
  color: colors.textSecondary,
  textTransform: 'uppercase',
  letterSpacing: '0.8px'
});

const tableCellStyle = (colors) => ({
  padding: '14px 16px',
  color: colors.text,
  fontSize: '14px'
});

export default App;
