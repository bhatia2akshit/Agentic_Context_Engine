from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from ai.models import AIQueryRequest
from auth.dependencies import get_current_user
from ai.rag import build_rag_chain
from session.manager import SessionManager
import json
import tempfile
import os

router = APIRouter()

def get_ai_router(app):
    @router.post("/load_data")
    async def load_data(
        pdf_file: UploadFile = File(...),
        json_file: UploadFile = File(...),
        current_user: str = Depends(get_current_user),
    ):
        """
        Load PDF and JSON data, then initialize the RAG chain.
        This must be called before query_ai can be used.
        """
        try:
            # Read and parse JSON file
            json_content = await json_file.read()
            parsed_json_data = json.loads(json_content.decode('utf-8'))
            if isinstance(parsed_json_data, list):
                # Wrap arrays so session state stays a dict for updates/removals.
                parsed_json_data = {"data": parsed_json_data}
            elif not isinstance(parsed_json_data, dict):
                raise HTTPException(400, "JSON must be an object or array")
            print('data loaded.')
            # Save PDF to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
                pdf_content = await pdf_file.read()
                temp_pdf.write(pdf_content)
                temp_pdf_path = temp_pdf.name
            
            # Initialize session manager with JSON data
            app.state.session_manager = SessionManager(parsed_json_data)
            
            # Build RAG chain with the uploaded PDF and session manager
            app.state.chain = build_rag_chain(temp_pdf_path, app.state.session_manager)
            
            # Clean up temporary file
            os.unlink(temp_pdf_path)
            
            return {
                "message": "Data loaded successfully. RAG session initialized.",
                "session_state": app.state.session_manager.get_current_state(),
            }
            
        except json.JSONDecodeError:
            raise HTTPException(400, "Invalid JSON file provided")
        except UnicodeDecodeError:
            raise HTTPException(400, "JSON file must be UTF-8 encoded")
        except Exception as e:
            raise HTTPException(500, f"Failed to load data: {str(e)}")

    @router.post("/query_ai")
    async def query_ai(
        request: AIQueryRequest,
        current_user: str = Depends(get_current_user),
    ):
        """
        Query the AI agent. Requires load_data to be called first.
        """
        if app.state.chain is None or app.state.session_manager is None:
            raise HTTPException(
                400, 
                "RAG session not initialized. Please call /load_data first."
            )

        # Invoke the chain with the question
        response = app.state.chain.invoke(request.question)
        
        return {
            "response": response,
            "session_state": app.state.session_manager.get_current_state(),
        }

    @router.get("/session_state")
    async def session_state(current_user: str = Depends(get_current_user)):
        """
        Get the current session state.
        """
        if app.state.session_manager is None:
            raise HTTPException(
                400, 
                "Session not initialized. Please call /load_data first."
            )
        return app.state.session_manager.get_current_state()

    return router
