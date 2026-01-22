# Agentic Context Engine (Rulebook Agent)

This repository implements a minimal end-to-end hybrid RAG system with:

- **Backend API** (FastAPI): authentication, session management, and AI query endpoints.
- **AI Agent logic** (LangChain + Chroma + Mistral): hybrid retrieval over persistent PDF rules and ephemeral session JSON.
- **Web frontend** (React): upload PDF/JSON, ask questions, and view session state.

> Note: The AI Agent service is currently implemented inside the backend process. The `backend/Dockerfile.agent` image is provided for containerization parity if you want to deploy the agent separately in the future.

## Architecture overview

- **Persistent knowledge**: PDFs are embedded into a vector store on load.
- **Ephemeral data**: JSON session state is stored in-memory for each running backend instance.
- **Hybrid RAG**: each query is answered using both retrieved PDF chunks and the current session state.

## Local development (no Docker)

### 1) Backend API

From the repository root:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env.local`:

```bash
JWT_SECRET_KEY="replace-with-a-secure-secret"
MISTRAL_API_KEY="your-mistral-api-key"
```

Run the API:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2) Frontend

From the repository root:

```bash
cd rulebook-frontend
npm install
npm start
```

The app will be available at `http://localhost:3000` and expects the backend at `http://localhost:8000`.

## Docker (backend + agent)

### Build backend image

```bash
docker build -f backend/Dockerfile -t rulebook-backend backend
```

### Build AI agent image (same codebase)

```bash
docker build -f backend/Dockerfile.agent -t rulebook-agent backend
```

### Build frontend image

```bash
docker build -f rulebook-frontend/Dockerfile -t rulebook-frontend rulebook-frontend
```

### Run backend image

```bash
docker run --rm \
  -p 8000:8000 \
  --env-file backend/.env.local \
  rulebook-backend
```

### Run AI agent image

```bash
docker run --rm \
  -p 8001:8000 \
  --env-file backend/.env.local \
  rulebook-agent
```

### Run frontend image

```bash
docker run --rm \
  -p 3000:3000 \
  rulebook-frontend
```

## API usage

1) **Authenticate** (JWT token):

```bash
curl -X POST http://localhost:8000/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=testpassword"
```

2) **Load PDF + JSON (initialize RAG)**:

```bash
curl -X POST http://localhost:8000/load_data \
  -H "Authorization: Bearer <TOKEN>" \
  -F "pdf_file=@/path/to/rules.pdf" \
  -F "json_file=@/path/to/session.json"
```

3) **Ask a question**:

```bash
curl -X POST http://localhost:8000/query_ai \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"question": "What rules apply to these objects?"}'
```

4) **Inspect session state**:

```bash
curl -X GET http://localhost:8000/session_state \
  -H "Authorization: Bearer <TOKEN>"
```

## Notes

- The backend requires `JWT_SECRET_KEY` and `MISTRAL_API_KEY` to start.
- The frontend is intentionally minimal and intended for local evaluation.
