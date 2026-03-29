import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";
import PageTransition from "@/components/animations/PageTransition";
import StaggerContainer, { StaggerItem } from "@/components/animations/StaggerContainer";
import SettingsSkeleton from "@/components/skeletons/SettingsSkeleton";
import type { ProfileRow } from "@/lib/healthData";
import {
  Settings as SettingsIcon, User, Bell, Shield, LogOut,
  Trash2, Sun, Moon, Monitor, Palette, BellRing,
} from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useTheme } from "next-themes";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const { user, signOut } = useAuth();
  const { supported: pushSupported, permission: pushPermission, requestPermission } = usePushNotifications();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (error) throw error;
      if (data) {
        const profile = data as ProfileRow;
        setFullName(profile.full_name || "");
      }
    } catch (error) { console.error("Error fetching profile:", error); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    void fetchProfile();
  }, [fetchProfile, navigate, user]);

  const handleDeleteHistory = async () => {
    if (!user) return;
    try {
      const { error } = await supabase.from("predictions").delete().eq("user_id", user.id);
      if (error) throw error;
      toast({ title: "History cleared", description: "All your prediction history has been deleted." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete history.", variant: "destructive" });
    }
  };

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  if (loading) return <SettingsSkeleton />;

  return (
    <Layout>
      <PageTransition>
        <div className="container py-8 md:py-12">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <SettingsIcon className="h-8 w-8 text-primary" />
                Settings
              </h1>
              <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>

            <StaggerContainer className="space-y-6" staggerDelay={0.1}>
              <StaggerItem>
                <Card className="border-border/50 hover:shadow-md transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Profile</CardTitle>
                    <CardDescription>Update your personal information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="font-medium">{fullName || "No name set"}</p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate("/profile")}>
                        <User className="mr-2 h-4 w-4" />Edit Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <Card className="border-border/50 hover:shadow-md transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Notifications</CardTitle>
                    <CardDescription>Configure how you want to receive updates</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5"><Label>Email Notifications</Label><p className="text-sm text-muted-foreground">Receive health tips and analysis updates via email</p></div>
                      <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-2">
                          <BellRing className="h-4 w-4" />
                          Push Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {pushPermission === "granted"
                            ? "Enabled - you'll get medication reminders"
                            : pushPermission === "denied"
                            ? "Blocked - click the lock icon in your browser's address bar to allow notifications, then refresh"
                            : pushSupported
                            ? "Get browser notifications for medication reminders"
                            : "Not supported in this browser"}
                        </p>
                      </div>
                      {pushSupported && pushPermission !== "granted" ? (
                        <Button size="sm" variant="outline" onClick={async () => {
                          const granted = await requestPermission();
                          if (granted) toast({ title: "Notifications enabled!", description: "You'll receive medication reminders." });
                          else toast({ title: "Permission denied", description: "If you're in a preview, publish the app and try from the published URL. Otherwise, click the lock icon in your address bar to allow notifications.", variant: "destructive" });
                        }}>Enable</Button>
                      ) : (
                        <Badge variant={pushPermission === "granted" ? "default" : "secondary"}>
                          {pushPermission === "granted" ? "Active" : "Off"}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <Card className="border-border/50 hover:shadow-md transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" />Appearance</CardTitle>
                    <CardDescription>Customize how the app looks and feels</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Theme</Label>
                      <div className="grid grid-cols-3 gap-3">
                        <Button variant={theme === "light" ? "default" : "outline"} className="w-full gap-2" onClick={() => setTheme("light")}><Sun className="h-4 w-4" />Light</Button>
                        <Button variant={theme === "dark" ? "default" : "outline"} className="w-full gap-2" onClick={() => setTheme("dark")}><Moon className="h-4 w-4" />Dark</Button>
                        <Button variant={theme === "system" ? "default" : "outline"} className="w-full gap-2" onClick={() => setTheme("system")}><Monitor className="h-4 w-4" />System</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <Card className="border-border/50 hover:shadow-md transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Privacy & Data</CardTitle>
                    <CardDescription>Manage your data and privacy settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="font-medium">Delete Prediction History</p>
                        <p className="text-sm text-muted-foreground">Permanently remove all your saved analyses</p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete all history?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete all your prediction history. This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteHistory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete All</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="font-medium">Sign Out</p>
                        <p className="text-sm text-muted-foreground">Sign out of your account on this device</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleSignOut}><LogOut className="mr-2 h-4 w-4" />Sign Out</Button>
                    </div>
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

export default Settings;
