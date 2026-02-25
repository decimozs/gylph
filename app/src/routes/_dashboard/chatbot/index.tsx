import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUp, Eclipse, Plus, Sparkle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Nav from "@/components/nav";

export const Route = createFileRoute("/_dashboard/chatbot/")({
  component: RouteComponent,
});

function RouteComponent() {
  const handleSendMessage = async (message: string) => {
    await console.log("Send message:", message);
  };

  return (
    <div className="mx-auto w-220 flex flex-col gap-4 h-full">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-3">
          <Link to="/">
            <div className="bg-muted p-2 rounded-md w-fit">
              <Eclipse className="text-primary" />
            </div>
          </Link>
          <p className="text-2xl">Medcurial Chat</p>
        </div>
        <div className="w-40">
          <Nav />
        </div>
      </div>
      <ScrollArea className="flex-1 mt-4 overflow-y-auto rounded-md mx-auto w-200">
        <div className="flex flex-col gap-6 px-6">
          <div className="flex flex-col gap-2 justify-end items-end w-full">
            <p className="p-4 bg-input/30 rounded-l-md rounded-b-md max-w-125 border border-primary">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Accusantium vel suscipit minima accusamus perferendis facere,
              ratione enim, laudantium tempora aperiam id error hic veniam atque
              neque dolorem ipsum culpa pariatur.
            </p>
          </div>

          <div className="grid grid-cols-[50px_1fr] gap-2 w-full">
            <div className="size-9 flex mt-1 items-center justify-center text-sm font-medium rounded-full bg-primary/80 shrink-0">
              <Sparkle className="size-5" />
            </div>
            <p className="p-4 bg-input/30 rounded-md max-w-125">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Accusantium vel suscipit minima accusamus perferendis facere,
              ratione enim, laudantium tempora aperiam id error hic veniam atque
              neque dolorem ipsum culpa pariatur.
            </p>
          </div>
        </div>
      </ScrollArea>
      <div className="flex items-center justify-center ">
        <div className="relative mx-auto w-170 group">
          <Textarea
            placeholder="What do you want to ask?"
            className="min-h-30 w-full resize-none rounded-2xl border-muted bg-background 
                 pt-4 pb-16 px-4
                 focus-visible:ring-1 focus-visible:ring-primary"
          />
          <div className="absolute bottom-3 left-3 right-3 flex flex-row items-center justify-between pointer-events-none">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="rounded-full pointer-events-auto size-9"
            >
              <Plus className="size-5" />
            </Button>
            <Button
              type="submit"
              size="icon"
              className="rounded-full pointer-events-auto size-9"
            >
              <ArrowUp className="size-5" />
            </Button>
          </div>
        </div>
      </div>{" "}
    </div>
  );
}
