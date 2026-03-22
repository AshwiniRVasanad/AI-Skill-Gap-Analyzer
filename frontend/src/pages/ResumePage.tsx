import type { Page } from "@/App";
import Layout from "@/components/Layout";
import ScoreGauge from "@/components/ScoreGauge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import {
  type AnalysisResult,
  analyzeResume,
  buildResumeText,
} from "@/lib/resumeAnalysis";
import { BookOpen, CloudUpload, ExternalLink, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface Props {
  navigate: (page: Page) => void;
}

export default function ResumePage({ navigate }: Props) {
  const user = JSON.parse(localStorage.getItem("vexora_user") || "{}");
  const { actor } = useActor();
  const [dragging, setDragging] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [builderData, setBuilderData] = useState({
    name: "",
    email: "",
    phone: "",
    summary: "",
    skills: "",
    education: "",
    experience: "",
    projects: "",
  });

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setResumeText((e.target?.result as string) || "");
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const runAnalysis = (text: string) => {
    setAnalyzing(true);
    setTimeout(() => {
      const result = analyzeResume(text);
      setAnalysis(result);
      setAnalyzing(false);
    }, 1500);
  };

  const saveToBackend = async () => {
    if (!analysis || !actor) return;
    setSaving(true);
    try {
      await actor.saveResume(
        resumeText,
        analysis.detectedSkills,
        BigInt(analysis.score),
        analysis.missingSkills,
        analysis.suggestions,
      );
      toast.success("Resume analysis saved!");
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const platformColor: Record<string, string> = {
    Udemy: "bg-orange-500/20 text-orange-300",
    Coursera: "bg-blue-500/20 text-blue-300",
    YouTube: "bg-red-500/20 text-red-300",
  };

  return (
    <Layout isAdmin={user.isAdmin} navigate={navigate} currentPage="resume">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display text-3xl font-bold mb-2">
          Resume <span className="text-gradient">Analysis</span>
        </h1>
        <p className="text-muted-foreground mb-8">
          Upload your resume or build one to get AI-powered analysis.
        </p>

        <Tabs defaultValue="upload">
          <TabsList className="mb-8">
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="w-4 h-4" />
              Upload Resume
            </TabsTrigger>
            <TabsTrigger value="build" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Build Resume
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                {/* biome-ignore lint/a11y/useSemanticElements: drag-and-drop zone requires div */}
                <div
                  role="button"
                  tabIndex={0}
                  className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                    dragging
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      fileRef.current?.click();
                  }}
                >
                  <CloudUpload className="w-12 h-12 text-primary mx-auto mb-4" />
                  <p className="font-semibold mb-1">
                    {fileName || "Drag & drop your resume"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    PDF or TXT files supported
                  </p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.txt"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files?.[0] && handleFile(e.target.files[0])
                    }
                  />
                </div>

                <Textarea
                  placeholder="Or paste your resume text here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="min-h-40"
                />

                <Button
                  className="w-full glow-cyan"
                  disabled={!resumeText || analyzing}
                  onClick={() => runAnalysis(resumeText)}
                >
                  {analyzing ? "Analyzing..." : "Analyze Resume"}
                </Button>
              </div>

              <AnalysisPanel
                analysis={analysis}
                onSave={saveToBackend}
                saving={saving}
                platformColor={platformColor}
              />
            </div>
          </TabsContent>

          <TabsContent value="build">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="font-display text-lg">
                      Personal Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(["name", "email", "phone"] as const).map((field) => (
                      <div key={field}>
                        <Label className="capitalize">{field}</Label>
                        <Input
                          value={builderData[field]}
                          onChange={(e) =>
                            setBuilderData((p) => ({
                              ...p,
                              [field]: e.target.value,
                            }))
                          }
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
                {(
                  [
                    "summary",
                    "skills",
                    "education",
                    "experience",
                    "projects",
                  ] as const
                ).map((field) => (
                  <div key={field}>
                    <Label className="capitalize mb-2 block">{field}</Label>
                    <Textarea
                      placeholder={`Enter your ${field}...`}
                      value={builderData[field]}
                      onChange={(e) =>
                        setBuilderData((p) => ({
                          ...p,
                          [field]: e.target.value,
                        }))
                      }
                    />
                  </div>
                ))}
                <Button
                  className="w-full"
                  onClick={() => {
                    const text = buildResumeText(builderData);
                    setResumeText(text);
                    runAnalysis(text);
                  }}
                >
                  Analyze This Resume
                </Button>
              </div>

              <div>
                <h3 className="font-display font-semibold mb-4">
                  Live Preview
                </h3>
                <Card className="bg-card border-border">
                  <CardContent className="p-6 font-mono text-sm whitespace-pre-wrap text-foreground/80">
                    {buildResumeText(builderData) ||
                      "Fill in the form to see preview..."}
                  </CardContent>
                </Card>
                {analysis && (
                  <AnalysisPanel
                    analysis={analysis}
                    onSave={saveToBackend}
                    saving={saving}
                    platformColor={platformColor}
                  />
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function AnalysisPanel({
  analysis,
  onSave,
  saving,
  platformColor,
}: {
  analysis: AnalysisResult | null;
  onSave: () => void;
  saving: boolean;
  platformColor: Record<string, string>;
}) {
  if (!analysis) {
    return (
      <div className="flex items-center justify-center h-64 border border-dashed border-border rounded-xl">
        <p className="text-muted-foreground text-sm">
          Analysis results will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardContent className="p-6 flex flex-col items-center">
          <ScoreGauge score={analysis.score} />
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-base">
            Detected Skills
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {analysis.detectedSkills.map((s) => (
            <Badge key={s} className="bg-success/20 text-green-300">
              {s}
            </Badge>
          ))}
        </CardContent>
      </Card>

      {analysis.missingSkills.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="font-display text-base">
              Missing Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {analysis.missingSkills.map((s) => (
              <Badge key={s} variant="destructive">
                {s}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-base">Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.suggestions.map((s) => (
              <li key={s} className="text-sm text-muted-foreground flex gap-2">
                <span className="text-primary">→</span>
                {s}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {analysis.courseLinks.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="font-display text-base">
              Recommended Courses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.courseLinks.map(({ skill, url, platform }) => (
              <a
                key={skill}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors group"
              >
                <div>
                  <p className="text-sm font-semibold">{skill}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${platformColor[platform] || ""}`}
                  >
                    {platform}
                  </span>
                </div>
                <ExternalLink className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </CardContent>
        </Card>
      )}

      <Button
        className="w-full"
        variant="outline"
        onClick={onSave}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Analysis"}
      </Button>
    </div>
  );
}
