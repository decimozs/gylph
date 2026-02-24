import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { BadgeCheck, PenTool, Scroll, Sparkle } from "lucide-react";

export default function Nav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (value: string) => {
    if (value === "signature-dashboard") navigate({ to: "/signatures" });
    if (value === "verification-dashboard") navigate({ to: "/verifications" });
    if (value === "document-dashboard") navigate({ to: "/documents" });
    if (value === "chatbot") navigate({ to: "/chatbot" });
  };

  const getCurrentValue = () => {
    const path = pathname;
    if (path.startsWith("/signatures")) return "signature-dashboard";
    if (path.startsWith("/verifications")) return "verification-dashboard";
    if (path.startsWith("/documents")) return "document-dashboard";
    if (path.startsWith("/chatbot")) return "chatbot";
    return "";
  };

  return (
    <Select value={getCurrentValue()} onValueChange={handleNavigation}>
      <SelectTrigger className="w-full min-h-10 px-4">
        <SelectValue placeholder="Actions" />
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
  );
}
