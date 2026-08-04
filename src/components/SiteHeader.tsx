import { Link } from "@tanstack/react-router";
import { ChevronDown, Search } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="text-xl font-bold tracking-tight text-foreground">
          Seat<span className="text-primary">Sync</span>
        </Link>

        <button className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface border border-border text-sm font-medium text-foreground hover:bg-surface-2 transition-colors">
          Bengaluru
          <ChevronDown size={14} className="text-muted-foreground" />
        </button>

        <div className="flex items-center gap-2">
          <button
            aria-label="Search"
            className="w-9 h-9 rounded-full border border-border bg-surface flex items-center justify-center text-foreground hover:bg-surface-2 transition-colors"
          >
            <Search size={16} />
          </button>
          <ThemeToggle />
          <Link
            to="/admin"
            className="hidden sm:inline-flex items-center px-4 py-2 rounded-full border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
