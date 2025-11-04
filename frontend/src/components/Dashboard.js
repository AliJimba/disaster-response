import React, { useState } from 'react';
import RiskAnalyzer from './RiskAnalyzer';
import DataViz from './DataViz';

export default function Dashboard({ noiseEnabled }) {
  const [prediction, setPrediction] = useState(null);

  const handlePrediction = (result) => {
    setPrediction(result);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <div className="panel left-panel">
          <RiskAnalyzer 
            onPrediction={handlePrediction}
            noiseEnabled={noiseEnabled}
          />
        </div>

        <div className="panel right-panel">
          <DataViz prediction={prediction} noiseEnabled={noiseEnabled} />
        </div>
      </div>
    </div>
  );
}
