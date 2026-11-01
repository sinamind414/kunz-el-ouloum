import { useState } from "react";
import Watch from "../configurator/Watch";
import { defaultConfig, presetConfigs, totalPrice, WatchConfig } from "../configurator/catalog";
import { BRAND } from "../lib/brand";
import { formatMoney, useCurrency } from "../lib/store";
import { useNow } from "../lib/useNow";
import Reveal from "../components/Reveal";

interface Props {
  onNavigate: (to: string) => void;
  onPreset: (config: WatchConfig) => void;
}

const FAQ = [
  {
    q: "Combien de temps pour recevoir ma montre ?",
    a: "Chaque pièce est assemblée à la commande. Comptez 7 à 12 jours ouvrés pour l'Algérie et 2 à 3 semaines pour l'international, réglage et test d'étanchéité inclus.",
  },
  {
    q: "Puis-je fournir mon propre logo ou mon texte ?",
    a: "Oui. Dans le configurateur, choisissez l'onglet « Signature » : importez un PNG transparent ou saisissez un texte. Nous gravons votre marque sur le cadran, le fond ou la couronne. Un contrôle du fichier est fait avant production.",
  },
  {
    q: "Quel mouvement équipe les montres ?",
    a: "Un Seiko NH35 automatique (41 h de réserve de marche), ou NH34 pour les versions GMT. Chaque mouvement est réglé au chronocomparateur avant fermeture du boîtier.",
  },
  {
    q: "Le verre est-il vraiment saphir ?",
    a: "Oui, verre saphir bombé avec traitement antireflet intérieur sur l'ensemble de nos boîtiers. Il ne se raye qu'avec un diamant.",
  },
  {
    q: "Comment se passe le paiement ?",
    a: "Aucun paiement en ligne n'est prélevé sur le site. Après validation de votre configuration par WhatsApp ou e-mail, nous convenons d'un acompte (virement, CCP ou espèces à l'atelier) et du solde à la livraison.",
  },
  {
    q: "La montre est-elle étanche ?",
    a: "Chaque boîtier est testé à 3 bars minimum après assemblage (10 bars sur les modèles plongeuse). Nous ne garantissons pas l'étanchéité après ouverture du boîtier par un tiers.",
  },
];

export default function Home({ onNavigate, onPreset }: Props) {
  const now = useNow();
  const { currency } = useCurrency();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const heroConfig: WatchConfig = {
    ...defaultConfig,
    caseId: "sub-acier",
    dialId: "noir",
    bezelId: "noir",
    rehautId: "marqueurs",
    handsId: "benz-argent",
    secondsId: "rouge",
    braceletId: "oyster",
    magnifier: true,
  };

  return (
    <main>
      {/* ---------------- HERO ---------------- */}
      <section className="hero">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span className="rule" />
              <span className="eyebrow">Atelier horloger · {BRAND.city}, {BRAND.country}</span>
            </div>
            <h1>
              Le temps.
              <em>Votre style.</em>
            </h1>
            <p className="hero-lede">
              Composez votre montre pièce par pièce — boîtier, cadran, lunette, aiguilles, bracelet — puis laissez notre
              atelier l'assembler à la main. Mouvement automatique Seiko, verre saphir, finitions contrôlées une à une.
            </p>
            <div className="hero-actions">
              <button className="btn btn--solid" onClick={() => onNavigate("/configurateur")}>
                <span>Composer ma montre</span>
                <span aria-hidden>→</span>
              </button>
              <button className="btn" onClick={() => onNavigate("/collection")}>
                <span>Voir la collection</span>
              </button>
            </div>
            <div className="hero-specs">
              <div>
                <strong>NH35</strong>
                <span>Automatique</span>
              </div>
              <div>
                <strong>Saphir</strong>
                <span>Antireflet</span>
              </div>
              <div>
                <strong>200 m</strong>
                <span>Étanchéité</span>
              </div>
              <div>
                <strong>24 mois</strong>
                <span>Garantie atelier</span>
              </div>
            </div>
          </div>

          <div className="hero-stage">
            <Watch config={heroConfig} time={now} className="hero-watch" idPrefix="hero" />
            <div className="hero-badge hero-badge--a">
              <span>Modèle</span>
              <b>Sub 40 · Acier</b>
            </div>
            <div className="hero-badge hero-badge--b">
              <span>À partir de</span>
              <b>{formatMoney(totalPrice(heroConfig), currency)}</b>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- MARQUEE ---------------- */}
      <div className="marquee" aria-hidden>
        <div className="marquee-track">
          {Array.from({ length: 2 }).flatMap((_, k) =>
            ["Assemblage à Oran", "Seiko NH35 / NH34", "Verre saphir", "Cadrans personnalisés", "Gravure laser", "Livraison mondiale", "Pièces uniques"].map(
              (item, i) => <span key={`${k}-${i}`}>{item}</span>,
            ),
          )}
        </div>
      </div>

      {/* ---------------- PROCESS ---------------- */}
      <section className="section">
        <div className="shell">
          <div className="section-head">
            <div>
              <div className="eyebrow" style={{ marginBottom: 18 }}>La méthode</div>
              <h2>
                Quatre gestes, <em>une montre</em> qui n'existe qu'une fois.
              </h2>
            </div>
            <p>
              Le configurateur affiche votre pièce en temps réel. Rien n'est produit avant votre validation : vous voyez
              exactement ce qui sera assemblé.
            </p>
          </div>

          <Reveal>
            <div className="process">
              {[
                { n: "01", t: "Composez", d: "Choisissez boîtier, cadran, lunette, aiguilles et bracelet. Chaque option modifie instantanément le rendu et le prix." },
                { n: "02", t: "Signez", d: "Ajoutez votre texte, vos initiales ou votre logo sur le cadran, le fond de boîtier ou la couronne." },
                { n: "03", t: "Validez", d: "Nous vérifions la compatibilité des composants, la lisibilité de votre signature et le délai. Devis définitif sous 24 h." },
                { n: "04", t: "Recevez", d: "Assemblage, réglage au chronocomparateur, test d'étanchéité, écrin et expédition suivie." },
              ].map((s) => (
                <article className="process-step" key={s.n}>
                  <div className="num">{s.n}</div>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </article>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- PRESETS ---------------- */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          <div className="section-head">
            <div>
              <div className="eyebrow" style={{ marginBottom: 18 }}>Collection signature</div>
              <h2>
                Trois compositions, <em>mille variantes</em>.
              </h2>
            </div>
            <button className="btn btn--ghost" onClick={() => onNavigate("/collection")}>
              <span>Toute la collection →</span>
            </button>
          </div>

          <div className="presets">
            {presetConfigs.map((p) => (
              <Reveal key={p.name}>
                <article className="preset-card">
                  <span className="arrow">Personnaliser →</span>
                  <div className="stage">
                    <Watch config={p.config} time={now} idPrefix={`preset-${p.name}`} showShadow={false} showStrap={false} />
                  </div>
                  <div className="meta">
                    <div>
                      <h3>{p.name}</h3>
                      <p>{p.subtitle}</p>
                    </div>
                    <div className="price">{formatMoney(totalPrice(p.config), currency)}</div>
                  </div>
                  <button
                    className="btn"
                    style={{ width: "100%", marginTop: 18 }}
                    onClick={() => onPreset(p.config)}
                  >
                    <span>Partir de ce modèle</span>
                  </button>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- MATERIALS ---------------- */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell materials">
          <Reveal>
            <div>
              <div className="eyebrow" style={{ marginBottom: 18 }}>Matières</div>
              <h2 style={{ fontSize: "clamp(30px, 4vw, 50px)", fontWeight: 300 }}>
                La matière avant <em style={{ fontStyle: "italic", color: "var(--gold)" }}>l'effet</em>.
              </h2>
              <dl className="materials-list">
                <div className="materials-row">
                  <dt>Boîtier</dt>
                  <dd>
                    Acier 316L, PVD or / or rose / noir
                    <small>Brossé ou poli main, couronne vissée, fond gravé à la demande.</small>
                  </dd>
                </div>
                <div className="materials-row">
                  <dt>Verre</dt>
                  <dd>
                    Saphir bombé, antireflet
                    <small>Une dureté de 9 Mohs : seule une rayure au diamant peut le marquer.</small>
                  </dd>
                </div>
                <div className="materials-row">
                  <dt>Mouvement</dt>
                  <dd>
                    Seiko NH35 · NH34 GMT
                    <small>41 h de réserve, réglé et contrôlé au chronocomparateur avant fermeture.</small>
                  </dd>
                </div>
                <div className="materials-row">
                  <dt>Bracelet</dt>
                  <dd>
                    Oyster, jubilé, FKM, cuir, NATO
                    <small>Maillons vissés, fermoir déployant, boucles gravées sur demande.</small>
                  </dd>
                </div>
              </dl>
            </div>
          </Reveal>

          <Reveal>
            <div className="materials-panel">
              <img className="monogram" src="/assets/monogram.png" alt="" aria-hidden />
              <p className="eyebrow" style={{ position: "relative", zIndex: 1 }}>
                Atelier XWATCH
              </p>
              <p style={{ position: "relative", zIndex: 1, color: "var(--muted)", fontSize: 14, maxWidth: 320 }}>
                « Une montre n'est pas un accessoire : c'est une signature portée au poignet. »
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- TESTIMONIALS ---------------- */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          <div className="section-head">
            <div>
              <div className="eyebrow" style={{ marginBottom: 18 }}>Ils portent XWATCH</div>
              <h2>
                Des pièces qui <em>voyagent</em>.
              </h2>
            </div>
            <p>Oran, Alger, Paris, Dubaï : nos montres quittent l'atelier avec un certificat de composition nominatif.</p>
          </div>

          <div className="quotes">
            {[
              {
                q: "J'ai composé une plongeuse noire avec le fond gravé au prénom de mon père. Le rendu est encore plus net qu'à l'écran.",
                c: "Yacine B. · Oran",
              },
              {
                q: "Le configurateur m'a permis de tester vingt combinaisons avant de choisir. Livraison en dix jours, écrin impeccable.",
                c: "Sabrina K. · Alger",
              },
              {
                q: "J'ai commandé une GMT or rose pour un mariage. La gravure du fermoir est d'une finesse rare.",
                c: "Mehdi R. · Paris",
              },
            ].map((t) => (
              <article className="quote" key={t.c}>
                <div className="stars">★★★★★</div>
                <blockquote>« {t.q} »</blockquote>
                <cite>{t.c}</cite>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          <div className="section-head">
            <div>
              <div className="eyebrow" style={{ marginBottom: 18 }}>Questions fréquentes</div>
              <h2>Avant de composer.</h2>
            </div>
          </div>
          <div className="faq">
            {FAQ.map((item, i) => (
              <div className="faq-item" key={item.q} data-open={openFaq === i}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
                  {item.q}
                  <span className="ico" aria-hidden>
                    +
                  </span>
                </button>
                <div className="faq-answer">
                  <div>
                    <p>{item.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          <Reveal>
            <div className="cta">
              <img className="mono" src="/assets/monogram.png" alt="" aria-hidden />
              <h2>
                Votre montre vous <em>attend</em>.
              </h2>
              <p>Le configurateur est gratuit, sans compte et sans engagement. Votre composition est sauvegardée sur votre appareil.</p>
              <div className="actions">
                <button className="btn btn--solid" onClick={() => onNavigate("/configurateur")}>
                  <span>Ouvrir le configurateur</span>
                </button>
                <a className="btn" href={`mailto:${BRAND.email}`}>
                  <span>Parler à l'atelier</span>
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
