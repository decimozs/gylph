import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { signatureQueries } from "@/hooks/use-signature";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Activity,
  BadgeAlert,
  BadgeCheck,
  BadgeHelp,
  Check,
  Copy,
  Crop,
  Fullscreen,
  Image,
  ImageUp,
  Signature,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export const Route = createFileRoute("/_dashboard/signatures/$id/")({
  loader: async ({ context, params }) => {
    return context.queryClient.ensureQueryData(
      signatureQueries.getById(params.id),
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data: signature } = useSuspenseQuery(signatureQueries.getById(id));
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    label: string;
    description: string;
    bg: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const originalImage = signature.imageUrl;
  const visImage = signature.logs.find((log) => log.type === "vis")?.imageUrl;
  const roiImage = signature.logs.find((log) => log.type === "roi")?.imageUrl;
  const normalizedImage = signature.logs.find(
    (log) => log.type === "normalized",
  )?.imageUrl;

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast.error("Failed to copy");
    }
  };

  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const id = e.dataTransfer.getData("signatureId");

    if (id) {
      navigate({ to: "/signatures/$id", params: { id } });
    }
  };

  const getVerificationStatus = (score: number) => {
    const numScore = parseFloat(String(score));

    if (numScore >= 0.8)
      return {
        label: "Authentic",
        colorClass: "bg-blue-500",
        borderClass: "bg-blue-50 border-blue-200",
        textClass: "text-blue-700",
        icon: <BadgeCheck className="text-white" size={18} />,
      };

    if (numScore >= 0.7)
      return {
        label: "Requires Review",
        colorClass: "bg-orange-500",
        borderClass: "bg-orange-50 border-orange-200",
        textClass: "text-orange-700",
        icon: <BadgeHelp className="text-white" size={18} />,
      };

    return {
      label: "Rejected",
      colorClass: "bg-red-500",
      borderClass: "bg-red-50 border-red-200",
      textClass: "text-red-700",
      icon: <BadgeAlert className="text-white" size={18} />,
    };
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={handleDrop}
      className={`bg-muted/30 rounded-md h-full p-4 flex flex-col gap-4 ${isDraggingOver ? "border-2 border-dashed border-primary bg-primary/10" : ""}`}
    >
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          <div className="bg-muted p-2 rounded-md w-fit">
            <Signature className="text-primary" />
          </div>
          <p className="text-2xl">
            Signature by {signature.name}{" "}
            <span className="text-primary">(SIG - {signature.no})</span>
          </p>
        </div>
        <div
          onClick={handleCopyId}
          className="flex flex-row items-center gap-3 border border-dashed px-4 py-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors group"
        >
          <p className="text-sm font-mono">Id: {id}</p>
          {copied ? (
            <Check className="size-4 text-primary" />
          ) : (
            <Copy className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
          )}
        </div>
      </div>
      <Separator />
      <div className="flex flex-row items-center gap-2">
        <Sheet modal={false}>
          <SheetTrigger asChild>
            <Button variant="outline">Logs</Button>
          </SheetTrigger>
          <SheetContent className="min-w-125">
            <SheetHeader>
              <SheetTitle>Processing Logs</SheetTitle>
              <SheetDescription>
                Detailed logs of each step in the signature processing pipeline,
                including timestamps, status updates, and any errors encountered
                during the contourization, ROI extraction, and normalization
                stages.
              </SheetDescription>
            </SheetHeader>
            {signature.logs.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Activity className="text-muted-foreground" />
                    </EmptyMedia>
                    <EmptyTitle>No Activity Logs</EmptyTitle>
                    <EmptyDescription>
                      Processing history for ROI extraction and neural network
                      normalization is currently empty. Logs will generate
                      automatically during the next verification sequence.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </div>
            ) : (
              <>
                <Separator className="mx-6 mb-6" />
                <ScrollArea className="px-6 flex flex-col gap-2 overflow-y-auto flex-1 rounded-md">
                  {signature.logs.map((log, index) => {
                    const logDescriptions = {
                      roi: "Signature extracted based on its rect bound points.",
                      vis: "Visual processing overlay applied.",
                      preview: "Generating high-resolution preview.",
                      normalized: "Image normalized for Siamese network input.",
                      default: "Processing step completed.",
                    };
                    const description =
                      logDescriptions[log.type] || logDescriptions.default;
                    return (
                      <div
                        key={index}
                        className="p-4 border rounded-md mb-2 bg-input/30"
                      >
                        <div className="text-sm font-mono grid grid-cols-[100px_1fr] gap-1">
                          <p className="text-primary">
                            [ {new Date(log.createdAt).toLocaleTimeString()}{" "}
                            ]{" "}
                          </p>
                          <p> {description}</p>
                        </div>
                      </div>
                    );
                  })}
                </ScrollArea>
              </>
            )}
            <SheetFooter></SheetFooter>
          </SheetContent>
        </Sheet>
        <Sheet modal={false}>
          <SheetTrigger asChild>
            <Button variant="outline">Verifications</Button>
          </SheetTrigger>
          <SheetContent className="min-w-125">
            <SheetHeader>
              <SheetTitle>Verification History</SheetTitle>
              <SheetDescription>
                A chronological log of all verification attempts for this
                signature, including timestamps, outcomes (success/failure), and
                any relevant notes or metadata associated with each attempt.
              </SheetDescription>
            </SheetHeader>
            {signature.verifications.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <BadgeCheck className="text-muted-foreground" />
                    </EmptyMedia>
                    <EmptyTitle>No Verifications Yet</EmptyTitle>
                    <EmptyDescription>
                      This signature hasn't been used for any document checks.
                      Once you perform a verification, the history and
                      similarity scores will appear here.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </div>
            ) : (
              <>
                <Separator className="mx-6 mb-6" />
                <ScrollArea className="px-6 flex flex-col gap-2 overflow-y-auto flex-1 rounded-md">
                  {signature.verifications.map((verification, index) => {
                    const status = getVerificationStatus(
                      verification.similarityScore,
                    );
                    return (
                      <Link
                        to="/verifications/$id"
                        params={{ id: verification.id }}
                        key={index}
                        className={`p-4 border rounded-md mb-2 flex items-start gap-4 bg-input/30 hover:border-primary transition-all`}
                      >
                        <div
                          className={`p-1.5 rounded-full shrink-0 ${status.colorClass}`}
                          title={status.label}
                        >
                          {status.icon}
                        </div>

                        <div className="text-sm font-mono flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-primary">
                              [{" "}
                              {new Date(
                                verification.createdAt,
                              ).toLocaleTimeString()}{" "}
                              ]
                            </p>
                          </div>
                          <p>
                            Verification {status.label.toLowerCase()} with a
                            score of{" "}
                            {(verification.similarityScore * 100).toFixed(1)}%.
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </ScrollArea>
              </>
            )}
            <SheetFooter></SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      <div className="flex items-center justify-center h-full">
        <div className="grid grid-cols-2 gap-6 mx-auto w-full max-w-5xl">
          {[
            {
              label: "Original Signature",
              url: originalImage,
              icon: <Image />,
              description:
                "The raw uploaded image containing the source signature before any digital processing or filtering.",
              bg: "bg-white",
            },
            {
              label: "Contourized Signature",
              url: visImage,
              icon: <Fullscreen />,
              description:
                "Visual representation of detected edges and vector paths used to identify the unique structural strokes of the pen.",
              bg: "bg-white",
            },
            {
              label: "ROI (Region of Extraction) Signature",
              url: roiImage,
              icon: <Crop />,
              description:
                "The 'Region of Interest' extraction, isolating the signature from the background and removing unnecessary whitespace.",
              bg: "bg-black",
            },
            {
              label: "Normalized Signature",
              url: normalizedImage,
              icon: <ImageUp />,
              description:
                "The final processed output adjusted for standard scale, orientation, and thickness for consistent verification.",
              bg: "bg-black",
            },
          ].map((img, index) => (
            <div key={index} className="flex flex-col gap-4">
              <div className="flex flex-row items-center gap-4">
                <div className="bg-muted p-2 rounded-md w-fit">{img.icon}</div>
                <p className="text-xl">{img.label}</p>
              </div>
              <div
                onClick={() =>
                  setSelectedImage({
                    url: img.url || "",
                    label: img.label,
                    description: img.description,
                    bg: img.bg,
                  })
                }
                className={`h-52 w-full ${img.bg} rounded-md border flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all`}
              >
                <img
                  src={img.url}
                  alt={img.label}
                  className="h-full w-full object-contain p-4"
                />
              </div>
            </div>
          ))}{" "}
        </div>
      </div>
      <Separator />
      <div className="flex flex-row items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Registered on{" "}
          {new Date(signature.createdAt).toLocaleString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })}
        </p>
        <p className="text-sm text-muted-foreground">
          Last update on{" "}
          {new Date(signature.updatedAt).toLocaleString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })}
        </p>
      </div>
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-h-200">
          <DialogHeader>
            <DialogTitle>{selectedImage?.label}</DialogTitle>
            <DialogDescription>{selectedImage?.description}</DialogDescription>
          </DialogHeader>
          <div
            className={`aspect-video w-full rounded-md border overflow-hidden ${selectedImage?.bg}`}
          >
            <img
              src={selectedImage?.url}
              alt={selectedImage?.label}
              className="h-full w-full object-contain p-8"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
