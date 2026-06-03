import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ShieldCheck } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Error 404</p>
        <h1 className="mt-3 text-4xl font-semibold text-foreground">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The resource you requested is not available in this workspace.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Return to console
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">Operation failed</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Retry
          </button>
          <a href="/" className="rounded-sm border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-accent">
            Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Incident Response Commander" },
      { name: "description", content: "AI-assisted cyber incident response platform for security operations teams." },
      { property: "og:title", content: "Incident Response Commander" },
      { property: "og:description", content: "AI-assisted cyber incident response platform for security operations teams." },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center bg-brand text-brand-foreground">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold tracking-tight">Incident Response Commander</span>
            <span className="hidden font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:inline">v1.0</span>
          </div>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link to="/" className="rounded-sm px-3 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" activeProps={{ className: "rounded-sm px-3 py-1.5 text-foreground bg-accent" }} activeOptions={{ exact: true }}>
            Overview
          </Link>
          <Link to="/analyze" className="rounded-sm px-3 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" activeProps={{ className: "rounded-sm px-3 py-1.5 text-foreground bg-accent" }}>
            Analyze
          </Link>
        </nav>
      </div>
    </header>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <TopBar />
        <main className="flex-1"><Outlet /></main>
        <footer className="border-t border-border bg-surface">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono uppercase tracking-widest">Incident Response Commander</p>
            <p>Enterprise SOC platform — AI-assisted triage, containment, and recovery.</p>
          </div>
        </footer>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
