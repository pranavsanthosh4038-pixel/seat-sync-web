import { toast } from "sonner";

type Kind = "success" | "error" | "warning" | "info";

const DOT: Record<Kind, string> = {
  success: "#2ecc71",
  error: "#e23744",
  warning: "#f39c12",
  info: "#e23744",
};

export function notify(kind: Kind, message: string) {
  toast.custom(
    () => (
      <div
        className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-card border border-border text-sm font-medium text-foreground"
        style={{
          boxShadow: "0 6px 24px -8px rgba(0,0,0,0.25)",
          animation: "toast-up 0.25s ease",
        }}
      >
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: DOT[kind] }}
        />
        {message}
      </div>
    ),
    { duration: 3000 },
  );
}
