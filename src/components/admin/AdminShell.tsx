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
    <div
      className="admin-scope min-h-screen"
      style={{
        background:
          "radial-gradient(ellipse at top, #eaf2fb 0%, #f4f7fc 45%, #eef3fb 100%)",
        color: "#2a3547",
      }}
    >
      <header
        className="px-4 md:px-8 py-4 flex items-center justify-between gap-4 flex-wrap"
        style={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #e4ecf6",
        }}
      >
        <div className="flex items-center gap-6">
          <Link
            to="/admin"
            className="text-lg tracking-[0.25em] font-semibold"
            style={{ color: "#2a3547", fontFamily: "var(--font-display)" }}
          >
            SEAT<span style={{ color: "#8a5cd1" }}>SYNC</span>
            <span
              className="ml-2 text-[10px] tracking-widest align-middle font-mono px-1.5 py-0.5 rounded"
              style={{ background: "#fff2c9", color: "#8a6a10" }}
            >
              ADMIN
            </span>
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
                  className="px-3 py-1.5 transition-all"
                  style={
                    active
                      ? {
                          background: "linear-gradient(180deg,#cfe8f7,#87ceeb)",
                          color: "#0f3d55",
                          borderRadius: 10,
                          boxShadow:
                            "0 6px 14px -6px rgba(90,170,210,0.55), inset 0 1px 0 rgba(255,255,255,0.9)",
                        }
                      : {
                          color: "#6b7a92",
                          borderRadius: 10,
                        }
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div
            className="text-right font-mono text-[10px] uppercase tracking-widest hidden sm:block"
          >
            <div style={{ color: "#6b7a92" }}>System</div>
            <div style={{ color: "#2f8a4f" }}>● Online</div>
          </div>
          <div className="text-right font-mono text-[10px]">
            <div className="uppercase tracking-widest" style={{ color: "#6b7a92" }}>
              Operator
            </div>
            <div className="truncate max-w-[160px]" style={{ color: "#2a3547" }}>
              {email ?? "—"}
            </div>
          </div>
          <button
            onClick={signOut}
            className="px-3 py-1.5 pastel-btn-pink font-mono text-[10px] uppercase tracking-widest"
          >
            Sign out
          </button>
        </div>
      </header>
      {children}
      <AiChatWidget />
    </div>
  );
}
