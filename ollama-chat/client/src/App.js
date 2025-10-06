import React, { useState, useEffect } from 'react';
import { MessageSquare, Image, Settings, Brain, AlertCircle, Mail, ExternalLink } from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import ModelManager from './components/ModelManager';
import ImageGenerator from './components/ImageGenerator';
import ContactPage from './components/ContactPage';
import ollamaService from './services/ollamaService';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedModel, setSelectedModel] = useState('');
  const [models, setModels] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [error, setError] = useState('');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setConnectionStatus('connecting');
      await ollamaService.healthCheck();
      setConnectionStatus('connected');
      setError('');
    } catch (error) {
      console.error('Connection failed:', error);
      setConnectionStatus('disconnected');
      setError('Failed to connect to Ollama service. Make sure Ollama is running on localhost:11434');
    }
  };

  const handleModelSelect = (modelName) => {
    setSelectedModel(modelName);
    localStorage.setItem('selectedModel', modelName);
  };

  const handleModelsChange = (modelList) => {
    setModels(modelList);
    // Auto-select saved model or first available model
    const savedModel = localStorage.getItem('selectedModel');
    if (savedModel && modelList.find(m => m.name === savedModel)) {
      setSelectedModel(savedModel);
    } else if (modelList.length > 0 && !selectedModel) {
      setSelectedModel(modelList[0].name);
    }
  };

  const tabs = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'models', label: 'Models', icon: Settings },
    { id: 'images', label: 'Images', icon: Image },
    { id: 'contact', label: 'Contact', icon: Mail }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <ChatInterface 
            selectedModel={selectedModel}
            models={models}
          />
        );
      case 'models':
        return (
          <ModelManager
            selectedModel={selectedModel}
            onModelSelect={handleModelSelect}
            onModelsChange={handleModelsChange}
          />
        );
      case 'images':
        return (
          <ImageGenerator
            selectedModel={selectedModel}
            models={models}
          />
        );
      case 'contact':
        return <ContactPage />;
      default:
        return null;
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="app-logo">
            <Brain size={32} />
            <h1>KAI FREE GPT</h1>
            <span className="app-tagline">Powered by Ollama</span>
          </div>
          
          <div className={`connection-status ${connectionStatus}`}>
            <div className="status-indicator" />
            <span>
              {connectionStatus === 'connecting' && 'Connecting...'}
              {connectionStatus === 'connected' && 'Connected'}
              {connectionStatus === 'disconnected' && 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="header-right">
          {selectedModel && (
            <div className="selected-model">
              <span className="model-label">Model:</span>
              <span className="model-name">{selectedModel}</span>
            </div>
          )}
        </div>
      </header>

      {/* Connection Error */}
      {connectionStatus === 'disconnected' && (
        <div className="connection-error">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={checkConnection} className="retry-btn">
            Retry Connection
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="app-content">
        {/* Sidebar Navigation */}
        <nav className="app-sidebar">
          <div className="tab-list">
            {tabs.map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                  title={tab.label}
                >
                  <IconComponent size={20} />
                  <span className="tab-label">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Model Info in Sidebar */}
          {connectionStatus === 'connected' && (
            <div className="sidebar-info">
              <div className="info-section">
                <h4>Available Models</h4>
                <div className="model-count">{models.length} models</div>
              </div>
              
              {selectedModel && (
                <div className="info-section">
                  <h4>Current Model</h4>
                  <div className="current-model">
                    <div className="model-name">{selectedModel}</div>
                    <div className="model-features">
                      {selectedModel.toLowerCase().includes('llava') && (
                        <span className="feature-badge">Vision</span>
                      )}
                      {selectedModel.toLowerCase().includes('code') && (
                        <span className="feature-badge">Code</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="sidebar-actions">
            <div className="action-section">
              <h4>Quick Actions</h4>
              <button
                onClick={() => setActiveTab('models')}
                className="action-btn"
                disabled={connectionStatus !== 'connected'}
              >
                <Settings size={16} />
                Manage Models
              </button>
              <button
                onClick={() => setActiveTab('images')}
                className="action-btn"
                disabled={connectionStatus !== 'connected' || !selectedModel}
              >
                <Image size={16} />
                Generate Images
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className="action-btn"
              >
                <Mail size={16} />
                Contact & Info
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="app-main">
          {connectionStatus === 'connected' ? (
            renderActiveTab()
          ) : connectionStatus === 'connecting' ? (
            <div className="loading-screen">
              <div className="loading-spinner" />
              <h3>Connecting to Ollama...</h3>
              <p>Please make sure Ollama is running</p>
            </div>
          ) : (
            <div className="disconnected-screen">
              <AlertCircle size={64} />
              <h3>Connection Failed</h3>
              <p>Unable to connect to Ollama service</p>
              <div className="troubleshooting">
                <h4>Troubleshooting:</h4>
                <ul>
                  <li>Make sure Ollama is installed and running</li>
                  <li>Check that Ollama is accessible at localhost:11434</li>
                  <li>Try restarting the Ollama service</li>
                </ul>
              </div>
              <button onClick={checkConnection} className="retry-connection-btn">
                Retry Connection
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <span>KAI FREE GPT</span>
          <span>•</span>
          <span>Powered by Ollama</span>
          <span>•</span>
          <a href="https://www.kartikbhardwaj.me/freegpt" target="_blank" rel="noopener noreferrer" className="footer-link">
            <ExternalLink size={14} />
            Visit Website
          </a>
          {connectionStatus === 'connected' && (
            <>
              <span>•</span>
              <span>{models.length} models available</span>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}

export default App;