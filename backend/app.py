from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    # simple dummy check (replace with real DB later)
    if username == "admin" and password == "admin123":
        return jsonify({"success": True, "token": "fake-jwt-token", "isAdmin": True})
    elif username == "user" and password == "user123":
        return jsonify({"success": True, "token": "fake-jwt-token", "isAdmin": False})
    else:
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

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
