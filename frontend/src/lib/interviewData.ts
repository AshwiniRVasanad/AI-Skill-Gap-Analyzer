export type Role =
  | "Frontend Developer"
  | "Backend Developer"
  | "Full Stack Developer"
  | "Data Scientist"
  | "DevOps Engineer";

export const roles: Role[] = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "DevOps Engineer",
];

export const questionBanks: Record<Role, string[]> = {
  "Frontend Developer": [
    "Can you explain the difference between React hooks and class components?",
    "What is the virtual DOM and how does it improve performance?",
    "How do you handle CSS specificity conflicts?",
    "Explain the concept of accessibility in web development.",
    "What are some techniques to optimize web performance?",
    "How does event bubbling work in JavaScript?",
    "What is the difference between `null` and `undefined` in JavaScript?",
    "Explain how `useEffect` works and when to use it.",
    "What is CSS Flexbox and when would you use Grid instead?",
    "How do you manage state in a large React application?",
  ],
  "Backend Developer": [
    "What is the difference between REST and GraphQL?",
    "How do database indexes improve query performance?",
    "Explain caching strategies you have used.",
    "How do you secure API endpoints?",
    "What is the difference between SQL and NoSQL databases?",
    "Explain the concept of database transactions.",
    "How would you handle rate limiting in an API?",
    "What are microservices and their trade-offs?",
    "How do you approach error handling in backend services?",
    "Explain JWT authentication flow.",
  ],
  "Full Stack Developer": [
    "How do you approach building a full-stack feature from scratch?",
    "What is CORS and how do you handle it?",
    "How do you keep frontend and backend in sync?",
    "Explain how you would implement real-time updates.",
    "What is server-side rendering and when would you use it?",
    "How do you handle authentication across frontend and backend?",
    "What are the trade-offs between monolithic and microservice architectures?",
    "How do you approach database schema design?",
    "What tools do you use for API testing?",
    "Explain the concept of CI/CD pipelines.",
  ],
  "Data Scientist": [
    "What is overfitting and how do you prevent it?",
    "Explain cross-validation and why it matters.",
    "How do you handle missing data in a dataset?",
    "What is the difference between supervised and unsupervised learning?",
    "Explain feature engineering and its importance.",
    "How do you evaluate the performance of a classification model?",
    "What is the bias-variance tradeoff?",
    "How do you handle imbalanced datasets?",
    "Explain the concept of regularization in machine learning.",
    "What is the difference between bagging and boosting?",
  ],
  "DevOps Engineer": [
    "Explain the concept of CI/CD and its benefits.",
    "What is Docker and how does containerization work?",
    "How does Kubernetes help in container orchestration?",
    "What monitoring tools have you worked with?",
    "Explain infrastructure as code.",
    "How do you handle secrets management in production?",
    "What is blue-green deployment?",
    "How do you troubleshoot a production incident?",
    "Explain the concept of idempotency in infrastructure.",
    "What is the difference between horizontal and vertical scaling?",
  ],
};

export const motivationalMessages = [
  "Great answer! Keep it up!",
  "You're improving with each response!",
  "Nice use of technical terminology!",
  "Be more specific with examples next time.",
  "Excellent! Very structured response.",
  "Good start! Try the STAR method for behavioral questions.",
  "You're gaining confidence!",
  "Great technical depth!",
];

export function evaluateAnswer(
  answer: string,
  _question: string,
): { score: number; feedback: string; tips: string } {
  const wordCount = answer.trim().split(/\s+/).length;
  const hasTechTerms =
    /(?:algorithm|function|component|database|api|async|state|class|method|interface|hook|render|query|cache|deploy|container)/i.test(
      answer,
    );
  const hasExample =
    /(?:for example|such as|like|instance|when i|i used|i implemented|in my)/i.test(
      answer,
    );
  const hasStructure =
    /(?:first|second|then|finally|also|additionally|however|because)/i.test(
      answer,
    );

  let score = 40;
  if (wordCount > 20) score += 10;
  if (wordCount > 50) score += 10;
  if (wordCount > 100) score += 5;
  if (hasTechTerms) score += 15;
  if (hasExample) score += 10;
  if (hasStructure) score += 10;
  score = Math.min(score, 100);

  let feedback = "";
  let tips = "";

  if (score >= 80) {
    feedback =
      "Excellent answer! You demonstrated strong knowledge with clear examples and structure.";
    tips =
      "Keep using structured answers like the STAR method for behavioral questions.";
  } else if (score >= 60) {
    feedback =
      "Good answer. You covered the main points but could go deeper with specific examples.";
    tips =
      "Try to include real-world examples from your projects to strengthen your answers.";
  } else if (score >= 40) {
    feedback = "Decent start, but the answer lacks depth and technical detail.";
    tips =
      "Study this topic more thoroughly and practice explaining it out loud.";
  } else {
    feedback =
      "The answer needs more substance. Try to be more specific and detailed.";
    tips =
      "Break your answer into clear parts: what it is, how it works, and when to use it.";
  }

  return { score, feedback, tips };
}
