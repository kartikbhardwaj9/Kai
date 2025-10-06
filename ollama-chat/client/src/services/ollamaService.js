import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class OllamaService {
  constructor() {
    this.axios = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // 30 seconds for regular requests
    });
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.axios.get('/health');
      return response.data;
    } catch (error) {
      throw new Error('Failed to connect to Ollama service');
    }
  }

  // Get available models
  async getModels() {
    try {
      const response = await this.axios.get('/models');
      return response.data.models || [];
    } catch (error) {
      console.error('Error fetching models:', error);
      throw new Error('Failed to fetch models');
    }
  }

  // Pull/download a new model with progress
  async pullModel(modelName, onProgress) {
    return new Promise((resolve, reject) => {
      const eventSource = new EventSource(`${API_BASE_URL}/models/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ modelName })
      });

      // For EventSource, we need to use fetch for POST
      fetch(`${API_BASE_URL}/models/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ modelName })
      }).then(response => {
        if (!response.ok) {
          throw new Error('Failed to start model download');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        const readStream = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              resolve({ status: 'completed' });
              return;
            }

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim());

            lines.forEach(line => {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  
                  if (data.error) {
                    reject(new Error(data.error));
                    return;
                  }
                  
                  if (data.status === 'completed') {
                    resolve(data);
                    return;
                  }
                  
                  if (onProgress) {
                    onProgress(data);
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            });

            readStream();
          }).catch(reject);
        };

        readStream();
      }).catch(reject);
    });
  }

  // Delete a model
  async deleteModel(modelName) {
    try {
      const response = await this.axios.delete(`/models/${encodeURIComponent(modelName)}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting model:', error);
      throw new Error('Failed to delete model');
    }
  }

  // Get model information
  async getModelInfo(modelName) {
    try {
      const response = await this.axios.get(`/models/${encodeURIComponent(modelName)}/info`);
      return response.data;
    } catch (error) {
      console.error('Error fetching model info:', error);
      throw new Error('Failed to fetch model information');
    }
  }

  // Chat with streaming response
  async chat(model, messages, options = {}, onMessage, onComplete, onError) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          options
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start chat');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      const readStream = () => {
        reader.read().then(({ done, value }) => {
          if (done) {
            if (onComplete) {
              onComplete(accumulatedContent);
            }
            return;
          }

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          lines.forEach(line => {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.error) {
                  if (onError) onError(new Error(data.error));
                  return;
                }
                
                if (data.message && data.message.content) {
                  accumulatedContent += data.message.content;
                  if (onMessage) {
                    onMessage(data.message.content, accumulatedContent, data);
                  }
                }

                if (data.done) {
                  if (onComplete) {
                    onComplete(accumulatedContent, data);
                  }
                  return;
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          });

          readStream();
        }).catch(error => {
          if (onError) onError(error);
        });
      };

      readStream();
    } catch (error) {
      if (onError) onError(error);
    }
  }

  // Non-streaming chat
  async chatSync(model, messages, options = {}) {
    try {
      const response = await this.axios.post('/chat', {
        model,
        messages,
        stream: false,
        options
      });
      return response.data;
    } catch (error) {
      console.error('Error in chat:', error);
      throw new Error('Chat request failed');
    }
  }

  // Generate image
  async generateImage(model, prompt, options = {}) {
    try {
      const response = await this.axios.post('/generate-image', {
        model,
        prompt,
        options
      });
      return response.data;
    } catch (error) {
      console.error('Error generating image:', error);
      throw new Error('Image generation failed');
    }
  }

  // Analyze image with vision model
  async analyzeImage(model, imageFile, prompt = "Describe this image in detail.") {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('model', model);
      formData.append('prompt', prompt);

      const response = await this.axios.post('/analyze-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 1 minute for image analysis
      });
      return response.data;
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw new Error('Image analysis failed');
    }
  }
}

export default new OllamaService();