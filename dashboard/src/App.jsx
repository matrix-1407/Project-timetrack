import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Filler } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { fetchAnalytics, getDeviceId, setDeviceId, formatTime } from './api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Filler);

function App() {
  const [theme, setTheme] = useState('dark');
  const [deviceId, setDeviceIdState] = useState(getDeviceId());
  const [days, setDays] = useState(7);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch analytics data
  useEffect(() => {
    async function loadAnalytics() {
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
    }
    loadAnalytics();
  }, [deviceId, days]);

  const handleDeviceIdChange = (newId) => {
    setDeviceIdState(newId);
    setDeviceId(newId);
  };

  // Theme colors
  const colors = {
    bg: theme === 'dark' ? '#111827' : '#f9fafb',
    cardBg: theme === 'dark' ? '#1f2937' : '#ffffff',
    text: theme === 'dark' ? '#f9fafb' : '#111827',
    textSecondary: theme === 'dark' ? '#9ca3af' : '#6b7280',
    border: theme === 'dark' ? '#374151' : '#e5e7eb',
    primary: '#3b82f6',
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
      backgroundColor: '#3b82f6',
      borderColor: '#2563eb',
      borderWidth: 1
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
      backgroundColor: ['#10b981', '#ef4444', '#6b7280'],
      borderColor: theme === 'dark' ? '#1f2937' : '#ffffff',
      borderWidth: 2
    }]
  } : null;

  const dailyTrendsData = analytics ? {
    labels: analytics.dailyStats.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [{
      label: 'Time Spent (hours)',
      data: analytics.dailyStats.map(d => (d.seconds / 3600).toFixed(1)),
      fill: true,
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: '#3b82f6',
      tension: 0.4
    }]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: colors.text }
      }
    },
    scales: {
      x: {
        ticks: { color: colors.textSecondary },
        grid: { color: colors.border }
      },
      y: {
        ticks: { color: colors.textSecondary },
        grid: { color: colors.border }
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, padding: '20px' }}>
      {/* Header */}
      <header style={{ maxWidth: '1400px', margin: '0 auto 30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: colors.text, margin: 0 }}>
            ⏱️ TimeTrack Dashboard
          </h1>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              value={deviceId}
              onChange={(e) => handleDeviceIdChange(e.target.value)}
              placeholder="Device ID"
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: `1px solid ${colors.border}`,
                background: colors.cardBg,
                color: colors.text,
                fontSize: '14px',
                width: '200px'
              }}
            />
            <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} style={buttonStyle(colors)}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Time Period Selector */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          {[1, 7, 30].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              style={{
                ...buttonStyle(colors),
                background: days === d ? colors.primary : colors.cardBg,
                color: days === d ? '#fff' : colors.text,
                border: `1px solid ${days === d ? colors.primary : colors.border}`
              }}
            >
              {d === 1 ? 'Today' : `${d} Days`}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: colors.textSecondary }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <div>Loading analytics...</div>
          </div>
        )}

        {error && (
          <div style={{ ...cardStyle(colors), textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <div style={{ color: colors.danger, fontSize: '18px', marginBottom: '8px' }}>Error loading data</div>
            <div style={{ color: colors.textSecondary }}>{error}</div>
            <div style={{ marginTop: '16px', fontSize: '14px', color: colors.textSecondary }}>
              Make sure the backend server is running on port 5000
            </div>
          </div>
        )}

        {!loading && !error && analytics && (
          <>
            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <StatCard title="Total Time" value={formatTime(analytics.overall.totalSeconds)} icon="⏱️" colors={colors} />
              <StatCard title="Total Sessions" value={analytics.overall.totalSessions} icon="📊" colors={colors} />
              <StatCard title="Unique Domains" value={analytics.overall.uniqueDomains} icon="🌐" colors={colors} />
              <StatCard title="Avg per Session" value={formatTime(Math.floor(analytics.overall.totalSeconds / (analytics.overall.totalSessions || 1)))} icon="📈" colors={colors} />
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
              <div style={cardStyle(colors)}>
                <h3 style={{ margin: '0 0 20px', fontSize: '18px', color: colors.text }}>Top Domains</h3>
                <div style={{ height: '300px' }}>
                  {topDomainsData && <Bar data={topDomainsData} options={chartOptions} />}
                </div>
              </div>

              <div style={cardStyle(colors)}>
                <h3 style={{ margin: '0 0 20px', fontSize: '18px', color: colors.text }}>Category Breakdown</h3>
                <div style={{ height: '300px' }}>
                  {categoryData && <Doughnut data={categoryData} options={{ ...chartOptions, scales: undefined }} />}
                </div>
              </div>

              <div style={{ ...cardStyle(colors), gridColumn: 'span 2' }}>
                <h3 style={{ margin: '0 0 20px', fontSize: '18px', color: colors.text }}>Daily Activity Trends</h3>
                <div style={{ height: '300px' }}>
                  {dailyTrendsData && <Line data={dailyTrendsData} options={chartOptions} />}
                </div>
              </div>
            </div>

            {/* Top Domains List */}
            <div style={{ ...cardStyle(colors), marginTop: '20px' }}>
              <h3 style={{ margin: '0 0 20px', fontSize: '18px', color: colors.text }}>Detailed Breakdown</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
                      <th style={tableHeaderStyle(colors)}>Rank</th>
                      <th style={tableHeaderStyle(colors)}>Domain</th>
                      <th style={tableHeaderStyle(colors)}>Time Spent</th>
                      <th style={tableHeaderStyle(colors)}>Sessions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topDomains.slice(0, 10).map((domain, idx) => (
                      <tr key={domain.domain} style={{ borderBottom: `1px solid ${colors.border}` }}>
                        <td style={tableCellStyle(colors)}>{idx + 1}</td>
                        <td style={tableCellStyle(colors)}>{domain.domain}</td>
                        <td style={tableCellStyle(colors)}>{formatTime(domain.seconds)}</td>
                        <td style={tableCellStyle(colors)}>{domain.sessions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// Helper components
function StatCard({ title, value, icon, colors }) {
  return (
    <div style={cardStyle(colors)}>
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.text, marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '14px', color: colors.textSecondary }}>{title}</div>
    </div>
  );
}

// Styles
const cardStyle = (colors) => ({
  background: colors.cardBg,
  padding: '24px',
  borderRadius: '12px',
  border: `1px solid ${colors.border}`,
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
});

const buttonStyle = (colors) => ({
  padding: '8px 16px',
  borderRadius: '6px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  transition: 'all 0.2s'
});

const tableHeaderStyle = (colors) => ({
  padding: '12px',
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: '600',
  color: colors.textSecondary,
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
});

const tableCellStyle = (colors) => ({
  padding: '12px',
  color: colors.text,
  fontSize: '14px'
});

export default App;
