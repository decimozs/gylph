import { Button } from "@/components/ui/button";
import { documentQueries } from "@/hooks/use-document";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_dashboard/documents/$id/")({
  loader: async ({ context, params }) => {
    return context.queryClient.ensureQueryData(
      documentQueries.getById(params.id),
    );
  },

  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data: document } = useSuspenseQuery(documentQueries.getById(id));
  const navigate = useNavigate();
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [imageType, setImageType] = useState<"original" | "processed">(
    "original",
  );

  const currentImageUrl =
    imageType === "original" ? document.url : document.previewImageUrl;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const id = e.dataTransfer.getData("documentId");

    if (id) {
      setImageType("original");
      navigate({ to: "/documents/$id", params: { id } });
    }
  };

  const isPDF = currentImageUrl?.toLowerCase().endsWith(".pdf");

  const handleImageTab = (tab: "original" | "processed") => setImageType(tab);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={handleDrop}
      className={`
        bg-muted/30 rounded-md border-2 border-dashed h-full p-4 transition-colors flex flex-col gap-4
        ${isDraggingOver ? "border-primary bg-primary/10" : "border-muted-foreground/20"}
      `}
    >
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          <Button
            variant={imageType === "original" ? "default" : "outline"}
            onClick={() => handleImageTab("original")}
          >
            Original
          </Button>
          <Button
            variant={imageType === "processed" ? "default" : "outline"}
            onClick={() => handleImageTab("processed")}
          >
            Processed
          </Button>
        </div>
        <div className="flex flex-row items-center gap-2">
          <Button
            className="rounded-full"
            size="icon-lg"
            variant="secondary"
            onClick={() => window.open(currentImageUrl, "_blank")}
          >
            <ExternalLink />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden rounded-md">
        {isPDF ? (
          <iframe
            src={`${currentImageUrl}#toolbar=0&navpanes=0`}
            className="h-full w-full pointer-events-none rounded-md"
            title={document.name}
          />
        ) : (
          <img
            src={currentImageUrl}
            alt={document.name}
            className="h-full w-full object-contain rounded-md"
          />
        )}
      </div>
      <div>
        <p className="font-medium">{document.name}</p>
      </div>
    </div>
  );
}
