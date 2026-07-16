import { useEffect, useState } from "react";

type Props = {
  id: string;
  status: string;
  expiresAt: string | null;
  queueLength: number;
  selected: boolean;
  onClick: () => void;
};

export function SeatCell({ id, status, expiresAt, queueLength, selected, onClick }: Props) {
  const [remaining, setRemaining] = useState<number>(() =>
    expiresAt ? Math.max(0, new Date(expiresAt).getTime() - Date.now()) : 0,
  );

  useEffect(() => {
    if (!expiresAt) return;
    const t = setInterval(() => {
      setRemaining(Math.max(0, new Date(expiresAt).getTime() - Date.now()));
    }, 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  const secs = Math.floor(remaining / 1000);
  const mm = String(Math.floor(secs / 60)).padStart(1, "0");
  const ss = String(secs % 60).padStart(2, "0");

  let color = "#00ff88";
  let bg = "rgba(0,255,136,0.12)";
  let glow = "0 0 6px rgba(0,255,136,0.5)";
  let animation: string | undefined;

  if (status === "locked") {
    color = "#ffcc00";
    bg = "rgba(255,204,0,0.15)";
    glow = "0 0 10px rgba(255,204,0,0.7)";
    animation = "pulse-amber 1.6s infinite";
  } else if (status === "booked") {
    color = "#bf00ff";
    bg = "rgba(191,0,255,0.15)";
    glow = "0 0 8px rgba(191,0,255,0.6)";
  }

  if (selected) {
    color = "#00f0ff";
    bg = "rgba(0,240,255,0.25)";
    glow = "0 0 14px rgba(0,240,255,0.9), inset 0 0 6px rgba(0,240,255,0.4)";
    animation = undefined;
  }

  return (
    <button
      onClick={onClick}
      className="relative aspect-square font-mono text-[8px] flex items-center justify-center transition-all"
      style={{
        color,
        background: bg,
        border: `1px solid ${color}`,
        boxShadow: glow,
        animation,
      }}
      title={`${id} · ${status}${queueLength ? ` · ${queueLength} waiting` : ""}`}
    >
      <span className="leading-none">{id}</span>
      {status === "locked" && remaining > 0 && (
        <span className="absolute -bottom-0.5 right-0.5 text-[7px] leading-none">
          {mm}:{ss}
        </span>
      )}
      {queueLength > 0 && (
        <span
          className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold"
          style={{
            background: "#00f0ff",
            color: "#000",
            boxShadow: "0 0 6px #00f0ff",
          }}
        >
          {queueLength > 9 ? "9+" : queueLength}
        </span>
      )}
    </button>
  );
}
