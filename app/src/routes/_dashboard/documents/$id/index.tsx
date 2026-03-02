import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { documentQueries } from "@/hooks/use-document";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import z from "zod";
import remarkBreaks from "remark-breaks";

const documentSearchSchema = z.object({
  mode: z.string().optional(),
});

export const Route = createFileRoute("/_dashboard/documents/$id/")({
  validateSearch: (search) => documentSearchSchema.parse(search),
  loader: async ({ context, params }) => {
    return context.queryClient.ensureQueryData(
      documentQueries.getById(params.id),
    );
  },
  component: RouteComponent,
  pendingComponent: Loader,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data: document } = useSuspenseQuery(documentQueries.getById(id));
  const navigate = useNavigate();
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [imageType, setImageType] = useState<
    | "original"
    | "text-extraction"
    | "signature-extraction"
    | "markdown"
    | "text"
  >("original");

  const currentImageUrl =
    imageType === "original"
      ? document.url
      : imageType === "text-extraction"
        ? document.textExtractionImageUrl
        : document.signatureExtractionImageUrl;

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

  const handleImageTab = (
    tab:
      | "original"
      | "text-extraction"
      | "signature-extraction"
      | "markdown"
      | "text",
  ) => setImageType(tab);

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
        <Select
          value={imageType}
          onValueChange={(value) => handleImageTab(value as typeof imageType)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select view type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="original">Original</SelectItem>
              <SelectItem value="text-extraction">Text Extraction</SelectItem>
              <SelectItem value="signature-extraction">
                Signature Extraction
              </SelectItem>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="markdown">Markdown</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {imageType !== "markdown" && (
          <div className="flex flex-row items-center gap-2">
            <Button
              className="rounded-full"
              size="icon-lg"
              variant="secondary"
              onClick={() => window.open(currentImageUrl as string, "_blank")}
            >
              <ExternalLink />
            </Button>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-hidden rounded-md">
        {imageType === "markdown" ? (
          <ScrollArea className="h-full w-full p-6 text-left prose prose-sm prose-p:my-4 dark:prose-invert max-w-none border border-dashed">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
              {document.markdown || "*No markdown content available*"}
            </ReactMarkdown>
          </ScrollArea>
        ) : isPDF ? (
          <iframe
            src={`${currentImageUrl}#toolbar=0&navpanes=0`}
            className="h-full w-full pointer-events-none rounded-md"
            title={document.name}
          />
        ) : imageType === "text" ? (
          <ScrollArea className="h-full w-full p-6 text-left prose prose-sm prose-p:my-4 dark:prose-invert max-w-none border border-dashed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {document.text || "*No raw text available*"}
            </ReactMarkdown>
          </ScrollArea>
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
