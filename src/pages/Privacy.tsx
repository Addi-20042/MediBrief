import Layout from "@/components/layout/Layout";
import PageTransition from "@/components/animations/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { APP_NAME, MEDICAL_DISCLAIMER } from "@/lib/site";

const sections = [
  {
    title: "What We Collect",
    body: "We may store account details, profile information, health tracking entries, medication reminders, uploaded report text, and analysis history that you choose to save inside the app.",
  },
  {
    title: "How We Use It",
    body: "Your data is used to power symptom analysis, report interpretation, reminders, personalized health context, admin-managed content, and support for your account.",
  },
  {
    title: "Health Information",
    body: "Health-related data is sensitive. You should only enter information you are comfortable storing in your Supabase-backed account. Avoid uploading documents you do not want retained.",
  },
  {
    title: "Third-Party Services",
    body: "The app may rely on Supabase for authentication and storage, AI providers for analysis features, and email or SMS providers for notifications. Those services process the minimum data needed to perform their role.",
  },
  {
    title: "Your Controls",
    body: "You can update profile details, remove history, and request account changes through the app admin or your configured support contact. Review your deployment settings before launch so your public contact path is clear.",
  },
];

const Privacy = () => {
  usePageMeta({
    title: "Privacy Policy",
    description: "Review how MediBrief handles account, health, and analysis data.",
    path: "/privacy",
  });

  return (
    <Layout>
      <PageTransition>
        <div className="container py-10 md:py-14">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <ShieldCheck className="h-4 w-4" />
                Privacy Policy
              </div>
              <h1 className="text-3xl font-bold tracking-tight">How {APP_NAME} handles your data</h1>
              <p className="text-muted-foreground">
                This policy explains the kinds of information the app stores and how it is used for a small-scale launch.
              </p>
            </div>

            <Card className="border-primary/20 bg-primary/5">
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
              Last updated: March 29, 2026. Update this page with your real business identity, support contact, and jurisdiction before public launch.
            </p>
          </div>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default Privacy;
