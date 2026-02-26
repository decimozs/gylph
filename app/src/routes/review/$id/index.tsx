import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { verificationQueries } from "@/hooks/use-verification";
import type { VerificationStatus } from "@/lib/types";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { Blend, Columns2, Eclipse, Fullscreen } from "lucide-react";
import { useState } from "react";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import z from "zod";
import { updateVerificationStatus } from "@/api/verification-api";
import { toast } from "sonner";

const modeSearchSchema = z.object({
  type: z.string().optional(),
});

export const Route = createFileRoute("/review/$id/")({
  validateSearch: (search) => modeSearchSchema.parse(search),

  beforeLoad: async ({ context, params, search }) => {
    if (!search.type || search.type !== "signature-review" || !params.id) {
      throw redirect({ to: "/" });
    }

    try {
      const verification = await context.queryClient.ensureQueryData(
        verificationQueries.getById(params.id),
      );

      if (verification.status !== "needs-review") {
        throw redirect({ to: "/" });
      }
    } catch {
      throw redirect({ to: "/" });
    }
  },

  loader: async ({ context, params }) => {
    return context.queryClient.ensureQueryData(
      verificationQueries.getById(params.id),
    );
  },

  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: verification } = useSuspenseQuery(
    verificationQueries.getById(id),
  );
  const [isPending, setIsPending] = useState(false);
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"comparison" | "heatmap">("comparison");
  const [sideBySideView, setSideBySideView] = useState(false);

  const toggleTab = (selectedTab: "comparison" | "heatmap") => {
    setTab(selectedTab);
  };

  const toggleSideBySideView = () => {
    setSideBySideView((prev) => !prev);
  };

  const handleUpdateVerificationStatus = async (status: VerificationStatus) => {
    setIsPending(true);
    const toastId = toast.loading("Updating signature...");

    try {
      await updateVerificationStatus(id, status);
      toast.success(
        `Signature ${status === "authentic" ? "approved" : "rejected"} successfully!`,
        { id: toastId },
      );

      queryClient.invalidateQueries(verificationQueries.getAll());
      navigate({ to: "/" });
    } catch (error) {
      toast.error("Failed to update signature. Please try again.", {
        id: toastId,
      });
      console.error("Failed to update status:", error);
      setIsPending(false);
    }
  };

  return (
    <div className="flex items-center justify-center flex-col gap-4 h-full">
      <div className="flex flex-col gap-4 w-250">
        <div className="flex flex-row items-center gap-3">
          <div className="bg-muted p-2 rounded-md w-fit">
            <Eclipse className="text-primary" />
          </div>
          <p className="text-2xl">Medcurial</p>
        </div>
        <Separator />
        <div className="flex flex-col gap-3">
          <div className="flex flex-row items-center justify-between">
            <div>
              <p className="text-2xl">Review your signature</p>
              <p className="text-muted-foreground">Is this your signature?</p>
            </div>
            <div className="flex flex-row items-center gap-2">
              <Button
                size="lg"
                disabled={isPending}
                onClick={() => handleUpdateVerificationStatus("authentic")}
              >
                Approve
              </Button>
              <Button
                size="lg"
                variant="destructive"
                disabled={isPending}
                onClick={() => handleUpdateVerificationStatus("forged")}
              >
                Reject
              </Button>
            </div>
          </div>
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
        </div>
        <div className="flex items-center flex-col gap-4 justify-center h-full">
          {tab === "comparison" ? (
            <div className="flex flex-col gap-4 w-full h-125">
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
            <div className="flex flex-col gap-4 h-125 w-full">
              <div className="flex flex-row items-center justify-between w-full">
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
                  <p>Reference Signature</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
