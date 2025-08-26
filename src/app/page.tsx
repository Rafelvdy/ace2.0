'use client';

import { useState } from 'react';
import BpmnViewer from '@/components/BpmnViewer';

export default function Home() {
  const [requirements, setRequirements] = useState('');
  const [generatedXml, setGeneratedXml] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!requirements.trim()) {
      setError('Please enter requirements');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate-bpmn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requirements }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate BPMN');
      }

      setGeneratedXml(data.xml);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleElementClick = (element: { id: string; type: string; [key: string]: unknown }) => {
    console.log('Element clicked:', element);
  };

  const exampleRequirements = `
  Auto-approve motor insurance claims under £1,000 where:
  - Customer has no previous claims in 24 months
  - Damage assessment score is below 3/10
  - No third party involvement
  
  Escalate to human review if:
  - Claim amount exceeds £1,000
  - Customer has 2+ claims in past 24 months  
  - Fraud indicators detected
  - Third party claims involved
  
  Reject automatically if:
  - Policy is expired or suspended
  - Claim is outside policy coverage
  - Duplicate claim detected
    `.trim();

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              AI BPMN Generator for Insurance Claims
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Convert natural language requirements into automated workflow diagrams
            </p>
          </div>
  
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Requirements Input</h2>
              
              <div className="mb-4">
                <button
                  onClick={() => setRequirements(exampleRequirements)}
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  Load example requirements
                </button>
              </div>
  
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Describe your insurance claims automation requirements in plain English..."
                className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
  
              <div className="mt-4 flex items-center gap-4">
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Generating...' : 'Generate BPMN Diagram'}
                </button>
  
                {generatedXml && (
                  <button
                    onClick={() => {
                      const blob = new Blob([generatedXml], { type: 'application/xml' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'insurance-claims-workflow.bpmn';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Download XML
                  </button>
                )}
              </div>
  
              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
            </div>
  
            {/* Diagram Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Generated BPMN Diagram</h2>
              
              {generatedXml ? (
                <BpmnViewer 
                  xml={generatedXml} 
                  onElementClick={handleElementClick}
                />
              ) : (
                <div className="border border-gray-300 rounded-lg h-96 flex items-center justify-center text-gray-500">
                  Enter requirements and click &quot;Generate&quot; to see your BPMN diagram
                </div>
              )}
            </div>
          </div>
  
          {generatedXml && (
            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-3">Generated BPMN XML</h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{generatedXml}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    );
}