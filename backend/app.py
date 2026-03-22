from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "Backend is running 🚀"

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.json
    resume_text = data.get("resume", "")

    # Dummy analysis (you can upgrade later)
    score = 75
    missing_skills = ["Machine Learning", "Deep Learning"]

    return jsonify({
        "score": score,
        "missing_skills": missing_skills,
        "message": "Improve these skills to increase your score!"
    })

@app.route("/interview", methods=["POST"])
def interview():
    data = request.json
    answer = data.get("answer", "")

    return jsonify({
        "feedback": "Good answer! Try to be more specific.",
        "score": 8
    })

if __name__ == "__main__":
    app.run(debug=True)
