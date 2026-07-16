import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "SeatSync Admin // Sign In" },
      { name: "description", content: "Staff sign-in for SeatSync control room." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Access granted");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        toast.success("Staff account created");
      }
      navigate({ to: "/admin" });
    } catch (err: any) {
      toast.error(err?.message ?? "Sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm panel p-6" style={{ boxShadow: "0 0 30px rgba(0,240,255,0.2)" }}>
        <div className="text-center mb-6">
          <h1 className="font-display text-2xl tracking-[0.3em] glow-cyan">
            SEAT<span className="text-neon-violet" style={{ textShadow: "0 0 10px #bf00ff" }}>SYNC</span>
          </h1>
          <div className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase mt-2">
            Admin Control Room // Access Required
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full mt-1 px-3 py-2 bg-black border border-neon-cyan/30 font-mono text-sm text-foreground focus:outline-none focus:border-neon-cyan focus:box-glow-cyan"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              className="w-full mt-1 px-3 py-2 bg-black border border-neon-cyan/30 font-mono text-sm text-foreground focus:outline-none focus:border-neon-cyan focus:box-glow-cyan"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 font-display tracking-[0.25em] uppercase text-xs disabled:opacity-40 transition-all"
            style={{
              background: "rgba(0,240,255,0.1)",
              border: "1px solid #00f0ff",
              color: "#00f0ff",
              boxShadow: "0 0 16px rgba(0,240,255,0.4)",
            }}
          >
            {busy ? "…" : mode === "signin" ? "Sign In" : "Create Staff Account"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
              className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-neon-cyan"
            >
              {mode === "signin" ? "Need an account? Register" : "Have an account? Sign in"}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-neon-cyan/15 text-center">
          <Link to="/" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-neon-cyan">
            ← Public site
          </Link>
        </div>
      </div>
    </div>
  );
}
