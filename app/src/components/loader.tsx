import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div
      className={`bg-muted/30 rounded-md h-full p-4 flex flex-col gap-4 items-center justify-center transition-colors`}
    >
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Loader2 className="animate-spin text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>Loading...</EmptyTitle>
          <EmptyDescription>
            Please wait while we load the data.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
