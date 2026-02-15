'use client';

import { useState } from 'react';

export default function ESGTestComponent() {
  const [testResult, setTestResult] = useState<string>('');

  const testESGScoring = async () => {
    try {
      const response = await fetch('/api/esg/scoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          environmental: {
            carbonEmissions: 50,
            energyEfficiency: 75,
            wasteManagement: 80,
            waterConservation: 70,
            renewableEnergy: 60
          },
          social: {
            laborRights: 85,
            communityEngagement: 75,
            diversityInclusion: 80,
            healthSafety: 90,
            supplyChainEthics: 70
          },
          governance: {
            boardDiversity: 75,
            transparency: 80,
            antiCorruption: 85,
            riskManagement: 80,
            stakeholderEngagement: 75
          },
          industry: 'manufacturing'
        }),
      });

      const data = await response.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setTestResult(`Error: ${error}`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">ESG Scoring System Test</h2>
      <button
        onClick={testESGScoring}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
      >
        Test ESG Scoring
      </button>
      {testResult && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Test Result:</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {testResult}
          </pre>
        </div>
      )}
    </div>
  );
} 
