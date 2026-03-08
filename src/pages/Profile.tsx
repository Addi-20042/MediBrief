import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";
import PageTransition from "@/components/animations/PageTransition";
import StaggerContainer, { StaggerItem } from "@/components/animations/StaggerContainer";
import {
  User, Camera, Save, Loader2, Heart, Ruler, Droplets,
  Calendar, AlertTriangle, Activity, ArrowLeft,
} from "lucide-react";

interface ProfileData {
  full_name: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  date_of_birth: string | null;
  gender: string | null;
  blood_type: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  allergies: string | null;
  medical_conditions: string | null;
}

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        const p = data as any;
        setProfile(p);
        setFullName(p.full_name || "");
        setPhoneNumber(p.phone_number || "");
        setDateOfBirth(p.date_of_birth || "");
        setGender(p.gender || "");
        setBloodType(p.blood_type || "");
        setHeightCm(p.height_cm?.toString() || "");
        setWeightKg(p.weight_kg?.toString() || "");
        setAllergies(p.allergies || "");
        setMedicalConditions(p.medical_conditions || "");
        setAvatarUrl(p.avatar_url || null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Avatar must be under 2MB.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const url = `${publicUrl}?t=${Date.now()}`;
      await supabase.from("profiles").update({ avatar_url: url } as any).eq("user_id", user.id);
      setAvatarUrl(url);
      toast({ title: "Avatar updated!", description: "Your profile picture has been changed." });
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast({ title: "Upload failed", description: "Could not upload avatar. Please try again.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updates: any = {
        full_name: fullName.trim() || null,
        phone_number: phoneNumber.trim() || null,
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
        blood_type: bloodType || null,
        height_cm: heightCm ? parseFloat(heightCm) : null,
        weight_kg: weightKg ? parseFloat(weightKg) : null,
        allergies: allergies.trim() || null,
        medical_conditions: medicalConditions.trim() || null,
      };

      const { error } = await supabase.from("profiles").update(updates).eq("user_id", user.id);
      if (error) throw error;
      toast({ title: "Profile saved!", description: "Your profile has been updated successfully." });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({ title: "Error", description: "Failed to save profile.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    if (!fullName) return user?.email?.charAt(0).toUpperCase() || "U";
    return fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="max-w-3xl mx-auto space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageTransition>
        <div className="container py-8 md:py-12">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <User className="h-8 w-8 text-primary" />
                  My Profile
                </h1>
                <p className="text-muted-foreground">Manage your personal and health information</p>
              </div>
            </div>

            <StaggerContainer className="space-y-6" staggerDelay={0.1}>
              {/* Avatar & Basic Info */}
              <StaggerItem>
                <Card className="border-border/50 overflow-hidden">
                  <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/10" />
                  <CardContent className="relative pt-0">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12">
                      <div className="relative group">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                          <AvatarImage src={avatarUrl || undefined} alt={fullName} />
                          <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                            {getInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        >
                          {uploading ? (
                            <Loader2 className="h-6 w-6 text-white animate-spin" />
                          ) : (
                            <Camera className="h-6 w-6 text-white" />
                          )}
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                        />
                      </div>
                      <div className="text-center sm:text-left pb-2">
                        <h2 className="text-xl font-semibold">{fullName || "Set your name"}</h2>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>

              {/* Personal Information */}
              <StaggerItem>
                <Card className="border-border/50 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>Your basic personal details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="+91 9876543210" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dob" className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />Date of Birth
                        </Label>
                        <Input id="dob" type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Gender</Label>
                        <Select value={gender} onValueChange={setGender}>
                          <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="non-binary">Non-binary</SelectItem>
                            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>

              {/* Health Details */}
              <StaggerItem>
                <Card className="border-border/50 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-destructive" />
                      Health Details
                    </CardTitle>
                    <CardDescription>Medical information for better health insights</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1.5">
                          <Droplets className="h-3.5 w-3.5" />Blood Type
                        </Label>
                        <Select value={bloodType} onValueChange={setBloodType}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bt => (
                              <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="height" className="flex items-center gap-1.5">
                          <Ruler className="h-3.5 w-3.5" />Height (cm)
                        </Label>
                        <Input id="height" type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} placeholder="170" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight" className="flex items-center gap-1.5">
                          <Activity className="h-3.5 w-3.5" />Weight (kg)
                        </Label>
                        <Input id="weight" type="number" value={weightKg} onChange={e => setWeightKg(e.target.value)} placeholder="70" />
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label htmlFor="allergies" className="flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" />Allergies
                      </Label>
                      <Textarea id="allergies" value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="e.g. Penicillin, Peanuts, Dust..." rows={2} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="conditions">Existing Medical Conditions</Label>
                      <Textarea id="conditions" value={medicalConditions} onChange={e => setMedicalConditions(e.target.value)} placeholder="e.g. Diabetes Type 2, Hypertension..." rows={2} />
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>

              {/* Save */}
              <StaggerItem>
                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={saving} size="lg" className="gradient-primary text-primary-foreground">
                    {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />Save Profile</>}
                  </Button>
                </div>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default Profile;
