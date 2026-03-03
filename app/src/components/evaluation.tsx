import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type {
  Verification,
  Document,
  Signature,
  VerificationStatus,
  DocumentFinalRankType,
  OverallScore,
} from "@/lib/types";
import { Separator } from "./ui/separator";
import VerificationBadge from "./verification-badge";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Blend,
  Columns2,
  ExternalLink,
  Fullscreen,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import { Link } from "@tanstack/react-router";
import { documentQueries } from "@/hooks/use-document";
import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";

function SignatureEvaluation({
  data,
}: {
  data:
    | (Document & {
        signature: Signature;
        verification: Verification;
        overall: OverallScore;
      })
    | undefined;
}) {
  const [tab, setTab] = useState<"comparison" | "heatmap">("comparison");
  const [sideBySideView, setSideBySideView] = useState(false);

  const toggleTab = (selectedTab: "comparison" | "heatmap") => {
    setTab(selectedTab);
  };

  const toggleSideBySideView = () => {
    setSideBySideView((prev) => !prev);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-row items-center justify-between">
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
        <div className="flex flex-row items-center gap-2">
          <div className="flex flex-row items-center gap-2 border border-dashed h-10 px-4 rounded-full">
            <p>
              {Math.round(Number(data?.verification.similarityScore) * 100)} %
            </p>
            <p>Confidence</p>
          </div>
        </div>
      </div>
      <div className="flex items-center flex-col justify-center h-full gap-4 -mt-8">
        {tab === "comparison" ? (
          <div className="flex flex-col gap-4 w-[90%] h-125">
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
                key={data?.id}
                className="w-full bg-white rounded-md"
                itemOne={
                  <ReactCompareSliderImage
                    src={data?.verification.previewLiveNormalizedImageUrl}
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
                    src={data?.verification.previewRefNormalizedImageUrl}
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
                            data?.verification.previewLiveNormalizedImageUrl,
                            "_blank",
                          )
                        }
                      >
                        <ExternalLink />
                      </Button>
                    </div>
                    <img
                      src={data?.verification.previewLiveNormalizedImageUrl}
                      alt={`${data?.verification.id}-live-normalized`}
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
                            data?.verification.previewRefNormalizedImageUrl,
                            "_blank",
                          )
                        }
                      >
                        <ExternalLink />
                      </Button>
                    </div>
                    <img
                      src={data?.verification.previewRefNormalizedImageUrl}
                      alt={`${data?.verification.id}-ref-normalized`}
                      className="h-full w-full object-contain p-4"
                    />
                  </div>
                  <Link
                    to="/signatures/$id"
                    params={{ id: data?.verification.signatureId || "" }}
                    className="text-center hover:underline hover:text-primary transition-colors"
                  >
                    Reference Signature
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4 w-[90%] h-125">
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
                    window.open(data?.verification.previewImageUrl, "_blank")
                  }
                >
                  <ExternalLink />
                </Button>
              </div>
              <img
                src={data?.verification.previewImageUrl}
                alt={`${data?.verification.id}-heatmap`}
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
                  params={{ id: data?.verification.signatureId || "" }}
                  className="hover:underline hover:text-primary transition-colors"
                >
                  Reference Signature
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DocumentEvaluation({
  data,
}: {
  data:
    | (Document & {
        signature: Signature;
        verification: Verification;
        overall: OverallScore;
      })
    | undefined;
}) {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center justify-between">
          <p className="text-2xl">Overview</p>
          <div className="flex flex-row items-center gap-2">
            {data?.suspicionType.toLowerCase() !== "none" && (
              <div className="flex flex-row items-center gap-2 border border-dashed h-10 px-4 rounded-full capitalize bg-red-500/30">
                <p>{data?.suspicionType.replaceAll("-", " ")}</p>
              </div>
            )}
            <div
              className={`flex flex-row items-center gap-2 border border-dashed h-10 px-4 rounded-full ${Number(data?.severityScore) > 0.7 ? "bg-red-500/30" : "bg-blue-500/30"}`}
            >
              <p>{Math.round((1 - Number(data?.severityScore)) * 100)} %</p>
              <p>
                {Number(data?.severityScore) > 0.7
                  ? "Untrained Writing Match"
                  : "Clinical Consistency"}
              </p>
            </div>
          </div>
        </div>
        <p className="text-2xl p-4 bg-primary/30 rounded-md">
          {data?.overview}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center justify-between">
          <p className="text-2xl">Analysis</p>
        </div>
        <p className="text-2xl p-4 bg-primary/30 rounded-md">
          {data?.analysisSummary}
        </p>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span>Medical Language Match</span>
          <span>{Number(data?.medicalLanguageScore || 0) * 100}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              Number(data?.medicalLanguageScore) < 0.5
                ? "bg-red-500"
                : "bg-blue-500"
            }`}
            style={{
              width: `${Number(data?.medicalLanguageScore || 0) * 100}%`,
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground italic">
          {data?.languageNote}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span>Protocol Adherence</span>
          <span>{Number(data?.protocolScore || 0) * 100}%</span>
        </div>

        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              Number(data?.protocolScore) < 0.5 ? "bg-red-500" : "bg-blue-500"
            }`}
            style={{
              width: `${Number(data?.protocolScore || 0) * 100}%`,
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground italic">
          {data?.protocolNote}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span>Linguistic Naturalness</span>
          <span>{Number(data?.linguisticScore || 0) * 100}%</span>
        </div>

        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              Number(data?.linguisticScore) < 0.6 ? "bg-red-500" : "bg-blue-500"
            }`}
            style={{
              width: `${Number(data?.linguisticScore || 0) * 100}%`,
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground italic">
          {data?.linguisticNote}
        </p>
      </div>
    </div>
  );
}

function OverallEvaluation({
  data,
}: {
  data:
    | (Document & {
        signature: Signature;
        verification: Verification;
        overall: OverallScore;
      })
    | undefined;
}) {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center justify-between">
          <p className="text-2xl">Note</p>
          <div className="flex flex-row items-center gap-2">
            {data?.suspicionType.toLowerCase() !== "none" && (
              <div className="flex flex-row items-center gap-2 border border-dashed h-10 px-4 rounded-full capitalize bg-red-500/30">
                <p>{data?.suspicionType.replaceAll("-", " ")}</p>
              </div>
            )}
            {data?.overall.suspicionType.toLowerCase() !== "none" && (
              <div className="flex flex-row items-center gap-2 border border-dashed h-10 px-4 rounded-full capitalize bg-red-500/30">
                <p>{data?.overall.suspicionType.replaceAll("-", " ")}</p>
              </div>
            )}
            <div
              className={`flex flex-row items-center gap-2 border border-dashed h-10 px-4 rounded-full ${
                Number(data?.overall?.score) > 0.7
                  ? "bg-red-500/30"
                  : "bg-blue-500/30"
              }`}
            >
              <p>Document</p>
            </div>
          </div>
        </div>
        <p className="text-2xl p-4 bg-primary/30 rounded-md">
          {data?.overall.verdict}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <ReactCompareSlider
              key={data?.id}
              className="w-full bg-white rounded-md"
              itemOne={
                <ReactCompareSliderImage
                  src={data?.verification.previewLiveNormalizedImageUrl}
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
                  src={data?.verification.previewRefNormalizedImageUrl}
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
            <div className="absolute bottom-4 left-4">
              <p className="text-2xl text-primary-foreground">Comparison</p>
            </div>
          </div>
          <div className="relative">
            <img
              src={data?.verification.previewImageUrl}
              alt={`${data?.verification.id}-heatmap`}
              className="h-full w-full object-contain rounded-md"
            />
            <div className="absolute bottom-4 left-4">
              <p className="text-2xl text-primary-foreground">Heatmap</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between">
            <p className="text-2xl">Document Analysis</p>
          </div>
          <p className="text-2xl p-4 bg-primary/30 rounded-md">
            {data?.overview}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Evaluation({
  data: initialData,
}: {
  data:
    | (Document & {
        signature: Signature;
        verification: Verification;
        overall: OverallScore;
      })
    | undefined;
}) {
  const { data: polledData } = useQuery({
    ...documentQueries.getById(initialData?.id || ""),
    refetchInterval: (query) =>
      query.state.data?.status === "processing" ? 5000 : false,
    placeholderData: (prev) => prev,
  });
  const [, setMode] = useQueryState("mode");

  const data = polledData || initialData;

  const [evaluationType, setEvaluationType] = useState<
    "signature-evaluation" | "document-evaluation" | "overall-evaluation"
  >("overall-evaluation");

  const handleEvaluationTab = (
    tab: "signature-evaluation" | "document-evaluation" | "overall-evaluation",
  ) => setEvaluationType(tab);

  if (data?.status === "processing") {
    return (
      <div className="border rounded-md flex flex-col w-full min-h-0 bg-background items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Loader2 className="animate-spin text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>Analyzing Claim</EmptyTitle>
            <EmptyDescription>
              Document is on process for analysis
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="border rounded-md flex flex-col w-full min-h-0 bg-background">
      <div className="flex flex-row items-center justify-between pr-4">
        <div className="flex flex-row items-center gap-2">
          <div className="p-4 flex flex-row items-center gap-4 shrink-0">
            {evaluationType === "signature-evaluation" && (
              <>
                <VerificationBadge
                  status={data?.verification.status as VerificationStatus}
                />

                <p className="text-2xl tracking-tight">
                  {data?.verification.status === "authentic"
                    ? "Signature Verified"
                    : data?.verification.status === "needs-review"
                      ? "Signature In Review"
                      : "Forged Signature"}
                </p>
              </>
            )}
            {evaluationType === "document-evaluation" && (
              <>
                <VerificationBadge
                  status={data?.finalRank as DocumentFinalRankType}
                />
                <p className="text-2xl tracking-tight">
                  {data?.finalRank.toLowerCase() === "low"
                    ? "Professional Writing"
                    : data?.finalRank === "moderate"
                      ? "Unusual Writing"
                      : "Fraud Document"}
                </p>
              </>
            )}
            {evaluationType === "overall-evaluation" && (
              <>
                <VerificationBadge
                  status={data?.finalRank as DocumentFinalRankType}
                />
                <p className="text-2xl tracking-tight">
                  {data?.finalRank.toLowerCase() === "low"
                    ? "Low Risk"
                    : data?.finalRank === "moderate"
                      ? "Moderate Risk"
                      : "Highly Suspicious"}
                </p>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-row items-center gap-2">
          <Select
            value={evaluationType}
            onValueChange={(value) =>
              handleEvaluationTab(value as typeof evaluationType)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select evaluation type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="overall-evaluation">
                  Overall Evaluation
                </SelectItem>
                <SelectItem value="signature-evaluation">
                  Signature Evaluation
                </SelectItem>
                <SelectItem value="document-evaluation">
                  Document Evaluation
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon-lg"
            onClick={() => setMode(null)}
          >
            <X />
          </Button>
        </div>
      </div>
      <Separator />
      <div className="p-4 flex flex-col gap-4 h-full">
        {evaluationType === "overall-evaluation" && (
          <OverallEvaluation data={data} />
        )}
        {evaluationType === "signature-evaluation" && (
          <SignatureEvaluation data={data} />
        )}
        {evaluationType === "document-evaluation" && (
          <DocumentEvaluation data={data} />
        )}
      </div>
    </div>
  );
}
