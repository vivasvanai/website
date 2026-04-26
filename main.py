from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/health')
def health():
    return {"status": "ok"}

@app.get('/api/skills')
def skills():
    return [
        {"name": "Python",       "icon": "<i class='ph ph-code'></i>", "level": 90, "levelLabel": "Proficient"},
        {"name": "FastAPI",      "icon": "<i class='ph ph-lightning'></i>", "level": 85, "levelLabel": "Proficient"},
        {"name": "Scikit-learn", "icon": "<i class='ph ph-graph'></i>", "level": 80, "levelLabel": "Advanced"},
        {"name": "C",            "icon": "<i class='ph ph-cpu'></i>", "level": 60, "levelLabel": "Intermediate"}
    ]

@app.get('/api/projects')
def projects():
    return [
        {
            "title": "Vivasvan AI Portfolio",
            "description": "A dynamic AI portfolio website built with FastAPI, Streamlit, and Vanilla JS.",
            "tags": ["FastAPI", "Streamlit", "JavaScript", "HTML/CSS"]
        }
    ]

class ContactForm(BaseModel):
    name: str
    email: str
    message: str

@app.post('/api/contact')
def contact(form: ContactForm):
    return {"message": "received"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="localhost", port=3000, reload=True)