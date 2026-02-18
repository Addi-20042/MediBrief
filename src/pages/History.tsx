import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import PageTransition from "@/components/animations/PageTransition";
import StaggerContainer, { StaggerItem } from "@/components/animations/StaggerContainer";
import HistorySkeleton from "@/components/skeletons/HistorySkeleton";
import { motion } from "framer-motion";
import {
  History,
  Stethoscope,
  FileText,
  Trash2,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Prediction {
  id: string;
  prediction_type: string;
  input_data: string;
  predicted_diseases: any;
  summary: string | null;
  created_at: string;
}

const HistoryPage = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchPredictions();
  }, [user, navigate]);

  const fetchPredictions = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("predictions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setPredictions(data || []);
    } catch (error) {
      console.error("Error fetching predictions:", error);
      toast({ title: "Error", description: "Failed to load history", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const deletePrediction = async (id: string) => {
    try {
      const { error } = await supabase.from("predictions").delete().eq("id", id);
      if (error) throw error;
      setPredictions((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Deleted", description: "Prediction removed from history" });
    } catch (error) {
      console.error("Error deleting prediction:", error);
      toast({ title: "Error", description: "Failed to delete prediction", variant: "destructive" });
    }
  };

  if (loading) return <HistorySkeleton />;

  return (
    <Layout>
      <PageTransition>
        <div className="container py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-between mb-8"
            >
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <History className="h-8 w-8 text-primary" />
                  Your History
                </h1>
                <p className="text-muted-foreground">View and manage your past predictions and analyses</p>
              </div>
              <Badge variant="secondary" className="text-sm">
                {predictions.length} {predictions.length === 1 ? "record" : "records"}
              </Badge>
            </motion.div>

            {predictions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-dashed border-2">
                  <CardContent className="py-12 text-center">
                    <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No history yet</h3>
                    <p className="text-muted-foreground mb-6">Your symptom analyses and report summaries will appear here.</p>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={() => navigate("/symptoms")}>
                        <Stethoscope className="mr-2 h-4 w-4" />
                        Analyze Symptoms
                      </Button>
                      <Button variant="outline" onClick={() => navigate("/upload")}>
                        <FileText className="mr-2 h-4 w-4" />
                        Upload Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <StaggerContainer className="space-y-4" staggerDelay={0.06}>
                {predictions.map((prediction) => (
                  <StaggerItem key={prediction.id}>
                    <Card className="border-border/50 hover:shadow-md transition-all duration-300">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                              prediction.prediction_type === "symptom"
                                ? "bg-primary/10 text-primary"
                                : "bg-info/10 text-info"
                            }`}>
                              {prediction.prediction_type === "symptom" ? <Stethoscope className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                            </div>
                            <div>
                              <CardTitle className="text-lg">
                                {prediction.prediction_type === "symptom" ? "Symptom Analysis" : "Report Analysis"}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(prediction.created_at), "PPp")}
                              </CardDescription>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deletePrediction(prediction.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-3">
                          <p className="text-sm font-medium text-muted-foreground mb-1">Input:</p>
                          <p className="text-sm line-clamp-2">{prediction.input_data}</p>
                        </div>
                        {prediction.summary && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-muted-foreground mb-1">Summary:</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">{prediction.summary}</p>
                          </div>
                        )}
                        {prediction.predicted_diseases && prediction.predicted_diseases.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Conditions:</p>
                            <div className="flex flex-wrap gap-2">
                              {prediction.predicted_diseases.slice(0, 5).map((disease: any, index: number) => (
                                <Badge key={index} variant="secondary">{disease.name || disease}</Badge>
                              ))}
                              {prediction.predicted_diseases.length > 5 && (
                                <Badge variant="outline">+{prediction.predicted_diseases.length - 5} more</Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </div>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default HistoryPage;
