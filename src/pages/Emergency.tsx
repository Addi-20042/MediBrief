import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout/Layout";
import {
  Phone,
  Ambulance,
  AlertTriangle,
  Heart,
  Baby,
  Flame,
  Shield,
  Car,
  Search,
  MapPin,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Siren,
  Hospital,
  Brain,
  Droplets,
  Skull,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmergencyContact {
  id: string;
  name: string;
  number: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  available: string;
  priority: "critical" | "high" | "medium";
}

const emergencyContacts: EmergencyContact[] = [
  // Critical Emergency Services
  {
    id: "ambulance",
    name: "Ambulance / Emergency",
    number: "102",
    description: "Medical emergencies, accidents, and critical care transport",
    icon: <Ambulance className="h-6 w-6" />,
    category: "Emergency Services",
    available: "24/7",
    priority: "critical",
  },
  {
    id: "police",
    name: "Police Emergency",
    number: "100",
    description: "Crime, accidents, law enforcement emergencies",
    icon: <Shield className="h-6 w-6" />,
    category: "Emergency Services",
    available: "24/7",
    priority: "critical",
  },
  {
    id: "fire",
    name: "Fire Department",
    number: "101",
    description: "Fire emergencies, rescue operations, hazardous materials",
    icon: <Flame className="h-6 w-6" />,
    category: "Emergency Services",
    available: "24/7",
    priority: "critical",
  },
  {
    id: "disaster",
    name: "Disaster Management",
    number: "108",
    description: "Natural disasters, emergency response coordination",
    icon: <AlertTriangle className="h-6 w-6" />,
    category: "Emergency Services",
    available: "24/7",
    priority: "critical",
  },
  {
    id: "unified",
    name: "Unified Emergency Number",
    number: "112",
    description: "Single emergency number for all services (Police, Fire, Ambulance)",
    icon: <Siren className="h-6 w-6" />,
    category: "Emergency Services",
    available: "24/7",
    priority: "critical",
  },
  
  // Medical Helplines
  {
    id: "health",
    name: "National Health Helpline",
    number: "104",
    description: "Health information, medical advice, hospital information",
    icon: <Hospital className="h-6 w-6" />,
    category: "Medical Helplines",
    available: "24/7",
    priority: "high",
  },
  {
    id: "covid",
    name: "COVID-19 Helpline",
    number: "1075",
    description: "Coronavirus information, testing, vaccination queries",
    icon: <Heart className="h-6 w-6" />,
    category: "Medical Helplines",
    available: "24/7",
    priority: "high",
  },
  {
    id: "blood",
    name: "Blood Bank",
    number: "1910",
    description: "Blood donation, blood requirements, nearest blood bank",
    icon: <Droplets className="h-6 w-6" />,
    category: "Medical Helplines",
    available: "24/7",
    priority: "high",
  },
  {
    id: "aids",
    name: "AIDS Helpline",
    number: "1097",
    description: "HIV/AIDS information, counseling, testing centers",
    icon: <Heart className="h-6 w-6" />,
    category: "Medical Helplines",
    available: "24/7",
    priority: "medium",
  },
  {
    id: "mental",
    name: "Mental Health Helpline",
    number: "08046110007",
    description: "Mental health support, counseling, crisis intervention",
    icon: <Brain className="h-6 w-6" />,
    category: "Medical Helplines",
    available: "24/7",
    priority: "high",
  },
  
  // Crisis Helplines
  {
    id: "suicide",
    name: "Suicide Prevention",
    number: "9152987821",
    description: "Suicide prevention, crisis counseling, emotional support",
    icon: <Heart className="h-6 w-6" />,
    category: "Crisis Helplines",
    available: "24/7",
    priority: "critical",
  },
  {
    id: "women",
    name: "Women Helpline",
    number: "181",
    description: "Women in distress, domestic violence, harassment",
    icon: <Shield className="h-6 w-6" />,
    category: "Crisis Helplines",
    available: "24/7",
    priority: "critical",
  },
  {
    id: "child",
    name: "Child Helpline",
    number: "1098",
    description: "Child abuse, missing children, child protection",
    icon: <Baby className="h-6 w-6" />,
    category: "Crisis Helplines",
    available: "24/7",
    priority: "critical",
  },
  {
    id: "senior",
    name: "Senior Citizen Helpline",
    number: "14567",
    description: "Elder abuse, senior citizen support, emergency assistance",
    icon: <Heart className="h-6 w-6" />,
    category: "Crisis Helplines",
    available: "24/7",
    priority: "high",
  },
  
  // Other Emergency Services
  {
    id: "poison",
    name: "Poison Control Center",
    number: "1800-11-6117",
    description: "Poisoning emergencies, toxic exposure, treatment guidance",
    icon: <Skull className="h-6 w-6" />,
    category: "Specialized Emergency",
    available: "24/7",
    priority: "critical",
  },
  {
    id: "road",
    name: "Road Accident Emergency",
    number: "1073",
    description: "Highway accidents, road emergencies, traffic police",
    icon: <Car className="h-6 w-6" />,
    category: "Specialized Emergency",
    available: "24/7",
    priority: "high",
  },
  {
    id: "electricity",
    name: "Electricity Emergency",
    number: "1912",
    description: "Power failures, electrical emergencies, electrocution",
    icon: <Zap className="h-6 w-6" />,
    category: "Specialized Emergency",
    available: "24/7",
    priority: "high",
  },
];

const emergencyTips = [
  {
    title: "Stay Calm",
    description: "Take deep breaths and try to stay as calm as possible. Clear thinking helps in emergencies.",
    icon: <Brain className="h-5 w-5" />,
  },
  {
    title: "Call for Help",
    description: "Dial the appropriate emergency number. Speak clearly and provide your exact location.",
    icon: <Phone className="h-5 w-5" />,
  },
  {
    title: "Provide Information",
    description: "Give your name, location, nature of emergency, and number of people affected.",
    icon: <MapPin className="h-5 w-5" />,
  },
  {
    title: "Follow Instructions",
    description: "Listen carefully to the dispatcher and follow their instructions until help arrives.",
    icon: <Shield className="h-5 w-5" />,
  },
  {
    title: "Don't Hang Up",
    description: "Stay on the line unless told otherwise. The dispatcher may need more information.",
    icon: <Clock className="h-5 w-5" />,
  },
];

const Emergency = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const { toast } = useToast();

  const categories = ["All", ...new Set(emergencyContacts.map(c => c.category))];

  const filteredContacts = emergencyContacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.number.includes(searchQuery);
    const matchesCategory = selectedCategory === "All" || contact.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopyNumber = async (number: string) => {
    await navigator.clipboard.writeText(number);
    setCopiedNumber(number);
    toast({
      title: "Number Copied",
      description: `${number} copied to clipboard`,
    });
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const handleCallNumber = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-destructive/10 text-destructive border-destructive/30";
      case "high":
        return "bg-warning/10 text-warning border-warning/30";
      default:
        return "bg-info/10 text-info border-info/30";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-destructive text-destructive-foreground";
      case "high":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-info text-info-foreground";
    }
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-destructive/10 px-4 py-1.5 text-sm font-medium text-destructive mb-4">
            <Siren className="h-4 w-4" />
            Emergency Services
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Emergency Contacts
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Quick access to emergency services and helplines. Save these numbers - they could save a life.
          </p>
        </div>

        {/* Critical Alert Banner */}
        <Card className="mb-8 border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-destructive">In a Life-Threatening Emergency?</h3>
                <p className="text-sm text-muted-foreground">Call 112 immediately - it's the unified emergency number that connects to all services.</p>
              </div>
              <Button 
                variant="destructive" 
                size="lg" 
                className="gap-2"
                onClick={() => handleCallNumber("112")}
              >
                <Phone className="h-5 w-5" />
                Call 112
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search emergency services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs defaultValue="All" className="mb-8" onValueChange={setSelectedCategory}>
          <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Emergency Contacts Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {filteredContacts.map((contact) => (
            <Card
              key={contact.id}
              className={`transition-all hover:shadow-lg ${getPriorityColor(contact.priority)}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${contact.priority === "critical" ? "bg-destructive/20 text-destructive" : contact.priority === "high" ? "bg-warning/20 text-warning" : "bg-info/20 text-info"}`}>
                      {contact.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{contact.name}</CardTitle>
                      <Badge className={`mt-1 ${getPriorityBadge(contact.priority)}`}>
                        {contact.priority === "critical" ? "CRITICAL" : contact.priority === "high" ? "HIGH PRIORITY" : "MEDIUM"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {contact.description}
                </p>
                
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {contact.available}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 p-3 bg-background rounded-lg border">
                  <Phone className="h-5 w-5 text-primary" />
                  <span className="text-xl font-bold font-mono flex-1">{contact.number}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyNumber(contact.number)}
                  >
                    {copiedNumber === contact.number ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    className="flex-1 gap-2"
                    onClick={() => handleCallNumber(contact.number)}
                  >
                    <Phone className="h-4 w-4" />
                    Call Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Emergency Tips Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">What to Do in an Emergency</h2>
          <div className="grid gap-4 md:grid-cols-5">
            {emergencyTips.map((tip, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {tip.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{index + 1}. {tip.title}</h3>
                  <p className="text-sm text-muted-foreground">{tip.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* International Numbers */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-primary" />
              International Emergency Numbers
            </CardTitle>
            <CardDescription>Common emergency numbers used worldwide</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {[
                { country: "USA", number: "911" },
                { country: "UK", number: "999" },
                { country: "EU", number: "112" },
                { country: "Australia", number: "000" },
                { country: "Japan", number: "110 / 119" },
                { country: "China", number: "110 / 120" },
                { country: "Brazil", number: "190 / 192" },
                { country: "Mexico", number: "911" },
              ].map((item) => (
                <div key={item.country} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="font-medium">{item.country}</span>
                  <span className="font-mono text-lg font-bold text-primary">{item.number}</span>
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
