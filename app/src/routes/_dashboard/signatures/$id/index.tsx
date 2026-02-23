import { createFileRoute } from "@tanstack/react-router";
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

  return (
    <div className="bg-muted/30 rounded-md h-full p-4 flex flex-col gap-4">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          <div className="bg-muted p-2 rounded-md w-fit">
            <Signature className="text-primary" />
          </div>
          <p className="text-2xl">Signature by {signature.name}</p>
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
                <p className="text-xl font-medium">{img.label}</p>
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
      <div>
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
