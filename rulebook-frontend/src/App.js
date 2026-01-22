import React, { useMemo, useState } from 'react';
import './App.css';

function App() {
  // State to track which tab is active (1 or 2)
  const [activeTab, setActiveTab] = useState(1);
  
  // State for Tab 1 (Load Data)
  const [pdfFile, setPdfFile] = useState(null);
  const [jsonFile, setJsonFile] = useState(null);
  const [loadMessage, setLoadMessage] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [apiMessage, setApiMessage] = useState('');
  
  // State for Tab 2 (Chat)
  const [question, setQuestion] = useState('');
  const [sessionState, setSessionState] = useState(null);
  const [response, setResponse] = useState('');

  // Auth state
  const [username, setUsername] = useState('testuser');
  const [password, setPassword] = useState('testpassword');
  const [accessToken, setAccessToken] = useState('');
  const [apiBaseUrl, setApiBaseUrl] = useState('http://localhost:8000');

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [isRefreshingSession, setIsRefreshingSession] = useState(false);

  const apiBaseUrlLabel = useMemo(
    () => apiBaseUrl.replace(/^https?:\/\//, ''),
    [apiBaseUrl]
  );

  const handleLogin = async () => {
    try {
      setAuthMessage('');
      setApiMessage('');
      setIsLoggingIn(true);
      const form = new URLSearchParams();
      form.append('username', username);
      form.append('password', password);

      const res = await fetch(`${apiBaseUrl}/token`, {
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
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Function to load document data (Tab 1)
  const handleLoadData = async () => {
    try {
      setLoadMessage('');
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

      setIsLoadingData(true);
      // Make API call to load_data endpoint
      const res = await fetch(`${apiBaseUrl}/load_data`, {
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
    } finally {
      setIsLoadingData(false);
    }
  };

  // Function to ask a question (Tab 2)
  const handleAskQuestion = async () => {
    try {
      if (!accessToken) {
        setResponse('Please log in to get an access token first.');
        return;
      }
      if (!question.trim()) {
        setResponse('Please enter a question before submitting.');
        return;
      }
      setIsAsking(true);
      // Make API call to ask question endpoint
      const res = await fetch(`${apiBaseUrl}/query_ai`, {
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
    } finally {
      setIsAsking(false);
    }
  };

  // Function to get current session state
  const handleGetSessionState = async () => {
    try {
      if (!accessToken) {
        setSessionState({ error: 'Please log in to get an access token first.' });
        return;
      }
      setIsRefreshingSession(true);
      const res = await fetch(`${apiBaseUrl}/session_state`, {
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
    } finally {
      setIsRefreshingSession(false);
    }
  };

  return (
    <div className="app">
      <div className="app__shell">
        {/* Header */}
        <header className="app__header">
          <div>
            <p className="app__eyebrow">Hybrid RAG Console</p>
            <h1>Rulebook Agent</h1>
          </div>
          <div className="app__status">
            <span className={`pill ${accessToken ? 'pill--success' : 'pill--warning'}`}>
              {accessToken ? 'Authenticated' : 'Not authenticated'}
            </span>
            <span className="pill pill--info">API: {apiBaseUrlLabel}</span>
          </div>
        </header>

        {/* Tab Buttons */}
        <div className="tabs">
          <button
            onClick={() => setActiveTab(1)}
            className={`tab ${activeTab === 1 ? 'tab--active' : ''}`}
          >
            Load Data
          </button>
          <button
            onClick={() => setActiveTab(2)}
            className={`tab ${activeTab === 2 ? 'tab--active' : ''}`}
          >
            Ask Questions
          </button>
        </div>

        {/* Tab 1: Load Data */}
        {activeTab === 1 && (
          <div className="card">
            <h2>Load Document Data</h2>
            <p className="card__helper">
              Provide credentials, point to your backend URL, then upload the PDF rules and
              JSON session objects to start a hybrid RAG session.
            </p>

            <div className="grid grid--3">
              <label className="field">
                <span>API Base URL</span>
                <input
                  type="url"
                  value={apiBaseUrl}
                  onChange={(e) => setApiBaseUrl(e.target.value)}
                  placeholder="http://localhost:8000"
                />
              </label>
              <label className="field">
                <span>Username</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                />
              </label>
              <label className="field">
                <span>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                />
              </label>
            </div>

            <div className="actions">
              <button className="button button--ghost" onClick={handleLogin} disabled={isLoggingIn}>
                {isLoggingIn ? 'Logging in…' : 'Login'}
              </button>
              {authMessage && <span className="text-muted">{authMessage}</span>}
            </div>

            <div className="grid grid--2">
              <label className="field">
                <span>PDF File</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                />
              </label>
              <label className="field">
                <span>JSON File</span>
                <input
                  type="file"
                  accept="application/json"
                  onChange={(e) => setJsonFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            <div className="actions">
              <button
                onClick={handleLoadData}
                className="button"
                disabled={isLoadingData}
              >
                {isLoadingData ? 'Loading…' : 'Load Data'}
              </button>
              {loadMessage && <span className="text-muted">{loadMessage}</span>}
            </div>

            {apiMessage && <div className="notice">{apiMessage}</div>}
          </div>
        )}

        {/* Tab 2: Ask Questions */}
        {activeTab === 2 && (
          <div className="stack">
            {/* Session State Refresh */}
            <div className="card">
              <h2>Session</h2>
              <p className="card__helper">
                Refresh the session state to confirm which ephemeral objects are currently in
                memory.
              </p>
              <button
                onClick={handleGetSessionState}
                className="button button--ghost"
                disabled={isRefreshingSession}
              >
                {isRefreshingSession ? 'Refreshing…' : 'Refresh Session State'}
              </button>
            </div>

            {/* Question Input */}
            <div className="card">
              <h2>Ask a Question</h2>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question here..."
                className="textarea"
              />
              <button
                onClick={handleAskQuestion}
                className="button"
                disabled={isAsking}
              >
                {isAsking ? 'Thinking…' : 'Ask Question'}
              </button>
            </div>

            {/* Response Display */}
            {response && (
              <div className="card">
                <h3>Response</h3>
                <pre className="response">{response}</pre>
              </div>
            )}

            {/* Session State Display */}
            {sessionState && (
              <div className="card">
                <h3>Current Session State</h3>
                <pre className="code-block">
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
