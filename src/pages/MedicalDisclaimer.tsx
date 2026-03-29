import Layout from "@/components/layout/Layout";
import PageTransition from "@/components/animations/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { APP_NAME, MEDICAL_DISCLAIMER } from "@/lib/site";

const points = [
  "Do not use this app as a replacement for emergency services, urgent care, or professional medical advice.",
  "AI outputs may be incomplete, incorrect, or unsuitable for your individual situation.",
  "Always verify medications, diagnoses, and treatment decisions with a licensed clinician.",
  "If you experience severe symptoms such as chest pain, breathing difficulty, stroke symptoms, seizures, or uncontrolled bleeding, contact emergency services immediately.",
];

const MedicalDisclaimer = () => {
  usePageMeta({
    title: "Medical Disclaimer",
    description: "Important limitations and safety guidance for using MediBrief.",
    path: "/medical-disclaimer",
  });

  return (
    <Layout>
      <PageTransition>
        <div className="container py-10 md:py-14">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive">
                <AlertTriangle className="h-4 w-4" />
                Medical Disclaimer
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Important safety information</h1>
              <p className="text-muted-foreground">{MEDICAL_DISCLAIMER}</p>
            </div>

            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader>
                <CardTitle>Before you rely on any result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {points.map((point) => (
                  <p key={point} className="text-muted-foreground">
                    {point}
                  </p>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default MedicalDisclaimer;
