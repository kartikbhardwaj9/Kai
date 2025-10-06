const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Ollama Chat API is running' });
});

// Get available models
app.get('/api/models', async (req, res) => {
  try {
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching models:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch models',
      details: error.message 
    });
  }
});

// Pull/download a new model
app.post('/api/models/pull', async (req, res) => {
  const { modelName } = req.body;
  
  if (!modelName) {
    return res.status(400).json({ error: 'Model name is required' });
  }

  try {
    // Set up Server-Sent Events for streaming progress
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    const response = await axios.post(
      `${OLLAMA_BASE_URL}/api/pull`,
      { name: modelName },
      { 
        responseType: 'stream',
        timeout: 0 // No timeout for model downloads
      }
    );

    response.data.on('data', (chunk) => {
      const lines = chunk.toString().split('\n').filter(line => line.trim());
      
      lines.forEach(line => {
        try {
          const data = JSON.parse(line);
          res.write(`data: ${JSON.stringify(data)}\n\n`);
        } catch (e) {
          // Skip invalid JSON lines
        }
      });
    });

    response.data.on('end', () => {
      res.write(`data: ${JSON.stringify({ status: 'completed' })}\n\n`);
      res.end();
    });

    response.data.on('error', (error) => {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    });

  } catch (error) {
    console.error('Error pulling model:', error.message);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

// Delete a model
app.delete('/api/models/:modelName', async (req, res) => {
  const { modelName } = req.params;
  
  try {
    await axios.delete(`${OLLAMA_BASE_URL}/api/delete`, {
      data: { name: modelName }
    });
    res.json({ message: `Model ${modelName} deleted successfully` });
  } catch (error) {
    console.error('Error deleting model:', error.message);
    res.status(500).json({ 
      error: 'Failed to delete model',
      details: error.message 
    });
  }
});

// Chat with streaming response
app.post('/api/chat', async (req, res) => {
  const { model, messages, stream = true, options = {} } = req.body;
  
  if (!model || !messages) {
    return res.status(400).json({ 
      error: 'Model and messages are required' 
    });
  }

  try {
    if (stream) {
      // Set up Server-Sent Events for streaming
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      });

      const response = await axios.post(
        `${OLLAMA_BASE_URL}/api/chat`,
        {
          model,
          messages,
          stream: true,
          options: {
            temperature: options.temperature || 0.7,
            top_k: options.top_k || 40,
            top_p: options.top_p || 0.9,
            ...options
          }
        },
        { 
          responseType: 'stream',
          timeout: 0
        }
      );

      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n').filter(line => line.trim());
        
        lines.forEach(line => {
          try {
            const data = JSON.parse(line);
            res.write(`data: ${JSON.stringify(data)}\n\n`);
          } catch (e) {
            // Skip invalid JSON lines
          }
        });
      });

      response.data.on('end', () => {
        res.end();
      });

      response.data.on('error', (error) => {
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      });

    } else {
      // Non-streaming response
      const response = await axios.post(`${OLLAMA_BASE_URL}/api/chat`, {
        model,
        messages,
        stream: false,
        options
      });
      
      res.json(response.data);
    }

  } catch (error) {
    console.error('Error in chat:', error.message);
    if (stream) {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ 
        error: 'Chat request failed',
        details: error.message 
      });
    }
  }
});

// Generate image (if model supports it)
app.post('/api/generate-image', async (req, res) => {
  const { model, prompt, options = {} } = req.body;
  
  if (!model || !prompt) {
    return res.status(400).json({ 
      error: 'Model and prompt are required' 
    });
  }

  try {
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model,
      prompt,
      stream: false,
      options: {
        ...options,
        seed: options.seed || Math.floor(Math.random() * 1000000)
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error generating image:', error.message);
    res.status(500).json({ 
      error: 'Image generation failed',
      details: error.message 
    });
  }
});

// Upload and analyze image (for vision models like llava)
app.post('/api/analyze-image', upload.single('image'), async (req, res) => {
  const { model, prompt } = req.body;
  const imageFile = req.file;
  
  if (!model || !imageFile) {
    return res.status(400).json({ 
      error: 'Model and image file are required' 
    });
  }

  try {
    // Convert image to base64
    const imageBase64 = imageFile.buffer.toString('base64');
    
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model,
      prompt: prompt || "Describe this image in detail.",
      images: [imageBase64],
      stream: false
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error analyzing image:', error.message);
    res.status(500).json({ 
      error: 'Image analysis failed',
      details: error.message 
    });
  }
});

// Get model info
app.get('/api/models/:modelName/info', async (req, res) => {
  const { modelName } = req.params;
  
  try {
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/show`, {
      name: modelName
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching model info:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch model info',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    details: error.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Ollama Chat API running on port ${PORT}`);
  console.log(`📡 Ollama URL: ${OLLAMA_BASE_URL}`);
});

module.exports = app;