const API_BASE = import.meta.env.VITE_BACKEND_URL;

export interface AnalysisResult {
  score: number;
  level: "Poor" | "Moderate" | "Excellent";
  detectedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
  courseLinks: { skill: string; url: string; platform: string }[];
}

export async function analyzeResume(resumeText: string): Promise<AnalysisResult | null> {
  try {
    const response = await fetch(`${API_BASE}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume: resumeText }),
    });
    const data = await response.json();

    return {
      score: data.score,
      level: data.score > 80 ? "Excellent" : data.score > 50 ? "Moderate" : "Poor",
      detectedSkills: data.detected_skills || [],
      missingSkills: data.missing_skills || [],
      suggestions: [data.message],
      courseLinks: [], // Optional: can fill later
    };
  } catch (err) {
    console.error("Error analyzing resume:", err);
    return null;
  }
}
