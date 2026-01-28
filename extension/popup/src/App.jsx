import React from 'react';

/**
 * Chrome Extension Popup Component
 * TODO (Commit-4): Add mini stats and quick actions
 */
function App() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '24px', margin: '20px 0' }}>⏱️ TimeTrack</h1>
      <p style={{ color: '#666', fontSize: '14px' }}>
        Browsing Activity Tracker
      </p>
      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        background: '#f5f5f5', 
        borderRadius: '8px' 
      }}>
        <p style={{ fontSize: '12px', color: '#999' }}>
          Extension is active and tracking...
        </p>
      </div>
    </div>
  );
}

export default App;
