import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface AdminModerationDialogProps {
  open: boolean;
  title: string;
  description: string;
  requireReason?: boolean;
  confirmLabel: string;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => Promise<void> | void;
}

const AdminModerationDialog = ({
  open,
  title,
  description,
  requireReason = false,
  confirmLabel,
  loading = false,
  onOpenChange,
  onConfirm,
}: AdminModerationDialogProps) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) {
      setReason("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="admin-reason">
            Reason {requireReason ? "(required)" : "(optional)"}
          </Label>
          <Textarea
            id="admin-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Add context for this admin action"
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={() => void onConfirm(reason.trim())}
            disabled={loading || (requireReason && !reason.trim())}
            className="gradient-primary text-primary-foreground"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminModerationDialog;
