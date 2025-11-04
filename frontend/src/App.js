import React, { useState } from 'react';
import './App.css';
import LocationInput from './components/LocationInput';
import PredictionResult from './components/PredictionResult';
import ChatTab from './components/ChatTab';

function App() {
  const [activeTab, setActiveTab] = useState('predict');
  const [prediction, setPrediction] = useState(null);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  const handlePredict = async (loc, noiseLevel = 50) => {
  if (!loc.trim()) return;
  
  setLocation(loc);
  setLoading(true);
  setProcessingStep(0);
  setPrediction(null);
  
  const steps = ['Data Collection', 'Noise Injection', 'ML Processing', 'Risk Calculation'];
  
  for (let i = 0; i < steps.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 800 + (noiseLevel * 8)));
    setProcessingStep(i + 1);
  }

  try {
    // CORRECTED API CALL
    const response = await fetch('http://localhost:8000/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `location=${encodeURIComponent(loc)}&noise_level=${noiseLevel / 100}`
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      setPrediction({ error: data.error });
    } else {
      setPrediction(data);
      console.log('✅ Prediction received:', data);
    }
  } catch (error) {
    console.error('❌ Fetch error:', error);
    setPrediction({ error: 'Failed to fetch: ' + error.message });
  }
  
  setLoading(false);
  setProcessingStep(0);
};



  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a, #1a1f3a)', padding: '30px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5em', color: '#667eea', marginBottom: '10px' }}>🌊 FloodAI</h1>
          <p style={{ color: '#94a3b8' }}>Disaster Response System | n8n + Ollama + Noise Injection</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '2px solid #334155', paddingBottom: '10px' }}>
          <button
            onClick={() => setActiveTab('predict')}
            style={{
              background: activeTab === 'predict' ? '#667eea' : 'transparent',
              border: 'none',
              color: activeTab === 'predict' ? 'white' : '#94a3b8',
              padding: '10px 20px',
              cursor: 'pointer',
              fontWeight: 'bold',
              borderRadius: '4px'
            }}
          >
            📊 Prediction
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            disabled={!prediction || prediction.error}
            style={{
              background: activeTab === 'chat' ? '#667eea' : 'transparent',
              border: 'none',
              color: activeTab === 'chat' ? 'white' : '#94a3b8',
              padding: '10px 20px',
              cursor: prediction?.error ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: prediction?.error ? 0.5 : 1,
              borderRadius: '4px'
            }}
          >
            💬 Chat
          </button>
        </div>

        {/* Prediction Tab */}
        {activeTab === 'predict' && (
          <>
            <LocationInput onPredict={handlePredict} loading={loading} />

            {/* Processing Bar */}
            {loading && processingStep > 0 && (
              <div style={{
                background: 'rgba(102, 126, 234, 0.1)',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #667eea'
              }}>
                <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#f1f5f9', fontWeight: 'bold' }}>Processing</span>
                  <span style={{ color: '#667eea' }}>{Math.round((processingStep / 4) * 100)}%</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: '6px',
                        background: i < processingStep ? '#667eea' : 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '3px',
                        transition: 'all 0.3s'
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <PredictionResult prediction={prediction} location={location} />
          </>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && prediction && !prediction.error && (
          <ChatTab prediction={prediction} location={location} />
        )}
      </div>
    </div>
  );
}

export default App;
