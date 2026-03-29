import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Layout from "@/components/layout/Layout";
import PageTransition from "@/components/animations/PageTransition";
import { motion } from "framer-motion";
import {
  Search, Heart, Flame, Droplets, Skull, Zap, AlertTriangle, Wind,
  ThermometerSun, Bone, Brain, HeartPulse, Siren, ArrowRight, Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { listPublishedCustomFirstAidGuides } from "@/lib/adminContent";

interface FirstAidGuide {
  id: string; title: string; icon: React.ReactNode; severity: "critical" | "high" | "medium";
  overview: string; steps: string[]; doNot: string[];
}

const firstAidGuides: FirstAidGuide[] = [
  { id: "cpr", title: "CPR", icon: <HeartPulse className="h-5 w-5" />, severity: "critical", overview: "For when someone's heart stops beating",
    steps: ["Check responsiveness - tap shoulder and shout", "Call 112 immediately", "Place heel of hand on center of chest", "Push hard and fast - 100-120 compressions/min", "Give 2 rescue breaths after 30 compressions", "Continue until help arrives"],
    doNot: ["Don't stop CPR unless help arrives", "Don't compress too slowly"] },
  { id: "choking", title: "Choking", icon: <Wind className="h-5 w-5" />, severity: "critical", overview: "When airway is blocked by an object",
    steps: ["Ask 'Are you choking?' - if can't speak, act fast", "Stand behind, lean them forward", "Give 5 firm back blows between shoulder blades", "Give 5 abdominal thrusts (Heimlich)", "Repeat until object is expelled", "If unconscious, begin CPR"],
    doNot: ["Don't finger sweep blindly", "Don't give water"] },
  { id: "bleeding", title: "Severe Bleeding", icon: <Droplets className="h-5 w-5" />, severity: "critical", overview: "Control blood loss quickly",
    steps: ["Call 112", "Apply firm pressure with clean cloth", "Don't remove first cloth - add more layers", "Keep pressing for 10-15 minutes", "Elevate if possible (no broken bones)", "Apply tourniquet for life-threatening limb bleeding"],
    doNot: ["Don't remove embedded objects", "Don't apply tourniquet to head/neck"] },
  { id: "burns", title: "Burns", icon: <Flame className="h-5 w-5" />, severity: "high", overview: "Immediate cooling prevents damage",
    steps: ["Remove from heat source", "Cool with running water for 10-20 mins", "Remove jewelry near burn (if not stuck)", "Cover loosely with clean bandage", "Don't pop blisters", "Seek help for large/deep burns"],
    doNot: ["Don't use ice", "Don't apply butter/oil", "Don't remove stuck clothing"] },
  { id: "heart-attack", title: "Heart Attack", icon: <Heart className="h-5 w-5" />, severity: "critical", overview: "Time is critical - act fast",
    steps: ["Call 112 immediately", "Help person sit or lie comfortably", "Give aspirin if not allergic (chew it)", "Loosen tight clothing", "Monitor breathing", "Be ready to perform CPR"],
    doNot: ["Don't let them drive", "Don't ignore symptoms"] },
  { id: "stroke", title: "Stroke", icon: <Brain className="h-5 w-5" />, severity: "critical", overview: "Use FAST: Face, Arms, Speech, Time",
    steps: ["Face - ask to smile, is one side drooping?", "Arms - can they raise both equally?", "Speech - is it slurred or strange?", "Time - call 112 immediately if any signs", "Note the time symptoms started", "Keep them safe and monitor"],
    doNot: ["Don't give food/water", "Don't let them sleep"] },
  { id: "fractures", title: "Broken Bones", icon: <Bone className="h-5 w-5" />, severity: "high", overview: "Immobilize and get help",
    steps: ["Don't move if spine injury suspected", "Stop any bleeding with pressure", "Immobilize with splint or padding", "Apply ice wrapped in cloth", "Keep person warm", "Get medical help"],
    doNot: ["Don't try to straighten bone", "Don't move unnecessarily"] },
  { id: "poisoning", title: "Poisoning", icon: <Skull className="h-5 w-5" />, severity: "critical", overview: "Identify and call for help",
    steps: ["Move to fresh air if inhaled poison", "Call poison control (1800-11-6117)", "Identify what was taken, how much, when", "Keep container/sample for responders", "Don't induce vomiting unless told", "Rinse skin/eyes if contact poison"],
    doNot: ["Don't induce vomiting without direction", "Don't use home remedies"] },
  { id: "electric-shock", title: "Electric Shock", icon: <Zap className="h-5 w-5" />, severity: "critical", overview: "Safety first - turn off power",
    steps: ["DON'T touch if still connected to source", "Turn off power at source/breaker", "Separate with dry non-conducting object", "Call 112", "Check breathing, prepare for CPR", "Cover burns with sterile bandage"],
    doNot: ["Don't touch person if source is on", "Don't use wet/metal objects"] },
  { id: "heat-stroke", title: "Heat Stroke", icon: <ThermometerSun className="h-5 w-5" />, severity: "critical", overview: "Cool the person rapidly",
    steps: ["Call 112 - this is life-threatening", "Move to cool/shaded area", "Remove excess clothing", "Cool with ice packs at neck, armpits, groin", "Fan while misting with water", "Give cool water only if conscious"],
    doNot: ["Don't give fever medication", "Don't give fluids if unconscious"] },
  { id: "allergic-reaction", title: "Severe Allergic Reaction", icon: <AlertTriangle className="h-5 w-5" />, severity: "critical", overview: "Anaphylaxis needs immediate epinephrine",
    steps: ["Call 112 immediately", "Use EpiPen if available (outer thigh)", "Help them lie down, elevate legs", "Loosen tight clothing", "Monitor breathing, prepare for CPR", "Second EpiPen dose after 5-15 min if needed"],
    doNot: ["Don't leave them alone", "Don't have them stand/walk"] },
];

const FirstAid = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const customGuidesQuery = useQuery({
    queryKey: ["published-custom-first-aid"],
    queryFn: listPublishedCustomFirstAidGuides,
  });

  const customGuides = useMemo(
    () =>
      (customGuidesQuery.data || []).map((guide) => ({
        id: `custom-first-aid-${guide.id}`,
        title: guide.title,
        overview: guide.overview,
        severity: guide.severity,
        steps: guide.steps,
        doNot: guide.do_not,
        icon:
          guide.severity === "critical" ? (
            <Siren className="h-5 w-5" />
          ) : guide.severity === "high" ? (
            <AlertTriangle className="h-5 w-5" />
          ) : (
            <HeartPulse className="h-5 w-5" />
          ),
      })),
    [customGuidesQuery.data],
  );

  const allGuides = useMemo(() => [...firstAidGuides, ...customGuides], [customGuides]);

  const filteredGuides = allGuides.filter((g) =>
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) || g.overview.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const criticalGuides = filteredGuides.filter(g => g.severity === "critical");
  const otherGuides = filteredGuides.filter(g => g.severity !== "critical");

  return (
    <Layout>
      <PageTransition>
        <div className="container py-8 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-3">
              <HeartPulse className="h-3.5 w-3.5" />First Aid Guide
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Emergency First Aid</h1>
            <p className="text-muted-foreground text-sm">Step-by-step guides for common emergencies</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Link to="/emergency">
              <Card className="mb-6 border-destructive/30 bg-destructive/5 hover:bg-destructive/10 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center"><Phone className="h-5 w-5 text-destructive" /></div>
                  <div className="flex-1"><h3 className="font-semibold">Need to Call Emergency Services?</h3><p className="text-sm text-muted-foreground">Access emergency numbers for ambulance, police, fire</p></div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search first aid guides..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>

          {criticalGuides.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-6">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Siren className="h-4 w-4 text-destructive" />Life-Saving Procedures</h2>
              <Accordion type="multiple" className="space-y-2">
                {criticalGuides.map((guide, idx) => (
                  <motion.div key={guide.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + idx * 0.04 }}>
                    <AccordionItem value={guide.id} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-destructive/10 text-destructive">{guide.icon}</div>
                          <div className="text-left">
                            <div className="flex items-center gap-2"><span className="font-medium">{guide.title}</span><Badge variant="destructive" className="text-[10px] px-1.5 py-0">CRITICAL</Badge></div>
                            <p className="text-xs text-muted-foreground">{guide.overview}</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="pl-12 space-y-4">
                          <div>
                            <h4 className="font-medium text-sm mb-2 text-success">✓ Steps to Follow</h4>
                            <ol className="text-sm space-y-1.5">
                              {guide.steps.map((step, i) => (<li key={i} className="flex gap-2"><span className="text-primary font-medium">{i + 1}.</span><span className="text-muted-foreground">{step}</span></li>))}
                            </ol>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm mb-2 text-destructive">✗ Do NOT</h4>
                            <ul className="text-sm space-y-1">
                              {guide.doNot.map((item, i) => (<li key={i} className="text-muted-foreground flex gap-2"><span className="text-destructive">•</span>{item}</li>))}
                            </ul>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </motion.div>
          )}

          {otherGuides.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <h2 className="text-lg font-semibold mb-3">Other Procedures</h2>
              <Accordion type="multiple" className="space-y-2">
                {otherGuides.map((guide, idx) => (
                  <motion.div key={guide.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 + idx * 0.04 }}>
                    <AccordionItem value={guide.id} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline py-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">{guide.icon}</div>
                          <div className="text-left"><span className="font-medium">{guide.title}</span><p className="text-xs text-muted-foreground">{guide.overview}</p></div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="pl-12 space-y-4">
                          <div>
                            <h4 className="font-medium text-sm mb-2 text-success">✓ Steps to Follow</h4>
                            <ol className="text-sm space-y-1.5">
                              {guide.steps.map((step, i) => (<li key={i} className="flex gap-2"><span className="text-primary font-medium">{i + 1}.</span><span className="text-muted-foreground">{step}</span></li>))}
                            </ol>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm mb-2 text-destructive">✗ Do NOT</h4>
                            <ul className="text-sm space-y-1">
                              {guide.doNot.map((item, i) => (<li key={i} className="text-muted-foreground flex gap-2"><span className="text-destructive">•</span>{item}</li>))}
                            </ul>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="mt-6 border-warning/30 bg-warning/5">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                  <div>
                    <h3 className="font-medium text-sm mb-1">Important</h3>
                    <p className="text-xs text-muted-foreground">These guides are for educational purposes. Always call emergency services (112) in serious situations.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default FirstAid;
