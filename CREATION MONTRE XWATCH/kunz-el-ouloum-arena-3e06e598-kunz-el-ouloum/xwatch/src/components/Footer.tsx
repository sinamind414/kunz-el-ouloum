import { BRAND } from "../lib/brand";

export default function Footer({ onNavigate }: { onNavigate: (to: string) => void }) {
  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src="/assets/monogram.png" alt="XWATCH" />
            <p>{BRAND.description}</p>
            <p style={{ marginTop: 14, color: "var(--muted-2)", fontSize: 11.5, letterSpacing: "0.06em" }}>
              {BRAND.tagline}
            </p>
          </div>

          <div className="footer-col">
            <h4>Boutique</h4>
            <a href="#/configurateur" onClick={(e) => { e.preventDefault(); onNavigate("/configurateur"); }}>
              Configurateur
            </a>
            <a href="#/collection" onClick={(e) => { e.preventDefault(); onNavigate("/collection"); }}>
              Collection
            </a>
            <a href="#/atelier" onClick={(e) => { e.preventDefault(); onNavigate("/atelier"); }}>
              L'atelier
            </a>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <a href={`https://wa.me/${BRAND.whatsapp}`} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
            <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
            <p>
              {BRAND.city}, {BRAND.country}
            </p>
            <p>{BRAND.hours}</p>
          </div>

          <div className="footer-col">
            <h4>Informations</h4>
            <p>Livraison suivie</p>
            <p>Garantie 24 mois</p>
            <p>Retour 14 jours</p>
            <p>Paiement à la commande</p>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} XWATCH — Tous droits réservés</span>
          <span>Fait à {BRAND.city} · Assemblé à la main</span>
          <span>Montres personnalisées · Seiko NH35 / NH34</span>
        </div>
      </div>
    </footer>
  );
}
