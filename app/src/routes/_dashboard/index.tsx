import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  PenTool,
  BadgeCheck,
  SquareDashed,
  Eclipse,
  Sparkle,
  Scroll,
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
    if (value === "extract") navigate({ to: "/extract" });
    if (value === "signature-dashboard") navigate({ to: "/signatures" });
    if (value === "verification-dashboard") navigate({ to: "/verifications" });
    if (value === "document-dashboard") navigate({ to: "/documents" });
    if (value === "chatbot") navigate({ to: "/chatbot" });
  };

  return (
    <div className="bg-muted/30 rounded-md border border-dashed h-full p-4 flex items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Eclipse className="text-primary" />
          </EmptyMedia>
          <EmptyTitle>Medcurial</EmptyTitle>
          <EmptyDescription>
            Welcome to the ai powered claims verification dashboard. Register a
            new baseline signature, run a verification check against an existing
            record, or view global analytics.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex flex-row gap-3 justify-center mt-4">
          <Select onValueChange={handleNavigation}>
            <SelectTrigger className="w-45 min-h-10 px-4">
              <SelectValue placeholder="Dashboard" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="signature-dashboard">
                  <div className="flex items-center">
                    <PenTool className="mr-2 w-4 h-4" />
                    Signatures
                  </div>
                </SelectItem>
                <SelectItem value="verification-dashboard">
                  <div className="flex items-center">
                    <BadgeCheck className="mr-2 w-4 h-4" />
                    Verifications
                  </div>
                </SelectItem>
                <SelectItem value="document-dashboard">
                  <div className="flex items-center">
                    <Scroll className="mr-2 w-4 h-4" />
                    Documents
                  </div>
                </SelectItem>
                <SelectItem value="chatbot">
                  <div className="flex items-center">
                    <Sparkle className="mr-2 w-4 h-4" />
                    Chatbot
                  </div>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select onValueChange={handleNavigation}>
            <SelectTrigger className="w-45 min-h-10 px-4">
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
                <SelectItem value="extract">
                  <div className="flex items-center">
                    <SquareDashed className="mr-2 w-4 h-4" />
                    Extract
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
