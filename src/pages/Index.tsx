import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import {
  Activity,
  FileText,
  Stethoscope,
  MessageCircle,
  BookOpen,
  ArrowRight,
  Shield,
  Zap,
  Brain,
  Sparkles,
} from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Stethoscope,
      title: "Symptom Analysis",
      description: "Enter your symptoms and get AI-powered disease predictions with detailed insights.",
      href: "/symptoms",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: FileText,
      title: "Report Upload",
      description: "Upload medical reports in PDF format for instant text extraction and analysis.",
      href: "/upload",
      color: "bg-info/10 text-info",
    },
    {
      icon: MessageCircle,
      title: "AI Chatbot",
      description: "Chat with our medical AI assistant for guidance, precautions, and health tips.",
      href: "/chatbot",
      color: "bg-success/10 text-success",
    },
    {
      icon: BookOpen,
      title: "Disease Library",
      description: "Learn about various diseases, their symptoms, causes, and prevention methods.",
      href: "/learn",
      color: "bg-warning/10 text-warning",
    },
  ];

  const benefits = [
    {
      icon: Brain,
      title: "AI-Powered Intelligence",
      description: "Advanced machine learning models trained on medical data for accurate predictions.",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your health data is encrypted and never shared with third parties.",
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get analysis and predictions within seconds, not hours or days.",
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="container relative py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 animate-fade-in">
              <Sparkles className="h-4 w-4" />
              AI-Powered Healthcare Assistant
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6 animate-slide-up">
              Your Personal
              <span className="text-gradient-primary"> Medical AI </span>
              Assistant
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Analyze symptoms, understand medical reports, and learn about diseases with our
              intelligent healthcare platform. Get instant insights powered by advanced AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Link to="/symptoms">
                <Button size="lg" className="gradient-primary text-primary-foreground shadow-lg hover:shadow-glow transition-all w-full sm:w-auto">
                  <Stethoscope className="mr-2 h-5 w-5" />
                  Analyze Symptoms
                </Button>
              </Link>
              <Link to="/upload">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <FileText className="mr-2 h-5 w-5" />
                  Upload Report
                </Button>
              </Link>
            </div>
          </div>

          {/* Floating Medical Icons */}
          <div className="absolute top-20 left-10 opacity-20 animate-float hidden lg:block">
            <Activity className="h-16 w-16 text-primary" />
          </div>
          <div className="absolute bottom-20 right-10 opacity-20 animate-float hidden lg:block" style={{ animationDelay: "1s" }}>
            <Stethoscope className="h-12 w-12 text-primary" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Powerful Health Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to understand your health better, all in one platform.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Link key={feature.href} to={feature.href} className="group">
                <Card className="h-full border-border/50 bg-card hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.color} mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {feature.description}
                    </p>
                    <span className="inline-flex items-center text-sm font-medium text-primary">
                      Get Started
                      <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary text-primary-foreground mb-4 shadow-md">
                  <benefit.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl gradient-dark p-8 md:p-12 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Take Control of Your Health?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Join thousands of users who trust Medical AI for health insights and education.
              </p>
              <Link to="/signup">
                <Button size="lg" className="bg-white text-foreground hover:bg-white/90 shadow-xl">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 border-t border-border">
        <div className="container">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20">
            <Shield className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Medical Disclaimer:</strong> This tool is for
              educational and informational purposes only. It is not a substitute for professional
              medical advice, diagnosis, or treatment. Always seek the advice of your physician or
              other qualified health provider with any questions you may have regarding a medical
              condition.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
