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
import { downloadReport, printReport, getProbabilityPercent } from "@/lib/downloadReport";
import { format } from "date-fns";
import ShareReportDialog from "@/components/ShareReportDialog";
import {
  Stethoscope,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  Printer,
  Download,
  Save,
  Sparkles,
  Mail,
} from "lucide-react";

interface Condition {
  name: string;
  probability: string;
  matchingSymptoms: string[];
  description: string;
  recommendations: string[];
  urgency: string;
}

interface AnalysisResult {
  conditions: Condition[];
  generalAdvice: string;
  disclaimer: string;
}

const Symptoms = () => {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const resultRef = useRef<HTMLDivElement>(null);

  const exampleSymptoms = [
    "Headache, fatigue, fever",
    "Chest pain, shortness of breath",
    "Stomach pain, nausea, bloating",
    "Joint pain, stiffness, swelling",
  ];

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) {
      toast({
        title: "Please enter symptoms",
        description: "Describe your symptoms to get an analysis.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await supabase.functions.invoke("analyze-symptoms", {
        body: { symptoms: symptoms.trim() },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to analyze symptoms");
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
          prediction_type: "symptom",
          input_data: symptoms,
          predicted_diseases: data.conditions,
          summary: data.generalAdvice,
        });
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze symptoms",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!result) return;
    printReport({
      title: "Symptom Analysis Report",
      date: format(new Date(), "MMMM d, yyyy 'at' h:mm a"),
      inputData: symptoms,
      conditions: result.conditions,
      generalAdvice: result.generalAdvice,
      disclaimer: result.disclaimer,
    });
  };

  const handleDownload = () => {
    if (!result) return;
    downloadReport({
      title: "Symptom Analysis Report",
      date: format(new Date(), "MMMM d, yyyy 'at' h:mm a"),
      inputData: symptoms,
      conditions: result.conditions,
      generalAdvice: result.generalAdvice,
      disclaimer: result.disclaimer,
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case "emergency":
        return "bg-destructive text-destructive-foreground";
      case "urgent":
        return "bg-warning text-warning-foreground";
      case "routine":
        return "bg-info text-info-foreground";
      default:
        return "bg-success text-success-foreground";
    }
  };

  const getProbabilityColor = (probability: string) => {
    switch (probability.toLowerCase()) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <Stethoscope className="h-4 w-4" />
              AI Symptom Analysis
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Describe Your Symptoms
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Enter your symptoms below and our AI will analyze them to suggest possible conditions.
              This is for educational purposes only.
            </p>
          </div>

          {/* Input Section */}
          <Card className="mb-8 border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Enter Your Symptoms
              </CardTitle>
              <CardDescription>
                Be as detailed as possible. Include duration, severity, and any related symptoms.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Example: I've been experiencing severe headaches for the past 3 days, along with fatigue and sensitivity to light. The pain is mostly on one side of my head and gets worse with physical activity."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="min-h-[150px] resize-none"
                disabled={loading}
              />

              {/* Example Symptoms */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Quick examples:</p>
                <div className="flex flex-wrap gap-2">
                  {exampleSymptoms.map((example) => (
                    <Button
                      key={example}
                      variant="outline"
                      size="sm"
                      onClick={() => setSymptoms(example)}
                      disabled={loading}
                      className="text-xs"
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={analyzeSymptoms}
                disabled={loading || !symptoms.trim()}
                className="w-full gradient-primary text-primary-foreground"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing Symptoms...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Analyze Symptoms
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          {result && (
            <div ref={resultRef} className="space-y-6 animate-slide-up print:animate-none">
              {/* Action Buttons */}
              <div className="flex justify-end gap-2 no-print">
                <ShareReportDialog
                  reportData={{
                    type: "symptom",
                    input: symptoms,
                    predictions: result.conditions,
                    summary: result.generalAdvice,
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

              {/* Conditions */}
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    Possible Conditions
                  </CardTitle>
                  <CardDescription>
                    Based on your symptoms, here are the potential conditions ranked by likelihood.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.conditions.map((condition, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border border-border bg-card hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                            {index + 1}
                          </span>
                          <h3 className="font-semibold text-lg">{condition.name}</h3>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getProbabilityColor(condition.probability)}>
                            {getProbabilityPercent(condition.probability)}% match
                          </Badge>
                          <Badge className={getUrgencyColor(condition.urgency)}>
                            <Clock className="mr-1 h-3 w-3" />
                            {condition.urgency}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Probability Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Match Probability</span>
                          <span className="font-medium">{getProbabilityPercent(condition.probability)}%</span>
                        </div>
                        <Progress 
                          value={getProbabilityPercent(condition.probability)} 
                          className="h-2"
                        />
                      </div>
                      
                      <p className="text-muted-foreground mb-3">{condition.description}</p>
                      
                      {condition.matchingSymptoms.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium mb-1.5">Matching Symptoms:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {condition.matchingSymptoms.map((symptom, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {symptom}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {condition.recommendations.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1.5">Recommendations:</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {condition.recommendations.map((rec, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* General Advice */}
              {result.generalAdvice && (
                <Card className="border-border/50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-info" />
                      General Advice
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{result.generalAdvice}</p>
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
                      {result.disclaimer || "This analysis is for educational purposes only and should not be considered medical advice. Please consult a healthcare professional for proper diagnosis and treatment."}
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
    </Layout>
  );
};

export default Symptoms;
