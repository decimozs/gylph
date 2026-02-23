import { createFileRoute } from "@tanstack/react-router";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { SquareDashed } from "lucide-react";

export const Route = createFileRoute("/_dashboard/verifications/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="bg-muted/30 rounded-md border border-dashed h-full p-4 flex items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SquareDashed />
          </EmptyMedia>
          <EmptyTitle>No Verification Selected</EmptyTitle>
          <EmptyDescription className="">
            Select a verification attempt from the history sidebar to review
            similarity scores, authenticity verdicts, and vector comparisons.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
