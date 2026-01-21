from typing import Any, Dict
from pydantic import BaseModel

class AIQueryRequest(BaseModel):
    question: str

class LoadDataRequest(BaseModel):
    """
    Model for loading data into the RAG system.
    Note: PDF file is handled separately as UploadFile in the endpoint.
    """
    json_data: Dict[str, Any]
