
# 🚀 KAI FREE GPT
A Modern, Privacy-First AI Chat Interface Powered by Ollama.

KAI FREE GPT provides a ChatGPT-like experience — but entirely local, ensuring data privacy, model flexibility, and developer freedom. It combines Ollama’s local model runtime with a sleek React-based UI and a modular Node.js backend.

---

## ✨ Overview
KAI FREE GPT lets you:

* **Chat** with local AI models (Mistral, LLaMA, Dolphin, Codellama, etc.).
* **View** reasoning traces (if supported).
* **Analyze and generate** images using LLaVA or Stable Diffusion.
* **Manage** Ollama models directly from the UI.
* **Enjoy** a responsive, ChatGPT-inspired experience — all offline.

---

## 🧩 Features

#### 🤖 Chat Interface
* Real-time streaming responses
* Markdown + syntax highlighting for code blocks
* Conversation history & message management
* Adjustable model parameters (temperature, top-k, top-p)
* Copy & export chat logs
* Clear chat history

#### 🔧 Model Management
* List, pull, and delete Ollama models
* Track download progress and disk usage
* View detailed metadata (parameters, quantization, size)
* Auto-detect model capabilities (vision, reasoning, generation)

#### 🧠 Reasoning Display
* Toggle model’s internal “thoughts” (when supported)
* Separate reasoning from final answer
* Track performance metrics (tokens/sec, latency, output size)

#### 🖼️ Image Capabilities
* Image Analysis (via LLaVA/BakLLAVA)
* Image Generation (via Stable Diffusion)
* Integrated image gallery with previews, downloads, and batch generation
* Adjustable diffusion parameters (steps, CFG, dimensions)

#### 🎨 Modern UI/UX
* Dark theme optimized for long use
* Mobile-first responsive design
* Smooth transitions with Framer Motion
* Keyboard shortcuts and accessibility support
* Real-time Ollama connection indicator

---

## ⚙️ Project Architecture

### 📁 Folder Structure
```

KAI-FREE-GPT/
├── client/                     \# React Frontend
│   ├── public/                 \# Static files (favicon, manifest, logo)
│   ├── src/
│   │   ├── assets/             \# Images, icons, and theme files
│   │   ├── components/         \# UI components (ChatBox, Sidebar, Header, etc.)
│   │   ├── pages/              \# Route-based pages (Chat, Models, Images)
│   │   ├── services/           \# API service handlers (Axios)
│   │   ├── hooks/              \# Custom React hooks
│   │   ├── context/            \# Context Providers (Auth, Settings, Theme)
│   │   ├── utils/              \# Helpers (formatting, constants, local storage)
│   │   └── App.jsx             \# Main React app entry
│   ├── package.json
│   └── vite.config.js
│
├── server/                     \# Node.js + Express Backend
│   ├── routes/                 \# API routes (chat.js, model.js, image.js)
│   ├── controllers/            \# Logic separated from routes
│   ├── middleware/             \# Error handling, logging, rate limiting
│   ├── services/               \# Ollama API integration and utilities
│   ├── utils/                  \# Helper functions
│   ├── index.js                \# Express entry point
│   ├── .env                    \# Server environment variables
│   └── package.json
│
├── .env                        \# Root environment variables (optional)
├── package.json                \# Root npm file (contains scripts to run all)
└── README.md                   \# Project documentation

````

### 🧠 Tech Stack
| Layer          | Technology                     | Purpose                                   |
|----------------|--------------------------------|-------------------------------------------|
| **Frontend** | React + Vite                   | Fast, modern UI                           |
| **Backend** | Node.js + Express              | REST API for chat, model, and image ops   |
| **Model Runtime** | Ollama                         | Local AI model execution                  |
| **Image Handling** | Multer (upload), Sharp (resize) | Secure file operations                    |
| **Styling** | TailwindCSS + Framer Motion    | Responsive and animated UI                |
| **State Management** | React Context + Local Storage  | Theme, model, chat persistence          |

---

## 🧰 Prerequisites
Before installing, ensure you have:

* **Node.js v16+**
* **npm** or **yarn**
* **Ollama** installed and running locally.

### Install Ollama
```bash
# macOS
brew install ollama

# Linux
curl -fsSL [https://ollama.ai/install.sh](https://ollama.ai/install.sh) | sh

# Windows
# Download from [https://ollama.ai/download](https://ollama.ai/download)
````

Start the Ollama service:

```bash
ollama serve
```

Verify it's running:

```bash
curl http://localhost:11434/api/tags
```

-----

## ⚡ Setup & Installation

**1️⃣ Clone Repository**

```bash
git clone [https://github.com/](https://github.com/)<your-username>/kai-free-gpt.git
cd kai-free-gpt
```

**2️⃣ Install All Dependencies**
This command installs dependencies for the root, client, and server folders.

```bash
npm run install:all
```

**3️⃣ Environment Configuration**
Create `.env` files in both the `server` and `client` directories and add the following variables:

**Backend (`server/.env`)**

```env
PORT=3001
OLLAMA_BASE_URL=http://localhost:11434
ALLOWED_ORIGIN=http://localhost:3000
MAX_UPLOAD_SIZE=10mb
```

**Frontend (`client/.env`)**

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_APP_NAME="KAI FREE GPT"
```

**4️⃣ Run the Application**
Start both the frontend and backend servers concurrently:

```bash
npm run dev
```

Alternatively, run them in separate terminals:

```bash
# In the root directory, run the backend server
npm run server:dev

# In a new terminal, run the frontend client
npm run client:dev
```

**5️⃣ Access the App**

  * **Frontend:** [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)
  * **Backend Health Check:** [http://localhost:3001/api/health](https://www.google.com/search?q=http://localhost:3001/api/health)

-----

## 🧱 Design & Development Philosophy

#### 🎯 Frontend Design Principles

  * **Component-Based Architecture:** Modular, reusable UI elements.
  * **Centralized State:** Context Providers manage app-wide settings like theme, model, and chat history.
  * **Asynchronous Handling:** Streamed responses are managed efficiently using the `EventSource` API.
  * **Responsive Layout:** Flexbox and Tailwind's grid system ensure a seamless experience on all devices.

#### ⚙️ Backend Design

  * **Layered MVC Structure:** Logic is separated into controllers, routes, and services for maintainability.
  * **Secure Communication:** CORS policies and sanitized inputs protect the server.
  * **Ollama Service Wrapper:** A dedicated service abstracts Ollama API calls for reusability.
  * **Streaming API Support:** Server-Sent Events (SSE) enable real-time text generation and progress updates.

-----

## 🧪 Available NPM Scripts

| Script              | Location | Description                                |
|---------------------|----------|--------------------------------------------|
| `npm run dev`       | Root     | Runs both client and server concurrently.  |
| `npm run install:all` | Root     | Installs dependencies in all folders.      |
| `npm run build`     | Root     | Builds the React client for production.    |
| `npm run server:dev`| Server   | Starts the Express server with `nodemon`.  |
| `npm run client:dev`| Client   | Starts the frontend development server.    |
| `npm run client:build`| Client   | Builds the production-ready frontend.    |

-----

## 🛠️ API Endpoints

| Endpoint              | Method | Description                        |
|-----------------------|--------|------------------------------------|
| `/api/models`         | `GET`  | List available models              |
| `/api/models/pull`    | `POST` | Download a new model               |
| `/api/models/:name`   | `DELETE`| Delete a model                     |
| `/api/chat`           | `POST` | Send a message (SSE streaming)     |
| `/api/analyze-image`  | `POST` | Analyze an uploaded image          |
| `/api/generate-image` | `POST` | Generate an image from a prompt    |
| `/api/health`         | `GET`  | Check server status                |

-----

## 🔒 Privacy & Security

  * All chats and images are processed **locally**.
  * **No data** ever leaves your system.
  * Zero telemetry, tracking, or analytics.
  * Optional encrypted chat storage is planned for a future release.

-----

## 🧑‍💼 Contributing

We welcome all contributions\!

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/new-ui`).
3.  Make your changes and commit them.
4.  Push to your branch and submit a pull request.

-----

## 📜 License

This project is licensed under the **MIT License**.

© 2025 Kartik Bhardwaj — All Rights Reserved.

-----

## 💬 Contact

  * **Email:** `freegpt@kartikbhardwaj.me`
  * **Website:** `https://www.kartikbhardwaj.me/freegpt`
  * **Developer:** Kartik Bhardwaj

> 🌟 **“Own Your AI — Locally, Privately, and Powerfully.”**
