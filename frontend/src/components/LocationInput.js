import React, { useState } from 'react';

export default function LocationInput({ onPredict, loading }) {
  const [location, setLocation] = useState('');
  const [noiseLevel, setNoiseLevel] = useState(50);

  const commonLocations = ['London', 'Tokyo', 'New York', 'Paris', 'Mumbai', 'Sydney', 'Bangkok', 'Lagos'];

  const handleSubmit = (e) => {
    e.preventDefault();
    onPredict(location, noiseLevel);
  };

  const handleQuickAccess = (loc) => {
    onPredict(loc, noiseLevel);
  };

  return (
    <div className="location-input-section">
      <h2>📍 Enter Location</h2>
      <p>City, State, or Country</p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., London, Tokyo, Mumbai..."
          className="location-input"
          disabled={loading}
        />
        <button type="submit" disabled={loading} className="predict-btn">
          {loading ? '⏳ Analyzing...' : '🎯 Check Flood Risk'}
        </button>
      </form>

      {/* NOISE FIELD */}
      <div style={{
        background: 'rgba(102, 126, 234, 0.1)',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #667eea',
        marginTop: '20px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
          <label style={{ fontWeight: 'bold', color: '#f1f5f9' }}>🔊 Noise Level (Data Processing)</label>
          <span style={{ color: '#667eea', fontWeight: 'bold', fontSize: '1.1em' }}>{noiseLevel}%</span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={noiseLevel}
          onChange={(e) => setNoiseLevel(Number(e.target.value))}
          disabled={loading}
          style={{
            width: '100%',
            cursor: 'pointer',
            marginBottom: '12px',
            height: '6px'
          }}
        />

        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
          <span style={{
            flex: 1,
            textAlign: 'center',
            padding: '8px',
            borderRadius: '4px',
            background: noiseLevel < 33 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.05)',
            color: noiseLevel < 33 ? '#22c55e' : '#94a3b8',
            fontWeight: 'bold',
            fontSize: '0.85em'
          }}>Low Noise</span>
          <span style={{
            flex: 1,
            textAlign: 'center',
            padding: '8px',
            borderRadius: '4px',
            background: (noiseLevel >= 33 && noiseLevel < 67) ? 'rgba(251, 191, 36, 0.3)' : 'rgba(255, 255, 255, 0.05)',
            color: (noiseLevel >= 33 && noiseLevel < 67) ? '#fbbf24' : '#94a3b8',
            fontWeight: 'bold',
            fontSize: '0.85em'
          }}>Medium Noise</span>
          <span style={{
            flex: 1,
            textAlign: 'center',
            padding: '8px',
            borderRadius: '4px',
            background: noiseLevel >= 67 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.05)',
            color: noiseLevel >= 67 ? '#ef4444' : '#94a3b8',
            fontWeight: 'bold',
            fontSize: '0.85em'
          }}>High Noise</span>
        </div>

        <p style={{ fontSize: '0.8em', color: '#94a3b8', margin: 0 }}>
          💡 Higher noise = More data inconsistencies, sensor errors & real-world irregularities processed
        </p>
      </div>

      {/* QUICK ACCESS */}
      <div className="suggestions">
        <h3>⚡ Quick Access</h3>
        <div className="suggestion-grid">
          {commonLocations.map((loc) => (
            <button 
              key={loc} 
              onClick={() => handleQuickAccess(loc)} 
              className="suggestion-btn" 
              disabled={loading}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
