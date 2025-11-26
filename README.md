# Real-Time ChatBot

A small real-time chat demo built with a simple HTML/CSS/JavaScript frontend and an Express.js backend. Realtime replies are delivered via WebSockets and the bot uses a locally-run TinyOllama (or compatible Ollama-like) model for generating responses. Postman can be used to test the REST API endpoints.

This repository demonstrates a lightweight real-time chat architecture suitable for local experimentation with small LLMs and websockets.

## Key features

- Real-time messaging using WebSockets
- Frontend: plain HTML, CSS, and JavaScript (no framework)
- Backend: Node.js + Express
- Local LLM integration (TinyOllama / Ollama-style local model) for response generation
- Simple REST endpoints for non-realtime testing (Postman-ready)

## Tech stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Realtime: WebSocket (ws or socket-based)
- Local LLM: TinyOllama (or compatible local Ollama server)
- Testing: Postman (example requests described below)

---

## Project structure (example)

Your repository may look similar to:

- /public or /frontend - static HTML/CSS/JS files
- /server or /backend - Express server, WebSocket handling, integration with local LLM
- .env - environment variables (not committed)

Adjust paths below to match this repo layout if different.

---

## Prerequisites

- Node.js (v16+ recommended)
- npm or yarn
- TinyOllama or local Ollama runtime (or another local LLM) installed and running if you want local model responses
- Postman (optional, for API testing)

---

## Local TinyOllama / Ollama setup (brief)

1. Install and run your local Ollama/TinyOllama runtime following their docs. Many Ollama setups run an HTTP API server on your machine.
2. Make note of the model endpoint (for example, a commonly used Ollama endpoint is `http://localhost:11434/api/generate` — your setup may differ).
3. If the runtime requires a model name or additional params, note that too.

In this project you will provide that URL to the backend through environment variables (example below).

---

## Environment variables

Create a `.env` file in the backend folder (or project root) with values like:

```
PORT=3000
WS_PORT=3000               # if same as HTTP server, websockets are mounted there
TINY_OLLAMA_API_URL=http://localhost:11434/api/generate
TINY_OLLAMA_MODEL=my-model # optional, if your local server needs a model name
API_KEY=                    # optional, if your local runtime needs auth
```

Adjust names and values to match your setup.

---

## Backend — install & run

1. Change to the backend folder (if present):
   ```
   cd backend
   ```
   or root if server is at repo root.

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm run start
   ```
   or for development with live reload:
   ```
   npm run dev
   ```

Typical server responsibilities:
- Serve static frontend files
- Provide a REST endpoint like `POST /api/reply` for non-realtime message/response exchange
- Open a WebSocket endpoint (for example `/ws` or using `ws` / `socket.io`) to push streaming/realtime replies to connected clients
- Forward user prompts to TinyOllama API and return/generate responses

---

## Frontend — open & use

If the Express server serves static files, open your browser at:
```
http://localhost:3000
```

If the frontend is just static files in `/public`, you can also open `index.html` directly (if you use WebSocket to `ws://localhost:3000` make sure CORS/WS host matches).

Example WebSocket client snippet (frontend JavaScript):

```javascript
const socket = new WebSocket('ws://localhost:3000'); // or ws://localhost:3000/ws

socket.addEventListener('open', () => {
  console.log('WS connected');
});

socket.addEventListener('message', event => {
  const data = JSON.parse(event.data);
  // handle partial/streamed responses or full reply messages
  console.log('message from server:', data);
});

// send a message to the server
function sendMessage(text) {
  const payload = { type: 'message', text };
  socket.send(JSON.stringify(payload));
}
```

The UI is built with plain HTML/CSS/JS: a message input, a send button, and a message list. The frontend listens for websocket messages and appends replies in real time.

---

## REST / Postman usage

A simple REST endpoint can be used for debugging or non-realtime clients.

Example: POST /api/reply
- URL: `http://localhost:3000/api/reply`
- Method: `POST`
- Body (JSON):
  ```json
  {
    "message": "Hello, bot!"
  }
  ```
- Response:
  ```json
  {
    "reply": "Hi — this is the bot response..."
  }
  ```

Use Postman to send a request to the endpoint above to inspect server-to-model behavior and returned replies.

---

## How the realtime reply flow works (high level)

1. Client opens a WebSocket connection to the backend.
2. Client sends a "message" payload over WebSocket.
3. Backend receives the message and calls the local TinyOllama API (via HTTP) to generate a reply. For streaming-capable local runtimes, backend can stream partial tokens as they arrive.
4. Backend forwards token chunks or the final reply back to the client over the same WebSocket connection.
5. Frontend receives the streamed data and updates the chat UI in realtime.

---

## Notes & troubleshooting

- If WebSocket fails to connect, ensure the backend server is running, and the correct ws:// or wss:// URL is used.
- If TinyOllama requests fail, ensure your local model server is running and the `TINY_OLLAMA_API_URL` environment variable is correct.
- CORS: If frontend and backend are on different hosts/ports, configure CORS in Express or serve the frontend from Express to avoid cross-origin issues.
- If your local LLM runtime requires auth or a different API shape, adapt the backend integration layer to match its API.

---

## Extending / Next steps

- Add authentication if needed (JWT, session)
- Implement message history persistence (file, DB)
- Add streaming token rendering in frontend for a more natural typing effect
- Swap the local model for a cloud LLM provider by changing the backend adapter and environment variables

---

## Contributing

Contributions welcome. Create an issue or open a PR with small, focused changes. If you add features, update the README with new commands or environment variables.

---

## License

Add license text here (e.g., MIT) or create a LICENSE file in the repo.

---

If you want, I can:
- Provide a sample Express server file that integrates with a TinyOllama-style API and websockets,
- Create a minimal frontend HTML/CSS/JS example that connects via WebSocket,
- Or produce a Postman collection JSON to import for testing.

Tell me which one you'd like next and I’ll generate it.
