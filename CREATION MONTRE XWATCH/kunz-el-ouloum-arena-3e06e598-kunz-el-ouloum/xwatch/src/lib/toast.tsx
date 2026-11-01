import { useEffect, useState } from "react";

type Toast = { id: number; message: string };
const listeners = new Set<(t: Toast) => void>();
let seq = 0;

export function toast(message: string) {
  const t = { id: ++seq, message };
  listeners.forEach((l) => l(t));
}

export function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    const add = (t: Toast) => {
      setItems((prev) => [...prev, t]);
      setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== t.id)), 3200);
    };
    listeners.add(add);
    return () => {
      listeners.delete(add);
    };
  }, []);

  if (!items.length) return null;
  return (
    <div className="toast-stack" aria-live="polite">
      {items.map((t) => (
        <div className="toast" key={t.id}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
