import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Eye,
  EyeOff,
  Loader2,
  Pill,
  Shield,
  ShieldAlert,
  UserCog,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import PageTransition from "@/components/animations/PageTransition";
import AdminRoute from "@/components/admin/AdminRoute";
import AdminModerationDialog from "@/components/admin/AdminModerationDialog";
import AdminContentManager from "@/components/admin/AdminContentManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  AdminAuditLog,
  AdminUserDetail,
  getAdminOverview,
  getAdminUserDetail,
  listAdminAuditLogs,
  listAdminUsers,
  setAdminUserStatus,
  setMedicationReminderStatus,
  setPredictionVisibility,
} from "@/lib/admin";
import { getFrequencyLabel } from "@/lib/medicationReminders";

type ModerationTarget =
  | { type: "user"; id: string; nextState: boolean; label: string }
  | { type: "prediction"; id: string; nextState: boolean; label: string }
  | { type: "reminder"; id: string; nextState: boolean; label: string }
  | null;

const Admin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [auditActionFilter, setAuditActionFilter] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [moderationTarget, setModerationTarget] = useState<ModerationTarget>(null);

  const overviewQuery = useQuery({
    queryKey: ["admin-overview"],
    queryFn: getAdminOverview,
  });

  const usersQuery = useQuery({
    queryKey: ["admin-users", searchTerm, statusFilter],
    queryFn: () => listAdminUsers(searchTerm.trim(), statusFilter),
  });

  const auditsQuery = useQuery({
    queryKey: ["admin-audits", auditActionFilter],
    queryFn: () => listAdminAuditLogs(auditActionFilter === "all" ? "" : auditActionFilter),
  });

  const selectedUserQuery = useQuery({
    queryKey: ["admin-user-detail", selectedUserId],
    queryFn: () => getAdminUserDetail(selectedUserId!),
    enabled: Boolean(selectedUserId),
  });

  const moderationMutation = useMutation({
    mutationFn: async ({ target, reason }: { target: NonNullable<ModerationTarget>; reason: string }) => {
      if (target.type === "user") {
        return setAdminUserStatus(target.id, target.nextState, reason);
      }

      if (target.type === "prediction") {
        return setPredictionVisibility(target.id, !target.nextState, reason);
      }

      return setMedicationReminderStatus(target.id, target.nextState, reason);
    },
    onSuccess: () => {
      toast({
        title: "Admin action saved",
        description: "The record was updated and the action was logged.",
      });
      setModerationTarget(null);
      void queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-audits"] });
      if (selectedUserId) {
        void queryClient.invalidateQueries({ queryKey: ["admin-user-detail", selectedUserId] });
      }
    },
    onError: (error) => {
      toast({
        title: "Admin action failed",
        description: error instanceof Error ? error.message : "The action could not be completed.",
        variant: "destructive",
      });
    },
  });

  const actionOptions = useMemo(
    () => [
      "all",
      "deactivate_user",
      "reactivate_user",
      "hide_prediction",
      "unhide_prediction",
      "deactivate_medication_reminder",
      "reactivate_medication_reminder",
    ],
    [],
  );

  const renderAuditRows = (logs: AdminAuditLog[]) => {
    if (logs.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center text-muted-foreground">
            No audit entries found.
          </TableCell>
        </TableRow>
      );
    }

    return logs.map((log) => (
      <TableRow key={log.id}>
        <TableCell>{format(new Date(log.created_at), "MMM d, yyyy h:mm a")}</TableCell>
        <TableCell className="font-medium">{log.admin_name}</TableCell>
        <TableCell>{log.action}</TableCell>
        <TableCell>{log.target_user_name}</TableCell>
        <TableCell className="max-w-xs text-muted-foreground">{log.reason || "No reason provided"}</TableCell>
      </TableRow>
    ));
  };

  const detail = selectedUserQuery.data as AdminUserDetail | undefined;

  return (
    <AdminRoute>
      <Layout>
        <PageTransition>
          <div className="container py-8 md:py-12">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Shield className="h-8 w-8 text-primary" />
                    Admin Console
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Manage operations safely with audit trails and moderation controls.
                  </p>
                </div>
                <Badge variant="outline" className="px-3 py-1 text-sm">
                  Internal Admin
                </Badge>
              </div>

              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full max-w-3xl grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="audit">Audit Log</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    {[
                      { label: "Total Users", value: overviewQuery.data?.total_users, icon: UserCog },
                      { label: "Active Users", value: overviewQuery.data?.active_users, icon: Shield },
                      { label: "Hidden Predictions", value: overviewQuery.data?.hidden_predictions, icon: EyeOff },
                      { label: "Active Reminders", value: overviewQuery.data?.active_reminders, icon: Pill },
                      { label: "Admins", value: overviewQuery.data?.admin_count, icon: ShieldAlert },
                    ].map(({ label, value, icon: Icon }) => (
                      <Card key={label} className="border-border/50">
                        <CardHeader className="pb-3">
                          <CardDescription>{label}</CardDescription>
                          <CardTitle className="flex items-center justify-between">
                            <span className="text-3xl">{overviewQuery.isLoading ? "…" : value ?? 0}</span>
                            <Icon className="h-5 w-5 text-muted-foreground" />
                          </CardTitle>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>

                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle>Recent Admin Actions</CardTitle>
                      <CardDescription>Latest moderation and account management activity.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {overviewQuery.isLoading ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading admin overview...
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>When</TableHead>
                              <TableHead>Admin</TableHead>
                              <TableHead>Action</TableHead>
                              <TableHead>User</TableHead>
                              <TableHead>Reason</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>{renderAuditRows(overviewQuery.data?.recent_actions || [])}</TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="users" className="space-y-6">
                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle>User Operations</CardTitle>
                      <CardDescription>Search accounts, review activity, and moderate safely.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-3 flex-wrap">
                        <Input
                          placeholder="Search by name, email, or phone"
                          value={searchTerm}
                          onChange={(event) => setSearchTerm(event.target.value)}
                          className="max-w-sm"
                        />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All accounts</SelectItem>
                            <SelectItem value="active">Active only</SelectItem>
                            <SelectItem value="inactive">Inactive only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {usersQuery.isLoading ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading users...
                        </div>
                      ) : usersQuery.isError ? (
                        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                          <p className="font-medium">Could not load users.</p>
                          <p className="mt-1">
                            {usersQuery.error instanceof Error
                              ? usersQuery.error.message
                              : "The admin user list request failed."}
                          </p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>User</TableHead>
                              <TableHead>Phone</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Predictions</TableHead>
                              <TableHead>Reminders</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(usersQuery.data || []).length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                  No matching users found.
                                </TableCell>
                              </TableRow>
                            ) : (
                              usersQuery.data?.map((user) => (
                                <TableRow key={user.user_id}>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium">{user.full_name || "Unnamed user"}</p>
                                      <p className="text-xs text-muted-foreground">{user.email || "No email"}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell>{user.phone_number || "—"}</TableCell>
                                  <TableCell>
                                    <Badge variant={user.is_account_active ? "default" : "secondary"}>
                                      {user.is_account_active ? "Active" : "Inactive"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{user.predictions_count}</TableCell>
                                  <TableCell>{user.active_reminders_count}</TableCell>
                                  <TableCell className="text-right space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => setSelectedUserId(user.user_id)}>
                                      View
                                    </Button>
                                    <Button
                                      variant={user.is_account_active ? "destructive" : "default"}
                                      size="sm"
                                      onClick={() =>
                                        setModerationTarget({
                                          type: "user",
                                          id: user.user_id,
                                          nextState: !user.is_account_active,
                                          label: user.full_name || user.email || "this user",
                                        })
                                      }
                                    >
                                      {user.is_account_active ? "Deactivate" : "Reactivate"}
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

                <TabsContent value="audit" className="space-y-6">
                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle>Audit Log</CardTitle>
                      <CardDescription>Every admin mutation is recorded here.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Select value={auditActionFilter} onValueChange={setAuditActionFilter}>
                        <SelectTrigger className="w-[280px]">
                          <SelectValue placeholder="Filter action" />
                        </SelectTrigger>
                        <SelectContent>
                          {actionOptions.map((action) => (
                            <SelectItem key={action} value={action}>
                              {action === "all" ? "All actions" : action}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {auditsQuery.isLoading ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading audit log...
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>When</TableHead>
                              <TableHead>Admin</TableHead>
                              <TableHead>Action</TableHead>
                              <TableHead>User</TableHead>
                              <TableHead>Reason</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>{renderAuditRows(auditsQuery.data || [])}</TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="content" className="space-y-6">
                  <AdminContentManager />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </PageTransition>
      </Layout>

      <Dialog open={Boolean(selectedUserId)} onOpenChange={(open) => !open && setSelectedUserId(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Detail</DialogTitle>
            <DialogDescription>
              Review profile, predictions, medication reminders, and moderation history for this user.
            </DialogDescription>
          </DialogHeader>

          {selectedUserQuery.isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-8">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading user detail...
            </div>
          ) : selectedUserQuery.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              <p className="font-medium">Could not load user detail.</p>
              <p className="mt-1">
                {selectedUserQuery.error instanceof Error
                  ? selectedUserQuery.error.message
                  : "The selected user detail request failed."}
              </p>
            </div>
          ) : !detail ? (
            <div className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
              User details are unavailable for this account.
            </div>
          ) : (
            <div className="space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>{detail.user.full_name || "Unnamed user"}</CardTitle>
                  <CardDescription>{detail.user.email || "No email address available"}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Phone:</span> {detail.user.phone_number || "—"}</p>
                    <p><span className="font-medium">Created:</span> {format(new Date(detail.user.created_at), "MMM d, yyyy h:mm a")}</p>
                    <p><span className="font-medium">Last sign-in:</span> {detail.user.last_sign_in_at ? format(new Date(detail.user.last_sign_in_at), "MMM d, yyyy h:mm a") : "—"}</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Status:</span> {detail.user.is_account_active ? "Active" : "Inactive"}</p>
                    <p><span className="font-medium">Blood type:</span> {detail.user.blood_type || "—"}</p>
                    <p><span className="font-medium">Conditions:</span> {detail.user.medical_conditions || "—"}</p>
                    {detail.user.account_status_reason && (
                      <p><span className="font-medium">Status reason:</span> {detail.user.account_status_reason}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Saved Predictions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {detail.predictions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No predictions saved.</p>
                  ) : (
                    detail.predictions.map((prediction) => (
                      <div key={prediction.id} className="rounded-xl border border-border p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium">
                              {prediction.prediction_type === "symptom" ? "Symptom Analysis" : "Report Analysis"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {prediction.summary || "No summary available"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {format(new Date(prediction.created_at), "MMM d, yyyy h:mm a")}
                            </p>
                            {prediction.hidden_reason && (
                              <p className="text-xs text-destructive mt-1">
                                Hidden reason: {prediction.hidden_reason}
                              </p>
                            )}
                          </div>
                          <Button
                            variant={prediction.is_hidden ? "outline" : "destructive"}
                            size="sm"
                            onClick={() =>
                              setModerationTarget({
                                type: "prediction",
                                id: prediction.id,
                                nextState: prediction.is_hidden,
                                label: "this prediction",
                              })
                            }
                          >
                            {prediction.is_hidden ? (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                Unhide
                              </>
                            ) : (
                              <>
                                <EyeOff className="mr-2 h-4 w-4" />
                                Hide
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Medication Reminders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {detail.medication_reminders.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No medication reminders found.</p>
                  ) : (
                    detail.medication_reminders.map((reminder) => (
                      <div key={reminder.id} className="rounded-xl border border-border p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium">{reminder.medication_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {reminder.dosage} • {getFrequencyLabel(reminder.frequency)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Times: {reminder.reminder_times.join(", ")}
                            </p>
                            {reminder.status_reason && (
                              <p className="text-xs text-destructive mt-1">
                                Status reason: {reminder.status_reason}
                              </p>
                            )}
                          </div>
                          <Button
                            variant={reminder.is_active ? "destructive" : "outline"}
                            size="sm"
                            onClick={() =>
                              setModerationTarget({
                                type: "reminder",
                                id: reminder.id,
                                nextState: !reminder.is_active,
                                label: reminder.medication_name,
                              })
                            }
                          >
                            {reminder.is_active ? "Deactivate" : "Reactivate"}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Recent Medication Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  {detail.medication_logs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No medication logs found.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Taken At</TableHead>
                          <TableHead>Scheduled Time</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detail.medication_logs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>{format(new Date(log.taken_at), "MMM d, yyyy h:mm a")}</TableCell>
                            <TableCell>{log.scheduled_time || "—"}</TableCell>
                            <TableCell>{log.skipped ? "Skipped" : "Taken"}</TableCell>
                            <TableCell>{log.notes || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AdminModerationDialog
        open={Boolean(moderationTarget)}
        onOpenChange={(open) => !open && setModerationTarget(null)}
        title={
          moderationTarget?.type === "user"
            ? moderationTarget.nextState
              ? "Reactivate user"
              : "Deactivate user"
            : moderationTarget?.type === "prediction"
            ? moderationTarget.nextState
              ? "Unhide prediction"
              : "Hide prediction"
            : moderationTarget?.nextState
            ? "Reactivate reminder"
            : "Deactivate reminder"
        }
        description={
          moderationTarget
            ? `You're about to update ${moderationTarget.label}. This action will be logged for audit purposes.`
            : ""
        }
        requireReason={
          Boolean(
            moderationTarget &&
              ((moderationTarget.type === "user" && moderationTarget.nextState === false) ||
                (moderationTarget.type === "prediction" && moderationTarget.nextState === false) ||
                (moderationTarget.type === "reminder" && moderationTarget.nextState === false)),
          )
        }
        confirmLabel="Confirm Action"
        loading={moderationMutation.isPending}
        onConfirm={async (reason) => {
          if (!moderationTarget) return;
          await moderationMutation.mutateAsync({
            target: moderationTarget,
            reason,
          });
        }}
      />
    </AdminRoute>
  );
};

export default Admin;
