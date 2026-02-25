import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SquareDashed } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useState } from "react";

export const Route = createFileRoute("/_dashboard/documents/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const id = e.dataTransfer.getData("documentId");

    if (id) {
      navigate({ to: "/documents/$id", params: { id } });
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
      className={`border border-dashed rounded-md flex flex-col min-h-0 bg-background ${isDraggingOver ? "border-primary bg-primary/10" : "border-muted-foreground/20"}`}
    >
      <div className="p-4 overflow-y-auto flex-1 flex items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SquareDashed
                className={isDraggingOver ? "animate-pulse text-primary" : ""}
              />
            </EmptyMedia>
            <EmptyTitle>
              {isDraggingOver ? "Drop to Open" : "No Document Selected"}
            </EmptyTitle>
            <EmptyDescription>
              {isDraggingOver
                ? "Release to view this document"
                : "Select or drag a document here to review its details."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    </div>
  );
}
