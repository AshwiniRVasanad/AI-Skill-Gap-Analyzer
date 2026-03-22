# main.py
from fastapi import FastAPI
from pydantic import BaseModel
from resume_analyzer import analyze_resume

app = FastAPI()

class ResumeRequest(BaseModel):
    resume: str

@app.post("/analyze")
async def analyze(req: ResumeRequest):
    result = analyze_resume(req.resume)
    return result

# Optional: interview endpoint
class InterviewRequest(BaseModel):
    role: str

@app.post("/interview")
async def interview(req: InterviewRequest):
    # Dummy response for now
    return {
        "role": req.role,
        "questions": [
            f"What experience do you have in {req.role}?",
            f"Explain a challenging project related to {req.role}.",
        ],
    }
