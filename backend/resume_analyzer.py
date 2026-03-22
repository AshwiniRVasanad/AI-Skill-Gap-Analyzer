# resume_analyzer.py
from typing import List

# Example skill sets
SKILL_SETS = {
    "frontend": ["React", "TypeScript", "CSS", "HTML", "JavaScript", "Tailwind", "Redux", "Next.js"],
    "backend": ["Node.js", "Python", "SQL", "NoSQL", "REST API", "GraphQL", "Docker", "Git"],
    "datascience": ["Python", "Machine Learning", "Pandas", "NumPy", "Matplotlib", "Scikit-Learn"],
}

COURSE_SUGGESTIONS = {
    "React": {"url": "https://www.udemy.com/course/react-the-complete-guide-incl-redux/", "platform": "Udemy"},
    "Python": {"url": "https://www.coursera.org/specializations/python", "platform": "Coursera"},
    "Machine Learning": {"url": "https://www.coursera.org/learn/machine-learning", "platform": "Coursera"},
}

def analyze_resume(text: str) -> dict:
    text_lower = text.lower()
    detected_skills = []
    missing_skills = []

    all_skills = [skill for skills in SKILL_SETS.values() for skill in skills]
    for skill in all_skills:
        if skill.lower() in text_lower:
            detected_skills.append(skill)

    # Determine role
    target_skills = SKILL_SETS["frontend"]
    if "python" in text_lower or "machine learning" in text_lower or "data" in text_lower:
        target_skills = SKILL_SETS["datascience"]
    elif "node" in text_lower or "backend" in text_lower:
        target_skills = SKILL_SETS["backend"]

    missing_skills = [s for s in target_skills if s not in detected_skills][:5]

    # Score calculation
    score = min(100, round(len(detected_skills)/len(target_skills)*100) + min(20, len(text.split())//50))

    message = "Add missing skills to improve your resume" if missing_skills else "Great skills coverage!"

    return {
        "score": score,
        "detected_skills": detected_skills,
        "missing_skills": missing_skills,
        "message": message,
    }
