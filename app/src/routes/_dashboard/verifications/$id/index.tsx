import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  BadgeAlert,
  BadgeCheck,
  BadgeHelp,
  Blend,
  Check,
  Columns2,
  Copy,
  ExternalLink,
  Fullscreen,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { toast } from "sonner";
import { verificationQueries } from "@/hooks/use-verification";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Loader from "@/components/loader";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import remarkBreaks from "remark-breaks";

export const Route = createFileRoute("/_dashboard/verifications/$id/")({
  loader: async ({ context, params }) => {
    return context.queryClient.ensureQueryData(
      verificationQueries.getById(params.id),
    );
  },
  component: RouteComponent,
  pendingComponent: Loader,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data: verification } = useSuspenseQuery(
    verificationQueries.getById(id),
  );
  const [tab, setTab] = useState<"comparison" | "heatmap">("comparison");
  const [sideBySideView, setSideBySideView] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    label: string;
    description: string;
    bg: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const [imageType, setImageType] = useState<
    | "original"
    | "text-extraction"
    | "signature-extraction"
    | "text"
    | "markdown"
  >("original");

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

  const toggleSideBySideView = () => {
    setSideBySideView((prev) => !prev);
  };

  const toggleTab = (selectedTab: "comparison" | "heatmap") => {
    setTab(selectedTab);
  };

  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const id = e.dataTransfer.getData("verificationId");

    if (id) {
      navigate({ to: "/verifications/$id", params: { id } });
    }
  };

  const currentImageUrl = verification.document
    ? imageType === "original"
      ? (verification.document.url as string)
      : imageType === "text-extraction"
        ? (verification.document.textExtractionImageUrl as string)
        : (verification.document.signatureExtractionImageUrl as string)
    : "";

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
      className={`bg-muted/30 rounded-md h-full p-4 flex flex-col gap-4 ${isDraggingOver ? "border-2 border-dashed border-primary bg-primary/10" : ""}`}
    >
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          <div className="bg-muted p-2 rounded-md w-fit">
            {(() => {
              if (verification.status === "authentic") {
                return <BadgeCheck className="text-primary" />;
              }
              if (verification.status === "needs-review") {
                return <BadgeHelp className="text-primary" />;
              }
              return <BadgeAlert className="text-primary" />;
            })()}
          </div>
          <div className="flex flex-row items-center gap-4">
            <p className="text-2xl">
              {(() => {
                if (verification.status === "authentic") {
                  return "Authentic Signature";
                }
                if (verification.status === "needs-review") {
                  return "Requires Review";
                }
                return "Forged";
              })()}{" "}
              <span className="text-primary">(VRF - {verification.no})</span>
            </p>
            <div className="flex flex-row items-center gap-2">
              <div className="flex flex-row items-center gap-2 border border-dashed h-10 px-4 rounded-full">
                <p>
                  {Math.round(Number(verification.similarityScore) * 100)} %
                </p>
                <p>Confidence</p>
              </div>
            </div>
          </div>
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
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="flex flex-row items-center gap-2">
          <Button
            onClick={() => toggleTab("comparison")}
            variant={tab === "comparison" ? "default" : "outline"}
          >
            Compare
          </Button>
          <Button
            onClick={() => toggleTab("heatmap")}
            variant={tab === "heatmap" ? "default" : "outline"}
          >
            Heatmap
          </Button>
          {verification.document && (
            <Sheet modal={false}>
              <SheetTrigger asChild>
                <Button variant="outline">Document</Button>
              </SheetTrigger>
              <SheetContent className="min-w-125">
                <SheetHeader>
                  <SheetTitle>Document</SheetTitle>
                  <SheetDescription>
                    {verification.document.name || "No document name available"}
                  </SheetDescription>
                </SheetHeader>
                <div className="px-6 flex flex-col gap-4">
                  <Separator />
                  <div className="flex flex-row items-center justify-between">
                    <Select
                      value={imageType}
                      onValueChange={(value) =>
                        handleImageTab(value as typeof imageType)
                      }
                    >
                      <SelectTrigger className="w-50">
                        <SelectValue placeholder="Select view type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="original">Original</SelectItem>
                          <SelectItem value="text-extraction">
                            Text Extraction
                          </SelectItem>
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
                          onClick={() => window.open(currentImageUrl, "_blank")}
                        >
                          <ExternalLink />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden rounded-md">
                    {imageType === "markdown" ? (
                      <ScrollArea className="h-full w-full p-6 text-left prose prose-sm prose-p:my-4 dark:prose-invert max-w-none border border-dashed">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkBreaks]}
                        >
                          {verification.document.markdown ||
                            "*No markdown content available*"}
                        </ReactMarkdown>
                      </ScrollArea>
                    ) : isPDF ? (
                      <iframe
                        src={`${currentImageUrl}#toolbar=0&navpanes=0`}
                        className="h-full w-full pointer-events-none rounded-md"
                        title={verification.document.name}
                      />
                    ) : imageType === "text" ? (
                      <ScrollArea className="h-full w-full p-6 text-left prose prose-sm prose-p:my-4 dark:prose-invert max-w-none border border-dashed">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkBreaks]}
                        >
                          {verification.document.text ||
                            "*No raw text available*"}
                        </ReactMarkdown>
                      </ScrollArea>
                    ) : (
                      <img
                        src={currentImageUrl}
                        alt={verification.document.name}
                        className="h-full w-full object-contain rounded-md"
                      />
                    )}
                  </div>
                </div>
                <SheetFooter>
                  <Link
                    to="/documents/$id"
                    params={{ id: verification.document.id }}
                    search={{ mode: "evaluation" }}
                    preload="intent"
                  >
                    <Button size="lg" variant="secondary" className="w-full">
                      Go to document evaluation
                    </Button>
                  </Link>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
      <div className="flex items-center flex-col gap-4 justify-center h-full -mt-4">
        {tab === "comparison" ? (
          <div className="flex flex-col gap-4 w-[70%] h-125">
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-row items-center gap-4">
                <div className="bg-muted p-2 rounded-md w-fit">
                  <Fullscreen />
                </div>
                <p className="text-xl font-medium">Comparison</p>
              </div>
              <Button onClick={toggleSideBySideView} size="icon-lg">
                <Columns2 />
              </Button>
            </div>
            {!sideBySideView ? (
              <ReactCompareSlider
                key={id}
                className="w-full bg-white rounded-md"
                itemOne={
                  <ReactCompareSliderImage
                    src={verification.previewLiveNormalizedImageUrl}
                    alt="Query Normalized Signature"
                    style={{
                      objectFit: "contain",
                      width: "100%",
                      height: "100%",
                      padding: "2rem",
                    }}
                  />
                }
                itemTwo={
                  <ReactCompareSliderImage
                    src={verification.previewRefNormalizedImageUrl}
                    alt="Original Normalized Signature"
                    style={{
                      objectFit: "contain",
                      width: "100%",
                      height: "100%",
                      padding: "2rem",
                    }}
                  />
                }
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-4">
                  <div
                    className={`relative h-100 w-full bg-white rounded-md border flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all`}
                  >
                    <div className="absolute top-3 right-3 flex flex-row items-center gap-2">
                      <Button
                        className="rounded-full"
                        size="icon-lg"
                        variant="secondary"
                        onClick={() =>
                          window.open(
                            verification.previewLiveNormalizedImageUrl,
                            "_blank",
                          )
                        }
                      >
                        <ExternalLink />
                      </Button>
                    </div>
                    <img
                      src={verification.previewLiveNormalizedImageUrl}
                      alt={`${verification.id}-live-normalized`}
                      className="h-full w-full object-contain p-4"
                    />
                  </div>
                  <p className="text-center">Query Signature</p>
                </div>
                <div className="flex flex-col gap-4">
                  <div
                    className={`relative h-100 w-full bg-white rounded-md border flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all`}
                  >
                    <div className="absolute top-3 right-3 flex flex-row items-center gap-2">
                      <Button
                        className="rounded-full"
                        size="icon-lg"
                        variant="secondary"
                        onClick={() =>
                          window.open(
                            verification.previewRefNormalizedImageUrl,
                            "_blank",
                          )
                        }
                      >
                        <ExternalLink />
                      </Button>
                    </div>
                    <img
                      src={verification.previewRefNormalizedImageUrl}
                      alt={`${verification.id}-ref-normalized`}
                      className="h-full w-full object-contain p-4"
                    />
                  </div>
                  <Link
                    to="/signatures/$id"
                    params={{ id: verification.signatureId }}
                    className="text-center hover:underline hover:text-primary transition-colors"
                  >
                    Reference Signature
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4 w-[70%] h-125">
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-row items-center gap-4">
                <div className="bg-muted p-2 rounded-md w-fit">
                  <Blend />
                </div>
                <p className="text-xl font-medium">Heatmap</p>
              </div>
            </div>
            <div
              className={`relative h-full w-full rounded-md border overflow-hidden bg-white`}
            >
              <div className="absolute top-3 right-3 flex flex-row items-center gap-2">
                <Button
                  className="rounded-full"
                  size="icon-lg"
                  variant="secondary"
                  onClick={() =>
                    window.open(verification.previewImageUrl, "_blank")
                  }
                >
                  <ExternalLink />
                </Button>
              </div>
              <img
                src={verification.previewImageUrl}
                alt={`${verification.id}-heatmap`}
                className="h-full w-full object-contain py-8"
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-row items-center gap-4">
                <span className="block bg-blue-500 rounded-md size-5"></span>
                <p>Signature Alignment</p>
              </div>
              <div className="flex flex-row items-center gap-4">
                <span className="block bg-red-500 rounded-md size-5"></span>
                <p>Query Signature</p>
              </div>
              <div className="flex flex-row items-center gap-4">
                <span className="block bg-green-500 rounded-md size-5"></span>
                <Link
                  to="/signatures/$id"
                  params={{ id: verification.signatureId }}
                  className="hover:underline hover:text-primary transition-colors"
                >
                  Reference Signature
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      <Separator />
      <div className="flex flex-row items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Verified on{" "}
          {new Date(verification.createdAt).toLocaleString("en-US", {
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
          {new Date(verification.updatedAt).toLocaleString("en-US", {
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
        <DialogContent className="max-w-3xl">
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
