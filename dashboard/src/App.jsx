import React, { useState } from 'react';

/**
 * Main Dashboard Component
 * TODO (Commit-4): Add charts, analytics cards, data fetching
 * TODO (Commit-5): Add dark/light mode, animations
 */
function App() {
  const [theme, setTheme] = useState('light');

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: theme === 'light' ? '#f8f9fa' : '#1a1a1a',
      color: theme === 'light' ? '#000' : '#fff',
      padding: '40px'
    }}>
      <header style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>
            ⏱️ TimeTrack Dashboard
          </h1>
          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: theme === 'light' ? '#000' : '#fff',
              color: theme === 'light' ? '#fff' : '#000',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '40px auto' }}>
        <div style={{
          background: theme === 'light' ? '#fff' : '#2a2a2a',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>
            Analytics Coming Soon
          </h2>
          <p style={{ color: '#666', fontSize: '16px' }}>
            Dashboard will display browsing analytics, charts, and insights.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
