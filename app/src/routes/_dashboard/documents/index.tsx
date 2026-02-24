import { Separator } from "@/components/ui/separator";
import { documentQueries } from "@/hooks/use-document";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  BadgeAlert,
  BadgeCheck,
  BadgeHelp,
  Scroll,
  SquareDashed,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export const Route = createFileRoute("/_dashboard/documents/")({
  loader: async ({ context }) => {
    return context.queryClient.ensureQueryData(documentQueries.getAll());
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useSuspenseQuery(documentQueries.getAll());

  return (
    <div className="grid grid-cols-[21%_21%_21%_1fr] gap-4 h-full max-h-screen overflow-hidden">
      <div className="border rounded-md flex flex-col min-h-0 bg-background">
        <div className="p-4 flex flex-row items-center gap-4 shrink-0">
          <div className="p-1 rounded-full bg-blue-500">
            <BadgeCheck className="text-white" />
          </div>
          <p className="text-2xl tracking-tight">Verified</p>
        </div>
        <Separator />
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-4 flex flex-col gap-4">
            {data.map((item) => {
              const isPDF = item.url?.toLowerCase().endsWith(".pdf");
              return (
                <div
                  key={item.id}
                  className="p-4 hover:bg-muted cursor-pointer rounded-md border bg-card transition-colors shrink-0"
                >
                  <div className="mb-3 h-40 w-full overflow-hidden rounded border bg-muted/50">
                    {isPDF ? (
                      <iframe
                        src={`${item.url}#toolbar=0&navpanes=0`}
                        className="h-full w-full pointer-events-none"
                        title={item.name}
                      />
                    ) : (
                      <img
                        src={item.url}
                        alt={item.name}
                        className="h-full w-full object-contain"
                      />
                    )}
                  </div>

                  <p className="font-medium truncate text-sm">{item.name}</p>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      <div className="border rounded-md flex flex-col min-h-0 bg-background">
        <div className="p-4 flex flex-row items-center gap-4 shrink-0">
          <div className="p-1 rounded-full bg-orange-500">
            <BadgeHelp className="text-white" />
          </div>
          <p className="text-2xl tracking-tight">In Review</p>
        </div>
        <Separator />
        <div className="p-4 overflow-y-auto flex-1 flex items-center justify-center">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Scroll className="text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle>No pending reviews</EmptyTitle>
              <EmptyDescription>
                Documents requiring manual inspection will appear here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      </div>

      <div className="border rounded-md flex flex-col min-h-0 bg-background">
        <div className="p-4 flex flex-row items-center gap-4 shrink-0">
          <div className="p-1 rounded-full bg-red-500">
            <BadgeAlert className="text-white" />
          </div>
          <p className="text-2xl tracking-tight">Anomalies</p>
        </div>
        <Separator />
        <div className="p-4 overflow-y-auto flex-1 flex items-center justify-center">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Scroll className="text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle>No anomalies found</EmptyTitle>
              <EmptyDescription>
                Documents flagged as potential forgeries are displayed here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      </div>

      <div className="border border-dashed rounded-md flex flex-col min-h-0 bg-background">
        <div className="p-4 overflow-y-auto flex-1 flex items-center justify-center">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SquareDashed />
              </EmptyMedia>
              <EmptyTitle>Select a document</EmptyTitle>
              <EmptyDescription>
                Choose a file from any category to view its detailed
                verification report.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      </div>
    </div>
  );
}
