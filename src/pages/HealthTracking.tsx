import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";
import {
  Heart,
  Activity,
  Droplets,
  Moon,
  Footprints,
  Pill,
  Plus,
  Save,
  Loader2,
  Calendar,
  Trash2,
  Bell,
  Check,
  X,
  TrendingUp,
  Smile,
  Meh,
  Frown,
} from "lucide-react";
import { format, subDays, isToday } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface HealthMetric {
  id: string;
  user_id: string;
  metric_date: string;
  weight: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  heart_rate: number | null;
  blood_sugar: number | null;
  sleep_hours: number | null;
  water_intake: number | null;
  steps: number | null;
  mood: string | null;
  notes: string | null;
}

interface MedicationReminder {
  id: string;
  user_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  reminder_times: string[];
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  notes: string | null;
}

interface MedicationLog {
  id: string;
  reminder_id: string;
  taken_at: string;
  skipped: boolean;
}

const HealthTracking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [todayLogs, setTodayLogs] = useState<MedicationLog[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [addMedDialogOpen, setAddMedDialogOpen] = useState(false);
  
  // Today's metrics form
  const [todayMetrics, setTodayMetrics] = useState({
    weight: "",
    blood_pressure_systolic: "",
    blood_pressure_diastolic: "",
    heart_rate: "",
    blood_sugar: "",
    sleep_hours: "",
    water_intake: "",
    steps: "",
    mood: "",
    notes: "",
  });
  
  // New medication form
  const [newMedication, setNewMedication] = useState({
    medication_name: "",
    dosage: "",
    frequency: "once_daily",
    reminder_times: ["09:00"],
    notes: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      fetchMetricsForDate(selectedDate);
    }
  }, [selectedDate, user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // Fetch metrics for last 7 days
      const sevenDaysAgo = format(subDays(new Date(), 7), "yyyy-MM-dd");
      const { data: metricsData, error: metricsError } = await supabase
        .from("health_metrics")
        .select("*")
        .eq("user_id", user.id)
        .gte("metric_date", sevenDaysAgo)
        .order("metric_date", { ascending: false });

      if (metricsError) throw metricsError;
      setMetrics(metricsData || []);

      // Fetch active medication reminders
      const { data: remindersData, error: remindersError } = await supabase
        .from("medication_reminders")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (remindersError) throw remindersError;
      setReminders(remindersData || []);

      // Fetch today's medication logs
      const today = format(new Date(), "yyyy-MM-dd");
      const { data: logsData, error: logsError } = await supabase
        .from("medication_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("taken_at", `${today}T00:00:00`)
        .lte("taken_at", `${today}T23:59:59`);

      if (logsError) throw logsError;
      setTodayLogs(logsData || []);

      // Load today's metrics into form
      const todayData = metricsData?.find(m => m.metric_date === today);
      if (todayData) {
        setTodayMetrics({
          weight: todayData.weight?.toString() || "",
          blood_pressure_systolic: todayData.blood_pressure_systolic?.toString() || "",
          blood_pressure_diastolic: todayData.blood_pressure_diastolic?.toString() || "",
          heart_rate: todayData.heart_rate?.toString() || "",
          blood_sugar: todayData.blood_sugar?.toString() || "",
          sleep_hours: todayData.sleep_hours?.toString() || "",
          water_intake: todayData.water_intake?.toString() || "",
          steps: todayData.steps?.toString() || "",
          mood: todayData.mood || "",
          notes: todayData.notes || "",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load health data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMetricsForDate = async (date: string) => {
    if (!user) return;
    
    const existing = metrics.find(m => m.metric_date === date);
    if (existing) {
      setTodayMetrics({
        weight: existing.weight?.toString() || "",
        blood_pressure_systolic: existing.blood_pressure_systolic?.toString() || "",
        blood_pressure_diastolic: existing.blood_pressure_diastolic?.toString() || "",
        heart_rate: existing.heart_rate?.toString() || "",
        blood_sugar: existing.blood_sugar?.toString() || "",
        sleep_hours: existing.sleep_hours?.toString() || "",
        water_intake: existing.water_intake?.toString() || "",
        steps: existing.steps?.toString() || "",
        mood: existing.mood || "",
        notes: existing.notes || "",
      });
    } else {
      setTodayMetrics({
        weight: "",
        blood_pressure_systolic: "",
        blood_pressure_diastolic: "",
        heart_rate: "",
        blood_sugar: "",
        sleep_hours: "",
        water_intake: "",
        steps: "",
        mood: "",
        notes: "",
      });
    }
  };

  const handleSaveMetrics = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const metricsData = {
        user_id: user.id,
        metric_date: selectedDate,
        weight: todayMetrics.weight ? parseFloat(todayMetrics.weight) : null,
        blood_pressure_systolic: todayMetrics.blood_pressure_systolic ? parseInt(todayMetrics.blood_pressure_systolic) : null,
        blood_pressure_diastolic: todayMetrics.blood_pressure_diastolic ? parseInt(todayMetrics.blood_pressure_diastolic) : null,
        heart_rate: todayMetrics.heart_rate ? parseInt(todayMetrics.heart_rate) : null,
        blood_sugar: todayMetrics.blood_sugar ? parseFloat(todayMetrics.blood_sugar) : null,
        sleep_hours: todayMetrics.sleep_hours ? parseFloat(todayMetrics.sleep_hours) : null,
        water_intake: todayMetrics.water_intake ? parseInt(todayMetrics.water_intake) : null,
        steps: todayMetrics.steps ? parseInt(todayMetrics.steps) : null,
        mood: todayMetrics.mood || null,
        notes: todayMetrics.notes || null,
      };

      const { error } = await supabase
        .from("health_metrics")
        .upsert(metricsData, { onConflict: "user_id,metric_date" });

      if (error) throw error;

      toast({
        title: "Saved!",
        description: "Your health metrics have been recorded.",
      });

      fetchData();
    } catch (error) {
      console.error("Error saving metrics:", error);
      toast({
        title: "Error",
        description: "Failed to save health metrics",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddMedication = async () => {
    if (!user || !newMedication.medication_name || !newMedication.dosage) return;
    
    try {
      const { error } = await supabase.from("medication_reminders").insert({
        user_id: user.id,
        medication_name: newMedication.medication_name,
        dosage: newMedication.dosage,
        frequency: newMedication.frequency,
        reminder_times: newMedication.reminder_times,
        notes: newMedication.notes || null,
      });

      if (error) throw error;

      toast({
        title: "Medication added!",
        description: `${newMedication.medication_name} has been added to your reminders.`,
      });

      setNewMedication({
        medication_name: "",
        dosage: "",
        frequency: "once_daily",
        reminder_times: ["09:00"],
        notes: "",
      });
      setAddMedDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error adding medication:", error);
      toast({
        title: "Error",
        description: "Failed to add medication",
        variant: "destructive",
      });
    }
  };

  const handleLogMedication = async (reminderId: string, taken: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("medication_logs").insert({
        user_id: user.id,
        reminder_id: reminderId,
        skipped: !taken,
      });

      if (error) throw error;

      toast({
        title: taken ? "Logged!" : "Skipped",
        description: taken ? "Medication marked as taken." : "Medication marked as skipped.",
      });

      fetchData();
    } catch (error) {
      console.error("Error logging medication:", error);
      toast({
        title: "Error",
        description: "Failed to log medication",
        variant: "destructive",
      });
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      const { error } = await supabase
        .from("medication_reminders")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Medication reminder has been removed.",
      });

      fetchData();
    } catch (error) {
      console.error("Error deleting reminder:", error);
      toast({
        title: "Error",
        description: "Failed to delete reminder",
        variant: "destructive",
      });
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case "great":
      case "good":
        return <Smile className="h-5 w-5 text-success" />;
      case "okay":
        return <Meh className="h-5 w-5 text-warning" />;
      case "bad":
      case "terrible":
        return <Frown className="h-5 w-5 text-destructive" />;
      default:
        return null;
    }
  };

  const getFrequencyLabel = (freq: string) => {
    const labels: Record<string, string> = {
      once_daily: "Once daily",
      twice_daily: "Twice daily",
      thrice_daily: "Three times daily",
      weekly: "Weekly",
      as_needed: "As needed",
    };
    return labels[freq] || freq;
  };

  const isMedicationLogged = (reminderId: string) => {
    return todayLogs.some(log => log.reminder_id === reminderId);
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

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Heart className="h-8 w-8 text-primary" />
              Health Tracking
            </h1>
            <p className="text-muted-foreground">
              Monitor your daily health metrics and medication schedule
            </p>
          </div>

          <Tabs defaultValue="metrics" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="metrics" className="gap-2">
                <Activity className="h-4 w-4" />
                Daily Metrics
              </TabsTrigger>
              <TabsTrigger value="medications" className="gap-2">
                <Pill className="h-4 w-4" />
                Medications
              </TabsTrigger>
            </TabsList>

            {/* Daily Metrics Tab */}
            <TabsContent value="metrics" className="space-y-6">
              {/* Date Selector */}
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      max={format(new Date(), "yyyy-MM-dd")}
                      className="w-auto"
                    />
                    {isToday(new Date(selectedDate)) && (
                      <Badge variant="secondary">Today</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Metrics Form */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Vital Signs */}
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Heart className="h-5 w-5 text-destructive" />
                      Vital Signs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Blood Pressure (Systolic)</Label>
                        <Input
                          type="number"
                          placeholder="120"
                          value={todayMetrics.blood_pressure_systolic}
                          onChange={(e) => setTodayMetrics(prev => ({ ...prev, blood_pressure_systolic: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Blood Pressure (Diastolic)</Label>
                        <Input
                          type="number"
                          placeholder="80"
                          value={todayMetrics.blood_pressure_diastolic}
                          onChange={(e) => setTodayMetrics(prev => ({ ...prev, blood_pressure_diastolic: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Heart Rate (BPM)</Label>
                      <Input
                        type="number"
                        placeholder="72"
                        value={todayMetrics.heart_rate}
                        onChange={(e) => setTodayMetrics(prev => ({ ...prev, heart_rate: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Blood Sugar (mg/dL)</Label>
                      <Input
                        type="number"
                        placeholder="100"
                        value={todayMetrics.blood_sugar}
                        onChange={(e) => setTodayMetrics(prev => ({ ...prev, blood_sugar: e.target.value }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Body & Activity */}
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Activity className="h-5 w-5 text-primary" />
                      Body & Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Weight (kg)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="70.0"
                        value={todayMetrics.weight}
                        onChange={(e) => setTodayMetrics(prev => ({ ...prev, weight: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Footprints className="h-4 w-4" />
                        Steps
                      </Label>
                      <Input
                        type="number"
                        placeholder="10000"
                        value={todayMetrics.steps}
                        onChange={(e) => setTodayMetrics(prev => ({ ...prev, steps: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Sleep (hours)
                        </Label>
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="8"
                          value={todayMetrics.sleep_hours}
                          onChange={(e) => setTodayMetrics(prev => ({ ...prev, sleep_hours: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Droplets className="h-4 w-4" />
                          Water (glasses)
                        </Label>
                        <Input
                          type="number"
                          placeholder="8"
                          value={todayMetrics.water_intake}
                          onChange={(e) => setTodayMetrics(prev => ({ ...prev, water_intake: e.target.value }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Mood & Notes */}
                <Card className="border-border/50 md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Smile className="h-5 w-5 text-success" />
                      Mood & Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>How are you feeling today?</Label>
                      <Select
                        value={todayMetrics.mood}
                        onValueChange={(value) => setTodayMetrics(prev => ({ ...prev, mood: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your mood" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="great">😄 Great</SelectItem>
                          <SelectItem value="good">🙂 Good</SelectItem>
                          <SelectItem value="okay">😐 Okay</SelectItem>
                          <SelectItem value="bad">😕 Bad</SelectItem>
                          <SelectItem value="terrible">😢 Terrible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea
                        placeholder="Any symptoms, observations, or notes about your day..."
                        value={todayMetrics.notes}
                        onChange={(e) => setTodayMetrics(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <Button
                      onClick={handleSaveMetrics}
                      disabled={saving}
                      className="w-full gradient-primary text-primary-foreground"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Today's Metrics
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Metrics Summary */}
              {metrics.length > 0 && (
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-info" />
                      Recent Trends (Last 7 Days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {metrics.slice(0, 5).map((metric) => (
                        <div
                          key={metric.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {getMoodIcon(metric.mood || "")}
                            <div>
                              <p className="font-medium text-sm">
                                {format(new Date(metric.metric_date), "EEEE, MMM d")}
                              </p>
                              <div className="flex gap-4 text-xs text-muted-foreground">
                                {metric.steps && <span>{metric.steps.toLocaleString()} steps</span>}
                                {metric.sleep_hours && <span>{metric.sleep_hours}h sleep</span>}
                                {metric.heart_rate && <span>{metric.heart_rate} BPM</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Medications Tab */}
            <TabsContent value="medications" className="space-y-6">
              {/* Add Medication Button */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your Medications</h2>
                <Dialog open={addMedDialogOpen} onOpenChange={setAddMedDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gradient-primary text-primary-foreground">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Medication
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Medication Reminder</DialogTitle>
                      <DialogDescription>
                        Set up a reminder for your medication schedule.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Medication Name</Label>
                        <Input
                          placeholder="e.g., Aspirin"
                          value={newMedication.medication_name}
                          onChange={(e) => setNewMedication(prev => ({ ...prev, medication_name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Dosage</Label>
                        <Input
                          placeholder="e.g., 100mg"
                          value={newMedication.dosage}
                          onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Frequency</Label>
                        <Select
                          value={newMedication.frequency}
                          onValueChange={(value) => setNewMedication(prev => ({ ...prev, frequency: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="once_daily">Once daily</SelectItem>
                            <SelectItem value="twice_daily">Twice daily</SelectItem>
                            <SelectItem value="thrice_daily">Three times daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="as_needed">As needed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Notes (optional)</Label>
                        <Textarea
                          placeholder="Any additional notes..."
                          value={newMedication.notes}
                          onChange={(e) => setNewMedication(prev => ({ ...prev, notes: e.target.value }))}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAddMedDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddMedication} className="gradient-primary text-primary-foreground">
                        Add Medication
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Today's Medications */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-warning" />
                    Today's Schedule
                  </CardTitle>
                  <CardDescription>
                    Track your medications for {format(new Date(), "MMMM d, yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {reminders.length > 0 ? (
                    <div className="space-y-3">
                      {reminders.map((reminder) => {
                        const logged = isMedicationLogged(reminder.id);
                        return (
                          <div
                            key={reminder.id}
                            className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                              logged ? "bg-success/10 border-success/30" : "border-border hover:bg-muted/50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                logged ? "bg-success text-success-foreground" : "bg-primary/10 text-primary"
                              }`}>
                                {logged ? <Check className="h-5 w-5" /> : <Pill className="h-5 w-5" />}
                              </div>
                              <div>
                                <p className="font-medium">{reminder.medication_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {reminder.dosage} • {getFrequencyLabel(reminder.frequency)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!logged && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleLogMedication(reminder.id, false)}
                                    className="text-muted-foreground"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleLogMedication(reminder.id, true)}
                                    className="gradient-primary text-primary-foreground"
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Taken
                                  </Button>
                                </>
                              )}
                              {logged && (
                                <Badge variant="secondary" className="bg-success/20 text-success">
                                  Completed
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">No medications added</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add your medications to track your schedule.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* All Medications */}
              {reminders.length > 0 && (
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle>All Medications</CardTitle>
                    <CardDescription>Manage your medication reminders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {reminders.map((reminder) => (
                        <div
                          key={reminder.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-border"
                        >
                          <div>
                            <p className="font-medium">{reminder.medication_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {reminder.dosage} • {getFrequencyLabel(reminder.frequency)}
                            </p>
                            {reminder.notes && (
                              <p className="text-xs text-muted-foreground mt-1">{reminder.notes}</p>
                            )}
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete medication?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove {reminder.medication_name} from your reminders.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteReminder(reminder.id)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default HealthTracking;
