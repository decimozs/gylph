import { createFileRoute } from "@tanstack/react-router";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { SquareDashed } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_dashboard/verifications/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const id = e.dataTransfer.getData("verificationId");

    if (id) {
      navigate({ to: "/verifications/$id", params: { id } });
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={handleDrop}
      className={`
        bg-muted/30 rounded-md border-2 border-dashed h-full p-4 flex items-center justify-center transition-colors
        ${isDraggingOver ? "border-primary bg-primary/10" : "border-muted-foreground/20"}
      `}
    >
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SquareDashed
              className={isDraggingOver ? "animate-pulse text-primary" : ""}
            />
          </EmptyMedia>
          <EmptyTitle>
            {isDraggingOver ? "Drop to Open" : "No Verification Selected"}
          </EmptyTitle>
          <EmptyDescription>
            {isDraggingOver
              ? "Release to view this verification attempt"
              : "Select or drag a verification attempt here to review similarity scores."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
