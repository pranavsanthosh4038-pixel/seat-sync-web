import { useState } from "react";
import { toast } from "sonner";
import { lockSeat, releaseSeat, type Seat } from "@/lib/seats";

export function AdminPanel({ seats }: { seats: Seat[] }) {
  const [selected, setSelected] = useState<string>(seats[0]?.id ?? "A1");
  const [open, setOpen] = useState(true);
  const [busy, setBusy] = useState(false);

  const onLock = async () => {
    setBusy(true);
    try {
      await lockSeat(selected);
      toast(`Seat ${selected} locked — releases in 2 min`, {
        style: {
          background: "#0d0d0d",
          border: "1px solid #ffcc00",
          color: "#ffcc00",
          boxShadow: "0 0 20px rgba(255,204,0,0.4)",
          fontFamily: "Space Mono, monospace",
        },
      });
    } catch (e) {
      toast.error(String((e as Error).message));
    } finally {
      setBusy(false);
    }
  };

  const onRelease = async () => {
    setBusy(true);
    try {
      const notified = await releaseSeat(selected);
      if (notified) {
        toast(`Would notify ${notified.phone} — #${notified.position} in queue for ${selected}`, {
          style: {
            background: "#0d0d0d",
            border: "1px solid #00f0ff",
            color: "#00f0ff",
            boxShadow: "0 0 20px rgba(0,240,255,0.4)",
            fontFamily: "Space Mono, monospace",
          },
        });
      }
    } catch (e) {
      toast.error(String((e as Error).message));
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 px-4 py-2 font-display text-xs tracking-widest uppercase"
        style={{
          background: "#0d0d0d",
          border: "1px solid #ffcc00",
          color: "#ffcc00",
          boxShadow: "0 0 10px rgba(255,204,0,0.5)",
        }}
      >
        Admin
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-50 w-80 p-4 font-mono text-xs"
      style={{
        background: "#0d0d0d",
        border: "1px solid #ffcc00",
        boxShadow: "0 0 20px rgba(255,204,0,0.35), inset 0 0 10px rgba(255,204,0,0.1)",
        borderRadius: "8px",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-sm tracking-widest glow-amber">ADMIN // DEMO</h3>
        <button
          onClick={() => setOpen(false)}
          className="text-neon-amber/70 hover:text-neon-amber text-lg leading-none"
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <div className="text-neon-amber/70 mb-1 uppercase tracking-widest text-[10px]">Select Seat</div>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full mb-3 px-2 py-2 bg-black border border-neon-amber/40 text-neon-amber font-mono"
      >
        {seats.map((s) => (
          <option key={s.id} value={s.id}>
            {s.id} — {s.status}
          </option>
        ))}
      </select>
      <button
        onClick={onLock}
        disabled={busy}
        className="w-full mb-2 py-2 font-display tracking-widest uppercase text-xs disabled:opacity-50"
        style={{
          background: "transparent",
          border: "1px solid #ffcc00",
          color: "#ffcc00",
          boxShadow: "0 0 8px rgba(255,204,0,0.3)",
        }}
      >
        Lock Seat (2 min)
      </button>
      <button
        onClick={onRelease}
        disabled={busy}
        className="w-full py-2 font-display tracking-widest uppercase text-xs disabled:opacity-50"
        style={{
          background: "transparent",
          border: "1px solid #00ff88",
          color: "#00ff88",
          boxShadow: "0 0 8px rgba(0,255,136,0.3)",
        }}
      >
        Release Seat Now
      </button>
      <div className="mt-3 text-[10px] text-neon-amber/50 uppercase tracking-widest">
        Simulates cancellation flow
      </div>
    </div>
  );
}
