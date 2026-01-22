import React, { useState } from 'react';

function App() {
  // State to track which tab is active (1 or 2)
  const [activeTab, setActiveTab] = useState(1);
  
  // State for Tab 1 (Load Data)
  const [pdfFile, setPdfFile] = useState(null);
  const [jsonFile, setJsonFile] = useState(null);
  const [loadMessage, setLoadMessage] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  
  // State for Tab 2 (Chat)
  const [question, setQuestion] = useState('');
  const [sessionState, setSessionState] = useState(null);
  const [response, setResponse] = useState('');

  // Auth state
  const [username, setUsername] = useState('testuser');
  const [password, setPassword] = useState('testpassword');
  const [accessToken, setAccessToken] = useState('');

  // Your API base URL - CHANGE THIS to your actual backend URL
  const API_BASE_URL = 'http://localhost:8000';

  const handleLogin = async () => {
    try {
      setAuthMessage('');
      const form = new URLSearchParams();
      form.append('username', username);
      form.append('password', password);

      const res = await fetch(`${API_BASE_URL}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString()
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthMessage(data.detail || 'Login failed');
        return;
      }

      setAccessToken(data.access_token || '');
      setAuthMessage('Logged in');
    } catch (error) {
      setAuthMessage('Login error: ' + error.message);
    }
  };

  // Function to load document data (Tab 1)
  const handleLoadData = async () => {
    try {
      if (!pdfFile || !jsonFile) {
        setLoadMessage('Please choose both a PDF and a JSON file.');
        return;
      }
      if (!accessToken) {
        setLoadMessage('Please log in to get an access token first.');
        return;
      }

      const formData = new FormData();
      formData.append('pdf_file', pdfFile);
      formData.append('json_file', jsonFile);

      // Make API call to load_data endpoint
      const res = await fetch(`${API_BASE_URL}/load_data`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        body: formData
      });
      
      const data = await res.json();
      if (!res.ok) {
        setLoadMessage(data.detail || 'Failed to load data.');
        return;
      }
      setLoadMessage(data.message || 'Data loaded successfully!');
      setSessionState(data.session_state || null);
      setActiveTab(2);
    } catch (error) {
      setLoadMessage('Error loading data: ' + error.message);
    }
  };

  // Function to ask a question (Tab 2)
  const handleAskQuestion = async () => {
    try {
      if (!accessToken) {
        setResponse('Please log in to get an access token first.');
        return;
      }
      // Make API call to ask question endpoint
      const res = await fetch(`${API_BASE_URL}/query_ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          question: question
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        setResponse(data.detail || 'No answer received');
        return;
      }
      setResponse(data.response || 'No answer received');
      setSessionState(data.session_state);
    } catch (error) {
      setResponse('Error: ' + error.message);
    }
  };

  // Function to get current session state
  const handleGetSessionState = async () => {
    try {
      if (!accessToken) {
        setSessionState({ error: 'Please log in to get an access token first.' });
        return;
      }
      const res = await fetch(`${API_BASE_URL}/session_state`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        setSessionState({ error: data.detail || 'Failed to get session state.' });
        return;
      }
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

            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="border border-gray-300 rounded-lg px-3 py-2"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="border border-gray-300 rounded-lg px-3 py-2"
                />
                <button
                  onClick={handleLogin}
                  className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition-colors"
                >
                  Login
                </button>
              </div>
              <div className="text-sm text-gray-600">
                {accessToken ? 'Token set.' : 'Not logged in.'}
              </div>
              {authMessage && (
                <div className="text-sm text-gray-700">{authMessage}</div>
              )}
            </div>

            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PDF File
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  JSON File
                </label>
                <input
                  type="file"
                  accept="application/json"
                  onChange={(e) => setJsonFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
              </div>
            </div>
            
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
            {/* Session State Refresh */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Session</h2>
              <button
                onClick={handleGetSessionState}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Refresh Session State
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
