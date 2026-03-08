import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Activity, Loader2, Mail, Lock, Chrome, ShieldCheck, Stethoscope, Brain, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { signIn, signInWithGoogle, user, loading: authLoading } = useAuth();
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

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as "email" | "password"] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        // Provide user-friendly error messages
        let message = error.message;
        if (message.includes("Invalid login credentials")) {
          message = "Incorrect email or password. Please try again.";
        } else if (message.includes("Email not confirmed")) {
          message = "Please check your email and confirm your account before signing in.";
        } else if (message.includes("Too many requests")) {
          message = "Too many login attempts. Please wait a moment and try again.";
        }
        toast({ title: "Login Failed", description: message, variant: "destructive" });
      } else {
        // Send login SMS notification (non-blocking)
        try {
          const { data: profileData } = await supabase.from("profiles").select("phone_number, full_name").eq("user_id", (await supabase.auth.getUser()).data.user?.id || "").maybeSingle();
          const phone = (profileData as any)?.phone_number;
          if (phone) {
            supabase.functions.invoke("send-sms", {
              body: { phone_number: phone, message: `MediBrief: Hi ${profileData?.full_name || "there"}! You have successfully logged in at ${new Date().toLocaleString()}. If this wasn't you, please secure your account immediately.`, type: "login" },
            }).catch(() => {});
          }
        } catch (_) {}
        toast({ title: "Welcome back!", description: "You have successfully signed in." });
        navigate("/dashboard");
      }
    } catch (err) {
      toast({ title: "Login Failed", description: "An unexpected error occurred. Please try again.", variant: "destructive" });
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
        const msg = error.message || "Google sign-in failed. Please try email login instead.";
        setGoogleError(msg);
        toast({ title: "Google Login Failed", description: msg, variant: "destructive" });
      }
    } catch (err) {
      setGoogleError("Google sign-in is temporarily unavailable. Please use email login.");
      toast({ title: "Google Login Unavailable", description: "Please use email login instead.", variant: "destructive" });
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
          <h2 className="text-3xl font-bold mb-4 leading-tight">Your personal AI health companion</h2>
          <p className="text-primary-foreground/80 text-lg mb-10">
            Get instant symptom analysis, understand medical reports, and track your health — all powered by AI.
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
            <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground mt-1">Sign in to continue to MediBrief</p>
          </div>

          {/* Social Login */}
          <Button variant="outline" onClick={handleGoogleSignIn} disabled={googleLoading || loading} className="w-full h-11 mb-2">
            {googleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Chrome className="mr-2 h-4 w-4" />}
            {googleLoading ? "Connecting..." : "Continue with Google"}
          </Button>

          {/* Google error fallback */}
          {googleError && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2 mb-4">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{googleError} Use email login below.</span>
            </motion.div>
          )}

          <div className="relative mb-6 mt-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or continue with email</span></div>
          </div>

          {/* Email Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-11" disabled={loading} autoComplete="email" />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/reset-password" className="text-xs text-muted-foreground hover:text-primary transition-colors">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-11" disabled={loading} autoComplete="current-password" />
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>
            <Button type="submit" className="w-full h-11 gradient-primary text-primary-foreground" disabled={loading || googleLoading}>
              {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing In...</>) : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-primary hover:underline">Sign up</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
