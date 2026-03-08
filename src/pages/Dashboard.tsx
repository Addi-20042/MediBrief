import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import PageTransition from "@/components/animations/PageTransition";
import StaggerContainer, { StaggerItem } from "@/components/animations/StaggerContainer";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import { motion } from "framer-motion";
import {
  Activity,
  Heart,
  TrendingUp,
  Calendar,
  Stethoscope,
  FileText,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Pill,
  Footprints,
  Droplets,
} from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";

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

interface TodayMetrics {
  steps: number | null;
  water_intake: number | null;
  medications_logged: number;
  medications_total: number;
}

const Dashboard = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [stats, setStats] = useState<HealthStats | null>(null);
  const [todayMetrics, setTodayMetrics] = useState<TodayMetrics | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileComplete, setProfileComplete] = useState(true);
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
      const today = format(new Date(), "yyyy-MM-dd");

      // Run ALL queries in parallel for maximum speed
      const [predictionsRes, metricsRes, remindersRes, logsRes] = await Promise.all([
        supabase
          .from("predictions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("health_metrics")
          .select("steps,water_intake")
          .eq("user_id", user.id)
          .eq("metric_date", today)
          .maybeSingle(),
        supabase
          .from("medication_reminders")
          .select("id")
          .eq("user_id", user.id)
          .eq("is_active", true),
        supabase
          .from("medication_logs")
          .select("reminder_id")
          .eq("user_id", user.id)
          .gte("taken_at", `${today}T00:00:00`)
          .lte("taken_at", `${today}T23:59:59`),
      ]);

      if (predictionsRes.error) throw predictionsRes.error;

      const allPredictions = predictionsRes.data || [];
      setPredictions(allPredictions);

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

      let healthScore = 100;
      allPredictions.forEach((p) => {
        if (p.predicted_diseases && Array.isArray(p.predicted_diseases)) {
          p.predicted_diseases.forEach((disease: any) => {
            const probability = disease.probability || disease.likelihood || 0;
            const urgency = (disease.urgency || "").toLowerCase();
            if (urgency === "high" || probability > 80) {
              healthScore -= 5;
            } else if (urgency === "medium" || probability > 50) {
              healthScore -= 2;
            } else {
              healthScore -= 1;
            }
          });
        }
      });
      if (thisMonthPredictions.length > 0) healthScore += 5;
      healthScore = Math.max(10, Math.min(100, healthScore));

      setStats({
        totalAnalyses: allPredictions.length,
        symptomAnalyses: allPredictions.filter((p) => p.prediction_type === "symptom").length,
        reportAnalyses: allPredictions.filter((p) => p.prediction_type === "report").length,
        thisMonthAnalyses: thisMonthPredictions.length,
        recentConditions: recentConditions.slice(0, 5),
        healthScore: Math.round(healthScore),
      });

      const uniqueLoggedMeds = new Set(logsRes.data?.map(l => l.reminder_id) || []);

      setTodayMetrics({
        steps: metricsRes.data?.steps || null,
        water_intake: metricsRes.data?.water_intake || null,
        medications_logged: uniqueLoggedMeds.size,
        medications_total: remindersRes.data?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
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
      <PageTransition>
        <div className="container py-8 md:py-12">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Heart className="h-8 w-8 text-primary" />
                Health Dashboard
              </h1>
              <p className="text-muted-foreground">
                Track your health analyses and monitor your wellness journey
              </p>
            </motion.div>

            {/* Stats Grid */}
            <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8" staggerDelay={0.08}>
              <StaggerItem>
                <Card className="border-border/50 hover:shadow-md transition-shadow duration-300">
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
              </StaggerItem>

              <StaggerItem>
                <Card className="border-border/50 hover:shadow-md transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats?.totalAnalyses || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">All-time health checks</p>
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <Card className="border-border/50 hover:shadow-md transition-shadow duration-300">
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
              </StaggerItem>

              <StaggerItem>
                <Card className="border-border/50 hover:shadow-md transition-shadow duration-300">
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
              </StaggerItem>
            </StaggerContainer>

            {/* Today's Health Metrics */}
            {todayMetrics && (todayMetrics.steps || todayMetrics.water_intake || todayMetrics.medications_total > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <Card className="border-border/50 metric-card mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-primary" />
                      Today's Health Snapshot
                    </CardTitle>
                    <CardDescription>Quick overview of your daily health metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {todayMetrics.steps !== null && (
                        <div className="text-center p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                          <Footprints className="h-6 w-6 mx-auto text-primary mb-2" />
                          <p className="text-2xl font-bold">{todayMetrics.steps.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Steps</p>
                        </div>
                      )}
                      {todayMetrics.water_intake !== null && (
                        <div className="text-center p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                          <Droplets className="h-6 w-6 mx-auto text-info mb-2" />
                          <p className="text-2xl font-bold">{todayMetrics.water_intake}</p>
                          <p className="text-xs text-muted-foreground">Glasses of Water</p>
                        </div>
                      )}
                      {todayMetrics.medications_total > 0 && (
                        <div className="text-center p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                          <Pill className="h-6 w-6 mx-auto text-success mb-2" />
                          <p className="text-2xl font-bold">{todayMetrics.medications_logged}/{todayMetrics.medications_total}</p>
                          <p className="text-xs text-muted-foreground">Medications Taken</p>
                        </div>
                      )}
                      <Link to="/health-tracking" className="text-center p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer">
                        <ArrowRight className="h-6 w-6 mx-auto text-primary mb-2" />
                        <p className="text-sm font-medium text-primary">View All</p>
                        <p className="text-xs text-muted-foreground">Health Tracking</p>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Main Content Grid */}
            <StaggerContainer className="grid gap-6 lg:grid-cols-2" staggerDelay={0.1} delayStart={0.5}>
              <StaggerItem>
                <Card className="border-border/50 hover:shadow-md transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-warning" />
                      Recent Conditions Analyzed
                    </CardTitle>
                    <CardDescription>Conditions from your recent health analyses</CardDescription>
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
              </StaggerItem>

              <StaggerItem>
                <Card className="border-border/50 hover:shadow-md transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-success" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription>Take control of your health today</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-between group" onClick={() => navigate("/symptoms")}>
                      <span className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4" />
                        Analyze Symptoms
                      </span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between group" onClick={() => navigate("/upload")}>
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Upload Report
                      </span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button variant="outline" className="w-full justify-between group" onClick={() => navigate("/history")}>
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        View History
                      </span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem className="lg:col-span-2">
                <Card className="border-border/50 hover:shadow-md transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-info" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>Your latest health analyses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {predictions.length > 0 ? (
                      <div className="space-y-3">
                        {predictions.slice(0, 5).map((prediction, idx) => (
                          <motion.div
                            key={prediction.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + idx * 0.05, duration: 0.3 }}
                            className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                prediction.prediction_type === "symptom"
                                  ? "bg-primary/10 text-primary"
                                  : "bg-info/10 text-info"
                              }`}>
                                {prediction.prediction_type === "symptom" ? (
                                  <Stethoscope className="h-5 w-5" />
                                ) : (
                                  <FileText className="h-5 w-5" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {prediction.prediction_type === "symptom" ? "Symptom Analysis" : "Report Analysis"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(prediction.created_at), "MMM d, yyyy 'at' h:mm a")}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {prediction.predicted_diseases && prediction.predicted_diseases.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {prediction.predicted_diseases.length} conditions
                                </Badge>
                              )}
                            </div>
                          </motion.div>
                        ))}
                        {predictions.length > 5 && (
                          <Button variant="ghost" className="w-full group" onClick={() => navigate("/history")}>
                            View all {predictions.length} analyses
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
              </StaggerItem>
            </StaggerContainer>
          </div>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default Dashboard;
