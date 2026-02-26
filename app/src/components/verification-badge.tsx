import { BadgeAlert, BadgeCheck, BadgeHelp, HelpCircle } from "lucide-react";

export default function VerificationBadge({
  status,
}: {
  status: "authentic" | "forged" | "needs-review";
}) {
  const items = {
    authentic: {
      title: "Authentic",
      color: "bg-blue-500",
      icon: <BadgeCheck className="text-white" />,
    },
    "needs-review": {
      title: "Needs Review",
      color: "bg-orange-500",
      icon: <BadgeHelp className="text-white" />,
    },
    forged: {
      title: "Forged",
      color: "bg-red-500",
      icon: <BadgeAlert className="text-white" />,
    },
  };

  const config = items[status] || {
    title: "Unknown",
    color: "bg-gray-400",
    icon: <HelpCircle className="text-white" />,
  };

  return (
    <div className={`p-1 rounded-full ${config.color}`} title={config.title}>
      {config.icon}
    </div>
  );
}
