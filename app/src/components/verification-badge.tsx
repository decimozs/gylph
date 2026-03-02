import type { DocumentFinalRankType, VerificationStatus } from "@/lib/types";
import { BadgeAlert, BadgeCheck, BadgeHelp, HelpCircle } from "lucide-react";
import type { JSX } from "react";

export default function VerificationBadge({
  status,
}: {
  status: VerificationStatus | DocumentFinalRankType;
}) {
  const items: Record<
    string,
    { title: string; color: string; icon: JSX.Element }
  > = {
    authentic: {
      title: "Authentic Signature",
      color: "bg-blue-500",
      icon: <BadgeCheck className="text-white" />,
    },
    "needs-review": {
      title: "Signature Needs Review",
      color: "bg-orange-500",
      icon: <BadgeHelp className="text-white" />,
    },
    forged: {
      title: "Signature Forged",
      color: "bg-red-500",
      icon: <BadgeAlert className="text-white" />,
    },
    low: {
      title: "Professional Writing",
      color: "bg-blue-500",
      icon: <BadgeCheck className="text-white" />,
    },
    moderate: {
      title: "Unusual Wording",
      color: "bg-orange-500",
      icon: <BadgeHelp className="text-white" />,
    },
    high: {
      title: "Non-Professional Writer",
      color: "bg-red-500",
      icon: <BadgeAlert className="text-white" />,
    },
  };

  const config = items[status as string] || {
    title: "Unknown Status",
    color: "bg-gray-400",
    icon: <HelpCircle className="text-white" />,
  };

  return (
    <div className={`p-1 rounded-full ${config.color}`} title={config.title}>
      {config.icon}
    </div>
  );
}
