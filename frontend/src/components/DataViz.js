import React from 'react';

export default function DataViz({ prediction, noiseEnabled }) {
  if (!prediction) {
    return (
      <div className="data-viz empty">
        <div className="empty-state">
          <span className="empty-icon">📊</span>
          <h3>Ready for Prediction</h3>
          <p>Adjust parameters and click "Predict Flood Risk"</p>
        </div>
      </div>
    );
  }

  if (prediction.error) {
    return (
      <div className="data-viz empty">
        <div className="empty-state">
          <span>❌</span>
          <h3>Error</h3>
          <p>{prediction.error}</p>
        </div>
      </div>
    );
  }

  const riskLevel = prediction.risk_level || 'MODERATE';
  const riskScore = prediction.risk_score || 5;
  const confidence = prediction.confidence || 80;
  const action = prediction.action || '📊 Analyzing...';
  const insights = prediction.insights || ['Monitor conditions'];
  const aiReasoning = prediction.ai_reasoning || 'Assessment ready';

  const getRiskColor = (level) => {
    const l = (level || '').toUpperCase();
    if (l === 'CRITICAL') return '#ff4444';
    if (l === 'HIGH') return '#ffaa00';
    if (l === 'MODERATE') return '#ffdd44';
    if (l === 'LOW') return '#44ff44';
    return '#667eea';
  };

  const floodProbability = Math.round((riskScore / 10) * 100);
  const today = new Date();
  const daysToAdd = riskLevel.toUpperCase() === 'CRITICAL' ? 1 : 
                    riskLevel.toUpperCase() === 'HIGH' ? 3 :
                    riskLevel.toUpperCase() === 'MODERATE' ? 7 : 14;
  const forecastDate = new Date(today.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  const formattedDate = forecastDate.toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  return (
    <div className="data-viz">
      <div className={`risk-card ${riskLevel.toLowerCase()}`}>
        <div className="risk-score-display">
          <div className="score-circle" style={{ borderColor: getRiskColor(riskLevel) }}>
            <span className="score">{riskScore}</span>
            <span className="label">/10</span>
          </div>
          <div className="risk-info">
            <h2>{riskLevel}</h2>
            <p className="action">{action}</p>
          </div>
        </div>

        <div className="confidence-bar">
          <span>Confidence: {confidence}%</span>
          <div className="bar">
            <div className="fill" style={{ width: `${confidence}%` }}></div>
          </div>
        </div>
      </div>

      <div className="probability-section">
        <div className="probability-card">
          <span className="prob-icon">📈</span>
          <div className="prob-content">
            <h3>Flood Probability</h3>
            <div className="probability-bar">
              <div className="probability-fill" style={{ 
                width: `${floodProbability}%`,
                background: floodProbability > 70 ? '#ff4444' : floodProbability > 40 ? '#ffaa00' : '#44ff44'
              }}></div>
            </div>
            <span className="prob-text">{floodProbability}% likely</span>
          </div>
        </div>

        <div className="forecast-card">
          <span className="forecast-icon">📅</span>
          <div className="forecast-content">
            <h3>Expected Timeline</h3>
            <p className="forecast-date">{formattedDate}</p>
            <p className="forecast-label">
              {daysToAdd === 1 ? '🚨 Within 24 hours' :
               daysToAdd === 3 ? '⚠️ Within 3 days' :
               daysToAdd === 7 ? '📢 Within a week' : '✅ Monitor 2 weeks'}
            </p>
          </div>
        </div>
      </div>

      <div className="insights-section">
        <h3>💡 Key Insights</h3>
        <div className="insights-list">
          {insights.map((insight, i) => (
            <div key={i} className="insight-item"><span>{insight}</span></div>
          ))}
        </div>
      </div>

      {aiReasoning && (
        <div className="ai-response-section">
          <h3>🤖 AI Assessment</h3>
          <div className="ai-response-box">
            <p>{aiReasoning}</p>
          </div>
        </div>
      )}

      {prediction.parameters && (
        <div className="parameters-section">
          <h3>🔬 Environmental Data</h3>
          <div className="parameters-grid">
            <div className="param-card">
              <span className="param-icon">🌧️</span>
              <div className="param-value">{prediction.parameters.rainfall_mm}</div>
              <div className="param-label">Rainfall (mm)</div>
            </div>
            <div className="param-card">
              <span className="param-icon">💧</span>
              <div className="param-value">{prediction.parameters.water_level_m}</div>
              <div className="param-label">Water Level (m)</div>
            </div>
            <div className="param-card">
              <span className="param-icon">🌊</span>
              <div className="param-value">{prediction.parameters.river_discharge_m3s}</div>
              <div className="param-label">Discharge (m³/s)</div>
            </div>
            <div className="param-card">
              <span className="param-icon">💨</span>
              <div className="param-value">{prediction.parameters.humidity_percent}%</div>
              <div className="param-label">Humidity</div>
            </div>
          </div>
        </div>
      )}

      {noiseEnabled && (
        <div className="noise-indicator">
          <span className="noise-badge">🔊 Noise Injection Active</span>
          <p>Results include ±10% sensor error</p>
        </div>
      )}

      <div className="metadata">
        <span>⏱️ {prediction.timestamp || new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
