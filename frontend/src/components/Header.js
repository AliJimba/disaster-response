import React from 'react';

export default function Header({ theme, setTheme, noiseEnabled, setNoiseEnabled }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="logo">🌊 FloodAI</h1>
          <p className="tagline">Intelligent Flood Risk Prediction</p>
        </div>

        <div className="header-center">
          <span className="domain-badge">🚨 Disaster Response</span>
          <span className="function-badge">📊 Data Visualization</span>
          <span className={`wildcard-badge ${noiseEnabled ? 'active' : ''}`}>
            🔊 Noise Injection {noiseEnabled ? '✓' : ''}
          </span>
        </div>

        <div className="header-right">
          <button 
            className={`noise-btn ${noiseEnabled ? 'active' : ''}`}
            onClick={() => setNoiseEnabled(!noiseEnabled)}
          >
            <span>🔊</span>
            {noiseEnabled ? 'Noise ON' : 'Noise OFF'}
          </button>

          <button 
            className="theme-toggle"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {noiseEnabled && (
        <div className="noise-banner">
          <span>⚠️ Noise Injection Active: ±10% sensor error simulation enabled</span>
        </div>
      )}
    </header>
  );
}
