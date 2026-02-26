import type { LucideIcon } from "lucide-react";
import { Button } from "./ui/button";

export default function ActionsButton({
  props,
}: {
  props: React.ComponentProps<typeof Button> & {
    icon: LucideIcon;
    label: string;
  };
}) {
  const Icon = props.icon;
  return (
    <div className="bg-muted/30 rounded-md p-4 px-6">
      <div className="grid grid-cols-[100px_1fr] items-center gap-2">
        <p className="text-2xl">Actions</p>
        <Button className="w-full" {...props}>
          <Icon className="mr-2 w-4 h-4" />
          {props.label}
        </Button>
      </div>
    </div>
  );
}
