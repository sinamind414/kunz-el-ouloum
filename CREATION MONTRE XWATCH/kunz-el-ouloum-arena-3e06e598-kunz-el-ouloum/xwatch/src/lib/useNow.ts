import { useEffect, useState } from "react";

/** Horloge fluide (rafraîchie chaque seconde) pour les aiguilles de la montre. */
export function useNow(active = true): Date | null {
  const [now, setNow] = useState<Date | null>(active ? new Date() : null);

  useEffect(() => {
    if (!active) return;
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, [active]);

  return now;
}
