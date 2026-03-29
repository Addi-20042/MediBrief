import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { diseases, Disease } from "@/lib/diseases";
import { listPublishedCustomDiseases, mapCustomDiseaseToDisease } from "@/lib/adminContent";
import Layout from "@/components/layout/Layout";
import PageTransition from "@/components/animations/PageTransition";
import StaggerContainer, { StaggerItem } from "@/components/animations/StaggerContainer";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  BookOpen, Search, AlertCircle, Activity, Pill, Shield, Heart, Stethoscope, X,
} from "lucide-react";

const DiseaseDetails = ({ disease, onClose, getCategoryColor }: { disease: Disease; onClose: () => void; getCategoryColor: (c: string) => string }) => (
  <>
    <div className="flex items-start justify-between mb-4">
      <div>
        <Badge className={getCategoryColor(disease.category)} variant="outline">{disease.category}</Badge>
        <h2 className="text-xl font-semibold mt-2">{disease.name}</h2>
      </div>
      <Button variant="ghost" size="icon" onClick={onClose} className="hidden lg:flex"><X className="h-4 w-4" /></Button>
    </div>
    <p className="text-muted-foreground mb-4">{disease.description}</p>
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="symptoms">
        <AccordionTrigger className="text-sm font-medium"><span className="flex items-center gap-2"><Stethoscope className="h-4 w-4 text-primary" />Symptoms</span></AccordionTrigger>
        <AccordionContent><ul className="space-y-1.5">{disease.symptoms.map((s, i) => (<li key={i} className="flex items-start gap-2 text-sm"><span className="text-primary mt-1">•</span>{s}</li>))}</ul></AccordionContent>
      </AccordionItem>
      <AccordionItem value="causes">
        <AccordionTrigger className="text-sm font-medium"><span className="flex items-center gap-2"><Activity className="h-4 w-4 text-info" />Causes</span></AccordionTrigger>
        <AccordionContent><ul className="space-y-1.5">{disease.causes.map((c, i) => (<li key={i} className="flex items-start gap-2 text-sm"><span className="text-info mt-1">•</span>{c}</li>))}</ul></AccordionContent>
      </AccordionItem>
      <AccordionItem value="prevention">
        <AccordionTrigger className="text-sm font-medium"><span className="flex items-center gap-2"><Shield className="h-4 w-4 text-success" />Prevention</span></AccordionTrigger>
        <AccordionContent><ul className="space-y-1.5">{disease.prevention.map((p, i) => (<li key={i} className="flex items-start gap-2 text-sm"><span className="text-success mt-1">•</span>{p}</li>))}</ul></AccordionContent>
      </AccordionItem>
      <AccordionItem value="treatment">
        <AccordionTrigger className="text-sm font-medium"><span className="flex items-center gap-2"><Pill className="h-4 w-4 text-warning" />Treatment</span></AccordionTrigger>
        <AccordionContent><ul className="space-y-1.5">{disease.treatment.map((t, i) => (<li key={i} className="flex items-start gap-2 text-sm"><span className="text-warning mt-1">•</span>{t}</li>))}</ul></AccordionContent>
      </AccordionItem>
      <AccordionItem value="risk">
        <AccordionTrigger className="text-sm font-medium"><span className="flex items-center gap-2"><Heart className="h-4 w-4 text-destructive" />Risk Factors</span></AccordionTrigger>
        <AccordionContent><ul className="space-y-1.5">{disease.riskFactors.map((r, i) => (<li key={i} className="flex items-start gap-2 text-sm"><span className="text-destructive mt-1">•</span>{r}</li>))}</ul></AccordionContent>
      </AccordionItem>
    </Accordion>
    <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
      <div className="flex items-start gap-2">
        <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div><p className="font-medium text-sm mb-1">When to See a Doctor</p><p className="text-sm text-muted-foreground">{disease.whenToSeeDoctor}</p></div>
      </div>
    </div>
  </>
);

const Learn = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const isMobile = useIsMobile();

  const customDiseasesQuery = useQuery({
    queryKey: ["published-custom-diseases"],
    queryFn: listPublishedCustomDiseases,
  });

  const allDiseases = useMemo(
    () => [...diseases, ...(customDiseasesQuery.data || []).map(mapCustomDiseaseToDisease)],
    [customDiseasesQuery.data],
  );

  const allCategories = useMemo(
    () => ["All", ...Array.from(new Set(allDiseases.map((disease) => disease.category))).sort()],
    [allDiseases],
  );

  useEffect(() => {
    if (!allCategories.includes(selectedCategory)) {
      setSelectedCategory("All");
    }
  }, [allCategories, selectedCategory]);

  const filteredDiseases = allDiseases.filter((disease) => {
    const matchesSearch =
      disease.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      disease.symptoms.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      disease.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || disease.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Cardiovascular: "bg-destructive/10 text-destructive border-destructive/20",
      Respiratory: "bg-info/10 text-info border-info/20",
      Neurological: "bg-accent/10 text-accent border-accent/20",
      "Mental Health": "bg-destructive/10 text-destructive border-destructive/20",
      Autoimmune: "bg-warning/10 text-warning border-warning/20",
      Metabolic: "bg-warning/10 text-warning border-warning/20",
      Gastrointestinal: "bg-success/10 text-success border-success/20",
      Infectious: "bg-primary/10 text-primary border-primary/20",
      Endocrine: "bg-info/10 text-info border-info/20",
      Musculoskeletal: "bg-primary/10 text-primary border-primary/20",
      Renal: "bg-success/10 text-success border-success/20",
      "Blood Disorders": "bg-destructive/10 text-destructive border-destructive/20",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  return (
    <Layout>
      <PageTransition>
        <div className="container py-8 md:py-12">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-warning/10 px-4 py-1.5 text-sm font-medium text-warning mb-4">
              <BookOpen className="h-4 w-4" />Disease Library
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Learn About Diseases</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Explore our comprehensive library of diseases, their symptoms, causes, and prevention methods.
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
            <div>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search diseases, symptoms..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {allCategories.map((category) => (
                  <Button key={category} variant={selectedCategory === category ? "default" : "outline"} size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={`${selectedCategory === category ? "gradient-primary text-primary-foreground" : ""} transition-all duration-200`}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              <p className="text-sm text-muted-foreground mb-4">Showing {filteredDiseases.length} of {allDiseases.length} diseases</p>

              <StaggerContainer className="grid gap-4 sm:grid-cols-2" staggerDelay={0.05} delayStart={0.15}>
                {filteredDiseases.map((disease) => (
                  <StaggerItem key={disease.id}>
                    <Card
                      className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary/30 ${selectedDisease?.id === disease.id ? "ring-2 ring-primary" : ""}`}
                      onClick={() => setSelectedDisease(disease)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg">{disease.name}</CardTitle>
                          <Badge className={getCategoryColor(disease.category)} variant="outline">{disease.category}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{disease.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {disease.symptoms.slice(0, 3).map((symptom, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">{symptom}</Badge>
                          ))}
                          {disease.symptoms.length > 3 && <Badge variant="secondary" className="text-xs">+{disease.symptoms.length - 3} more</Badge>}
                        </div>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                ))}
              </StaggerContainer>

              {filteredDiseases.length === 0 && (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No diseases found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </div>

            {/* Desktop: sticky sidebar */}
            {!isMobile && (
              <div className="hidden lg:block lg:sticky lg:top-20 lg:self-start">
                <AnimatePresence mode="wait">
                  {selectedDisease ? (
                    <motion.div key={selectedDisease.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.3 }}>
                      <Card className="border-border/50 shadow-lg">
                        <CardContent className="pt-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
                          <DiseaseDetails disease={selectedDisease} onClose={() => setSelectedDisease(null)} getCategoryColor={getCategoryColor} />
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <Card className="border-dashed border-2 border-border">
                        <CardContent className="py-12 text-center">
                          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">Select a Disease</h3>
                          <p className="text-sm text-muted-foreground">Click on a disease card to view detailed information.</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile: bottom sheet */}
            {isMobile && (
              <Sheet open={!!selectedDisease} onOpenChange={(open) => { if (!open) setSelectedDisease(null); }}>
                <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
                  <SheetHeader className="sr-only">
                    <SheetTitle>{selectedDisease?.name ?? "Disease Details"}</SheetTitle>
                  </SheetHeader>
                  {selectedDisease && (
                    <div className="pt-2">
                      <DiseaseDetails disease={selectedDisease} onClose={() => setSelectedDisease(null)} getCategoryColor={getCategoryColor} />
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default Learn;
