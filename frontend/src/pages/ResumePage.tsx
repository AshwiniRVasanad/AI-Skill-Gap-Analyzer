import Layout from "@/components/Layout";
import ScoreGauge from "@/components/ScoreGauge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { analyzeResume } from "@/lib/api";
import { BookOpen, CloudUpload, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface BuilderData {
  name: string;
  email: string;
  phone: string;
  summary: string;
  skills: string;
  education: string;
  experience: string;
  projects: string;
}

interface Props {
  navigate: (page: string) => void;
}

export default function ResumePage({ navigate }: Props) {
  const [dragging, setDragging] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const [builderData, setBuilderData] = useState<BuilderData>({
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
    reader.onload = (e) => setResumeText(e.target?.result as string || "");
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const runAnalysis = async (text: string) => {
    setAnalyzing(true);
    const result = await analyzeResume(text);
    if (result) setAnalysis(result);
    setAnalyzing(false);
  };

  const buildResumeText = (data: BuilderData) =>
    `${data.name}\n${data.email} | ${data.phone}\n\nSUMMARY\n${data.summary}\n\nSKILLS\n${data.skills}\n\nEDUCATION\n${data.education}\n\nEXPERIENCE\n${data.experience}\n\nPROJECTS\n${data.projects}`;

  return (
    <Layout navigate={navigate}>
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
              <Upload className="w-4 h-4" /> Upload Resume
            </TabsTrigger>
            <TabsTrigger value="build" className="gap-2">
              <BookOpen className="w-4 h-4" /> Build Resume
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div
                  role="button"
                  tabIndex={0}
                  className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                    dragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  onKeyDown={(e) => { if (e.key === "Enter") fileRef.current?.click(); }}
                >
                  <CloudUpload className="w-12 h-12 text-primary mx-auto mb-4" />
                  <p className="font-semibold mb-1">{fileName || "Drag & drop your resume"}</p>
                  <p className="text-sm text-muted-foreground">PDF or TXT files supported</p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.txt"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
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

              {/* Analysis Panel */}
              <div>
                {analysis ? (
                  <div className="space-y-6">
                    <Card className="bg-card border-border">
                      <CardContent className="p-6 flex flex-col items-center">
                        <ScoreGauge score={analysis.score} />
                      </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                      <CardHeader><CardTitle>Detected Skills</CardTitle></CardHeader>
                      <CardContent className="flex flex-wrap gap-2">
                        {analysis.detectedSkills.map((s: string) => (
                          <Badge key={s} className="bg-success/20 text-green-300">{s}</Badge>
                        ))}
                      </CardContent>
                    </Card>

                    {analysis.missingSkills.length > 0 && (
                      <Card className="bg-card border-border">
                        <CardHeader><CardTitle>Missing Skills</CardTitle></CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                          {analysis.missingSkills.map((s: string) => (
                            <Badge key={s} variant="destructive">{s}</Badge>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    <Card className="bg-card border-border">
                      <CardHeader><CardTitle>Suggestions</CardTitle></CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysis.suggestions.map((s: string) => (
                            <li key={s} className="text-sm text-muted-foreground flex gap-2">
                              <span className="text-primary">→</span> {s}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 border border-dashed border-border rounded-xl">
                    <p className="text-muted-foreground text-sm">Analysis results will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Build Tab */}
          <TabsContent value="build">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                {(["name","email","phone","summary","skills","education","experience","projects"] as const).map(field => (
                  <div key={field}>
                    <Label className="capitalize">{field}</Label>
                    {["summary","skills","education","experience","projects"].includes(field) ? (
                      <Textarea
                        placeholder={`Enter your ${field}...`}
                        value={builderData[field]}
                        onChange={(e) => setBuilderData(p => ({ ...p, [field]: e.target.value }))}
                      />
                    ) : (
                      <Input
                        value={builderData[field]}
                        onChange={(e) => setBuilderData(p => ({ ...p, [field]: e.target.value }))}
                      />
                    )}
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
                <h3 className="font-display font-semibold mb-4">Live Preview</h3>
                <Card className="bg-card border-border">
                  <CardContent className="p-6 font-mono text-sm whitespace-pre-wrap text-foreground/80">
                    {buildResumeText(builderData) || "Fill in the form to see preview..."}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
