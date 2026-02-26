import { Separator } from "@/components/ui/separator";
import { BadgeAlert, BadgeCheck, BadgeHelp, Scroll } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { Verification, Document } from "@/lib/types";
import { Link } from "@tanstack/react-router";

export default function DocumentKanbanBoard({
  data,
}: {
  data: (Document & { verifications: Verification })[];
}) {
  const authenticSignatures = data.filter(
    (i) => i.verifications.status === "authentic",
  ).length;
  const needReviewSignatures = data.filter(
    (i) => i.verifications.status === "needs-review",
  ).length;
  const forgedSignatures = data.filter((i) => i.verifications.status === "forged").length;

  return (
    <>
      <div className="border rounded-md flex flex-col min-h-0 bg-background">
        <div className="p-4 flex flex-row items-center gap-4 shrink-0">
          <div className="p-1 rounded-full bg-blue-500">
            <BadgeCheck className="text-white" />
          </div>
          <p className="text-2xl tracking-tight">
            {authenticSignatures} Verified
          </p>
        </div>
        <Separator />
        {(() => {
          const filteredData = data.filter(
            (item) => item.verifications.status === "authentic",
          );

          if (filteredData.length > 0) {
            return (
              <ScrollArea className="flex-1 overflow-y-auto">
                <div className="p-4 flex flex-col gap-4">
                  {filteredData.map((item) => {
                    const isPDF = item.url?.toLowerCase().endsWith(".pdf");
                    return (
                      <Link
                        to="/documents/$id"
                        params={{ id: item.id }}
                        key={item.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("documentId", item.id);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                      >
                        <div
                          key={item.id}
                          className="p-4 hover:bg-muted cursor-pointer rounded-md border bg-card transition-colors shrink-0"
                        >
                          <div className="relative">
                            <p className="absolute top-3 left-3 size-12 flex items-center justify-center text-sm font-medium rounded-full bg-primary/80 shrink-0">
                              {Math.round(
                                item.verifications.similarityScore * 100,
                              )}
                              %
                            </p>
                          </div>
                          <div className="mb-3 h-40 w-full overflow-hidden rounded border bg-muted/50">
                            {isPDF ? (
                              <iframe
                                src={`${item.previewImageUrl}#toolbar=0&navpanes=0`}
                                className="h-full w-full pointer-events-none"
                                title={item.name}
                              />
                            ) : (
                              <img
                                src={item.previewImageUrl}
                                alt={item.name}
                                className="h-full w-[300px] object-contain"
                              />
                            )}
                          </div>
                          <p className="font-medium truncate max-w-[300px] text-sm">
                            {item.name}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </ScrollArea>
            );
          }

          return (
            <div className="p-4 overflow-y-auto flex-1 flex items-center justify-center">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Scroll className="text-muted-foreground" />
                  </EmptyMedia>
                  <EmptyTitle>No verified documents</EmptyTitle>
                  <EmptyDescription>
                    Documents that have passed authentication will be listed in
                    this column.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          );
        })()}
      </div>

      <div className="border rounded-md flex flex-col min-h-0 bg-background">
        <div className="p-4 flex flex-row items-center gap-4 shrink-0">
          <div className="p-1 rounded-full bg-orange-500">
            <BadgeHelp className="text-white" />
          </div>
          <p className="text-2xl tracking-tight">
            {needReviewSignatures} In Review
          </p>
        </div>
        <Separator />
        {(() => {
          const filteredData = data.filter(
            (item) => item.verifications.status === "needs-review",
          );

          if (filteredData.length > 0) {
            return (
              <ScrollArea className="flex-1 overflow-y-auto">
                <div className="p-4 flex flex-col gap-4">
                  {filteredData.map((item) => {
                    const isPDF = item.url?.toLowerCase().endsWith(".pdf");
                    return (
                      <Link
                        to="/documents/$id"
                        params={{ id: item.id }}
                        key={item.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("documentId", item.id);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                      >
                        <div
                          key={item.id}
                          className="p-4 hover:bg-muted cursor-pointer rounded-md border bg-card transition-colors shrink-0"
                        >
                          <div className="relative">
                            <p className="absolute top-3 left-3 size-12 flex items-center justify-center text-sm font-medium rounded-full bg-primary/80 shrink-0">
                              {Math.round(
                                item.verifications.similarityScore * 100,
                              )}
                              %
                            </p>
                          </div>

                          <div className="mb-3 h-40 w-full overflow-hidden rounded border bg-muted/50">
                            {isPDF ? (
                              <iframe
                                src={`${item.previewImageUrl}#toolbar=0&navpanes=0`}
                                className="h-full w-full pointer-events-none"
                                title={item.name}
                              />
                            ) : (
                              <img
                                src={item.previewImageUrl}
                                alt={item.name}
                                className="h-full w-[300px] object-contain"
                              />
                            )}
                          </div>
                          <p className="font-medium truncate max-w-[300px] text-sm">
                            {item.name}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </ScrollArea>
            );
          }

          return (
            <div className="p-4 overflow-y-auto flex-1 flex items-center justify-center">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Scroll className="text-muted-foreground" />
                  </EmptyMedia>
                  <EmptyTitle>Queue is clear</EmptyTitle>
                  <EmptyDescription>
                    There are currently no documents waiting for manual review
                    or inspection.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          );
        })()}
      </div>

      <div className="border rounded-md flex flex-col min-h-0 bg-background">
        <div className="p-4 flex flex-row items-center gap-4 shrink-0">
          <div className="p-1 rounded-full bg-red-500">
            <BadgeAlert className="text-white" />
          </div>
          <p className="text-2xl tracking-tight">
            {forgedSignatures} Anomalies
          </p>
        </div>
        <Separator />
        {(() => {
          const filteredData = data.filter(
            (item) => item.verifications.status === "forged",
          );

          if (filteredData.length > 0) {
            return (
              <ScrollArea className="flex-1 overflow-y-auto">
                <div className="p-4 flex flex-col gap-4">
                  {filteredData.map((item) => {
                    const isPDF = item.url?.toLowerCase().endsWith(".pdf");
                    return (
                      <Link
                        to="/documents/$id"
                        params={{ id: item.id }}
                        key={item.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("documentId", item.id);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                      >
                        <div
                          key={item.id}
                          className="p-4 hover:bg-muted cursor-pointer rounded-md border bg-card transition-colors shrink-0"
                        >
                          <div className="relative">
                            <p className="absolute top-3 left-3 size-12 flex items-center justify-center text-sm font-medium rounded-full bg-primary/80 shrink-0">
                              {Math.round(
                                item.verifications.similarityScore * 100,
                              )}
                              %
                            </p>
                          </div>
                          <div className="mb-3 h-40 w-full overflow-hidden rounded border bg-muted/50">
                            {isPDF ? (
                              <iframe
                                src={`${item.previewImageUrl}#toolbar=0&navpanes=0`}
                                className="h-full w-full pointer-events-none"
                                title={item.name}
                              />
                            ) : (
                              <img
                                src={item.previewImageUrl}
                                alt={item.name}
                                className="h-full w-[300px] object-contain"
                              />
                            )}
                          </div>
                          <p className="font-medium truncate max-w-[300px] text-sm">
                            {item.name}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </ScrollArea>
            );
          }

          return (
            <div className="p-4 overflow-y-auto flex-1 flex items-center justify-center">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Scroll className="text-muted-foreground" />
                  </EmptyMedia>
                  <EmptyTitle>No anomalies detected</EmptyTitle>
                  <EmptyDescription>
                    Any documents flagged as fraudulent or inconsistent will be
                    moved here.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          );
        })()}
      </div>
    </>
  );
}
