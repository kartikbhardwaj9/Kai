import React, { useState, useEffect } from 'react';
import { Image, Loader2, Download } from 'lucide-react';
import ollamaService from '../services/ollamaService';

const ImageGenerator = ({ selectedModel, models }) => {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({
    seed: -1,
    steps: 50,
    cfg_scale: 7.5,
    width: 512,
    height: 512
  });

  const isImageGenModel = (modelName) => {
    return modelName && (
      modelName.toLowerCase().includes('stable') ||
      modelName.toLowerCase().includes('dall') ||
      modelName.toLowerCase().includes('imagen') ||
      modelName.toLowerCase().includes('sd') ||
      modelName.toLowerCase().includes('diffusion')
    );
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim() || !selectedModel || generating) {
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const result = await ollamaService.generateImage(selectedModel, prompt, {
        ...settings,
        seed: settings.seed === -1 ? Math.floor(Math.random() * 1000000) : settings.seed
      });

      // Add generated image to history
      const newImage = {
        id: Date.now(),
        prompt: prompt,
        image: result.response || result.image,
        model: selectedModel,
        settings: { ...settings },
        timestamp: new Date()
      };

      setGeneratedImages(prev => [newImage, ...prev]);
      setPrompt('');
    } catch (error) {
      console.error('Error generating image:', error);
      setError(`Failed to generate image: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerateImage();
    }
  };

  const downloadImage = (imageData, prompt) => {
    try {
      // Create download link
      const link = document.createElement('a');
      link.href = imageData.startsWith('data:') ? imageData : `data:image/png;base64,${imageData}`;
      link.download = `generated-${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear the image generation history?')) {
      setGeneratedImages([]);
    }
  };

  if (!selectedModel) {
    return (
      <div className="image-generator">
        <div className="no-model-message">
          <Image size={48} />
          <h3>No Model Selected</h3>
          <p>Please select a model to generate images.</p>
        </div>
      </div>
    );
  }

  if (!isImageGenModel(selectedModel)) {
    return (
      <div className="image-generator">
        <div className="unsupported-model-message">
          <Image size={48} />
          <h3>Image Generation Not Supported</h3>
          <p>The selected model "{selectedModel}" doesn't support image generation.</p>
          <p>Try downloading models like "stable-diffusion" or other image generation models.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="image-generator">
      {/* Header */}
      <div className="generator-header">
        <div className="header-info">
          <h2>Image Generation</h2>
          <span className="model-name">Using: {selectedModel}</span>
        </div>
        {generatedImages.length > 0 && (
          <button onClick={clearHistory} className="clear-history-btn">
            Clear History
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Generation Controls */}
      <div className="generation-controls">
        <div className="prompt-section">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe the image you want to generate..."
            className="prompt-input"
            rows={3}
            disabled={generating}
          />
          
          <button
            onClick={handleGenerateImage}
            disabled={!prompt.trim() || generating}
            className="generate-btn"
          >
            {generating ? (
              <>
                <Loader2 className="loading-spinner" size={20} />
                Generating...
              </>
            ) : (
              <>
                <Image size={20} />
                Generate Image
              </>
            )}
          </button>
        </div>

        {/* Settings */}
        <div className="generation-settings">
          <div className="settings-row">
            <div className="setting-group">
              <label>Seed (-1 for random): {settings.seed}</label>
              <input
                type="number"
                value={settings.seed}
                onChange={(e) => setSettings(prev => ({ ...prev, seed: parseInt(e.target.value) }))}
                className="setting-input"
                disabled={generating}
              />
            </div>
            
            <div className="setting-group">
              <label>Steps: {settings.steps}</label>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={settings.steps}
                onChange={(e) => setSettings(prev => ({ ...prev, steps: parseInt(e.target.value) }))}
                className="setting-slider"
                disabled={generating}
              />
            </div>
          </div>

          <div className="settings-row">
            <div className="setting-group">
              <label>CFG Scale: {settings.cfg_scale}</label>
              <input
                type="range"
                min="1"
                max="20"
                step="0.5"
                value={settings.cfg_scale}
                onChange={(e) => setSettings(prev => ({ ...prev, cfg_scale: parseFloat(e.target.value) }))}
                className="setting-slider"
                disabled={generating}
              />
            </div>

            <div className="setting-group">
              <label>Size</label>
              <div className="size-controls">
                <select
                  value={`${settings.width}x${settings.height}`}
                  onChange={(e) => {
                    const [width, height] = e.target.value.split('x').map(Number);
                    setSettings(prev => ({ ...prev, width, height }));
                  }}
                  className="size-select"
                  disabled={generating}
                >
                  <option value="512x512">512x512</option>
                  <option value="768x768">768x768</option>
                  <option value="1024x1024">1024x1024</option>
                  <option value="512x768">512x768 (Portrait)</option>
                  <option value="768x512">768x512 (Landscape)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Images Grid */}
      <div className="generated-images">
        {generatedImages.length === 0 ? (
          <div className="no-images-message">
            <Image size={48} />
            <p>No images generated yet. Enter a prompt above to get started!</p>
          </div>
        ) : (
          <div className="images-grid">
            {generatedImages.map((item) => (
              <div key={item.id} className="image-card">
                <div className="image-container">
                  <img
                    src={item.image.startsWith('data:') ? item.image : `data:image/png;base64,${item.image}`}
                    alt={item.prompt}
                    className="generated-image"
                  />
                  <div className="image-overlay">
                    <button
                      onClick={() => downloadImage(item.image, item.prompt)}
                      className="download-btn"
                      title="Download Image"
                    >
                      <Download size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="image-info">
                  <p className="image-prompt">{item.prompt}</p>
                  <div className="image-metadata">
                    <span className="metadata-item">Model: {item.model}</span>
                    <span className="metadata-item">
                      {item.settings.width}x{item.settings.height}
                    </span>
                    <span className="metadata-item">
                      Steps: {item.settings.steps}
                    </span>
                    <span className="metadata-item">
                      CFG: {item.settings.cfg_scale}
                    </span>
                    {item.settings.seed !== -1 && (
                      <span className="metadata-item">
                        Seed: {item.settings.seed}
                      </span>
                    )}
                  </div>
                  <div className="image-timestamp">
                    {item.timestamp.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;