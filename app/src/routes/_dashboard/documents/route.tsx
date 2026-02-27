import { useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Check,
  CircleAlert,
  Copy,
  Eclipse,
  FilePlusCorner,
  Search,
  Send,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useQueryState } from "nuqs";
import { useMatch } from "@tanstack/react-router";
import Nav from "@/components/nav";
import { documentQueries, useGetDocumentById } from "@/hooks/use-document";
import { Input } from "@/components/ui/input";
import DocumentKanbanBoard from "@/components/document-kanban-board";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { toast } from "sonner";
import ActionsButton from "@/components/actions-button";

export const Route = createFileRoute("/_dashboard/documents")({
  loader: async ({ context }) => {
    return context.queryClient.ensureQueryData(documentQueries.getAll());
  },
  beforeLoad: async ({ context }) => {
    const documents = await context.queryClient.ensureQueryData(
      documentQueries.getAll(),
    );

    if (!documents || documents.length === 0) {
      throw redirect({
        to: "/extract",
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useSuspenseQuery(documentQueries.getAll());
  const [search, setSearch] = useQueryState("q", {
    defaultValue: "",
    shallow: false,
    clearOnDefault: true,
    throttleMs: 2000,
  });
  const match = useMatch({
    from: "/_dashboard/documents/$id/",
    shouldThrow: false,
  });
  const activeId = match?.params?.id;
  const { data: metadata } = useGetDocumentById(activeId || "");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredData = data.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id || "");
      setCopiedId(id);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-3">
          <Link to="/">
            <div className="bg-muted p-2 rounded-md w-fit">
              <Eclipse className="text-primary" />
            </div>
          </Link>
          <p className="text-2xl">Medcurial</p>
        </div>
        <Link to="/extract">
          <Button size="lg">
            <FilePlusCorner className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-[350px_1fr] h-full gap-6 over overflow-y-auto">
        <div className="flex flex-col gap-4 overflow-y-auto">
          <Nav />
          <Separator />
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Search className="h-4 w-4" />
            </div>
            <Input
              className="pl-10"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {activeId && (
            <>
              <Separator />
              {metadata?.verifications.status === "needs-review" && (
                <>
                  <ActionsButton
                    props={{
                      icon: Send,
                      label: "Send Review",
                    }}
                  />
                  <Separator />
                </>
              )}
              {metadata?.verifications.status === "forged" && (
                <>
                  <ActionsButton
                    props={{
                      icon: CircleAlert,
                      label: "Report",
                      variant: "destructive",
                    }}
                  />
                  <Separator />
                </>
              )}

              <ScrollArea className="bg-muted/30 rounded-md h-full p-4 overflow-y-auto px-6">
                <div className="flex flex-col gap-4 overflow-y-auto">
                  <p className="text-2xl">
                    Document #{metadata?.no}{" "}
                    <span className="text-primary">
                      (DCM - {metadata?.no})
                    </span>{" "}
                  </p>
                  <Separator />
                  <div className="flex flex-col gap-1">
                    <p>Document Id</p>
                    <div
                      onClick={() => handleCopyId(activeId || "")}
                      className="flex flex-row items-center justify-between border border-dashed px-4 py-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors group"
                    >
                      <p className="text-sm font-mono truncate max-w-50">
                        {activeId}
                      </p>
                      {copiedId === activeId ? (
                        <Check className="size-4 text-primary" />
                      ) : (
                        <Copy className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Link
                      to="/verifications/$id"
                      className="w-fit hover:underline hover:text-primary transition-colors"
                      params={{ id: metadata?.verificationId || "" }}
                    >
                      Verification Id
                    </Link>

                    <div
                      onClick={() =>
                        handleCopyId(metadata?.verificationId || "")
                      }
                      className="flex flex-row items-center justify-between border border-dashed px-4 py-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors group"
                    >
                      <p className="text-sm font-mono truncate max-w-50">
                        {metadata?.verificationId || "N/A"}
                      </p>
                      {copiedId === metadata?.verificationId ? (
                        <Check className="size-4 text-primary" />
                      ) : (
                        <Copy className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                    </div>
                  </div>

                  {metadata?.status === "authentic" && (
                    <div className="flex flex-col gap-1">
                      <p>Signature by</p>
                      <Link
                        to="/signatures/$id"
                        className="w-fit hover:underline hover:text-primary transition-colors"
                        params={{ id: metadata?.signatureId || "" }}
                      >
                        {metadata?.signature.name || ""}
                      </Link>
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    <p>Filename</p>
                    <p className="truncate max-w-75">
                      {metadata?.name || "N/A"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <p>Created at</p>
                    <p>
                      {new Date(metadata?.createdAt || "").toLocaleString(
                        "en-US",
                        {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        },
                      )}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <p>Last updated</p>
                    <p>
                      {new Date(metadata?.updatedAt || "").toLocaleString(
                        "en-US",
                        {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        },
                      )}
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </div>
        <div className="grid grid-cols-[1fr_22%_22%_22%] gap-4 h-full max-h-screen overflow-hidden">
          <Outlet />
          <DocumentKanbanBoard data={filteredData} />
        </div>
      </div>
    </div>
  );
}
