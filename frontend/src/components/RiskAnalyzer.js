import React, { useState } from 'react';

export default function RiskAnalyzer({ onPrediction }) {
  const [formData, setFormData] = useState({
    rainfall: 150,
    water_level: 5,
    river_discharge: 2500,
    humidity: 70,
    population_density: 5000,
    historical_floods: 0,
    infrastructure: 1,
    location: 'North India'
  });
  const [loading, setLoading] = useState(false);
  const [noiseEnabled, setNoiseEnabled] = useState(false);

  const handleSliderChange = (key, value) => {
    setFormData({ ...formData, [key]: parseFloat(value) });
  };

  const handleSelectChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // Call n8n webhook with the webhook ID from your n8n setup
    const response = await fetch('http://localhost:5678/webhook/flood-predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rainfall: formData.rainfall,
        water_level: formData.water_level,
        river_discharge: formData.river_discharge,
        humidity: formData.humidity,
        population_density: formData.population_density,
        historical_floods: formData.historical_floods,
        infrastructure: formData.infrastructure,
        location: formData.location,
        apply_noise: noiseEnabled
      })
    });

    const prediction = await response.json();
    onPrediction(prediction);
    console.log('✅ n8n prediction:', prediction);
  } catch (error) {
    console.error('Error:', error);
    alert('❌ n8n workflow error\n\nMake sure:\n✅ n8n running (5678)\n✅ Backend running (8000)\n✅ Workflow activated');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="risk-analyzer">
      <h2>⚙️ Environmental Parameters</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>🌧️ Rainfall (mm): {formData.rainfall}</label>
          <input type="range" min="0" max="300" value={formData.rainfall} 
            onChange={(e) => handleSliderChange('rainfall', e.target.value)} />
        </div>

        <div className="form-group">
          <label>💧 Water Level (m): {formData.water_level}</label>
          <input type="range" min="0" max="15" step="0.1" value={formData.water_level} 
            onChange={(e) => handleSliderChange('water_level', e.target.value)} />
        </div>

        <div className="form-group">
          <label>🌊 River Discharge (m³/s): {formData.river_discharge}</label>
          <input type="range" min="0" max="5000" step="100" value={formData.river_discharge} 
            onChange={(e) => handleSliderChange('river_discharge', e.target.value)} />
        </div>

        <div className="form-group">
          <label>💨 Humidity (%): {formData.humidity}</label>
          <input type="range" min="0" max="100" value={formData.humidity} 
            onChange={(e) => handleSliderChange('humidity', e.target.value)} />
        </div>

        <div className="form-group">
          <label>👥 Population Density (/km²): {formData.population_density}</label>
          <input type="range" min="0" max="20000" step="500" value={formData.population_density} 
            onChange={(e) => handleSliderChange('population_density', e.target.value)} />
        </div>

        <div className="form-group">
          <label>📍 Location:</label>
          <select value={formData.location} onChange={(e) => handleSelectChange('location', e.target.value)}>
            <option>North India</option>
            <option>South India</option>
            <option>East India</option>
            <option>West India</option>
            <option>Northeast India</option>
          </select>
        </div>

        <div className="form-group checkbox">
          <label>
            <input type="checkbox" checked={formData.historical_floods} 
              onChange={(e) => setFormData({...formData, historical_floods: e.target.checked ? 1 : 0})} />
            📜 Historical Floods in Area
          </label>
        </div>

        <div className="form-group checkbox">
          <label>
            <input type="checkbox" checked={formData.infrastructure} 
              onChange={(e) => setFormData({...formData, infrastructure: e.target.checked ? 1 : 0})} />
            🏢 Built-up Infrastructure
          </label>
        </div>

        <div className="form-group checkbox">
          <label>
            <input type="checkbox" checked={noiseEnabled} onChange={(e) => setNoiseEnabled(e.target.checked)} />
            🔊 Enable Noise Injection (±10% sensor error)
          </label>
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? '⏳ Analyzing...' : '🎯 Predict Flood Risk'}
        </button>
      </form>
    </div>
  );
}
