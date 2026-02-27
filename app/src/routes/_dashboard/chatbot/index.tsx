import { useState, useRef, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUp, Eclipse, Sparkle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Nav from "@/components/nav";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const Route = createFileRoute("/_dashboard/chatbot/")({
  component: RouteComponent,
});

type Message = {
  role: "user" | "assistant";
  content: string;
};

function RouteComponent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_N8N_BASE_URL}/ai/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            sessionId: "123112s",
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      const data = await response.json();
      const aiMessage = data?.output || "No response";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiMessage },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="mx-auto w-220 flex items-center justify-center flex-col gap-4 h-full">
        <div className="flex flex-row items-center gap-4">
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
        <div className="flex items-center justify-center ">
          <div className="relative mx-auto w-170 group">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What do you want to ask?"
              className="min-h-30 w-full resize-none rounded-2xl border-muted bg-background pt-4 pb-16 px-4 focus-visible:ring-1 focus-visible:ring-primary"
            />
            <div className="absolute bottom-3 left-3 right-3 flex flex-row items-center justify-end pointer-events-none">
              <Button
                type="button"
                size="icon"
                className="rounded-full pointer-events-auto size-9"
                onClick={() => handleSendMessage(input)}
                disabled={isLoading}
              >
                <ArrowUp className="size-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          {messages.map((msg, index) =>
            msg.role === "user" ? (
              <div
                key={index}
                className="flex flex-col gap-2 justify-end items-end w-full"
              >
                <p className="p-4 bg-input/30 rounded-l-md rounded-b-md max-w-125 border border-primary">
                  {msg.content}
                </p>
              </div>
            ) : (
              <div
                key={index}
                className="grid grid-cols-[50px_1fr] gap-2 w-full"
              >
                <div className="size-9 flex mt-1 items-center justify-center text-sm font-medium rounded-full bg-primary/80 shrink-0">
                  <Sparkle className="size-5" />
                </div>
                <div className="p-4 bg-input/30 rounded-md max-w-125">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      img: ({ ...props }) => (
                        <img
                          {...props}
                          className="rounded-lg max-w-full h-auto my-2 border"
                        />
                      ),
                      h1: ({ children }) => (
                        <p className="font-bold">{children}</p>
                      ),
                      h2: ({ children }) => (
                        <p className="font-bold">{children}</p>
                      ),
                      h3: ({ children }) => (
                        <p className="font-bold">{children}</p>
                      ),
                      a: ({ ...props }) => (
                        <a
                          {...props}
                          className="text-primary underline hover:opacity-80"
                          target="_blank"
                          rel="noreferrer"
                        />
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            ),
          )}

          {isLoading && (
            <div className="grid grid-cols-[50px_1fr] gap-2 w-full animate-pulse">
              <div className="size-9 flex mt-1 items-center justify-center text-sm font-medium rounded-full bg-muted shrink-0">
                <Sparkle className="size-5 text-muted-foreground" />
              </div>
              <div className="p-4 bg-muted/30 rounded-md w-24 h-12 flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="flex items-center justify-center ">
        <div className="relative mx-auto w-170 group">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What do you want to ask?"
            className="min-h-30 w-full resize-none rounded-2xl border-muted bg-background pt-4 pb-16 px-4 focus-visible:ring-1 focus-visible:ring-primary"
          />
          <div className="absolute bottom-3 left-3 right-3 flex flex-row items-center justify-end pointer-events-none">
            <Button
              type="button"
              size="icon"
              className="rounded-full pointer-events-auto size-9"
              onClick={() => handleSendMessage(input)}
              disabled={isLoading}
            >
              <ArrowUp className="size-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
