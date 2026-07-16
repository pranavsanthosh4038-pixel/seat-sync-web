import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export function AdminShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const NAV = [
    { to: "/admin", label: "Shows" },
    { to: "/admin/waitlist", label: "Waitlist" },
    { to: "/admin/activity", label: "Activity" },
  ] as const;

  return (
    <div className="min-h-screen">
      <header className="border-b border-neon-cyan/15 px-4 md:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-6">
          <Link to="/admin" className="font-display text-lg tracking-[0.3em] glow-cyan">
            SEAT<span className="text-neon-violet" style={{ textShadow: "0 0 8px #bf00ff" }}>SYNC</span>
            <span className="ml-2 text-[10px] tracking-widest text-neon-amber align-middle font-mono">ADMIN</span>
          </Link>
          <nav className="flex gap-1 font-mono text-[11px] uppercase tracking-widest">
            {NAV.map((item) => {
              const active =
                pathname === item.to ||
                (item.to === "/admin" && pathname.startsWith("/admin/shows"));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-3 py-1.5 border transition-all ${
                    active
                      ? "border-neon-cyan text-neon-cyan box-glow-cyan"
                      : "border-neon-cyan/20 text-muted-foreground hover:text-neon-cyan hover:border-neon-cyan/60"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right font-mono text-[10px] uppercase tracking-widest hidden sm:block">
            <div className="text-neon-cyan/70">System</div>
            <div className="glow-green">ONLINE</div>
          </div>
          <div className="text-right font-mono text-[10px]">
            <div className="text-muted-foreground uppercase tracking-widest">Operator</div>
            <div className="text-neon-cyan truncate max-w-[160px]">{email ?? "—"}</div>
          </div>
          <button
            onClick={signOut}
            className="px-3 py-1.5 border border-destructive/60 text-destructive hover:bg-destructive/10 font-mono text-[10px] uppercase tracking-widest"
          >
            Sign out
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}
