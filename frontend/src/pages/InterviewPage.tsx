import type { Page } from "@/App";
import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActor } from "@/hooks/useActor";
import {
  type Role,
  evaluateAnswer,
  motivationalMessages,
  questionBanks,
  roles,
} from "@/lib/interviewData";
import { Brain, Mic, MicOff, StopCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface Props {
  navigate: (page: Page) => void;
}

type Status = "idle" | "listening" | "thinking" | "speaking";

interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
  score?: number;
}

interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

export default function InterviewPage({ navigate }: Props) {
  const user = JSON.parse(localStorage.getItem("vexora_user") || "{}");
  const { actor } = useActor();
  const [selectedRole, setSelectedRole] = useState<Role>("Frontend Developer");
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [scores, setScores] = useState<number[]>([]);
  const [confidence, setConfidence] = useState(50);
  const [motivational, setMotivational] = useState("");
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const questionsRef = useRef<string[]>([]);
  const answersRef = useRef<string[]>([]);
  const questionIndexRef = useRef(0);
  const scoresRef = useRef<number[]>([]);
  const selectedRoleRef = useRef(selectedRole);

  useEffect(() => {
    selectedRoleRef.current = selectedRole;
  }, [selectedRole]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: messages dep triggers scroll; ref is stable
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally stable with no deps
  const speak = useCallback((text: string, onEnd?: () => void) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => v.lang === "en-US" && v.name.includes("Female")) ||
      voices.find((v) => v.lang === "en-US") ||
      voices[0];
    if (preferred) utterance.voice = preferred;
    utterance.onend = onEnd || null;
    setStatus("speaking");
    window.speechSynthesis.speak(utterance);
  }, []);

  const finishInterview = useCallback(async () => {
    if (!actor) return;
    const currentScores = scoresRef.current;
    const avg =
      currentScores.length > 0
        ? Math.round(
            currentScores.reduce((a, b) => a + b) / currentScores.length,
          )
        : 0;
    try {
      await actor.saveInterview(
        selectedRoleRef.current,
        questionsRef.current,
        answersRef.current,
        BigInt(avg),
        `Completed ${questionsRef.current.length} questions. Avg score: ${avg}/100`,
      );
      toast.success("Interview saved!");
    } catch {
      /* ignore */
    }
  }, [actor]);

  const handleUserAnswer = useCallback(
    (answer: string) => {
      setStatus("thinking");
      const idx = questionIndexRef.current;
      answersRef.current.push(answer);
      setMessages((prev) => [
        ...prev,
        { id: `user-${Date.now()}`, role: "user", content: answer },
      ]);

      setTimeout(() => {
        const { score, feedback, tips } = evaluateAnswer(
          answer,
          questionsRef.current[idx] || "",
        );
        scoresRef.current = [...scoresRef.current, score];
        const ns = scoresRef.current;
        setScores([...ns]);
        setConfidence(Math.round(ns.reduce((a, b) => a + b, 0) / ns.length));
        setMotivational(
          motivationalMessages[
            Math.floor(Math.random() * motivationalMessages.length)
          ],
        );

        const nextIdx = idx + 1;
        questionIndexRef.current = nextIdx;
        const nextQ = questionsRef.current[nextIdx];
        const resp = nextQ
          ? `${feedback} ${tips}\n\nNext question: ${nextQ}`
          : `${feedback} ${tips}\n\nThat concludes our interview! Great job.`;

        setMessages((prev) => [
          ...prev,
          { id: `ai-${Date.now()}`, role: "ai", content: resp, score },
        ]);
        if (nextQ) speak(resp, () => setStatus("idle"));
        else
          speak(resp, () => {
            setStatus("idle");
            finishInterview();
          });
      }, 1500);
    },
    [speak, finishInterview],
  );

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      toast.error("Speech recognition not supported in this browser.");
      return;
    }
    const r = new SR();
    r.continuous = false;
    r.interimResults = false;
    r.lang = "en-US";
    r.onstart = () => setStatus("listening");
    r.onresult = (e) => handleUserAnswer(e.results[0][0].transcript);
    r.onerror = () => setStatus("idle");
    recognitionRef.current = r;
    r.start();
  }, [handleUserAnswer]);

  const endInterview = useCallback(() => {
    window.speechSynthesis.cancel();
    recognitionRef.current?.stop();
    setStarted(false);
    setStatus("idle");
    finishInterview();
  }, [finishInterview]);

  const startInterview = () => {
    const shuffled = [...questionBanks[selectedRole]]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
    questionsRef.current = shuffled;
    answersRef.current = [];
    scoresRef.current = [];
    questionIndexRef.current = 0;
    setMessages([]);
    setScores([]);
    setConfidence(50);
    setStarted(true);
    const firstQ = shuffled[0];
    setMessages([
      {
        id: "ai-start",
        role: "ai",
        content: `Hello! I'm your AI interviewer for the ${selectedRole} position. Let's begin.\n\n${firstQ}`,
      },
    ]);
    setTimeout(
      () =>
        speak(
          `Hello! I'm your AI interviewer for the ${selectedRole} position. Let's begin. ${firstQ}`,
          () => setStatus("idle"),
        ),
      500,
    );
  };

  const avgScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b) / scores.length)
      : 0;
  const statusConfig: Record<Status, { label: string; color: string }> = {
    idle: { label: "Ready", color: "bg-muted text-muted-foreground" },
    listening: { label: "Listening...", color: "bg-success/20 text-green-300" },
    thinking: { label: "Thinking...", color: "bg-warning/20 text-yellow-300" },
    speaking: { label: "Speaking...", color: "bg-primary/20 text-primary" },
  };

  return (
    <Layout isAdmin={user.isAdmin} navigate={navigate} currentPage="interview">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-3xl font-bold mb-2">
          AI Mock <span className="text-gradient">Interview</span>
        </h1>
        <p className="text-muted-foreground mb-8">
          Practice with a real-time voice-based AI interviewer.
        </p>

        {!started ? (
          <Card className="bg-card border-border max-w-lg mx-auto">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center mx-auto glow-cyan">
                <Brain className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold mb-2">
                  Select Your Role
                </h2>
                <p className="text-sm text-muted-foreground">
                  Choose the position you're interviewing for
                </p>
              </div>
              <Select
                value={selectedRole}
                onValueChange={(v) => setSelectedRole(v as Role)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                className="w-full glow-cyan text-lg py-6"
                onClick={startInterview}
              >
                Start Interview
              </Button>
              <p className="text-xs text-muted-foreground">
                Make sure your microphone is enabled
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    status === "listening"
                      ? "bg-green-400 animate-pulse"
                      : status === "speaking"
                        ? "bg-primary animate-pulse"
                        : "bg-muted-foreground"
                  }`}
                />
                <Badge className={statusConfig[status].color}>
                  {statusConfig[status].label}
                </Badge>
                {motivational && (
                  <span className="text-xs text-primary italic">
                    {motivational}
                  </span>
                )}
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={endInterview}
                className="gap-2"
              >
                <StopCircle className="w-4 h-4" />
                End Interview
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Average Score</p>
                <Progress value={avgScore} className="h-2" />
                <p className="text-xs text-primary">{avgScore}/100</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Confidence</p>
                <Progress value={confidence} className="h-2" />
                <p className="text-xs text-secondary">{confidence}%</p>
              </div>
            </div>

            <div className="flex justify-center">
              <div
                className={`w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center ${
                  status === "speaking" ? "pulse-glow" : ""
                }`}
              >
                {status === "speaking" ? (
                  <div className="flex items-end gap-0.5 h-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="waveform-bar w-1.5 bg-primary rounded-full h-6"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                ) : (
                  <Brain className="w-8 h-8 text-primary" />
                )}
              </div>
            </div>

            <Card className="bg-card border-border">
              <CardContent className="p-4 h-80 overflow-y-auto space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-3 text-sm whitespace-pre-wrap ${
                        msg.role === "ai"
                          ? "bg-primary/10 border border-primary/20"
                          : "bg-secondary/20 border border-secondary/30"
                      }`}
                    >
                      {msg.content}
                      {msg.score !== undefined && (
                        <div className="mt-2 text-xs text-primary font-semibold">
                          Score: {msg.score}/100
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={status === "idle" ? startListening : undefined}
                disabled={status !== "idle"}
                className={`w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all ${
                  status === "listening"
                    ? "border-green-400 bg-green-400/20 pulse-glow"
                    : status !== "idle"
                      ? "border-muted-foreground bg-muted opacity-50 cursor-not-allowed"
                      : "border-primary bg-primary/20 hover:bg-primary/30 glow-cyan cursor-pointer"
                }`}
              >
                {status === "listening" ? (
                  <MicOff className="w-8 h-8 text-green-400" />
                ) : (
                  <Mic className="w-8 h-8 text-primary" />
                )}
              </button>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              {status === "idle"
                ? "Click mic to answer"
                : statusConfig[status].label}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
