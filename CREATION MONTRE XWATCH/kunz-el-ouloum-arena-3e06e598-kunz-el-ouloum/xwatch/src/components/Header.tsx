import { useEffect, useState } from "react";
import { BRAND } from "../lib/brand";
import { Currency, useCartCount, useCurrency } from "../lib/store";

interface HeaderProps {
  route: string;
  onNavigate: (to: string) => void;
  onOpenCart: () => void;
}

export default function Header({ route, onNavigate, onOpenCart }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const count = useCartCount();
  const { currency, setCurrency } = useCurrency();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenu(false);
  }, [route]);

  const links = [
    { label: "Accueil", to: "/" },
    { label: "Collection", to: "/collection" },
    { label: "Configurateur", to: "/configurateur" },
    { label: "L'atelier", to: "/atelier" },
  ];

  const go = (to: string) => {
    onNavigate(to);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };

  return (
    <>
      <header className="site-header" data-scrolled={scrolled}>
        <div className="shell header-inner">
          <button className="brand" onClick={() => go("/")} aria-label="XWATCH — accueil">
            <img src="/assets/monogram.png" alt="" />
            <span className="brand-name">
              XWATCH
              <span>Atelier horloger</span>
            </span>
          </button>

          <nav className="nav" aria-label="Navigation principale">
            {links.map((l) => (
              <a
                key={l.to}
                href={`#${l.to}`}
                data-active={route === l.to}
                onClick={(e) => {
                  e.preventDefault();
                  go(l.to);
                }}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="header-tools">
            <div className="currency-toggle" role="group" aria-label="Devise">
              {(["EUR", "DZD"] as Currency[]).map((c) => (
                <button key={c} data-active={currency === c} onClick={() => setCurrency(c)}>
                  {c}
                </button>
              ))}
            </div>
            <button className="cart-button" onClick={onOpenCart} aria-label={`Panier, ${count} article(s)`}>
              Panier
              <span className="cart-count">{count}</span>
            </button>
            <button className="menu-toggle" onClick={() => setMenu((v) => !v)} aria-label="Menu">
              <i />
              <i />
            </button>
          </div>
        </div>
      </header>

      {menu && (
        <div className="mobile-nav">
          <button className="close" onClick={() => setMenu(false)} aria-label="Fermer">
            ✕
          </button>
          {links.map((l) => (
            <a
              key={l.to}
              href={`#${l.to}`}
              onClick={(e) => {
                e.preventDefault();
                go(l.to);
                setMenu(false);
              }}
            >
              {l.label}
            </a>
          ))}
          <a href={`mailto:${BRAND.email}`} onClick={() => setMenu(false)} style={{ fontSize: 16, fontFamily: "var(--sans)", letterSpacing: "0.2em" }}>
            {BRAND.email}
          </a>
        </div>
      )}
    </>
  );
}
