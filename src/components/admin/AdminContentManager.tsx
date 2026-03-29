import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, HeartPulse, LayoutPanelTop, Loader2, Pencil, Phone, Plus, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  appFeatureIconOptions,
  createAppFeatureCard,
  createCustomDisease,
  createCustomEmergencyContact,
  createCustomFirstAidGuide,
  deleteAppFeatureCard,
  deleteCustomDisease,
  deleteCustomEmergencyContact,
  deleteCustomFirstAidGuide,
  listAdminAppFeatureCards,
  listAdminCustomDiseases,
  listAdminCustomEmergencyContacts,
  listAdminCustomFirstAidGuides,
  updateAppFeatureCard,
  updateCustomDisease,
  updateCustomEmergencyContact,
  updateCustomFirstAidGuide,
  type AppFeatureCardEntry,
  type AppFeatureIconName,
  type CustomDiseaseEntry,
  type CustomEmergencyContactEntry,
  type CustomFirstAidGuideEntry,
} from "@/lib/adminContent";

type ContentType = "disease" | "firstAid" | "emergency" | "feature";

interface DeleteTarget {
  id: string;
  label: string;
  type: ContentType;
}

interface DiseaseFormState {
  name: string;
  category: string;
  description: string;
  symptoms: string;
  causes: string;
  prevention: string;
  treatment: string;
  riskFactors: string;
  whenToSeeDoctor: string;
  displayOrder: string;
  isPublished: boolean;
}

interface FirstAidFormState {
  title: string;
  overview: string;
  severity: "critical" | "high" | "medium";
  steps: string;
  doNot: string;
  displayOrder: string;
  isPublished: boolean;
}

interface EmergencyFormState {
  name: string;
  number: string;
  description: string;
  country: string;
  priority: "critical" | "high" | "medium";
  displayOrder: string;
  isPublished: boolean;
}

interface FeatureFormState {
  title: string;
  description: string;
  details: string;
  badge: string;
  href: string;
  ctaLabel: string;
  iconName: AppFeatureIconName;
  displayOrder: string;
  isPublished: boolean;
  isExternal: boolean;
}

const emptyDiseaseForm = (): DiseaseFormState => ({
  name: "",
  category: "",
  description: "",
  symptoms: "",
  causes: "",
  prevention: "",
  treatment: "",
  riskFactors: "",
  whenToSeeDoctor: "",
  displayOrder: "0",
  isPublished: true,
});

const emptyFirstAidForm = (): FirstAidFormState => ({
  title: "",
  overview: "",
  severity: "medium",
  steps: "",
  doNot: "",
  displayOrder: "0",
  isPublished: true,
});

const emptyEmergencyForm = (): EmergencyFormState => ({
  name: "",
  number: "",
  description: "",
  country: "",
  priority: "medium",
  displayOrder: "0",
  isPublished: true,
});

const emptyFeatureForm = (): FeatureFormState => ({
  title: "",
  description: "",
  details: "",
  badge: "",
  href: "",
  ctaLabel: "",
  iconName: "activity",
  displayOrder: "0",
  isPublished: true,
  isExternal: false,
});

const splitLines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

const joinLines = (value: string[] | null | undefined) => (value || []).join("\n");

const parseOrder = (value: string) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const statusBadge = (isPublished: boolean) => (
  <Badge variant={isPublished ? "default" : "secondary"}>{isPublished ? "Published" : "Draft"}</Badge>
);

const AdminContentManager = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeDialog, setActiveDialog] = useState<ContentType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [editingDisease, setEditingDisease] = useState<CustomDiseaseEntry | null>(null);
  const [editingFirstAid, setEditingFirstAid] = useState<CustomFirstAidGuideEntry | null>(null);
  const [editingEmergency, setEditingEmergency] = useState<CustomEmergencyContactEntry | null>(null);
  const [editingFeature, setEditingFeature] = useState<AppFeatureCardEntry | null>(null);
  const [diseaseForm, setDiseaseForm] = useState<DiseaseFormState>(emptyDiseaseForm);
  const [firstAidForm, setFirstAidForm] = useState<FirstAidFormState>(emptyFirstAidForm);
  const [emergencyForm, setEmergencyForm] = useState<EmergencyFormState>(emptyEmergencyForm);
  const [featureForm, setFeatureForm] = useState<FeatureFormState>(emptyFeatureForm);

  const diseasesQuery = useQuery({ queryKey: ["admin-custom-diseases"], queryFn: listAdminCustomDiseases });
  const firstAidQuery = useQuery({ queryKey: ["admin-custom-first-aid"], queryFn: listAdminCustomFirstAidGuides });
  const emergencyQuery = useQuery({ queryKey: ["admin-custom-emergency"], queryFn: listAdminCustomEmergencyContacts });
  const featuresQuery = useQuery({ queryKey: ["admin-app-feature-cards"], queryFn: listAdminAppFeatureCards });

  const invalidateContentQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-custom-diseases"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-custom-first-aid"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-custom-emergency"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-app-feature-cards"] }),
      queryClient.invalidateQueries({ queryKey: ["published-custom-diseases"] }),
      queryClient.invalidateQueries({ queryKey: ["published-custom-first-aid"] }),
      queryClient.invalidateQueries({ queryKey: ["published-custom-emergency"] }),
      queryClient.invalidateQueries({ queryKey: ["published-app-feature-cards"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-audits"] }),
    ]);
  };

  const diseaseMutation = useMutation({
    mutationFn: async () => {
      if (!diseaseForm.name.trim() || !diseaseForm.category.trim() || !diseaseForm.description.trim()) {
        throw new Error("Name, category, and description are required.");
      }

      const payload = {
        name: diseaseForm.name.trim(),
        category: diseaseForm.category.trim(),
        description: diseaseForm.description.trim(),
        symptoms: splitLines(diseaseForm.symptoms),
        causes: splitLines(diseaseForm.causes),
        prevention: splitLines(diseaseForm.prevention),
        treatment: splitLines(diseaseForm.treatment),
        risk_factors: splitLines(diseaseForm.riskFactors),
        when_to_see_doctor: diseaseForm.whenToSeeDoctor.trim(),
        display_order: parseOrder(diseaseForm.displayOrder),
        is_published: diseaseForm.isPublished,
      };

      return editingDisease ? updateCustomDisease(editingDisease.id, payload) : createCustomDisease(payload);
    },
    onSuccess: async () => {
      await invalidateContentQueries();
      toast({ title: editingDisease ? "Disease entry updated" : "Disease entry created", description: "The disease library has been updated." });
      setActiveDialog(null);
      setEditingDisease(null);
      setDiseaseForm(emptyDiseaseForm());
    },
    onError: (error) => {
      toast({ title: "Could not save disease entry", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  const firstAidMutation = useMutation({
    mutationFn: async () => {
      if (!firstAidForm.title.trim() || !firstAidForm.overview.trim()) {
        throw new Error("Title and overview are required.");
      }

      const payload = {
        title: firstAidForm.title.trim(),
        overview: firstAidForm.overview.trim(),
        severity: firstAidForm.severity,
        steps: splitLines(firstAidForm.steps),
        do_not: splitLines(firstAidForm.doNot),
        display_order: parseOrder(firstAidForm.displayOrder),
        is_published: firstAidForm.isPublished,
      };

      return editingFirstAid ? updateCustomFirstAidGuide(editingFirstAid.id, payload) : createCustomFirstAidGuide(payload);
    },
    onSuccess: async () => {
      await invalidateContentQueries();
      toast({ title: editingFirstAid ? "First aid guide updated" : "First aid guide created", description: "The first aid section has been updated." });
      setActiveDialog(null);
      setEditingFirstAid(null);
      setFirstAidForm(emptyFirstAidForm());
    },
    onError: (error) => {
      toast({ title: "Could not save first aid guide", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  const emergencyMutation = useMutation({
    mutationFn: async () => {
      if (!emergencyForm.name.trim() || !emergencyForm.number.trim() || !emergencyForm.description.trim()) {
        throw new Error("Name, phone number, and description are required.");
      }

      const payload = {
        name: emergencyForm.name.trim(),
        number: emergencyForm.number.trim(),
        description: emergencyForm.description.trim(),
        country: emergencyForm.country.trim() || null,
        priority: emergencyForm.priority,
        display_order: parseOrder(emergencyForm.displayOrder),
        is_published: emergencyForm.isPublished,
      };

      return editingEmergency ? updateCustomEmergencyContact(editingEmergency.id, payload) : createCustomEmergencyContact(payload);
    },
    onSuccess: async () => {
      await invalidateContentQueries();
      toast({ title: editingEmergency ? "Emergency contact updated" : "Emergency contact created", description: "Emergency contacts have been updated." });
      setActiveDialog(null);
      setEditingEmergency(null);
      setEmergencyForm(emptyEmergencyForm());
    },
    onError: (error) => {
      toast({ title: "Could not save emergency contact", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  const featureMutation = useMutation({
    mutationFn: async () => {
      if (!featureForm.title.trim() || !featureForm.description.trim()) {
        throw new Error("Title and description are required.");
      }

      const payload = {
        title: featureForm.title.trim(),
        description: featureForm.description.trim(),
        details: featureForm.details.trim() || null,
        badge: featureForm.badge.trim() || null,
        href: featureForm.href.trim() || null,
        cta_label: featureForm.ctaLabel.trim() || null,
        icon_name: featureForm.iconName,
        is_external: featureForm.isExternal,
        display_order: parseOrder(featureForm.displayOrder),
        is_published: featureForm.isPublished,
      };

      return editingFeature ? updateAppFeatureCard(editingFeature.id, payload) : createAppFeatureCard(payload);
    },
    onSuccess: async () => {
      await invalidateContentQueries();
      toast({ title: editingFeature ? "Feature card updated" : "Feature card created", description: "Your app feature cards have been updated." });
      setActiveDialog(null);
      setEditingFeature(null);
      setFeatureForm(emptyFeatureForm());
    },
    onError: (error) => {
      toast({ title: "Could not save feature card", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!deleteTarget) return;
      if (deleteTarget.type === "disease") return deleteCustomDisease(deleteTarget.id);
      if (deleteTarget.type === "firstAid") return deleteCustomFirstAidGuide(deleteTarget.id);
      if (deleteTarget.type === "emergency") return deleteCustomEmergencyContact(deleteTarget.id);
      return deleteAppFeatureCard(deleteTarget.id);
    },
    onSuccess: async () => {
      await invalidateContentQueries();
      toast({ title: "Content removed", description: "The selected item has been deleted." });
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast({ title: "Delete failed", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  const loadingCount = useMemo(
    () => [diseasesQuery.data?.length || 0, firstAidQuery.data?.length || 0, emergencyQuery.data?.length || 0, featuresQuery.data?.length || 0].reduce((sum, count) => sum + count, 0),
    [diseasesQuery.data, firstAidQuery.data, emergencyQuery.data, featuresQuery.data],
  );

  const openDiseaseDialog = (entry?: CustomDiseaseEntry) => {
    setEditingDisease(entry || null);
    setDiseaseForm(entry ? {
      name: entry.name,
      category: entry.category,
      description: entry.description,
      symptoms: joinLines(entry.symptoms),
      causes: joinLines(entry.causes),
      prevention: joinLines(entry.prevention),
      treatment: joinLines(entry.treatment),
      riskFactors: joinLines(entry.risk_factors),
      whenToSeeDoctor: entry.when_to_see_doctor,
      displayOrder: String(entry.display_order),
      isPublished: entry.is_published,
    } : emptyDiseaseForm());
    setActiveDialog("disease");
  };

  const openFirstAidDialog = (entry?: CustomFirstAidGuideEntry) => {
    setEditingFirstAid(entry || null);
    setFirstAidForm(entry ? {
      title: entry.title,
      overview: entry.overview,
      severity: entry.severity,
      steps: joinLines(entry.steps),
      doNot: joinLines(entry.do_not),
      displayOrder: String(entry.display_order),
      isPublished: entry.is_published,
    } : emptyFirstAidForm());
    setActiveDialog("firstAid");
  };

  const openEmergencyDialog = (entry?: CustomEmergencyContactEntry) => {
    setEditingEmergency(entry || null);
    setEmergencyForm(entry ? {
      name: entry.name,
      number: entry.number,
      description: entry.description,
      country: entry.country || "",
      priority: entry.priority,
      displayOrder: String(entry.display_order),
      isPublished: entry.is_published,
    } : emptyEmergencyForm());
    setActiveDialog("emergency");
  };

  const openFeatureDialog = (entry?: AppFeatureCardEntry) => {
    setEditingFeature(entry || null);
    setFeatureForm(entry ? {
      title: entry.title,
      description: entry.description,
      details: entry.details || "",
      badge: entry.badge || "",
      href: entry.href || "",
      ctaLabel: entry.cta_label || "",
      iconName: (entry.icon_name as AppFeatureIconName) || "activity",
      displayOrder: String(entry.display_order),
      isPublished: entry.is_published,
      isExternal: entry.is_external,
    } : emptyFeatureForm());
    setActiveDialog("feature");
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Content Manager</CardTitle>
          <CardDescription>
            Add custom diseases, first aid guides, emergency contacts, and app feature cards without editing code.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <Badge variant="outline">{loadingCount} custom entries</Badge>
          <span>Built-in app content stays available, and these entries are added on top.</span>
        </CardContent>
      </Card>

      <Tabs defaultValue="diseases" className="space-y-6">
        <TabsList className="grid w-full max-w-3xl grid-cols-4">
          <TabsTrigger value="diseases">Diseases</TabsTrigger>
          <TabsTrigger value="first-aid">First Aid</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
          <TabsTrigger value="features">App Features</TabsTrigger>
        </TabsList>

        <TabsContent value="diseases">
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Disease Library Additions
                </CardTitle>
                <CardDescription>Add new disease entries that appear in the Learn page.</CardDescription>
              </div>
              <Button onClick={() => openDiseaseDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add disease
              </Button>
            </CardHeader>
            <CardContent>
              {diseasesQuery.isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading disease entries...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(diseasesQuery.data || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No custom disease entries yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      diseasesQuery.data?.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">{entry.name}</TableCell>
                          <TableCell>{entry.category}</TableCell>
                          <TableCell>{statusBadge(entry.is_published)}</TableCell>
                          <TableCell>{entry.display_order}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="sm" onClick={() => openDiseaseDialog(entry)}>
                              <Pencil className="mr-2 h-3.5 w-3.5" />
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => setDeleteTarget({ id: entry.id, label: entry.name, type: "disease" })}>
                              <Trash2 className="mr-2 h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="first-aid">
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <HeartPulse className="h-5 w-5 text-primary" />
                  First Aid Guide Additions
                </CardTitle>
                <CardDescription>Add extra step-by-step emergency procedures.</CardDescription>
              </div>
              <Button onClick={() => openFirstAidDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add guide
              </Button>
            </CardHeader>
            <CardContent>
              {firstAidQuery.isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading first aid guides...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(firstAidQuery.data || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No custom first aid guides yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      firstAidQuery.data?.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">{entry.title}</TableCell>
                          <TableCell className="capitalize">{entry.severity}</TableCell>
                          <TableCell>{statusBadge(entry.is_published)}</TableCell>
                          <TableCell>{entry.display_order}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="sm" onClick={() => openFirstAidDialog(entry)}>
                              <Pencil className="mr-2 h-3.5 w-3.5" />
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => setDeleteTarget({ id: entry.id, label: entry.title, type: "firstAid" })}>
                              <Trash2 className="mr-2 h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency">
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Emergency Contact Additions
                </CardTitle>
                <CardDescription>Add helplines and important emergency numbers.</CardDescription>
              </div>
              <Button onClick={() => openEmergencyDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add contact
              </Button>
            </CardHeader>
            <CardContent>
              {emergencyQuery.isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading emergency contacts...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Number</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(emergencyQuery.data || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No custom emergency contacts yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      emergencyQuery.data?.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">{entry.name}</TableCell>
                          <TableCell className="font-mono">{entry.number}</TableCell>
                          <TableCell className="capitalize">{entry.priority}</TableCell>
                          <TableCell>{statusBadge(entry.is_published)}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="sm" onClick={() => openEmergencyDialog(entry)}>
                              <Pencil className="mr-2 h-3.5 w-3.5" />
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => setDeleteTarget({ id: entry.id, label: entry.name, type: "emergency" })}>
                              <Trash2 className="mr-2 h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <LayoutPanelTop className="h-5 w-5 text-primary" />
                  App Feature Cards
                </CardTitle>
                <CardDescription>
                  Publish new feature cards that link to internal routes or external tools from inside the app.
                </CardDescription>
              </div>
              <Button onClick={() => openFeatureDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add feature card
              </Button>
            </CardHeader>
            <CardContent>
              {featuresQuery.isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading feature cards...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(featuresQuery.data || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No app feature cards yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      featuresQuery.data?.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">{entry.title}</TableCell>
                          <TableCell className="max-w-xs truncate text-muted-foreground">{entry.href || "Informational only"}</TableCell>
                          <TableCell>{statusBadge(entry.is_published)}</TableCell>
                          <TableCell>{entry.display_order}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="sm" onClick={() => openFeatureDialog(entry)}>
                              <Pencil className="mr-2 h-3.5 w-3.5" />
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => setDeleteTarget({ id: entry.id, label: entry.title, type: "feature" })}>
                              <Trash2 className="mr-2 h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={activeDialog === "disease"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDisease ? "Edit Disease Entry" : "Add Disease Entry"}</DialogTitle>
            <DialogDescription>New entries will be added to the existing disease library.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void diseaseMutation.mutateAsync(); }}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="disease-name">Disease name</Label>
                <Input id="disease-name" value={diseaseForm.name} onChange={(event) => setDiseaseForm((current) => ({ ...current, name: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="disease-category">Category</Label>
                <Input id="disease-category" value={diseaseForm.category} onChange={(event) => setDiseaseForm((current) => ({ ...current, category: event.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="disease-description">Description</Label>
              <Textarea id="disease-description" value={diseaseForm.description} onChange={(event) => setDiseaseForm((current) => ({ ...current, description: event.target.value }))} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="disease-symptoms">Symptoms</Label>
                <Textarea id="disease-symptoms" placeholder="One symptom per line" value={diseaseForm.symptoms} onChange={(event) => setDiseaseForm((current) => ({ ...current, symptoms: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="disease-causes">Causes</Label>
                <Textarea id="disease-causes" placeholder="One cause per line" value={diseaseForm.causes} onChange={(event) => setDiseaseForm((current) => ({ ...current, causes: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="disease-prevention">Prevention</Label>
                <Textarea id="disease-prevention" placeholder="One prevention tip per line" value={diseaseForm.prevention} onChange={(event) => setDiseaseForm((current) => ({ ...current, prevention: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="disease-treatment">Treatment</Label>
                <Textarea id="disease-treatment" placeholder="One treatment item per line" value={diseaseForm.treatment} onChange={(event) => setDiseaseForm((current) => ({ ...current, treatment: event.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="disease-risk">Risk factors</Label>
              <Textarea id="disease-risk" placeholder="One risk factor per line" value={diseaseForm.riskFactors} onChange={(event) => setDiseaseForm((current) => ({ ...current, riskFactors: event.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="disease-doctor">When to see a doctor</Label>
              <Textarea id="disease-doctor" value={diseaseForm.whenToSeeDoctor} onChange={(event) => setDiseaseForm((current) => ({ ...current, whenToSeeDoctor: event.target.value }))} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="disease-order">Display order</Label>
                <Input id="disease-order" type="number" value={diseaseForm.displayOrder} onChange={(event) => setDiseaseForm((current) => ({ ...current, displayOrder: event.target.value }))} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label htmlFor="disease-published">Published</Label>
                  <p className="text-xs text-muted-foreground">Turn off to save as draft.</p>
                </div>
                <Switch id="disease-published" checked={diseaseForm.isPublished} onCheckedChange={(checked) => setDiseaseForm((current) => ({ ...current, isPublished: checked }))} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setActiveDialog(null)}>Cancel</Button>
              <Button type="submit" disabled={diseaseMutation.isPending}>
                {diseaseMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save entry
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === "firstAid"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingFirstAid ? "Edit First Aid Guide" : "Add First Aid Guide"}</DialogTitle>
            <DialogDescription>Add more procedures to the first aid page.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void firstAidMutation.mutateAsync(); }}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first-aid-title">Title</Label>
                <Input id="first-aid-title" value={firstAidForm.title} onChange={(event) => setFirstAidForm((current) => ({ ...current, title: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select value={firstAidForm.severity} onValueChange={(value: "critical" | "high" | "medium") => setFirstAidForm((current) => ({ ...current, severity: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="first-aid-overview">Overview</Label>
              <Textarea id="first-aid-overview" value={firstAidForm.overview} onChange={(event) => setFirstAidForm((current) => ({ ...current, overview: event.target.value }))} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first-aid-steps">Steps</Label>
                <Textarea id="first-aid-steps" placeholder="One step per line" value={firstAidForm.steps} onChange={(event) => setFirstAidForm((current) => ({ ...current, steps: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="first-aid-do-not">Do not</Label>
                <Textarea id="first-aid-do-not" placeholder="One caution per line" value={firstAidForm.doNot} onChange={(event) => setFirstAidForm((current) => ({ ...current, doNot: event.target.value }))} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first-aid-order">Display order</Label>
                <Input id="first-aid-order" type="number" value={firstAidForm.displayOrder} onChange={(event) => setFirstAidForm((current) => ({ ...current, displayOrder: event.target.value }))} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label htmlFor="first-aid-published">Published</Label>
                  <p className="text-xs text-muted-foreground">Turn off to keep it hidden.</p>
                </div>
                <Switch id="first-aid-published" checked={firstAidForm.isPublished} onCheckedChange={(checked) => setFirstAidForm((current) => ({ ...current, isPublished: checked }))} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setActiveDialog(null)}>Cancel</Button>
              <Button type="submit" disabled={firstAidMutation.isPending}>
                {firstAidMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save guide
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === "emergency"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEmergency ? "Edit Emergency Contact" : "Add Emergency Contact"}</DialogTitle>
            <DialogDescription>Add new helplines or local emergency contacts.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void emergencyMutation.mutateAsync(); }}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="emergency-name">Name</Label>
                <Input id="emergency-name" value={emergencyForm.name} onChange={(event) => setEmergencyForm((current) => ({ ...current, name: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency-number">Phone number</Label>
                <Input id="emergency-number" value={emergencyForm.number} onChange={(event) => setEmergencyForm((current) => ({ ...current, number: event.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency-description">Description</Label>
              <Textarea id="emergency-description" value={emergencyForm.description} onChange={(event) => setEmergencyForm((current) => ({ ...current, description: event.target.value }))} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="emergency-country">Country or region</Label>
                <Input id="emergency-country" value={emergencyForm.country} onChange={(event) => setEmergencyForm((current) => ({ ...current, country: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={emergencyForm.priority} onValueChange={(value: "critical" | "high" | "medium") => setEmergencyForm((current) => ({ ...current, priority: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="emergency-order">Display order</Label>
                <Input id="emergency-order" type="number" value={emergencyForm.displayOrder} onChange={(event) => setEmergencyForm((current) => ({ ...current, displayOrder: event.target.value }))} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label htmlFor="emergency-published">Published</Label>
                  <p className="text-xs text-muted-foreground">Turn off to hide it from users.</p>
                </div>
                <Switch id="emergency-published" checked={emergencyForm.isPublished} onCheckedChange={(checked) => setEmergencyForm((current) => ({ ...current, isPublished: checked }))} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setActiveDialog(null)}>Cancel</Button>
              <Button type="submit" disabled={emergencyMutation.isPending}>
                {emergencyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save contact
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === "feature"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingFeature ? "Edit Feature Card" : "Add Feature Card"}</DialogTitle>
            <DialogDescription>Feature cards can point to internal app routes or external tools and resources.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void featureMutation.mutateAsync(); }}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="feature-title">Title</Label>
                <Input id="feature-title" value={featureForm.title} onChange={(event) => setFeatureForm((current) => ({ ...current, title: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feature-badge">Badge</Label>
                <Input id="feature-badge" placeholder="Optional" value={featureForm.badge} onChange={(event) => setFeatureForm((current) => ({ ...current, badge: event.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feature-description">Description</Label>
              <Textarea id="feature-description" value={featureForm.description} onChange={(event) => setFeatureForm((current) => ({ ...current, description: event.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feature-details">Extra details</Label>
              <Textarea id="feature-details" placeholder="Optional supporting details" value={featureForm.details} onChange={(event) => setFeatureForm((current) => ({ ...current, details: event.target.value }))} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="feature-href">Route or URL</Label>
                <Input id="feature-href" placeholder="/new-tool or https://example.com" value={featureForm.href} onChange={(event) => setFeatureForm((current) => ({ ...current, href: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feature-cta">CTA label</Label>
                <Input id="feature-cta" placeholder="Open feature" value={featureForm.ctaLabel} onChange={(event) => setFeatureForm((current) => ({ ...current, ctaLabel: event.target.value }))} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Icon</Label>
                <Select value={featureForm.iconName} onValueChange={(value: AppFeatureIconName) => setFeatureForm((current) => ({ ...current, iconName: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {appFeatureIconOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="feature-order">Display order</Label>
                <Input id="feature-order" type="number" value={featureForm.displayOrder} onChange={(event) => setFeatureForm((current) => ({ ...current, displayOrder: event.target.value }))} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label htmlFor="feature-published">Published</Label>
                  <p className="text-xs text-muted-foreground">Show this feature card in the app.</p>
                </div>
                <Switch id="feature-published" checked={featureForm.isPublished} onCheckedChange={(checked) => setFeatureForm((current) => ({ ...current, isPublished: checked }))} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label htmlFor="feature-external">External link</Label>
                  <p className="text-xs text-muted-foreground">Enable if the card opens another website.</p>
                </div>
                <Switch id="feature-external" checked={featureForm.isExternal} onCheckedChange={(checked) => setFeatureForm((current) => ({ ...current, isExternal: checked }))} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setActiveDialog(null)}>Cancel</Button>
              <Button type="submit" disabled={featureMutation.isPending}>
                {featureMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save feature card
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete content item?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? `This will permanently remove ${deleteTarget.label} from the admin-managed content library.` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={(event) => { event.preventDefault(); void deleteMutation.mutateAsync(); }}>
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminContentManager;
