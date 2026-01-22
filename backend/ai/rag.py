import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_mistralai import ChatMistralAI

from core.config import MISTRAL_API_KEY
from session.manager import SessionManager

def build_rag_chain(pdf_file_path: str, session_manager: SessionManager):
    """
    Build a RAG chain with the provided PDF file and session manager.
    
    Args:
        pdf_file_path: Path to the PDF file to load
        session_manager: SessionManager instance with JSON data already loaded
    
    Returns:
        A LangChain runnable chain
    """
    if not os.path.exists(pdf_file_path):
        raise FileNotFoundError(f"{pdf_file_path} not found")

    # Load PDF
    loader = PyPDFLoader(pdf_file_path)
    pages = loader.load_and_split()

    # Split documents
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    docs = splitter.split_documents(pages)

    # Create embeddings
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-mpnet-base-v2"
    )

    # Create vector store
    vectorstore = Chroma.from_documents(
        documents=docs,
        embedding=embeddings,
        collection_name="persistent_rules"
    )

    retriever = vectorstore.as_retriever()

    # Initialize LLM
    llm = ChatMistralAI(
        model="mistral-small",
        temperature=0.1,
        mistral_api_key=MISTRAL_API_KEY,
    )

    # Create prompt template
    prompt = ChatPromptTemplate.from_template(
        """
        You are an AI assistant for permitted development rights.

        Context:
        - Persistent Rules: {persistent_rules}
        - Ephemeral Data: {ephemeral_data}

        Question: {question}
        Answer:
        """
    )

    # Build and return the chain
    return (
        {
            "persistent_rules": retriever,
            "ephemeral_data": lambda _: session_manager.get_current_state(),
            "question": RunnablePassthrough(),
        }
        | prompt
        | llm
        | StrOutputParser()
    )