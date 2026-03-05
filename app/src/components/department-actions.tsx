import { Check, CircleQuestionMark, Copy } from "lucide-react";
import { Button } from "./ui/button";
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
import type {
  Document,
  OverallScore,
  Signature,
  Verification,
} from "@/lib/types";
import { ScrollArea } from "./ui/scroll-area";
import { Link } from "@tanstack/react-router";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { useState } from "react";

function ClaimsProcessorActions() {
  return (
    <div className="flex flex-col gap-3">
      <Dialog>
        <DialogTrigger asChild>
          <Button size="lg">Approve Claim</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Claim Approval</DialogTitle>
            <DialogDescription>
              This will mark the digitized claim data as verified and move it to
              the final processing stage. Only perform this if the OCR
              extraction appears accurate.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="lg">
                Cancel
              </Button>
            </DialogClose>
            <Button size="lg">Confirm Approval</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button size="lg" variant="secondary">
            Send to Manual Review
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Manual Review</DialogTitle>
            <DialogDescription>
              This will flag the claim for a senior processor to review. Use
              this if the OCR output is unreadable or the form data is
              incomplete.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="lg">
                Cancel
              </Button>
            </DialogClose>
            <Button size="lg">Confirm Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DoctorCheckerActions() {
  return (
    <div className="flex flex-col gap-3">
      <Dialog>
        <DialogTrigger asChild>
          <Button size="lg">Verify Medical Logic</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Clinical Verification</DialogTitle>
            <DialogDescription>
              This confirms that the medical description and jargon used align
              with professional standards, despite any automated flags for
              suspicious sentence patterns.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="lg">
                Cancel
              </Button>
            </DialogClose>
            <Button size="lg">Confirm Verification</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button size="lg" variant="secondary">
            Request More Information
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Clinical Clarification</DialogTitle>
            <DialogDescription>
              This will notify the claimant to provide additional medical
              context. Use this if the NLP analysis shows excessive
              non-technical jargon that requires doctor explanation.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="lg">
                Cancel
              </Button>
            </DialogClose>
            <Button size="lg">Send Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FraudUnitActions() {
  return (
    <div className="flex flex-col gap-3">
      <Dialog>
        <DialogTrigger asChild>
          <Button size="lg" variant="destructive">
            Flag as Fraudulent
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Fraud Flag</DialogTitle>
            <DialogDescription>
              This action will route the claim to the investigation queue. Use
              this if signature pixel duplication is detected or statistical
              anomalies are confirmed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="lg">
                Cancel
              </Button>
            </DialogClose>
            <Button size="lg" variant="destructive">
              Confirm Fraud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button size="lg" variant="secondary">
            Clear from Suspicion
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dismiss Fraud Suspicion</DialogTitle>
            <DialogDescription>
              This will override high-suspicion rankings and move the claim back
              to the approval queue. Use this if the signature is verified as an
              authentic historical deviation.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="lg">
                Cancel
              </Button>
            </DialogClose>
            <Button size="lg">Confirm Clear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function DepartmentActions({
  department,
  metadata,
}: {
  department: string;
  metadata?: Document & {
    signature: Signature;
    verification: Verification;
    overall: OverallScore;
  };
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id || "");
      setCopiedId(id);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast.error("Failed to copy");
    }
  };

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

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-muted/30 rounded-md p-4 px-6 flex flex-col gap-4 overflow-y-auto h-fit pb-6">
        <div className="">
          <p className="text-2xl capitalize">Actions</p>
        </div>
        {department === "claims-processor" && <ClaimsProcessorActions />}
        {department === "doctor-checker" && <DoctorCheckerActions />}
        {department === "fraud-unit" && <FraudUnitActions />}
      </div>

      <div className="bg-primary/30 rounded-md p-4 px-6 flex flex-col gap-4 overflow-y-auto h-fit pb-6">
        <div>
          <div className="flex flex-row items-center gap-2 mb-3">
            <CircleQuestionMark />
            <p className="text-2xl">Note</p>
          </div>
          <p>{getNote(department)}</p>
        </div>
      </div>

      <ScrollArea className="bg-muted/30 rounded-md p-4 overflow-y-auto px-6">
        <div className="flex flex-col gap-4 overflow-y-auto h-full">
          <p className="text-2xl">
            Document #{metadata?.no}{" "}
            <span className="text-primary">(DCM - {metadata?.no})</span>{" "}
          </p>
          <Separator />
          <div className="flex flex-col gap-1">
            <p>Document Id</p>
            <div
              onClick={() => handleCopyId(metadata?.id || "")}
              className="flex flex-row items-center justify-between border border-dashed px-4 py-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors group"
            >
              <p className="text-sm font-mono truncate max-w-50">
                {metadata?.id}
              </p>
              {copiedId === metadata?.id ? (
                <Check className="size-4 text-primary" />
              ) : (
                <Copy className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </div>
          </div>

          {metadata?.verification.status === "authentic" && (
            <div className="flex flex-col gap-1">
              <p>Signature by</p>
              <Link
                to="/signatures/$id"
                className="w-fit hover:underline hover:text-primary transition-colors"
                params={{ id: metadata?.signatureId || "" }}
              >
                {metadata?.signature.name || ""}
              </Link>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <p>Filename</p>
            <p className="truncate max-w-75">{metadata?.name || "N/A"}</p>
          </div>

          <div className="flex flex-col gap-1">
            <p>Created at</p>
            <p>
              {new Date(metadata?.createdAt || "").toLocaleString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <p>Last updated</p>
            <p>
              {new Date(metadata?.updatedAt || "").toLocaleString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
