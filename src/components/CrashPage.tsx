import React from 'react';

const CrashPage: React.FC = () => (
  <div style={{
    width: '100vw',
    height: '100vh',
    minHeight: '100vh',
    minWidth: '100vw',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#e3f0fa',
    color: '#222',
    fontFamily: 'system-ui, sans-serif',
  }}>
    <div style={{
      width: '100%',
      maxWidth: 600,
      boxSizing: 'border-box',
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 4px 32px #0001',
      padding: '48px 32px',
      textAlign: 'center',
      margin: '0 16px',
    }}>
      <h1 style={{ fontSize: 72, margin: 0 }}>500</h1>
      <h2 style={{ fontWeight: 400, margin: '16px 0 8px 0' }}>Internal Error</h2>
      <p style={{ color: '#666', fontSize: 20, margin: 0 }}>
        Oops! Something went wrong.<br />
        The app has crashed.
      </p>
    </div>
  </div>
);

export default CrashPage; 