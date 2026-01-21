from ai.rag import build_rag_chain
from ai.router import get_ai_router
from fastapi import FastAPI
from auth.router import router as auth_router
import uvicorn

app = FastAPI()

# Store chain and session_manager in app state instead of global variables
app.state.chain = None
app.state.session_manager = None

app.include_router(auth_router)
app.include_router(get_ai_router(app))

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )