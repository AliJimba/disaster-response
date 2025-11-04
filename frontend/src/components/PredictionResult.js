import React from 'react';

export default function PredictionResult({ prediction, location }) {
  if (!prediction) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
        <p>🌍 Enter a location to check flood risk worldwide</p>
      </div>
    );
  }

  if (prediction.error) {
    return (
      <div style={{ textAlign: 'center', color: '#ff6b6b', padding: '20px' }}>
        <p>❌ {prediction.error}</p>
      </div>
    );
  }

  const getRiskColor = (level) => {
    switch (level) {
      case 'CRITICAL': return '#ff4444';
      case 'HIGH': return '#ff9500';
      case 'MODERATE': return '#ffc107';
      case 'LOW': return '#4caf50';
      default: return '#666';
    }
  };

  const getRiskEmoji = (level) => {
    switch (level) {
      case 'CRITICAL': return '🚨';
      case 'HIGH': return '⚠️';
      case 'MODERATE': return '📢';
      case 'LOW': return '✅';
      default: return '❓';
    }
  };

  return (
    <div className="prediction-result">
      <div className="result-card">
        <h2>📍 {location}</h2>
        
        <div className="risk-display">
          <div style={{
            fontSize: '3em',
            marginBottom: '10px'
          }}>
            {getRiskEmoji(prediction.risk_level)}
          </div>
          
          <div className="risk-level" style={{
            color: getRiskColor(prediction.risk_level),
            fontSize: '1.8em',
            fontWeight: 'bold'
          }}>
            {prediction.risk_level}
          </div>
          
          <div className="risk-score">
            <div className="score-bar">
              <div className="score-fill" style={{
                width: `${(prediction.risk_score / 10) * 100}%`,
                backgroundColor: getRiskColor(prediction.risk_level)
              }}></div>
            </div>
            <p>{prediction.risk_score.toFixed(1)}/10</p>
          </div>
        </div>

        <div className="metrics-grid">
          <div className="metric">
            <span className="metric-icon">🌡️</span>
            <span className="metric-label">Temperature</span>
            <span className="metric-value">{prediction.temperature}°C</span>
          </div>
          <div className="metric">
            <span className="metric-icon">💧</span>
            <span className="metric-label">Rainfall</span>
            <span className="metric-value">{prediction.rainfall}mm</span>
          </div>
          <div className="metric">
            <span className="metric-icon">💨</span>
            <span className="metric-label">Humidity</span>
            <span className="metric-value">{prediction.humidity}%</span>
          </div>
          <div className="metric">
            <span className="metric-icon">📏</span>
            <span className="metric-label">Elevation</span>
            <span className="metric-value">{prediction.elevation}m</span>
          </div>
        </div>

        <div className="action-box" style={{
          backgroundColor: `${getRiskColor(prediction.risk_level)}20`,
          borderLeft: `4px solid ${getRiskColor(prediction.risk_level)}`
        }}>
          <p><strong>🎯 Recommended Action:</strong></p>
          <p>{prediction.action}</p>
        </div>

        <div className="ai-reasoning">
          <p><strong>🤖 AI Analysis:</strong></p>
          <p>{prediction.ai_reasoning}</p>
        </div>

        <div className="confidence">
          <p>Confidence: {prediction.confidence}%</p>
        </div>
      </div>
    </div>
  );
}
