import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Loader2, Send, CheckCircle } from "lucide-react";
import { z } from "zod";

interface ShareReportDialogProps {
  reportData: {
    type: string;
    input: string;
    predictions: any[];
    summary?: string;
    date: string;
  };
  trigger?: React.ReactNode;
}

const emailSchema = z.string().trim().email("Please enter a valid email address");

const ShareReportDialog = ({ reportData, trigger }: ShareReportDialogProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [patientNote, setPatientNote] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleSend = async () => {
    setError("");
    
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setSending(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("send-report-email", {
        body: {
          to: email,
          doctorName: doctorName.trim() || undefined,
          patientNote: patientNote.trim() || undefined,
          report: reportData,
        },
      });

      if (fnError) throw fnError;

      setSent(true);
      toast({
        title: "Report sent!",
        description: `Your health report has been sent to ${email}`,
      });

      // Reset after 2 seconds
      setTimeout(() => {
        setOpen(false);
        setSent(false);
        setEmail("");
        setDoctorName("");
        setPatientNote("");
      }, 2000);
    } catch (err: any) {
      console.error("Error sending email:", err);
      
      // Parse edge function error response
      let errorMessage = "There was an error sending the report. Please try again.";
      try {
        if (err?.context?.body) {
          const body = typeof err.context.body === 'string' ? JSON.parse(err.context.body) : err.context.body;
          if (body?.error) errorMessage = body.error;
        } else if (err?.message) {
          errorMessage = err.message;
        }
      } catch {}
      
      toast({
        title: "Failed to send",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Mail className="h-4 w-4" />
            Email Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Share Report via Email
          </DialogTitle>
          <DialogDescription>
            Send your health analysis report to your doctor or healthcare provider.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="py-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <h3 className="font-medium text-lg mb-2">Report Sent!</h3>
            <p className="text-sm text-muted-foreground">
              Your health report has been sent to {email}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Recipient Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="doctor@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  disabled={sending}
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctorName">Doctor's Name (optional)</Label>
                <Input
                  id="doctorName"
                  placeholder="Dr. John Smith"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  disabled={sending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="patientNote">Personal Note (optional)</Label>
                <Textarea
                  id="patientNote"
                  placeholder="Add any additional context or questions for your doctor..."
                  value={patientNote}
                  onChange={(e) => setPatientNote(e.target.value)}
                  rows={3}
                  disabled={sending}
                />
              </div>

              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <p className="font-medium mb-1">Report includes:</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Analysis type: {reportData.type === "symptom" ? "Symptom Analysis" : "Report Analysis"}</li>
                  <li>• {reportData.predictions?.length || 0} predicted conditions</li>
                  <li>• Date: {reportData.date}</li>
                  {reportData.summary && <li>• AI-generated summary</li>}
                </ul>
              </div>
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm">
                <p className="font-medium text-primary mb-1">📧 Email Info</p>
                <p className="text-muted-foreground">
                  The report will be sent from MediBrief's shared email address. The recipient will receive a professionally formatted health report.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={sending}>
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={sending || !email}
                className="gradient-primary text-primary-foreground"
              >
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Report
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShareReportDialog;
