import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import PageTransition from "@/components/animations/PageTransition";
import StaggerContainer, { StaggerItem } from "@/components/animations/StaggerContainer";
import { motion } from "framer-motion";
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
      <PageTransition>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="container relative py-16 md:py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto max-w-2xl text-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6"
              >
                <Activity className="h-3.5 w-3.5" />
                AI Healthcare Assistant
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="text-3xl md:text-5xl font-bold tracking-tight mb-4"
              >
                Your Personal{" "}
                <span className="text-primary">Medical AI</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-muted-foreground mb-8 max-w-lg mx-auto"
              >
                Analyze symptoms, understand medical reports, and access emergency help with our intelligent healthcare platform.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.4 }}
                className="flex flex-col sm:flex-row gap-3 justify-center"
              >
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
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.1} delayStart={0.2}>
              {features.map((feature) => (
                <StaggerItem key={feature.href}>
                  <Link to={feature.href} className="group block h-full">
                    <Card className="h-full border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300">
                      <CardContent className="p-5">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
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
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16">
          <div className="container">
            <StaggerContainer className="grid gap-8 md:grid-cols-3 text-center" staggerDelay={0.15} delayStart={0.1}>
              {[
                { icon: Brain, title: "AI-Powered", desc: "Advanced ML models for accurate analysis" },
                { icon: Shield, title: "Private & Secure", desc: "Your data is encrypted and protected" },
                { icon: Zap, title: "Instant Results", desc: "Get insights in seconds, not hours" },
              ].map((item, i) => (
                <StaggerItem key={i}>
                  <div className="h-12 w-12 rounded-xl gradient-primary mx-auto mb-3 flex items-center justify-center">
                    <item.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Quick Access */}
        <section className="py-12 bg-muted/30">
          <div className="container">
            <StaggerContainer className="flex flex-col md:flex-row gap-4" staggerDelay={0.12}>
              <StaggerItem className="flex-1">
                <Link to="/emergency" className="block h-full">
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
              </StaggerItem>
              <StaggerItem className="flex-1">
                <Link to="/first-aid" className="block h-full">
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
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl gradient-dark p-8 text-center"
            >
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
            </motion.div>
          </div>
        </section>

        {/* Disclaimer */}
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
      </PageTransition>
    </Layout>
  );
};

export default Index;
