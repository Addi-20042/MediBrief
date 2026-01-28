import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import {
  Phone,
  Ambulance,
  AlertTriangle,
  Heart,
  Baby,
  Flame,
  Shield,
  Search,
  Copy,
  Check,
  Siren,
  Hospital,
  Brain,
  Droplets,
  HeartPulse,
  ArrowRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmergencyContact {
  id: string;
  name: string;
  number: string;
  description: string;
  icon: React.ReactNode;
  priority: "critical" | "high" | "medium";
}

const emergencyContacts: EmergencyContact[] = [
  {
    id: "unified",
    name: "Emergency (All Services)",
    number: "112",
    description: "Police, Fire, Ambulance - Universal",
    icon: <Siren className="h-5 w-5" />,
    priority: "critical",
  },
  {
    id: "ambulance",
    name: "Ambulance",
    number: "102",
    description: "Medical emergencies",
    icon: <Ambulance className="h-5 w-5" />,
    priority: "critical",
  },
  {
    id: "police",
    name: "Police",
    number: "100",
    description: "Crime & accidents",
    icon: <Shield className="h-5 w-5" />,
    priority: "critical",
  },
  {
    id: "fire",
    name: "Fire Department",
    number: "101",
    description: "Fire emergencies",
    icon: <Flame className="h-5 w-5" />,
    priority: "critical",
  },
  {
    id: "disaster",
    name: "Disaster Management",
    number: "108",
    description: "Natural disasters",
    icon: <AlertTriangle className="h-5 w-5" />,
    priority: "critical",
  },
  {
    id: "health",
    name: "Health Helpline",
    number: "104",
    description: "Medical advice",
    icon: <Hospital className="h-5 w-5" />,
    priority: "high",
  },
  {
    id: "mental",
    name: "Mental Health",
    number: "08046110007",
    description: "Crisis counseling",
    icon: <Brain className="h-5 w-5" />,
    priority: "high",
  },
  {
    id: "women",
    name: "Women Helpline",
    number: "181",
    description: "Women in distress",
    icon: <Heart className="h-5 w-5" />,
    priority: "critical",
  },
  {
    id: "child",
    name: "Child Helpline",
    number: "1098",
    description: "Child protection",
    icon: <Baby className="h-5 w-5" />,
    priority: "critical",
  },
  {
    id: "blood",
    name: "Blood Bank",
    number: "1910",
    description: "Blood requirements",
    icon: <Droplets className="h-5 w-5" />,
    priority: "high",
  },
];

const Emergency = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredContacts = emergencyContacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.number.includes(searchQuery)
  );

  const handleCopyNumber = async (number: string) => {
    await navigator.clipboard.writeText(number);
    setCopiedNumber(number);
    toast({ title: "Copied", description: `${number} copied to clipboard` });
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const handleCallNumber = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive mb-3">
            <Siren className="h-3.5 w-3.5" />
            Emergency Services
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Emergency Contacts</h1>
          <p className="text-muted-foreground text-sm">Quick access to emergency services and helplines</p>
        </div>

        {/* Main Emergency Banner */}
        <Card className="mb-6 border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-destructive">Life-Threatening Emergency?</h3>
                <p className="text-sm text-muted-foreground">Call 112 - connects to all services</p>
              </div>
              <Button 
                variant="destructive" 
                className="shrink-0"
                onClick={() => handleCallNumber("112")}
              >
                <Phone className="mr-2 h-4 w-4" />
                Call 112
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* First Aid Quick Link */}
        <Link to="/first-aid">
          <Card className="mb-6 border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <HeartPulse className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Need First Aid Instructions?</h3>
                <p className="text-sm text-muted-foreground">Step-by-step guides for CPR, choking, burns & more</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search emergency services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Emergency Contacts Grid */}
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredContacts.map((contact) => (
            <Card
              key={contact.id}
              className={`transition-all hover:shadow-md ${
                contact.priority === "critical" 
                  ? "border-destructive/30" 
                  : "border-border"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    contact.priority === "critical" 
                      ? "bg-destructive/10 text-destructive" 
                      : "bg-primary/10 text-primary"
                  }`}>
                    {contact.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm">{contact.name}</h3>
                      {contact.priority === "critical" && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                          CRITICAL
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{contact.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-lg">{contact.number}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleCopyNumber(contact.number)}
                      >
                        {copiedNumber === contact.number ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        className="ml-auto h-7"
                        onClick={() => handleCallNumber(contact.number)}
                      >
                        <Phone className="h-3.5 w-3.5 mr-1" />
                        Call
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* International Numbers - Compact */}
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">International Emergency Numbers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
              {[
                { country: "USA", number: "911" },
                { country: "UK", number: "999" },
                { country: "EU", number: "112" },
                { country: "Australia", number: "000" },
              ].map((item) => (
                <div key={item.country} className="flex justify-between p-2 rounded bg-muted/50 text-sm">
                  <span>{item.country}</span>
                  <span className="font-mono font-bold text-primary">{item.number}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Emergency;
