import { useSuspenseQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  CircleCheck,
  Eclipse,
  FilePlusCorner,
  Search,
  Signature,
} from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { verificationQueries } from "@/hooks/use-verification";
import Nav from "@/components/nav";
import ActionsButton from "@/components/actions-button";
import VerificationBadge from "@/components/verification-badge";

export const Route = createFileRoute("/_dashboard/verifications")({
  loader: async ({ context }) => {
    return context.queryClient.ensureQueryData(verificationQueries.getAll());
  },
  beforeLoad: async ({ context }) => {
    const verifications = await context.queryClient.ensureQueryData(
      verificationQueries.getAll(),
    );

    if (!verifications || verifications.length === 0) {
      throw redirect({
        to: "/verify",
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useSuspenseQuery(verificationQueries.getAll());
  const [search, setSearch] = useQueryState("q", {
    defaultValue: "",
    shallow: false,
    clearOnDefault: true,
    throttleMs: 2000,
  });
  const match = useMatch({
    from: "/_dashboard/verifications/$id/",
    shouldThrow: false,
  });
  const activeId = match?.params?.id;
  const filteredData = data.filter((item) =>
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
              placeholder="Search verifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Separator />
          <ScrollArea className="bg-muted/30 rounded-md h-full p-4 overflow-y-auto px-6">
            <div className="flex flex-col gap-4 overflow-y-auto">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <Link
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("verificationId", item.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    to="/verifications/$id"
                    params={{ id: item.id }}
                    key={item.id}
                    preload="viewport"
                    className={`rounded-md overflow-hidden bg-white group relative ${activeId === item.id ? "border-2 border-primary" : ""}`}
                  >
                    <div className="absolute top-1 py-2 px-4">
                      <VerificationBadge status={item.status} />
                    </div>
                    <img
                      src={item.previewImageUrl}
                      alt={`${item.id}-verification`}
                      className={`rounded-md p-4 w-full h-30 object-contain grayscale opacity-40 blur-[0.5px] transition-all duration-300 ease-in-out group-hover:grayscale-0 group-hover:opacity-100 group-hover:blur-none group-hover:scale-110 cursor-pointer ${activeId === item.id ? "grayscale-0 opacity-100 scale-110 blur-none ring-2 ring-primary" : ""} `}
                    />
                    <div className="absolute bottom-0 py-2 px-4">
                      <p className="font-medium text-primary">
                        {Math.round(item.similarityScore * 100)}%
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="flex items-center justify-center h-full mt-12">
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Signature />
                      </EmptyMedia>
                      <EmptyTitle>No Verifications Registered</EmptyTitle>
                      <EmptyDescription>
                        We couldn't find any signatures matching "{search}".
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </div>
              )}
            </div>
          </ScrollArea>
          <Separator />
          <div className="flex flex-row items-center justify-between text-primary font-medium text-sm">
            <p>Index</p>
            <p>
              {filteredData.length}{" "}
              {filteredData.length > 1 ? "Verifications" : "Verification"}
            </p>
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
