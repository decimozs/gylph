import { useSuspenseQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Eclipse, FilePlusCorner, Files, Search } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useQueryState } from "nuqs";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useMatch } from "@tanstack/react-router";
import Nav from "@/components/nav";
import { documentQueries } from "@/hooks/use-document";
import { Input } from "@/components/ui/input";

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

  const filteredData = data.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase()),
  );

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
        </div>
        <Outlet />
      </div>
    </div>
  );
}
