import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { diseases, diseaseCategories, Disease } from "@/lib/diseases";
import Layout from "@/components/layout/Layout";
import {
  BookOpen,
  Search,
  AlertCircle,
  Activity,
  Pill,
  Shield,
  Heart,
  Stethoscope,
  X,
} from "lucide-react";

const Learn = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);

  const filteredDiseases = diseases.filter((disease) => {
    const matchesSearch =
      disease.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      disease.symptoms.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      disease.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || disease.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Cardiovascular: "bg-red-100 text-red-800 border-red-200",
      Respiratory: "bg-blue-100 text-blue-800 border-blue-200",
      Neurological: "bg-purple-100 text-purple-800 border-purple-200",
      "Mental Health": "bg-pink-100 text-pink-800 border-pink-200",
      Autoimmune: "bg-orange-100 text-orange-800 border-orange-200",
      Metabolic: "bg-amber-100 text-amber-800 border-amber-200",
      Gastrointestinal: "bg-green-100 text-green-800 border-green-200",
      Infectious: "bg-teal-100 text-teal-800 border-teal-200",
      Endocrine: "bg-indigo-100 text-indigo-800 border-indigo-200",
      Musculoskeletal: "bg-cyan-100 text-cyan-800 border-cyan-200",
      Renal: "bg-emerald-100 text-emerald-800 border-emerald-200",
      "Blood Disorders": "bg-rose-100 text-rose-800 border-rose-200",
    };
    return colors[category] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-warning/10 px-4 py-1.5 text-sm font-medium text-warning mb-4">
            <BookOpen className="h-4 w-4" />
            Disease Library
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Learn About Diseases
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Explore our comprehensive library of diseases, their symptoms, causes, and prevention methods.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
          {/* Disease List */}
          <div>
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search diseases, symptoms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              {diseaseCategories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "gradient-primary text-primary-foreground" : ""}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Disease Count */}
            <p className="text-sm text-muted-foreground mb-4">
              Showing {filteredDiseases.length} of {diseases.length} diseases
            </p>

            {/* Disease Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredDiseases.map((disease) => (
                <Card
                  key={disease.id}
                  className={`cursor-pointer transition-all hover:shadow-lg hover:border-primary/30 ${
                    selectedDisease?.id === disease.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedDisease(disease)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{disease.name}</CardTitle>
                      <Badge className={getCategoryColor(disease.category)} variant="outline">
                        {disease.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {disease.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {disease.symptoms.slice(0, 3).map((symptom, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {symptom}
                        </Badge>
                      ))}
                      {disease.symptoms.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{disease.symptoms.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredDiseases.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No diseases found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}
          </div>

          {/* Disease Detail Panel */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            {selectedDisease ? (
              <Card className="border-border/50 shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className={getCategoryColor(selectedDisease.category)} variant="outline">
                        {selectedDisease.category}
                      </Badge>
                      <CardTitle className="text-xl mt-2">{selectedDisease.name}</CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedDisease(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="max-h-[calc(100vh-12rem)] overflow-y-auto">
                  <p className="text-muted-foreground mb-4">{selectedDisease.description}</p>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="symptoms">
                      <AccordionTrigger className="text-sm font-medium">
                        <span className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-primary" />
                          Symptoms
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-1.5">
                          {selectedDisease.symptoms.map((symptom, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <span className="text-primary mt-1">•</span>
                              {symptom}
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="causes">
                      <AccordionTrigger className="text-sm font-medium">
                        <span className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-info" />
                          Causes
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-1.5">
                          {selectedDisease.causes.map((cause, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <span className="text-info mt-1">•</span>
                              {cause}
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="prevention">
                      <AccordionTrigger className="text-sm font-medium">
                        <span className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-success" />
                          Prevention
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-1.5">
                          {selectedDisease.prevention.map((item, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <span className="text-success mt-1">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="treatment">
                      <AccordionTrigger className="text-sm font-medium">
                        <span className="flex items-center gap-2">
                          <Pill className="h-4 w-4 text-warning" />
                          Treatment
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-1.5">
                          {selectedDisease.treatment.map((item, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <span className="text-warning mt-1">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="risk">
                      <AccordionTrigger className="text-sm font-medium">
                        <span className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-destructive" />
                          Risk Factors
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-1.5">
                          {selectedDisease.riskFactors.map((risk, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <span className="text-destructive mt-1">•</span>
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {/* When to See Doctor */}
                  <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm mb-1">When to See a Doctor</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedDisease.whenToSeeDoctor}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed border-2 border-border">
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Select a Disease</h3>
                  <p className="text-sm text-muted-foreground">
                    Click on a disease card to view detailed information about symptoms, causes, prevention, and treatment.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Learn;
