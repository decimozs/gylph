import { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Send } from "lucide-react";
import ActionsButton from "./actions-button";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function SendReview({ overallId }: { overallId: string }) {
  const [route, setRoute] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getNote = (value: string) => {
    switch (value) {
      case "claims-processor":
        return "Ideal for 'Low' suspicion claims. This sends the data for standard digital extraction and final approval routing.";
      case "doctor-checker":
        return "Recommended for 'Moderate' flags. A specialist will verify the medical description and technical terminology used.";
      case "fraud-unit":
        return "Urgent: For 'Highly Suspicious' claims showing signature duplication or significant statistical anomalies.";
      default:
        return "Please select a destination to see the routing priority note.";
    }
  };

  const handleSubmit = async () => {
    if (!route || !overallId || isSubmitting) return;

    setIsSubmitting(true);
    const toastId = toast.loading("Sending a review...");

    try {
      const formData = new FormData();
      formData.append("route", route);
      formData.append("id", overallId);

      const res = await fetch(
        `${import.meta.env.VITE_N8N_BASE_URL}/reviews/send`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!res.ok) throw new Error("Failed to send");

      toast.success("Review sent successfully", { id: toastId });
      setOpen(false);
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("An error occurred during the sending review.", {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setRoute("");
      setIsSubmitting(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div>
          <ActionsButton
            props={{
              icon: Send,
              label: "Send for review",
            }}
          />
        </div>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Route Claim for Review</DialogTitle>
          <DialogDescription>
            Select the appropriate department to handle this claim based on the
            AI suspicion score. This action will be logged in the audit trail.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Select value={route} onValueChange={setRoute}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select destination department" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="claims-processor">
                  Claims Approval Processor
                </SelectItem>
                <SelectItem value="doctor-checker">
                  Doctor Claims Checker
                </SelectItem>
                <SelectItem value="fraud-unit">
                  Fraud Investigation Unit (FIU)
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {route && (
            <div className="w-full p-4 bg-primary/30 rounded-md">
              <p className="mb-1 font-medium">Note</p>
              <p className="leading-relaxed">{getNote(route)}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="lg">
              Cancel
            </Button>
          </DialogClose>

          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!route || isSubmitting}
          >
            {isSubmitting && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            {isSubmitting ? "Sending..." : "Route Document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
