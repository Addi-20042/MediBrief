import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Activity, Loader2, Mail, Lock, User, Chrome, ShieldCheck, Stethoscope, Brain, Phone, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { z } from "zod";
import {
  normalizePatientName,
  normalizePhoneNumber,
  optionalPhoneSchema,
  patientNameSchema,
} from "@/lib/profileValidation";

const signupSchema = z.object({
  fullName: patientNameSchema,
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: optionalPhoneSchema,
});

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string; phoneNumber?: string }>({});
  const { signUp, signInWithGoogle, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signupSchema.safeParse({ fullName, email, password, phoneNumber });
    if (!result.success) {
      const fieldErrors: { fullName?: string; email?: string; password?: string; phoneNumber?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as "fullName" | "email" | "password" | "phoneNumber"] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    const normalizedFullName = normalizePatientName(result.data.fullName);
    const normalizedPhoneNumber = result.data.phoneNumber?.trim()
      ? normalizePhoneNumber(result.data.phoneNumber)
      : "";

    setLoading(true);
    try {
      const { error } = await signUp(email, password, normalizedFullName);
      if (error) {
        let message = error.message;
        if (message.includes("already registered") || message.includes("already been registered")) {
          message = "This email is already registered. Please sign in instead.";
        } else if (message.includes("Password should be")) {
          message = "Password must be at least 6 characters with a mix of letters and numbers.";
        }
        toast({ title: "Signup Failed", description: message, variant: "destructive" });
      } else {
        // Store phone number in profile after signup (non-blocking)
        if (phoneNumber.trim()) {
          try {
            const { data: { user: newUser } } = await supabase.auth.getUser();
            if (newUser) {
              await supabase
                .from("profiles")
                .update({
                  full_name: normalizedFullName,
                  phone_number: normalizedPhoneNumber,
                } as any)
                .eq("user_id", newUser.id);
            }
          } catch (_) {}
        } else {
          try {
            const { data: { user: newUser } } = await supabase.auth.getUser();
            if (newUser) {
              await supabase
                .from("profiles")
                .update({ full_name: normalizedFullName } as any)
                .eq("user_id", newUser.id);
            }
          } catch (_) {}
        }
        toast({ title: "Account Created!", description: "Welcome to MediBrief. You're now signed in." });
        navigate("/dashboard");
      }
    } catch (err) {
      toast({ title: "Signup Failed", description: "An unexpected error occurred. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setGoogleError(null);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        const msg = error.message || "Google sign-in failed. Please try email signup instead.";
        setGoogleError(msg);
        toast({ title: "Google Signup Failed", description: msg, variant: "destructive" });
      }
    } catch (err) {
      setGoogleError("Google sign-in is temporarily unavailable. Please use email signup.");
      toast({ title: "Google Signup Unavailable", description: "Please use email signup instead.", variant: "destructive" });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left decorative panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-primary items-center justify-center p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.3),transparent_70%)]" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative z-10 max-w-md text-primary-foreground">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Activity className="h-7 w-7" />
            </div>
            <span className="text-3xl font-bold">MediBrief</span>
          </div>
          <h2 className="text-3xl font-bold mb-4 leading-tight">Start your health journey today</h2>
          <p className="text-primary-foreground/80 text-lg mb-10">
            Join thousands of users who trust MediBrief for personalized health insights.
          </p>
          <div className="space-y-5">
            {[
              { icon: Stethoscope, text: "AI-powered symptom analysis" },
              { icon: Brain, text: "Smart medical report insights" },
              { icon: ShieldCheck, text: "Private & secure health data" },
            ].map(({ icon: Icon, text }, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.15 }} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">{text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center justify-center gap-2.5 mb-8 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary shadow-md">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">
              Medi<span className="text-primary">Brief</span>
            </span>
          </Link>

          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
            <p className="text-muted-foreground mt-1">Get started with MediBrief today</p>
          </div>

          {/* Social Signup */}
          <Button variant="outline" onClick={handleGoogleSignIn} disabled={googleLoading || loading} className="w-full h-11 mb-2">
            {googleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Chrome className="mr-2 h-4 w-4" />}
            {googleLoading ? "Connecting..." : "Continue with Google"}
          </Button>

          {/* Google error fallback */}
          {googleError && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2 mb-4">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{googleError} Use email signup below.</span>
            </motion.div>
          )}

          <div className="relative mb-6 mt-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or continue with email</span></div>
          </div>

          {/* Email Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="fullName" type="text" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10 h-11" disabled={loading} autoComplete="name" />
              </div>
              {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
              <p className="text-xs text-muted-foreground">Use letters only for the patient name</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-11" disabled={loading} autoComplete="email" />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="phone" type="tel" placeholder="+91 9876543210" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="pl-10 h-11" disabled={loading} autoComplete="tel" />
              </div>
              {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber}</p>}
              <p className="text-xs text-muted-foreground">For medication reminder SMS notifications</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-11" disabled={loading} autoComplete="new-password" />
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>
            <Button type="submit" className="w-full h-11 gradient-primary text-primary-foreground" disabled={loading || googleLoading}>
              {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating Account...</>) : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
