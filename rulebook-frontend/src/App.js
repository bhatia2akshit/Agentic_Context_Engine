import React, { useState } from 'react';

function App() {
  // State to track which tab is active (1 or 2)
  const [activeTab, setActiveTab] = useState(1);
  
  // State for Tab 1 (Load Data)
  const [documentText, setDocumentText] = useState('');
  const [loadMessage, setLoadMessage] = useState('');
  
  // State for Tab 2 (Chat)
  const [question, setQuestion] = useState('');
  const [sessionState, setSessionState] = useState(null);
  const [response, setResponse] = useState('');
  const [sessionId, setSessionId] = useState('');

  // Your API base URL - CHANGE THIS to your actual backend URL
  const API_BASE_URL = 'http://0.0.0.0:8000';

  // Function to load document data (Tab 1)
  const handleLoadData = async () => {
    try {
      // Make API call to load_data endpoint
      const res = await fetch(`${API_BASE_URL}/load_data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_text: documentText
        })
      });
      
      const data = await res.json();
      setLoadMessage(data.message || 'Data loaded successfully!');
    } catch (error) {
      setLoadMessage('Error loading data: ' + error.message);
    }
  };

  // Function to ask a question (Tab 2)
  const handleAskQuestion = async () => {
    try {
      // Make API call to ask question endpoint
      const res = await fetch(`${API_BASE_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          question: question
        })
      });
      
      const data = await res.json();
      setResponse(data.answer || 'No answer received');
      setSessionState(data.session_state);
    } catch (error) {
      setResponse('Error: ' + error.message);
    }
  };

  // Function to get current session state
  const handleGetSessionState = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/session/${sessionId}`);
      const data = await res.json();
      setSessionState(data);
    } catch (error) {
      setSessionState({ error: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Rulebook Agent
        </h1>

        {/* Tab Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab(1)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 1
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Load Data
          </button>
          <button
            onClick={() => setActiveTab(2)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 2
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Ask Questions
          </button>
        </div>

        {/* Tab 1: Load Data */}
        {activeTab === 1 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Load Document Data</h2>
            
            <textarea
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              placeholder="Paste your document text here..."
              className="w-full h-64 p-3 border border-gray-300 rounded-lg mb-4 font-mono text-sm"
            />
            
            <button
              onClick={handleLoadData}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Load Data
            </button>

            {loadMessage && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
                {loadMessage}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Ask Questions */}
        {activeTab === 2 && (
          <div className="space-y-6">
            {/* Session ID Input */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Session</h2>
              <input
                type="text"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Enter session ID (e.g., user123)"
                className="w-full p-3 border border-gray-300 rounded-lg mb-4"
              />
              <button
                onClick={handleGetSessionState}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Get Session State
              </button>
            </div>

            {/* Question Input */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Ask a Question</h2>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question here..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg mb-4"
              />
              <button
                onClick={handleAskQuestion}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ask Question
              </button>
            </div>

            {/* Response Display */}
            {response && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-3">Response</h3>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  {response}
                </div>
              </div>
            )}

            {/* Session State Display */}
            {sessionState && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-3">Current Session State</h3>
                <pre className="p-4 bg-gray-50 border border-gray-200 rounded-lg overflow-auto text-sm">
                  {JSON.stringify(sessionState, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;