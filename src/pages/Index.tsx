import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import {
  Activity,
  FileText,
  Stethoscope,
  MessageCircle,
  ArrowRight,
  Shield,
  Zap,
  Brain,
  Siren,
  HeartPulse,
} from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();

  // Redirect logged-in users to dashboard
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: Stethoscope,
      title: "Symptom Analysis",
      description: "AI-powered disease predictions from your symptoms",
      href: "/symptoms",
    },
    {
      icon: FileText,
      title: "Report Analysis",
      description: "Upload medical reports for instant insights",
      href: "/upload",
    },
    {
      icon: MessageCircle,
      title: "AI Chatbot",
      description: "Get health guidance and tips anytime",
      href: "/chatbot",
    },
    {
      icon: Siren,
      title: "Emergency Help",
      description: "Quick access to emergency contacts & first aid",
      href: "/emergency",
    },
  ];

  return (
    <Layout>
      {/* Hero Section - Clean and Focused */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container relative py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
              <Activity className="h-3.5 w-3.5" />
              AI Healthcare Assistant
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Your Personal{" "}
              <span className="text-primary">Medical AI</span>
            </h1>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Analyze symptoms, understand medical reports, and access emergency help with our intelligent healthcare platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/symptoms">
                <Button size="lg" className="gradient-primary text-primary-foreground w-full sm:w-auto">
                  <Stethoscope className="mr-2 h-4 w-4" />
                  Analyze Symptoms
                </Button>
              </Link>
              <Link to="/emergency">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <Siren className="mr-2 h-4 w-4" />
                  Emergency Help
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Clean Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Link key={feature.href} to={feature.href} className="group">
                <Card className="h-full border-border/50 hover:border-primary/30 hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits - Compact */}
      <section className="py-16">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3 text-center">
            {[
              { icon: Brain, title: "AI-Powered", desc: "Advanced ML models for accurate analysis" },
              { icon: Shield, title: "Private & Secure", desc: "Your data is encrypted and protected" },
              { icon: Zap, title: "Instant Results", desc: "Get insights in seconds, not hours" },
            ].map((item, i) => (
              <div key={i}>
                <div className="h-12 w-12 rounded-xl gradient-primary mx-auto mb-3 flex items-center justify-center">
                  <item.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access - Emergency & First Aid */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-4">
            <Link to="/emergency" className="flex-1">
              <Card className="h-full border-destructive/30 bg-destructive/5 hover:bg-destructive/10 transition-colors">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center">
                    <Siren className="h-6 w-6 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Emergency Contacts</h3>
                    <p className="text-sm text-muted-foreground">Quick access to ambulance & helplines</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
            <Link to="/first-aid" className="flex-1">
              <Card className="h-full border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <HeartPulse className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">First Aid Guide</h3>
                    <p className="text-sm text-muted-foreground">Step-by-step emergency procedures</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container">
          <div className="rounded-2xl gradient-dark p-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Ready to Take Control of Your Health?
            </h2>
            <p className="text-white/80 mb-6 max-w-lg mx-auto">
              Join thousands of users who trust Medical AI for health insights.
            </p>
            <Link to="/signup">
              <Button size="lg" className="bg-white text-foreground hover:bg-white/90">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Disclaimer - Compact */}
      <section className="py-6 border-t border-border">
        <div className="container">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <Shield className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Disclaimer:</strong> This tool is for educational purposes only. Always consult a healthcare professional for medical advice.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
