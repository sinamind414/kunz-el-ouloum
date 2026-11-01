import { ReactNode, useEffect, useRef, useState } from "react";

export default function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    // fallback: never leave content invisible if the observer never fires
    const safety = window.setTimeout(() => setVisible(true), 1200);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            window.setTimeout(() => setVisible(true), delay);
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -4% 0px", threshold: 0 },
    );
    io.observe(el);
    return () => {
      window.clearTimeout(safety);
      io.disconnect();
    };
  }, [delay]);

  return (
    <div ref={ref} className="reveal" data-visible={visible}>
      {children}
    </div>
  );
}
