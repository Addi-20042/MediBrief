import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import PageTransition from "@/components/animations/PageTransition";
import StaggerContainer, { StaggerItem } from "@/components/animations/StaggerContainer";
import { motion } from "framer-motion";
import {
  Phone, Ambulance, AlertTriangle, Heart, Baby, Flame, Shield,
  Search, Copy, Check, Siren, Hospital, Brain, Droplets, HeartPulse, ArrowRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { listPublishedCustomEmergencyContacts } from "@/lib/adminContent";

interface EmergencyContact {
  id: string; name: string; number: string; description: string;
  icon: React.ReactNode; priority: "critical" | "high" | "medium";
}

const emergencyContacts: EmergencyContact[] = [
  { id: "unified", name: "Emergency (All Services)", number: "112", description: "Police, Fire, Ambulance - Universal", icon: <Siren className="h-5 w-5" />, priority: "critical" },
  { id: "ambulance", name: "Ambulance", number: "102", description: "Medical emergencies", icon: <Ambulance className="h-5 w-5" />, priority: "critical" },
  { id: "police", name: "Police", number: "100", description: "Crime & accidents", icon: <Shield className="h-5 w-5" />, priority: "critical" },
  { id: "fire", name: "Fire Department", number: "101", description: "Fire emergencies", icon: <Flame className="h-5 w-5" />, priority: "critical" },
  { id: "disaster", name: "Disaster Management", number: "108", description: "Natural disasters", icon: <AlertTriangle className="h-5 w-5" />, priority: "critical" },
  { id: "health", name: "Health Helpline", number: "104", description: "Medical advice", icon: <Hospital className="h-5 w-5" />, priority: "high" },
  { id: "mental", name: "Mental Health", number: "08046110007", description: "Crisis counseling", icon: <Brain className="h-5 w-5" />, priority: "high" },
  { id: "women", name: "Women Helpline", number: "181", description: "Women in distress", icon: <Heart className="h-5 w-5" />, priority: "critical" },
  { id: "child", name: "Child Helpline", number: "1098", description: "Child protection", icon: <Baby className="h-5 w-5" />, priority: "critical" },
  { id: "blood", name: "Blood Bank", number: "1910", description: "Blood requirements", icon: <Droplets className="h-5 w-5" />, priority: "high" },
];

const Emergency = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const { toast } = useToast();
  const customContactsQuery = useQuery({
    queryKey: ["published-custom-emergency"],
    queryFn: listPublishedCustomEmergencyContacts,
  });

  const customContacts = useMemo(
    () =>
      (customContactsQuery.data || []).map((contact) => ({
        id: `custom-emergency-${contact.id}`,
        name: contact.name,
        number: contact.number,
        description: contact.country ? `${contact.description} • ${contact.country}` : contact.description,
        priority: contact.priority,
        icon:
          contact.priority === "critical" ? (
            <Siren className="h-5 w-5" />
          ) : contact.priority === "high" ? (
            <Hospital className="h-5 w-5" />
          ) : (
            <Phone className="h-5 w-5" />
          ),
      })),
    [customContactsQuery.data],
  );

  const allContacts = useMemo(() => [...emergencyContacts, ...customContacts], [customContacts]);

  const filteredContacts = allContacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.number.includes(searchQuery)
  );

  const handleCopyNumber = async (number: string) => {
    await navigator.clipboard.writeText(number);
    setCopiedNumber(number);
    toast({ title: "Copied", description: `${number} copied to clipboard` });
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const handleCallNumber = (number: string) => { window.location.href = `tel:${number}`; };

  return (
    <Layout>
      <PageTransition>
        <div className="container py-8 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive mb-3">
              <Siren className="h-3.5 w-3.5" />Emergency Services
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Emergency Contacts</h1>
            <p className="text-muted-foreground text-sm">Quick access to emergency services and helplines</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15, duration: 0.35 }}>
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
                  <Button variant="destructive" className="shrink-0" onClick={() => handleCallNumber("112")}>
                    <Phone className="mr-2 h-4 w-4" />Call 112
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Link to="/first-aid">
              <Card className="mb-6 border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center"><HeartPulse className="h-5 w-5 text-primary" /></div>
                  <div className="flex-1"><h3 className="font-semibold">Need First Aid Instructions?</h3><p className="text-sm text-muted-foreground">Step-by-step guides for CPR, choking, burns & more</p></div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search emergency services..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>

          <StaggerContainer className="grid gap-3 sm:grid-cols-2" staggerDelay={0.05} delayStart={0.3}>
            {filteredContacts.map((contact) => (
              <StaggerItem key={contact.id}>
                <Card className={`transition-all duration-300 hover:shadow-md ${contact.priority === "critical" ? "border-destructive/30" : "border-border"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg shrink-0 ${contact.priority === "critical" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                        {contact.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm">{contact.name}</h3>
                          {contact.priority === "critical" && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">CRITICAL</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{contact.description}</p>
                        <div className="flex items-center gap-2">
                          <a href={`tel:${contact.number}`} className="font-mono font-bold text-lg text-primary hover:underline">{contact.number}</a>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopyNumber(contact.number)}>
                            {copiedNumber === contact.number ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                          </Button>
                          <a href={`tel:${contact.number}`} className="ml-auto">
                            <Button size="sm" className="h-7">
                              <Phone className="h-3.5 w-3.5 mr-1" />Call
                            </Button>
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="mt-6">
              <CardHeader className="pb-3"><CardTitle className="text-base">International Emergency Numbers</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
                   {[{ country: "USA", number: "911" }, { country: "UK", number: "999" }, { country: "EU", number: "112" }, { country: "Australia", number: "000" }].map((item) => (
                    <a key={item.country} href={`tel:${item.number}`} className="flex justify-between p-2 rounded bg-muted/50 text-sm hover:bg-muted/70 transition-colors">
                      <span>{item.country}</span>
                      <span className="font-mono font-bold text-primary">{item.number}</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </PageTransition>
    </Layout>
  );
};

export default Emergency;
