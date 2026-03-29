import Layout from "@/components/layout/Layout";
import PageTransition from "@/components/animations/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { APP_NAME, MEDICAL_DISCLAIMER } from "@/lib/site";

const sections = [
  {
    title: "Service Scope",
    body: `${APP_NAME} offers AI-assisted health education features, including symptom analysis, report summaries, health tracking, emergency reference material, and admin-managed content.`,
  },
  {
    title: "No Medical Relationship",
    body: "Using the app does not create a doctor-patient relationship. Do not rely on the app for emergencies or urgent treatment decisions.",
  },
  {
    title: "Responsible Use",
    body: "You agree not to misuse the service, overload it, abuse communication features, attempt unauthorized access, or upload unlawful or harmful content.",
  },
  {
    title: "Accounts and Access",
    body: "You are responsible for safeguarding your login credentials and keeping profile details accurate. Admin access and content management are restricted to approved accounts.",
  },
  {
    title: "Availability",
    body: "For a low-cost launch, the service may change, pause, or go offline for maintenance, provider limits, or infrastructure issues. Features may be added or removed over time.",
  },
];

const Terms = () => {
  usePageMeta({
    title: "Terms of Service",
    description: "Review the basic terms for using MediBrief and its AI-assisted health features.",
    path: "/terms",
  });

  return (
    <Layout>
      <PageTransition>
        <div className="container py-10 md:py-14">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <FileText className="h-4 w-4" />
                Terms of Service
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Rules for using {APP_NAME}</h1>
              <p className="text-muted-foreground">
                These terms describe the intended use of the platform and the boundaries of the service.
              </p>
            </div>

            <Card className="border-warning/20 bg-warning/5">
              <CardContent className="py-4 text-sm text-muted-foreground">
                {MEDICAL_DISCLAIMER}
              </CardContent>
            </Card>

            {sections.map((section) => (
              <Card key={section.title} className="border-border/50">
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{section.body}</p>
                </CardContent>
              </Card>
            ))}

            <p className="text-sm text-muted-foreground">
              Last updated: March 29, 2026. You should replace this with a lawyer-reviewed version before a larger commercial rollout.
            </p>
          </div>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default Terms;
