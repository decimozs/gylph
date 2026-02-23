import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  BadgeAlert,
  BadgeCheck,
  Blend,
  Check,
  Columns2,
  Copy,
  Fullscreen,
  ShieldAlert,
  ShieldCheck,
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
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_dashboard/verifications/$id/")({
  loader: async ({ context, params }) => {
    return context.queryClient.ensureQueryData(
      verificationQueries.getById(params.id),
    );
  },
  component: RouteComponent,
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

  return (
    <div className="bg-muted/30 rounded-md h-full p-4 flex flex-col gap-4">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          <div className="bg-muted p-2 rounded-md w-fit">
            {verification.isAuthentic ? (
              <BadgeCheck className="text-primary" />
            ) : (
              <BadgeAlert className="text-primary" />
            )}
          </div>
          <div className="flex flex-col">
            <p className="text-2xl">
              {verification.isAuthentic
                ? "Authentic Signature"
                : "Verification Failed"}
            </p>
          </div>
        </div>
        <div
          onClick={handleCopyId}
          className="flex flex-row items-center gap-3 border border-dashed px-4 py-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors group"
        >
          <p className="text-sm font-mono">Verification Id: {id}</p>
          {copied ? (
            <Check className="size-4 text-primary" />
          ) : (
            <Copy className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
          )}
        </div>
      </div>
      <Separator />
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
                <Dialog>
                  <DialogTrigger>
                    <div className="flex flex-col gap-4">
                      <div
                        className={`h-100 w-full bg-white rounded-md border flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all`}
                      >
                        <img
                          src={verification.previewLiveNormalizedImageUrl}
                          alt={`${verification.id}-live-normalized`}
                          className="h-full w-full object-contain p-4"
                        />
                      </div>
                      <p>Query Signature</p>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Query Signature</DialogTitle>
                      <DialogDescription>
                        This is the query signature that was submitted for
                        verification.
                      </DialogDescription>
                    </DialogHeader>
                    <div
                      className={`h-full w-full rounded-md border overflow-hidden bg-white`}
                    >
                      <img
                        src={verification.previewLiveNormalizedImageUrl}
                        alt={`${verification.id}-live-normalized`}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger>
                    <div className="flex flex-col gap-4">
                      <div
                        className={`h-100 w-full bg-white rounded-md border flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all`}
                      >
                        <img
                          src={verification.previewRefNormalizedImageUrl}
                          alt={`${verification.id}-ref-normalized`}
                          className="h-full w-full object-contain p-4"
                        />
                      </div>
                      <Link
                        to="/signatures/$id"
                        params={{ id: verification.signatureId }}
                        className="hover:underline hover:text-primary transition-colors"
                      >
                        Reference Signature
                      </Link>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reference Signature</DialogTitle>
                      <DialogDescription>
                        This is the reference signature that was used for
                        comparison.
                      </DialogDescription>
                    </DialogHeader>
                    <div
                      className={`h-full w-full rounded-md border overflow-hidden bg-white`}
                    >
                      <img
                        src={verification.previewRefNormalizedImageUrl}
                        alt={`${verification.id}-ref-normalized`}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
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
              className={`h-full w-full rounded-md border overflow-hidden bg-white`}
            >
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
      <div>
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
