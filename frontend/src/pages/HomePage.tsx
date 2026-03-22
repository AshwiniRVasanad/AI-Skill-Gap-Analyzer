import type { Page } from "@/App";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Award, FileText, Mic, Target, TrendingUp, Zap } from "lucide-react";

interface Props {
  navigate: (page: Page) => void;
}

export default function HomePage({ navigate }: Props) {
  const user = JSON.parse(localStorage.getItem("vexora_user") || "{}");

  const features = [
    {
      icon: Target,
      title: "Skill Gap Analysis",
      desc: "Identify missing skills compared to your target role requirements.",
    },
    {
      icon: TrendingUp,
      title: "Smart Scoring",
      desc: "Get a detailed resume score with actionable improvement suggestions.",
    },
    {
      icon: Mic,
      title: "AI Mock Interview",
      desc: "Practice with a real-time voice-based AI interviewer.",
    },
    {
      icon: Award,
      title: "Course Recommendations",
      desc: "Get curated course links from Udemy, Coursera, and YouTube.",
    },
  ];

  return (
    <Layout isAdmin={user.isAdmin} navigate={navigate} currentPage="home">
      <div className="space-y-16">
        <div className="text-center py-16 relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
              <Zap className="w-3 h-3 text-primary" />
              <span className="text-xs text-primary font-semibold">
                NextGen AI Hackathon Project
              </span>
            </div>
            <h1 className="font-display text-5xl font-bold mb-4">
              <span className="text-gradient">AI-Powered</span>
              <br />
              <span className="text-foreground">Career Intelligence</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Identify skill gaps, ace interviews, and land your dream job with
              AI guidance. Your personal career mentor, available 24/7.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                size="lg"
                className="glow-cyan gap-2"
                onClick={() => navigate("resume")}
              >
                <FileText className="w-5 h-5" />
                Analyze Resume
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                onClick={() => navigate("interview")}
              >
                <Mic className="w-5 h-5" />
                Start Interview
              </Button>
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold text-center mb-8">
            Everything you need to succeed
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <Card
                key={title}
                className="bg-card border-border hover:border-primary/50 transition-colors"
              >
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center py-8 border-t border-border">
          <p className="text-xl font-display font-semibold text-gradient mb-4">
            Grow your career with AI guidance 🚀
          </p>
          <p className="text-sm text-muted-foreground">
            Developed for NextGen AI Hackathon by Team Vexora ❤️
          </p>
        </div>
      </div>
    </Layout>
  );
}
