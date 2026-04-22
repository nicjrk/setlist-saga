import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Music, ListMusic, Users, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const tabs = [
  { to: "/", label: "Songs", icon: Music, end: true },
  { to: "/setlists", label: "Setlists", icon: ListMusic, end: false },
  { to: "/members", label: "Members", icon: Users, end: false },
];

export function AppShell() {
  const location = useLocation();
  const { theme, toggle } = useTheme();
  // Hide chrome in stage mode for full immersion
  const isStage = location.pathname.startsWith("/stage/");

  if (isStage) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <NavLink to="/" className="flex items-center gap-2">
            <img
              src={logo}
              alt="Mello Strings Studio logo"
              className="h-9 w-9 rounded-md object-contain"
            />
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight">
                Mello Strings Studio
              </p>
              <p className="text-[10px] text-muted-foreground">
                Repertoire · Stage
              </p>
            </div>
          </NavLink>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={theme === "dark" ? "Activează light mode" : "Activează dark mode"}
            className="h-9 w-9"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-28 pt-4">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-around px-2 py-2">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                cn(
                  "flex min-w-[88px] flex-col items-center gap-1 rounded-lg px-4 py-2 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}