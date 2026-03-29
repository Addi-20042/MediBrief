import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import PageTransition from "@/components/animations/PageTransition";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";

const NotFound = () => {
  const location = useLocation();

  usePageMeta({
    title: "Page Not Found",
    description: "The page you requested could not be found.",
    noIndex: true,
  });

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <PageTransition>
        <div className="container flex min-h-[70vh] items-center justify-center py-16">
          <div className="max-w-md text-center">
            <h1 className="mb-4 text-5xl font-bold">404</h1>
            <p className="mb-3 text-xl font-semibold">Page not found</p>
            <p className="mb-6 text-muted-foreground">
              The route <span className="font-medium text-foreground">{location.pathname}</span> does not exist.
            </p>
            <Button asChild>
              <Link to="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default NotFound;
