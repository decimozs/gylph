import { createFileRoute } from "@tanstack/react-router";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { SquareDashed } from "lucide-react";

export const Route = createFileRoute("/_dashboard/signatures/")({
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
          <EmptyTitle>No Signature Selected</EmptyTitle>
          <EmptyDescription>
            Choose a record from the sidebar to inspect original images, ROI
            extractions, and normalization results.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
