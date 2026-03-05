import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "./index.css";
import QueryProvider from "./components/provider/query-provider";
import { ThemeProvider } from "./components/provider/theme-provider";
import { QueryClient } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/react";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/sonner";

export const queryClient = new QueryClient();

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryProvider>
        <NuqsAdapter>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <TooltipProvider>
              <Toaster />
              <RouterProvider router={router} />
            </TooltipProvider>
          </ThemeProvider>
        </NuqsAdapter>
      </QueryProvider>
    </StrictMode>,
  );
}
