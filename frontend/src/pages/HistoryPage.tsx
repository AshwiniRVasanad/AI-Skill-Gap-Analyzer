import type { Page } from "@/App";
import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, FileText, Mic } from "lucide-react";
import { useState } from "react";

interface Props {
  navigate: (page: Page) => void;
}

export default function HistoryPage({ navigate }: Props) {
  const user = JSON.parse(localStorage.getItem("vexora_user") || "{}");
  const { actor } = useActor();
  const [expanded, setExpanded] = useState<number | null>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => actor!.getCallerUserProfile(),
    enabled: !!actor,
  });

  const interviews = profile?.interviews || [];
  const resumes = profile?.resumes || [];
  const avgScore =
    interviews.length > 0
      ? Math.round(
          interviews.reduce((a, b) => a + Number(b.score), 0) /
            interviews.length,
        )
      : 0;

  return (
    <Layout isAdmin={user.isAdmin} navigate={navigate} currentPage="history">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-3xl font-bold mb-2">
          Your <span className="text-gradient">History</span>
        </h1>
        <p className="text-muted-foreground mb-8">
          Track your progress over time.
        </p>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Interviews", value: interviews.length, icon: Mic },
                { label: "Resumes", value: resumes.length, icon: FileText },
                { label: "Avg Score", value: `${avgScore}/100`, icon: null },
              ].map(({ label, value, icon: Icon }) => (
                <Card key={label} className="bg-card border-border">
                  <CardContent className="p-4 text-center">
                    {Icon && (
                      <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
                    )}
                    <p className="font-display text-2xl font-bold text-gradient">
                      {value}
                    </p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold mb-4">
                Interview Sessions
              </h2>
              {interviews.length === 0 ? (
                <Card className="bg-card border-border">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No interviews yet.{" "}
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => navigate("interview")}
                    >
                      Start your first mock interview →
                    </button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {[...interviews].reverse().map((session, i) => {
                    const score = Number(session.score);
                    const date = new Date(
                      Number(session.timestamp) / 1_000_000,
                    ).toLocaleDateString();
                    const isExp = expanded === i;
                    return (
                      // biome-ignore lint/suspicious/noArrayIndexKey: reversed list, no stable id
                      <Card key={i} className="bg-card border-border">
                        <CardContent className="p-4">
                          {/* biome-ignore lint/a11y/useSemanticElements: expandable row with complex content */}
                          <div
                            role="button"
                            tabIndex={0}
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => setExpanded(isExp ? null : i)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ")
                                setExpanded(isExp ? null : i);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                                <Mic className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold">{session.role}</p>
                                <p className="text-xs text-muted-foreground">
                                  {date}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-sm font-bold text-primary">
                                  {score}/100
                                </p>
                                <Progress value={score} className="h-1 w-20" />
                              </div>
                              <Badge
                                className={
                                  score >= 70
                                    ? "bg-success/20 text-green-300"
                                    : score >= 40
                                      ? "bg-warning/20 text-yellow-300"
                                      : "bg-destructive/20 text-red-300"
                                }
                              >
                                {score >= 70
                                  ? "Excellent"
                                  : score >= 40
                                    ? "Moderate"
                                    : "Poor"}
                              </Badge>
                              {isExp ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          </div>
                          {isExp && (
                            <div className="mt-4 space-y-3 border-t border-border pt-4">
                              {session.questions.map((q, qi) => (
                                // biome-ignore lint/suspicious/noArrayIndexKey: question list has no id
                                <div key={qi} className="space-y-1">
                                  <p className="text-sm font-semibold text-primary">
                                    Q{qi + 1}: {q}
                                  </p>
                                  {session.answers[qi] && (
                                    <p className="text-sm text-muted-foreground pl-4">
                                      {session.answers[qi]}
                                    </p>
                                  )}
                                </div>
                              ))}
                              {session.feedback && (
                                <p className="text-sm text-muted-foreground italic border-l-2 border-primary pl-3">
                                  {session.feedback}
                                </p>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold mb-4">
                Resume Analyses
              </h2>
              {resumes.length === 0 ? (
                <Card className="bg-card border-border">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No resumes yet.{" "}
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => navigate("resume")}
                    >
                      Analyze your resume →
                    </button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {[...resumes].reverse().map((r, i) => {
                    const score = Number(r.analysisScore);
                    const date = new Date(
                      Number(r.timestamp) / 1_000_000,
                    ).toLocaleDateString();
                    return (
                      // biome-ignore lint/suspicious/noArrayIndexKey: reversed list
                      <Card key={i} className="bg-card border-border">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-secondary" />
                            </div>
                            <div>
                              <p className="font-semibold">Resume Analysis</p>
                              <p className="text-xs text-muted-foreground">
                                {date}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-primary">
                              {score}/100
                            </p>
                            <Badge
                              className={
                                score >= 70
                                  ? "bg-success/20 text-green-300"
                                  : score >= 40
                                    ? "bg-warning/20 text-yellow-300"
                                    : "bg-destructive/20 text-red-300"
                              }
                            >
                              {score >= 70
                                ? "Excellent ✅"
                                : score >= 40
                                  ? "Moderate ⚡"
                                  : "Poor ⚠️"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
