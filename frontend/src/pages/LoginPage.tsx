import type { Page } from "@/App";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { Brain, Zap } from "lucide-react";
import { useEffect } from "react";

interface Props {
  navigate: (page: Page) => void;
}

export default function LoginPage({ navigate }: Props) {
  const { login, isLoggingIn, identity } = useInternetIdentity();
  const { actor } = useActor();

  useEffect(() => {
    if (identity && actor) {
      actor
        .isCallerAdmin()
        .then((isAdmin) => {
          localStorage.setItem("vexora_user", JSON.stringify({ isAdmin }));
          navigate(isAdmin ? "admin" : "home");
        })
        .catch(() => {
          localStorage.setItem(
            "vexora_user",
            JSON.stringify({ isAdmin: false }),
          );
          navigate("home");
        });
    }
  }, [identity, actor, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      {/* Aurora background */}
      <div className="bg-aurora" aria-hidden="true">
        <div className="bg-aurora-mid" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 mb-4 glow-cyan">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-gradient">
            Vexora AI
          </h1>
          <p className="text-muted-foreground mt-2">AI Skill Gap Analyzer</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-xs text-primary">NextGen AI Hackathon</span>
          </div>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="font-display">Welcome</CardTitle>
            <CardDescription>
              Sign in with Internet Identity to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground mb-1">
                What you'll get access to:
              </p>
              <ul className="space-y-1">
                <li>🎯 AI-powered resume analysis</li>
                <li>📋 Resume builder with live preview</li>
                <li>🎤 Real-time voice mock interviews</li>
                <li>📊 Progress tracking &amp; history</li>
              </ul>
            </div>
            <Button
              className="w-full glow-cyan text-base py-6"
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="login.submit_button"
            >
              {isLoggingIn ? "Connecting..." : "Sign In with Internet Identity"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Secure, private, no password required
            </p>
          </CardContent>
        </Card>
        <p className="text-center text-xs text-muted-foreground mt-6">
          Developed for NextGen AI Hackathon by Team Vexora ❤️
        </p>
      </div>
    </div>
  );
}
