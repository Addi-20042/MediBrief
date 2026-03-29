import Layout from "@/components/layout/Layout";
import PageTransition from "@/components/animations/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, LifeBuoy } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { APP_NAME, MEDICAL_DISCLAIMER, getSupportEmail } from "@/lib/site";

const Contact = () => {
  const supportEmail = getSupportEmail();

  usePageMeta({
    title: "Contact",
    description: "Get support for account issues, admin content changes, and deployment questions.",
    path: "/contact",
  });

  return (
    <Layout>
      <PageTransition>
        <div className="container py-10 md:py-14">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <LifeBuoy className="h-4 w-4" />
                Contact
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Need help?</h1>
              <p className="text-muted-foreground">
                Use this page for launch support, account issues, content changes, and operational questions.
              </p>
            </div>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Support channel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {supportEmail ? (
                  <>
                    <p className="text-muted-foreground">
                      Email support at <span className="font-medium text-foreground">{supportEmail}</span>.
                    </p>
                    <Button asChild>
                      <a href={`mailto:${supportEmail}`}>
                        <Mail className="mr-2 h-4 w-4" />
                        Email Support
                      </a>
                    </Button>
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    Set <code>VITE_SUPPORT_EMAIL</code> before launch so visitors have a working public support contact.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-4 text-sm text-muted-foreground">
                {MEDICAL_DISCLAIMER}
              </CardContent>
            </Card>
          </div>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default Contact;
