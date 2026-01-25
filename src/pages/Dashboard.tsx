import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import {
  Activity,
  Heart,
  TrendingUp,
  Calendar,
  Stethoscope,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

interface Prediction {
  id: string;
  prediction_type: string;
  input_data: string;
  predicted_diseases: any;
  summary: string | null;
  created_at: string;
}

interface HealthStats {
  totalAnalyses: number;
  symptomAnalyses: number;
  reportAnalyses: number;
  thisMonthAnalyses: number;
  recentConditions: string[];
  healthScore: number;
}

const Dashboard = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [stats, setStats] = useState<HealthStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("predictions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const allPredictions = data || [];
      setPredictions(allPredictions);

      // Calculate stats
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      const thisMonthPredictions = allPredictions.filter((p) => {
        const date = new Date(p.created_at);
        return date >= monthStart && date <= monthEnd;
      });

      const recentConditions: string[] = [];
      allPredictions.slice(0, 5).forEach((p) => {
        if (p.predicted_diseases && Array.isArray(p.predicted_diseases)) {
          p.predicted_diseases.slice(0, 2).forEach((disease: any) => {
            const name = disease.name || disease;
            if (!recentConditions.includes(name)) {
              recentConditions.push(name);
            }
          });
        }
      });

      // Calculate health score (mock calculation based on activity)
      const activityScore = Math.min(100, allPredictions.length * 10);
      const recentActivityBonus = thisMonthPredictions.length > 0 ? 20 : 0;
      const healthScore = Math.min(100, 50 + activityScore / 5 + recentActivityBonus);

      setStats({
        totalAnalyses: allPredictions.length,
        symptomAnalyses: allPredictions.filter((p) => p.prediction_type === "symptom").length,
        reportAnalyses: allPredictions.filter((p) => p.prediction_type === "report").length,
        thisMonthAnalyses: thisMonthPredictions.length,
        recentConditions: recentConditions.slice(0, 5),
        healthScore: Math.round(healthScore),
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-12 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getHealthScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Attention";
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Heart className="h-8 w-8 text-primary" />
              Health Dashboard
            </h1>
            <p className="text-muted-foreground">
              Track your health analyses and monitor your wellness journey
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Health Score</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getHealthScoreColor(stats?.healthScore || 0)}`}>
                  {stats?.healthScore || 0}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {getHealthScoreLabel(stats?.healthScore || 0)}
                </p>
                <Progress value={stats?.healthScore || 0} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.totalAnalyses || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  All-time health checks
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.thisMonthAnalyses || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Analyses in {format(new Date(), "MMMM")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Analysis Types</CardTitle>
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="font-bold text-lg">{stats?.symptomAnalyses || 0}</span>
                    <p className="text-xs text-muted-foreground">Symptoms</p>
                  </div>
                  <div>
                    <span className="font-bold text-lg">{stats?.reportAnalyses || 0}</span>
                    <p className="text-xs text-muted-foreground">Reports</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Conditions */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  Recent Conditions Analyzed
                </CardTitle>
                <CardDescription>
                  Conditions from your recent health analyses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.recentConditions && stats.recentConditions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {stats.recentConditions.map((condition, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No recent conditions analyzed. Start by checking your symptoms!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Take control of your health today
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => navigate("/symptoms")}
                >
                  <span className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" />
                    Analyze Symptoms
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => navigate("/upload")}
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Upload Report
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => navigate("/history")}
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    View History
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-border/50 lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-info" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Your latest health analyses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {predictions.length > 0 ? (
                  <div className="space-y-3">
                    {predictions.slice(0, 5).map((prediction) => (
                      <div
                        key={prediction.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                              prediction.prediction_type === "symptom"
                                ? "bg-primary/10 text-primary"
                                : "bg-info/10 text-info"
                            }`}
                          >
                            {prediction.prediction_type === "symptom" ? (
                              <Stethoscope className="h-5 w-5" />
                            ) : (
                              <FileText className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {prediction.prediction_type === "symptom"
                                ? "Symptom Analysis"
                                : "Report Analysis"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(prediction.created_at), "MMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {prediction.predicted_diseases &&
                            prediction.predicted_diseases.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {prediction.predicted_diseases.length} conditions
                              </Badge>
                            )}
                        </div>
                      </div>
                    ))}
                    {predictions.length > 5 && (
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => navigate("/history")}
                      >
                        View all {predictions.length} analyses
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No activity yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start tracking your health by analyzing symptoms or uploading a report.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={() => navigate("/symptoms")}>
                        <Stethoscope className="mr-2 h-4 w-4" />
                        Analyze Symptoms
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
