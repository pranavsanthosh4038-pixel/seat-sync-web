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

  let bg = "#2ECC71";
  let animation: string | undefined;

  if (status === "locked") {
    bg = "#F39C12";
    animation = "seat-pulse 1.8s ease-in-out infinite";
  } else if (status === "booked" || status === "confirmed") {
    bg = "#333333";
  }

  return (
    <button
      onClick={onClick}
      className="relative flex aspect-square items-center justify-center text-[8px] font-semibold text-white transition-all"
      style={{
        background: bg,
        borderRadius: 4,
        animation,
        outline: selected ? "2px solid #E23744" : "none",
        outlineOffset: 1,
      }}
      title={`${id} · ${status}${queueLength ? ` · ${queueLength} waiting` : ""}`}
    >
      <span className="leading-none">{id}</span>
      {status === "locked" && remaining > 0 && (
        <span className="absolute bottom-0 right-0.5 text-[7px] leading-none">
          {mm}:{ss}
        </span>
      )}
      {queueLength > 0 && (
        <span
          className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold text-white"
          style={{ background: "#E23744" }}
        >
          {queueLength > 9 ? "9+" : queueLength}
        </span>
      )}
    </button>
  );
}
