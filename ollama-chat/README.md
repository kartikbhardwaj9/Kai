# KAI FREE GPT

A modern, privacy-first AI chat interface powered by Ollama. KAI FREE GPT provides a ChatGPT-like experience while keeping all your data local and secure. Features include real-time chat, model management, reasoning display, image analysis, and image generation capabilities.

![KAI FREE GPT](https://via.placeholder.com/800x400/0f0f0f/10a37f?text=KAI+FREE+GPT)

## Features

### 🤖 **Chat Interface**
- Real-time streaming responses
- Markdown rendering with syntax highlighting
- Message history and conversation management
- Adjustable model parameters (temperature, top-k, top-p)
- Copy messages to clipboard
- Clear chat history

### 🔧 **Model Management**
- List all available Ollama models
- Download/pull new models with progress tracking
- Delete unused models
- View model information and metadata
- Model selection with auto-detection of capabilities

### 🧠 **Reasoning Display**
- Show model thinking process (when supported)
- Toggle reasoning visibility
- Separate reasoning from final output
- Performance metrics (tokens/second, response time)

### 🖼️ **Image Capabilities**
- **Vision Models**: Upload and analyze images (llava, bakllava)
- **Image Generation**: Generate images with text prompts (stable-diffusion)
- **Image Gallery**: View and download generated images
- **Batch Operations**: Generate multiple images with different settings

### 🎨 **Modern UI/UX**
- Dark theme optimized for long sessions
- Responsive design for all screen sizes
- ChatGPT-inspired interface
- Smooth animations and transitions
- Real-time connection status
- Keyboard shortcuts and accessibility

## Prerequisites

Before running this application, make sure you have:

1. **Node.js** (v16 or higher)
2. **Ollama** installed and running
3. At least one Ollama model downloaded

### Installing Ollama

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download
```

### Starting Ollama Service

```bash
# Start Ollama service (runs on localhost:11434 by default)
ollama serve
```

### Download Your First Models

```bash
# Download LLaVA for vision capabilities
ollama pull llava

# Download GPT-4-like model
ollama pull dolphin-mistral:7b

# Download code-focused model
ollama pull codellama

# List downloaded models
ollama list
```

## Installation & Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd ollama-chat

# Install all dependencies (root, server, and client)
npm run install:all
```

### 2. Configuration

The application uses default configuration that should work out of the box. If you need to customize:

**Server Configuration** (`server/.env`):
```env
PORT=3001
OLLAMA_BASE_URL=http://localhost:11434
```

**Client Configuration** (optional):
```env
REACT_APP_API_URL=http://localhost:3001/api
```

### 3. Run the Application

```bash
# Start both server and client in development mode
npm run dev

# Or start individually:
# npm run server:dev  # Backend only
# npm run client:dev  # Frontend only
```

### 4. Access the Application

Open your browser and navigate to:
- **Main Application**: http://localhost:3000
- **API Health Check**: http://localhost:3001/api/health

## Usage Guide

### Getting Started

1. **Check Connection**: Ensure the connection status shows "Connected" in the header
2. **Manage Models**: Go to the "Models" tab to download your first model if none are available
3. **Select Model**: Choose a model from the sidebar or models page
4. **Start Chatting**: Return to the "Chat" tab and begin your conversation

### Model Types & Capabilities

#### **Text Models**
- `mistral`, `llama2`, `dolphin-mistral` - General conversation
- `codellama`, `deepseek-coder` - Code generation and analysis
- `wizard-math` - Mathematical reasoning

#### **Vision Models** 🔍
- `llava` - Image analysis and description
- `bakllava` - Advanced vision understanding
- Upload images in chat for analysis

#### **Image Generation** 🎨
- `stable-diffusion` - Generate images from prompts
- Adjustable parameters (steps, CFG scale, dimensions)
- Download generated images

### Chat Features

#### **Basic Chat**
1. Select a model from the sidebar
2. Type your message and press Enter or click Send
3. View streaming responses in real-time

#### **Image Analysis** (Vision Models)
1. Select a vision model (llava, bakllava)
2. Click the image upload button 📎
3. Select an image and add a prompt
4. Send to get detailed image analysis

#### **Advanced Settings**
- **Temperature**: Controls randomness (0.0 = deterministic, 2.0 = very creative)
- **Top K**: Limits vocabulary choices (lower = more focused)
- **Top P**: Nucleus sampling (lower = more focused)
- **Show Reasoning**: Display model's thinking process

### Model Management

#### **Download Models**
1. Go to "Models" tab
2. Enter model name (e.g., `llava`, `mistral:7b`)
3. Click "Download" and monitor progress
4. Popular models are suggested for quick selection

#### **Model Information**
- Click the info button (ℹ️) to view model details
- See parameters, format, and capabilities
- Check model size and last modified date

#### **Delete Models**
- Click the trash button (🗑️) to remove models
- Confirmation required to prevent accidents
- Frees up disk space

### Image Generation

1. **Select Compatible Model**: Choose a model that supports image generation
2. **Enter Prompt**: Describe the image you want to create
3. **Adjust Settings**:
   - **Seed**: For reproducible results (-1 for random)
   - **Steps**: Quality vs speed (10-100)
   - **CFG Scale**: Prompt adherence (1-20)
   - **Dimensions**: Output image size
4. **Generate**: Click "Generate Image" and wait for results
5. **Download**: Hover over images to download

## API Endpoints

The backend provides a RESTful API:

### **Models**
- `GET /api/models` - List available models
- `POST /api/models/pull` - Download a model (SSE)
- `DELETE /api/models/:name` - Delete a model
- `GET /api/models/:name/info` - Get model information

### **Chat**
- `POST /api/chat` - Chat with streaming response (SSE)

### **Images**
- `POST /api/generate-image` - Generate image from prompt
- `POST /api/analyze-image` - Analyze uploaded image

### **Utility**
- `GET /api/health` - Health check

## Troubleshooting

### Common Issues

#### **"Connection Failed" Error**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama if not running
ollama serve

# Check for port conflicts
netstat -an | grep 11434
```

#### **"No Models Available"**
```bash
# Download a basic model
ollama pull llama2

# Verify installation
ollama list
```

#### **Slow Response Times**
- Use smaller models (7B vs 13B/70B parameters)
- Ensure adequate RAM (8GB+ recommended)
- Close other resource-intensive applications

#### **Image Upload Not Working**
- Ensure you've selected a vision model (llava, bakllava)
- Check file size (10MB limit)
- Supported formats: JPEG, PNG, GIF, WebP

### Performance Optimization

#### **For Better Speed**
```bash
# Use quantized models
ollama pull llama2:7b-q4_0

# Enable GPU acceleration (if available)
# Ollama automatically uses GPU when detected
```

#### **Memory Management**
- Monitor system RAM usage
- Use `ollama ps` to see running models
- Models load automatically and stay in memory

## Development

### Project Structure
```
ollama-chat/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   └── hooks/          # Custom hooks
├── server/                 # Express backend
│   ├── index.js           # Main server file
│   └── .env               # Environment variables
└── package.json           # Root package file
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Available Scripts

```bash
# Development
npm run dev              # Start both client and server
npm run client:dev       # Start React dev server
npm run server:dev       # Start Express server with nodemon

# Production
npm run build           # Build React app
npm start              # Start production server

# Utilities
npm run install:all    # Install all dependencies
```

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- **Ollama** - For providing the local AI model runtime
- **React** - Frontend framework
- **Express.js** - Backend server
- **OpenAI** - UI/UX inspiration from ChatGPT

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review Ollama documentation
3. Open a GitHub issue with detailed information

---

## Contact & Support

- **Email**: freegpt@kartikbhardwaj.me
- **Website**: https://www.kartikbhardwaj.me/freegpt
- **Developer**: Kartik Bhardwaj

---

**Happy chatting with KAI FREE GPT! 🤖✨**