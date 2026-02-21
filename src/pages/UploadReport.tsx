import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import PageTransition from "@/components/animations/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import { downloadReport, printReport, getProbabilityPercent } from "@/lib/downloadReport";
import { format } from "date-fns";
import ShareReportDialog from "@/components/ShareReportDialog";
import {
  FileText,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
  Printer,
  Download,
  Save,
  Sparkles,
  X,
  FileUp,
  Mail,
} from "lucide-react";

interface KeyFinding {
  category: string;
  finding: string;
  status: string;
  interpretation: string;
}

interface PossibleCondition {
  name: string;
  likelihood: string;
  relatedFindings: string[];
  description: string;
}

interface ReportResult {
  summary: string;
  keyFindings: KeyFinding[];
  possibleConditions: PossibleCondition[];
  recommendations: string[];
  urgency: string;
  disclaimer: string;
}

const UploadReport = () => {
  const [reportText, setReportText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReportResult | null>(null);
  const [fileName, setFileName] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    if (file.type === "text/plain") {
      const text = await file.text();
      setReportText(text);
    } else if (file.type === "application/pdf") {
      toast({
        title: "PDF Processing",
        description: "PDF text extraction is simulated. Please paste the report text manually for best results.",
      });
      // In a real app, you'd use a PDF parsing library
      setReportText("Please paste your medical report text here for analysis.");
    } else {
      toast({
        title: "Unsupported File",
        description: "Please upload a text or PDF file, or paste the report text directly.",
        variant: "destructive",
      });
    }
  };

  const analyzeReport = async () => {
    if (!reportText.trim()) {
      toast({
        title: "Please enter report text",
        description: "Paste your medical report text to get an analysis.",
        variant: "destructive",
      });
      return;
    }
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to use AI report analysis.", variant: "destructive" });
      navigate("/login");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await supabase.functions.invoke("analyze-report", {
        body: { reportText: reportText.trim() },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to analyze report");
      }

      const data = response.data;
      
      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);

      // Save to history if user is logged in
      if (user) {
        await supabase.from("predictions").insert({
          user_id: user.id,
          prediction_type: "report",
          input_data: reportText.substring(0, 500),
          predicted_diseases: data.possibleConditions,
          summary: data.summary,
        });
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!result) return;
    printReport({
      title: "Medical Report Analysis",
      date: format(new Date(), "MMMM d, yyyy 'at' h:mm a"),
      inputData: reportText.substring(0, 300) + (reportText.length > 300 ? "..." : ""),
      conditions: result.possibleConditions.map((c) => ({
        name: c.name,
        probability: c.likelihood,
        relatedFindings: c.relatedFindings,
        description: c.description,
      })),
      summary: result.summary,
      recommendations: result.recommendations,
      disclaimer: result.disclaimer,
    });
  };

  const handleDownload = () => {
    if (!result) return;
    downloadReport({
      title: "Medical Report Analysis",
      date: format(new Date(), "MMMM d, yyyy 'at' h:mm a"),
      inputData: reportText.substring(0, 300) + (reportText.length > 300 ? "..." : ""),
      conditions: result.possibleConditions.map((c) => ({
        name: c.name,
        probability: c.likelihood,
        relatedFindings: c.relatedFindings,
        description: c.description,
      })),
      summary: result.summary,
      recommendations: result.recommendations,
      disclaimer: result.disclaimer,
    });
  };

  const clearFile = () => {
    setFileName("");
    setReportText("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "abnormal":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "borderline":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-success/10 text-success border-success/20";
    }
  };

  const getLikelihoodColor = (likelihood: string) => {
    switch (likelihood.toLowerCase()) {
      case "high":
        return "bg-destructive text-destructive-foreground";
      case "medium":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Layout>
      <PageTransition>
      <div className="container py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-info/10 px-4 py-1.5 text-sm font-medium text-info mb-4">
              <FileText className="h-4 w-4" />
              Medical Report Analysis
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Upload Your Medical Report
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Upload or paste your medical report for AI-powered analysis, summarization, and insights.
            </p>
          </motion.div>

          {/* Input Section */}
          <Card className="mb-8 border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-info" />
                Report Input
              </CardTitle>
              <CardDescription>
                Upload a file or paste your medical report text below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload */}
              <div
                className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={loading}
                />
                {fileName ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileUp className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">{fileName}</p>
                      <p className="text-sm text-muted-foreground">File uploaded</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearFile();
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <FileUp className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="font-medium mb-1">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground">
                      Supports TXT and PDF files
                    </p>
                  </>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or paste text</span>
                </div>
              </div>

              <Textarea
                placeholder="Paste your medical report text here...

Example:
COMPLETE BLOOD COUNT (CBC)
- Hemoglobin: 13.5 g/dL (Normal: 12-16)
- White Blood Cells: 8,500/mcL (Normal: 4,500-11,000)
- Platelets: 250,000/mcL (Normal: 150,000-400,000)
..."
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                className="min-h-[200px] resize-none font-mono text-sm"
                disabled={loading}
              />

              <Button
                onClick={analyzeReport}
                disabled={loading || !reportText.trim()}
                className="w-full gradient-primary text-primary-foreground"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing Report...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Analyze Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          {result && (
            <div className="space-y-6 animate-slide-up print:animate-none">
              {/* Action Buttons */}
              <div className="flex justify-end gap-2 no-print">
                <ShareReportDialog
                  reportData={{
                    type: "report",
                    input: reportText.substring(0, 200) + "...",
                    predictions: result.possibleConditions,
                    summary: result.summary,
                    date: format(new Date(), "MMMM d, yyyy"),
                  }}
                  trigger={
                    <Button variant="outline" size="sm">
                      <Mail className="mr-2 h-4 w-4" />
                      Email Report
                    </Button>
                  }
                />
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
              </div>

              {/* Summary */}
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-info" />
                    Report Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{result.summary}</p>
                </CardContent>
              </Card>

              {/* Key Findings */}
              {result.keyFindings && result.keyFindings.length > 0 && (
                <Card className="border-border/50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-success" />
                      Key Findings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.keyFindings.map((finding, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-lg border border-border bg-muted/30"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <Badge variant="outline" className="mb-1">
                                {finding.category}
                              </Badge>
                              <p className="font-medium">{finding.finding}</p>
                            </div>
                            <Badge className={getStatusColor(finding.status)}>
                              {finding.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {finding.interpretation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Possible Conditions */}
              {result.possibleConditions && result.possibleConditions.length > 0 && (
                <Card className="border-border/50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-warning" />
                      Possible Conditions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.possibleConditions.map((condition, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg border border-border"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold">{condition.name}</h4>
                          <Badge className={getLikelihoodColor(condition.likelihood)}>
                            {getProbabilityPercent(condition.likelihood)}% match
                          </Badge>
                        </div>
                        
                        {/* Probability Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Match Probability</span>
                            <span className="font-medium">{getProbabilityPercent(condition.likelihood)}%</span>
                          </div>
                          <Progress 
                            value={getProbabilityPercent(condition.likelihood)} 
                            className="h-2"
                          />
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {condition.description}
                        </p>
                        {condition.relatedFindings.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {condition.relatedFindings.map((finding, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {finding}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <Card className="border-border/50 shadow-lg">
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Disclaimer */}
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground mb-1">Medical Disclaimer</p>
                    <p className="text-sm text-muted-foreground">
                      {result.disclaimer || "This analysis is for educational purposes only. Please consult your healthcare provider for proper interpretation of your medical reports."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Login Prompt */}
              {!user && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <Save className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Save your results</p>
                          <p className="text-sm text-muted-foreground">
                            Sign in to save this analysis to your history
                          </p>
                        </div>
                      </div>
                      <Button onClick={() => navigate("/login")} className="gradient-primary text-primary-foreground">
                        Sign In
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
      </PageTransition>
    </Layout>
  );
};

export default UploadReport;
