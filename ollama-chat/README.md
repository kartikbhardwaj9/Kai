🚀 KAI FREE GPT
A Modern, Privacy-First AI Chat Interface Powered by Ollama

KAI FREE GPT provides a ChatGPT-like experience — but entirely local, ensuring data privacy, model flexibility, and developer freedom. It combines Ollama’s local model runtime with a sleek React-based UI and a modular Node.js backend.

✨ Overview

KAI FREE GPT lets you:

Chat with local AI models (Mistral, LLaMA, Dolphin, Codellama, etc.)

View reasoning traces (if supported)

Analyze and generate images using LLaVA or Stable Diffusion

Manage Ollama models directly from the UI

Enjoy a responsive, ChatGPT-inspired experience — all offline

🧩 Features
🤖 Chat Interface

Real-time streaming responses

Markdown + syntax highlighting for code blocks

Conversation history & message management

Adjustable model parameters (temperature, top-k, top-p)

Copy & export chat logs

Clear chat history

🔧 Model Management

List, pull, and delete Ollama models

Track download progress and disk usage

View detailed metadata (parameters, quantization, size)

Auto-detect model capabilities (vision, reasoning, generation)

🧠 Reasoning Display

Toggle model’s internal “thoughts” (when supported)

Separate reasoning from final answer

Track performance metrics (tokens/sec, latency, output size)

🖼️ Image Capabilities

Image Analysis (via LLaVA/BakLLAVA)

Image Generation (via Stable Diffusion)

Integrated image gallery with previews, downloads, and batch generation

Adjustable diffusion parameters (steps, CFG, dimensions)

🎨 Modern UI/UX

Dark theme optimized for long use

Mobile-first responsive design

Smooth transitions with Framer Motion

Keyboard shortcuts and accessibility support

Real-time Ollama connection indicator

⚙️ Project Architecture
📁 Folder Structure
KAI-FREE-GPT/
├── client/                     # React Frontend
│   ├── public/                 # Static files (favicon, manifest, logo)
│   ├── src/
│   │   ├── assets/             # Images, icons, and theme files
│   │   ├── components/         # UI components (ChatBox, Sidebar, Header, etc.)
│   │   ├── pages/              # Route-based pages (Chat, Models, Images)
│   │   ├── services/           # API service handlers (Axios)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── context/            # Context Providers (Auth, Settings, Theme)
│   │   ├── utils/              # Helpers (formatting, constants, local storage)
│   │   └── App.jsx             # Main React app entry
│   ├── package.json
│   └── vite.config.js          # or CRA config (depending on setup)
│
├── server/                     # Node.js + Express Backend
│   ├── routes/                 # API routes (chat.js, model.js, image.js)
│   ├── controllers/            # Logic separated from routes
│   ├── middleware/             # Error handling, logging, rate limiting
│   ├── services/               # Ollama API integration and utilities
│   ├── utils/                  # Helper functions
│   ├── index.js                # Express entry point
│   ├── .env                    # Server environment variables
│   ├── package.json
│   └── README.md
│
├── shared/                     # Shared configuration or constants
│   └── config.js
│
├── scripts/                    # Utility scripts (setup, cleanup, deploy)
│
├── .env                        # Root environment variables (optional)
├── package.json                # Root npm file (contains scripts to run all)
└── README.md                   # Project documentation

🧠 Tech Stack
Layer	Technology	Purpose
Frontend	React + Vite	Fast, modern UI
Backend	Node.js + Express	REST API for chat, model, and image ops
Model Runtime	Ollama	Local AI model execution
Image Handling	Multer (upload), Sharp (resize)	Secure file operations
Styling	TailwindCSS + Framer Motion	Responsive and animated UI
State Management	React Context + Local Storage	Theme, model, chat persistence
🧰 Prerequisites

Before installing:

Node.js v16+

npm or yarn

Ollama installed and running locally

Install Ollama
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download


Start Ollama service:

ollama serve


Verify:

curl http://localhost:11434/api/tags

⚡ Setup & Installation
1️⃣ Clone Repository
git clone https://github.com/<your-username>/kai-free-gpt.git
cd kai-free-gpt

2️⃣ Install All Dependencies
npm run install:all


This runs:

npm install           # at root
cd client && npm install
cd ../server && npm install

3️⃣ Environment Configuration
Backend (server/.env)
PORT=3001
OLLAMA_BASE_URL=http://localhost:11434
ALLOWED_ORIGIN=http://localhost:3000
MAX_UPLOAD_SIZE=10mb

Frontend (client/.env)
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_APP_NAME="KAI FREE GPT"

4️⃣ Run the Application
# Start both frontend & backend
npm run dev


Or separately:

npm run server:dev
npm run client:dev

5️⃣ Access App

Frontend: http://localhost:3000

Backend Health: http://localhost:3001/api/health

💬 Using KAI FREE GPT
🧠 Start Chatting

Select a model (e.g. llama2, dolphin-mistral)

Type a prompt and hit Enter

Watch real-time streaming responses

🖼️ Image Analysis

Choose llava or bakllava

Upload an image + text query

Get AI-generated descriptions or analysis

🎨 Image Generation

Switch to stable-diffusion

Write a creative prompt

Adjust steps, scale, and dimensions

Generate and download the image

🧩 Model Management

Pull new models: ollama pull mistral

Delete unused: ollama delete <model>

View details: ollama show <model>

🧱 Design & Development Philosophy
🎯 Frontend Design Principles

Component-Based Architecture: Modular, reusable UI elements

Context Providers: Centralized app-wide settings (theme, model, chat)

Asynchronous State Management: Streamed responses handled with EventSource API

Responsive Layout: Flexbox + Tailwind grid system

Modern UX: Inspired by ChatGPT but fully offline

⚙️ Backend Design

Layered MVC Structure: Controllers, routes, services separated

Secure Communication: CORS-controlled and sanitized inputs

Ollama Service Wrapper: Reusable functions to handle model requests

Streaming API Support: Server-Sent Events (SSE) for real-time text and progress

🧑‍💻 Code Quality

ESLint + Prettier enforced

Consistent naming conventions

Modularized error handling

Environment-based logging

🧪 Available NPM Scripts
# Root
npm run dev             # Run both client and server
npm run install:all     # Install all deps
npm run build           # Build React client for production

# Server
npm run server:dev      # Start Express server with nodemon

# Client
npm run client:dev      # Run frontend dev server
npm run client:build    # Build production-ready frontend
npm run client:lint     # Lint client code

🛠️ API Endpoints
Endpoint	Method	Description
/api/models	GET	List available models
/api/models/pull	POST	Download new model
/api/models/:name/info	GET	Model details
/api/models/:name	DELETE	Delete model
/api/chat	POST	Send message (SSE streaming)
/api/analyze-image	POST	Analyze uploaded image
/api/generate-image	POST	Generate image
/api/health	GET	Server status
🔒 Privacy & Security

All chats and images are processed locally.

No data leaves your system.

No telemetry, tracking, or analytics.

Optional encrypted chat storage (coming soon).

🧑‍💼 Contributing

Fork the repository

Create a new branch (feature/new-ui)

Commit your changes

Submit a pull request

All contributions are welcome — code, design, documentation, or testing!

📜 License

MIT License
© 2025 Kartik Bhardwaj — All Rights Reserved

💬 Contact

Email: freegpt@kartikbhardwaj.me

Website: https://www.kartikbhardwaj.me/freegpt

Developer: Kartik Bhardwaj

🌟 “Own Your AI — Locally, Privately, and Powerfully.”

Happy chatting with KAI FREE GPT! 🤖✨
