import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAppFeatureIcon, type AppFeatureCardEntry } from "@/lib/adminContent";

interface AppFeatureCardProps {
  feature: Pick<
    AppFeatureCardEntry,
    "title" | "description" | "details" | "href" | "cta_label" | "badge" | "icon_name" | "is_external"
  >;
  compact?: boolean;
}

const AppFeatureCard = ({ feature, compact = false }: AppFeatureCardProps) => {
  const Icon = getAppFeatureIcon(feature.icon_name);
  const href = feature.href?.trim() || "";
  const ctaLabel = feature.cta_label?.trim() || "Open feature";

  return (
    <Card className="h-full border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300">
      <CardContent className={compact ? "p-5" : "p-6"}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          {feature.badge ? <Badge variant="outline">{feature.badge}</Badge> : null}
        </div>

        <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
        <p className="text-sm text-muted-foreground">{feature.description}</p>

        {!compact && feature.details ? (
          <p className="text-sm text-muted-foreground mt-3">{feature.details}</p>
        ) : null}

        <div className="mt-5">
          {href ? (
            feature.is_external ? (
              <Button asChild variant="outline" className="w-full justify-between">
                <a href={href} target="_blank" rel="noreferrer">
                  {ctaLabel}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            ) : (
              <Button asChild variant="outline" className="w-full justify-between">
                <Link to={href}>
                  {ctaLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )
          ) : (
            <Button variant="outline" className="w-full" disabled>
              Informational card
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AppFeatureCard;
