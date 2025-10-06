import React, { useState, useEffect } from 'react';
import { Download, Trash2, Info, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import ollamaService from '../services/ollamaService';

const ModelManager = ({ selectedModel, onModelSelect, onModelsChange }) => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState({});
  const [deleting, setDeleting] = useState({});
  const [newModelName, setNewModelName] = useState('');
  const [downloadProgress, setDownloadProgress] = useState({});
  const [error, setError] = useState('');
  const [modelInfo, setModelInfo] = useState({});
  const [showInfo, setShowInfo] = useState({});

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setLoading(true);
    setError('');
    try {
      const modelList = await ollamaService.getModels();
      setModels(modelList);
      if (onModelsChange) {
        onModelsChange(modelList);
      }
      // Auto-select first model if none selected
      if (modelList.length > 0 && !selectedModel) {
        onModelSelect(modelList[0].name);
      }
    } catch (error) {
      setError('Failed to load models: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadModel = async () => {
    if (!newModelName.trim()) {
      setError('Please enter a model name');
      return;
    }

    const modelName = newModelName.trim();
    setDownloading(prev => ({ ...prev, [modelName]: true }));
    setDownloadProgress(prev => ({ ...prev, [modelName]: { status: 'Downloading...', completed: 0, total: 0 } }));
    setError('');

    try {
      await ollamaService.pullModel(
        modelName,
        (progress) => {
          setDownloadProgress(prev => ({
            ...prev,
            [modelName]: {
              status: progress.status || 'Downloading...',
              completed: progress.completed || 0,
              total: progress.total || 1,
              percent: progress.total ? Math.round((progress.completed / progress.total) * 100) : 0
            }
          }));
        }
      );

      // Refresh models list
      await loadModels();
      setNewModelName('');
      setDownloadProgress(prev => {
        const updated = { ...prev };
        delete updated[modelName];
        return updated;
      });
    } catch (error) {
      setError(`Failed to download ${modelName}: ${error.message}`);
    } finally {
      setDownloading(prev => {
        const updated = { ...prev };
        delete updated[modelName];
        return updated;
      });
    }
  };

  const handleDeleteModel = async (modelName) => {
    if (!window.confirm(`Are you sure you want to delete the model "${modelName}"?`)) {
      return;
    }

    setDeleting(prev => ({ ...prev, [modelName]: true }));
    setError('');

    try {
      await ollamaService.deleteModel(modelName);
      await loadModels();
      
      // If deleted model was selected, select another one
      if (selectedModel === modelName && models.length > 1) {
        const remainingModels = models.filter(m => m.name !== modelName);
        if (remainingModels.length > 0) {
          onModelSelect(remainingModels[0].name);
        }
      }
    } catch (error) {
      setError(`Failed to delete ${modelName}: ${error.message}`);
    } finally {
      setDeleting(prev => {
        const updated = { ...prev };
        delete updated[modelName];
        return updated;
      });
    }
  };

  const handleGetModelInfo = async (modelName) => {
    if (showInfo[modelName]) {
      setShowInfo(prev => ({ ...prev, [modelName]: false }));
      return;
    }

    try {
      setShowInfo(prev => ({ ...prev, [modelName]: true }));
      if (!modelInfo[modelName]) {
        const info = await ollamaService.getModelInfo(modelName);
        setModelInfo(prev => ({ ...prev, [modelName]: info }));
      }
    } catch (error) {
      setError(`Failed to get info for ${modelName}: ${error.message}`);
      setShowInfo(prev => ({ ...prev, [modelName]: false }));
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isVisionModel = (modelName) => {
    return modelName.toLowerCase().includes('llava') || 
           modelName.toLowerCase().includes('vision') ||
           modelName.toLowerCase().includes('bakllava');
  };

  const isImageGenModel = (modelName) => {
    return modelName.toLowerCase().includes('stable') ||
           modelName.toLowerCase().includes('dall') ||
           modelName.toLowerCase().includes('imagen');
  };

  return (
    <div className="model-manager">
      <div className="model-manager-header">
        <h3>Model Management</h3>
        {loading && <Loader2 className="loading-spinner" size={16} />}
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Download new model */}
      <div className="download-section">
        <div className="download-input-group">
          <input
            type="text"
            value={newModelName}
            onChange={(e) => setNewModelName(e.target.value)}
            placeholder="Enter model name (e.g., llava, mistral, codellama)"
            className="model-input"
            onKeyPress={(e) => e.key === 'Enter' && handleDownloadModel()}
          />
          <button
            onClick={handleDownloadModel}
            disabled={downloading[newModelName] || !newModelName.trim()}
            className="download-btn"
          >
            {downloading[newModelName] ? (
              <Loader2 className="loading-spinner" size={16} />
            ) : (
              <Download size={16} />
            )}
            Download
          </button>
        </div>

        {/* Download progress */}
        {Object.entries(downloadProgress).map(([modelName, progress]) => (
          <div key={modelName} className="download-progress">
            <div className="progress-info">
              <span className="model-name">{modelName}</span>
              <span className="progress-text">{progress.status}</span>
            </div>
            {progress.total > 0 && (
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            )}
            {progress.total > 0 && (
              <div className="progress-details">
                {formatBytes(progress.completed)} / {formatBytes(progress.total)} ({progress.percent}%)
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Available models */}
      <div className="models-list">
        <h4>Available Models ({models.length})</h4>
        {models.length === 0 && !loading ? (
          <div className="no-models">
            <p>No models available. Download a model to get started.</p>
            <p className="model-suggestions">
              Popular models: <code>llava</code>, <code>mistral</code>, <code>codellama</code>, <code>llama2</code>
            </p>
          </div>
        ) : (
          <div className="models-grid">
            {models.map((model) => (
              <div key={model.name} className={`model-card ${selectedModel === model.name ? 'selected' : ''}`}>
                <div className="model-header">
                  <div className="model-name-section">
                    <h5 className="model-name">{model.name}</h5>
                    <div className="model-badges">
                      {isVisionModel(model.name) && (
                        <span className="model-badge vision">Vision</span>
                      )}
                      {isImageGenModel(model.name) && (
                        <span className="model-badge image-gen">Image Gen</span>
                      )}
                    </div>
                  </div>
                  <div className="model-actions">
                    <button
                      onClick={() => handleGetModelInfo(model.name)}
                      className="info-btn"
                      title="Model Information"
                    >
                      <Info size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteModel(model.name)}
                      disabled={deleting[model.name]}
                      className="delete-btn"
                      title="Delete Model"
                    >
                      {deleting[model.name] ? (
                        <Loader2 className="loading-spinner" size={14} />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="model-details">
                  <div className="model-size">{formatBytes(model.size)}</div>
                  <div className="model-modified">Modified: {formatDate(model.modified_at)}</div>
                </div>

                {showInfo[model.name] && modelInfo[model.name] && (
                  <div className="model-info">
                    <div className="info-section">
                      <strong>Parameters:</strong> {modelInfo[model.name].details?.parameter_size || 'Unknown'}
                    </div>
                    <div className="info-section">
                      <strong>Format:</strong> {modelInfo[model.name].details?.format || 'Unknown'}
                    </div>
                    <div className="info-section">
                      <strong>Family:</strong> {modelInfo[model.name].details?.family || 'Unknown'}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => onModelSelect(model.name)}
                  className={`select-model-btn ${selectedModel === model.name ? 'selected' : ''}`}
                >
                  {selectedModel === model.name ? (
                    <>
                      <CheckCircle size={16} />
                      Selected
                    </>
                  ) : (
                    'Select Model'
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Popular models suggestions */}
      <div className="model-suggestions-section">
        <h4>Popular Models</h4>
        <div className="suggestions-grid">
          {['llava', 'mistral', 'codellama', 'llama2', 'vicuna', 'orca-mini'].map(suggestion => (
            <button
              key={suggestion}
              onClick={() => setNewModelName(suggestion)}
              className="suggestion-btn"
              disabled={models.some(m => m.name === suggestion)}
            >
              {suggestion}
              {models.some(m => m.name === suggestion) && <CheckCircle size={14} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModelManager;