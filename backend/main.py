
from fastapi import FastAPI
from socket_manager import sio
from database import create_database

app = FastAPI(
    title="CodeMathia Backend",
    description="1v1 Wizard Math Battle API"
)

@app.get("/")
def home():
    return {
        "project": "CodeMathia",
        "status": "Backend Running Successfully"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}


# Create database tables
create_database()

# Connect Socket.io with FastAPI
socket_app = sio

application = __import__("socketio").ASGIApp(
    socket_app,
    other_asgi_app=app
)
