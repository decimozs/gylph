import { createFileRoute, useNavigate } from "@tanstack/react-router"; // Added useNavigate
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import {
  PenTool,
  BadgeCheck,
  LineSquiggle,
  LayoutDashboard,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const handleNavigation = (value: string) => {
    if (value === "register") navigate({ to: "/register" });
    if (value === "verify") navigate({ to: "/verify" });
    if (value === "dashboard") navigate({ to: "/signatures" });
  };

  return (
    <div className="bg-muted/30 rounded-md border border-dashed h-full p-4 flex items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LineSquiggle className="text-primary" />
          </EmptyMedia>
          <EmptyTitle>Signature Verification</EmptyTitle>
          <EmptyDescription>
            Welcome to the verification dashboard. Register a new baseline
            signature, run a verification check against an existing record, or
            view global analytics.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex flex-row gap-3 justify-center mt-4">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate({ to: "/signatures" })}
          >
            <LayoutDashboard className="mr-2 w-4 h-4" />
            Go to Dashboard
          </Button>

          <Select onValueChange={handleNavigation}>
            <SelectTrigger className="w-[180px] min-h-10 px-4">
              <SelectValue placeholder="Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="register">
                  <div className="flex items-center">
                    <PenTool className="mr-2 w-4 h-4" />
                    Register
                  </div>
                </SelectItem>
                <SelectItem value="verify">
                  <div className="flex items-center">
                    <BadgeCheck className="mr-2 w-4 h-4" />
                    Verify
                  </div>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </EmptyContent>
      </Empty>
    </div>
  );
}
