export interface AnalysisResult {
  score: number;
  level: "Poor" | "Moderate" | "Excellent";
  detectedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
  courseLinks: { skill: string; url: string; platform: string }[];
}

const skillSets: Record<string, string[]> = {
  frontend: [
    "React",
    "TypeScript",
    "CSS",
    "HTML",
    "JavaScript",
    "Tailwind",
    "Redux",
    "Next.js",
    "Testing",
    "Git",
    "REST API",
    "Webpack",
    "Performance",
  ],
  backend: [
    "Node.js",
    "Python",
    "SQL",
    "NoSQL",
    "REST API",
    "GraphQL",
    "Docker",
    "Git",
    "Authentication",
    "Caching",
    "Testing",
    "Microservices",
  ],
  datascience: [
    "Python",
    "Machine Learning",
    "Pandas",
    "NumPy",
    "SQL",
    "Statistics",
    "Deep Learning",
    "TensorFlow",
    "Data Visualization",
    "Feature Engineering",
  ],
  devops: [
    "Docker",
    "Kubernetes",
    "CI/CD",
    "Linux",
    "AWS",
    "Terraform",
    "Monitoring",
    "Git",
    "Bash",
    "Networking",
  ],
};

const courseSuggestions: Record<string, { url: string; platform: string }> = {
  React: {
    url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
    platform: "Udemy",
  },
  TypeScript: {
    url: "https://www.udemy.com/course/understanding-typescript/",
    platform: "Udemy",
  },
  Python: {
    url: "https://www.coursera.org/specializations/python",
    platform: "Coursera",
  },
  "Machine Learning": {
    url: "https://www.coursera.org/learn/machine-learning",
    platform: "Coursera",
  },
  Docker: {
    url: "https://www.youtube.com/watch?v=fqMOX6JJhGo",
    platform: "YouTube",
  },
  Kubernetes: {
    url: "https://www.udemy.com/course/learn-kubernetes/",
    platform: "Udemy",
  },
  SQL: {
    url: "https://www.coursera.org/learn/sql-for-data-science",
    platform: "Coursera",
  },
  "Node.js": {
    url: "https://www.udemy.com/course/the-complete-nodejs-developer-course-2/",
    platform: "Udemy",
  },
  GraphQL: {
    url: "https://www.youtube.com/watch?v=ed8SzALpx1Q",
    platform: "YouTube",
  },
  "CI/CD": {
    url: "https://www.udemy.com/course/devops-with-docker/",
    platform: "Udemy",
  },
  AWS: {
    url: "https://www.coursera.org/learn/aws-fundamentals-going-cloud-native",
    platform: "Coursera",
  },
  "Deep Learning": {
    url: "https://www.coursera.org/specializations/deep-learning",
    platform: "Coursera",
  },
  Redux: {
    url: "https://www.udemy.com/course/react-redux/",
    platform: "Udemy",
  },
  "Next.js": {
    url: "https://www.youtube.com/watch?v=mTz0GXj8NN0",
    platform: "YouTube",
  },
  Testing: {
    url: "https://www.udemy.com/course/react-testing-library/",
    platform: "Udemy",
  },
  Pandas: {
    url: "https://www.youtube.com/watch?v=vmEHCJofslg",
    platform: "YouTube",
  },
};

export function analyzeResume(text: string): AnalysisResult {
  const lowerText = text.toLowerCase();
  const allSkills = [...new Set(Object.values(skillSets).flat())];

  const detectedSkills = allSkills.filter((skill) =>
    lowerText.includes(skill.toLowerCase()),
  );

  // Determine role
  let targetSkills = skillSets.frontend;
  if (
    lowerText.includes("python") ||
    lowerText.includes("machine learning") ||
    lowerText.includes("data")
  ) {
    targetSkills = skillSets.datascience;
  } else if (
    lowerText.includes("docker") ||
    lowerText.includes("kubernetes") ||
    lowerText.includes("devops")
  ) {
    targetSkills = skillSets.devops;
  } else if (
    lowerText.includes("node") ||
    lowerText.includes("backend") ||
    lowerText.includes("server")
  ) {
    targetSkills = skillSets.backend;
  }

  const missingSkills = targetSkills
    .filter((skill) => !detectedSkills.includes(skill))
    .slice(0, 5);

  const score = Math.min(
    100,
    Math.round((detectedSkills.length / targetSkills.length) * 100) +
      Math.min(20, Math.floor(text.split(/\s+/).length / 50)),
  );

  const level: AnalysisResult["level"] =
    score >= 70 ? "Excellent" : score >= 40 ? "Moderate" : "Poor";

  const suggestions = [
    missingSkills.length > 0
      ? `Add ${missingSkills.slice(0, 2).join(", ")} to your skill set`
      : "Great skill coverage!",
    text.length < 500
      ? "Expand your resume with more project details"
      : "Good resume length",
    'Quantify your achievements (e.g., "improved performance by 30%")',
    "Add links to GitHub, LinkedIn, or portfolio",
    "Include certifications and online course completions",
  ];

  const courseLinks = missingSkills
    .filter((skill) => courseSuggestions[skill])
    .map((skill) => ({ skill, ...courseSuggestions[skill] }));

  return {
    score,
    level,
    detectedSkills,
    missingSkills,
    suggestions,
    courseLinks,
  };
}

export function buildResumeText(data: {
  name: string;
  email: string;
  phone: string;
  summary: string;
  skills: string;
  education: string;
  experience: string;
  projects: string;
}): string {
  return `${data.name}\n${data.email} | ${data.phone}\n\nSUMMARY\n${data.summary}\n\nSKILLS\n${data.skills}\n\nEDUCATION\n${data.education}\n\nEXPERIENCE\n${data.experience}\n\nPROJECTS\n${data.projects}`;
}
