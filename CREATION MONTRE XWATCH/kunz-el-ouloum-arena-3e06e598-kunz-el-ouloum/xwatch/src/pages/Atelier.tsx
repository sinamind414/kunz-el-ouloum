import Watch from "../configurator/Watch";
import { defaultConfig, presetConfigs } from "../configurator/catalog";
import { BRAND } from "../lib/brand";
import { useNow } from "../lib/useNow";
import Reveal from "../components/Reveal";

export default function Atelier() {
  const now = useNow();
  const config = presetConfigs[2].config;

  return (
    <main>
      <section className="page-head">
        <div className="shell">
          <div className="eyebrow" style={{ marginBottom: 22 }}>
            L'atelier · {BRAND.city}
          </div>
          <h1>
            Une montre ne se choisit pas.
            <br />
            <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Elle se compose.</em>
          </h1>
          <p>
            XWATCH est né d'une obsession simple : permettre à chacun de porter une pièce qui lui ressemble, sans passer par
            les codes rigides des maisons horlogères. Ici, vous décidez du boîtier, du cadran, des aiguilles — nous répondons
            de l'assemblage.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell editorial">
          <Reveal>
            <div>
              <h2>Le geste de l'atelier</h2>
              <p>
                Chaque commande est préparée comme une pièce unique : les composants sont contrôlés à réception (boîtier,
                cadran, aiguilles, mouvement), puis assemblés à la main sous loupe binoculaire. Les aiguilles sont posées à
                la presse, jamais à la pince, pour ne pas marquer le cadran.
              </p>
              <p>
                Vient ensuite le réglage : le mouvement est mesuré au chronocomparateur dans six positions, puis le boîtier
                passe au banc d'étanchéité. Nous ne livrons aucune montre dont la dérive dépasse ±10 secondes par jour.
              </p>
              <p>
                Enfin, la signature : impression du cadran, gravure du fond ou du fermoir. C'est l'étape la plus lente, celle
                où votre pièce cesse d'être un assemblage pour devenir la vôtre.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="figure">
              <Watch config={config} time={now} idPrefix="atelier" showShadow={false} />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          <Reveal>
            <div className="stats">
              <div>
                <strong>2 400+</strong>
                <span>Pièces assemblées</span>
              </div>
              <div>
                <strong>±8 s</strong>
                <span>Dérive moyenne / jour</span>
              </div>
              <div>
                <strong>200 m</strong>
                <span>Test d'étanchéité plongeuse</span>
              </div>
              <div>
                <strong>24 mois</strong>
                <span>Garantie atelier</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          <div className="section-head">
            <div>
              <div className="eyebrow" style={{ marginBottom: 18 }}>Savoir-faire</div>
              <h2>Ce que nous ne négocions pas.</h2>
            </div>
            <p>Quatre engagements tenus sur chaque commande, sans exception.</p>
          </div>

          <div className="process">
            {[
              { n: "I", t: "Mouvement réglé", d: "Seiko NH35 ou NH34, mesuré au chronocomparateur dans six positions avant fermeture du boîtier." },
              { n: "II", t: "Saphir authentique", d: "Verre saphir bombé, antireflet intérieur. Contrôle d'épaisseur et de planéité à réception." },
              { n: "III", t: "Étanchéité testée", d: "Banc de pression à 3 bars minimum, 10 bars sur les modèles plongeuse, joint remplacé à chaque ouverture." },
              { n: "IV", t: "Signature contrôlée", d: "Un aperçu de votre logo ou gravure vous est envoyé avant production. Rien n'est lancé sans votre accord écrit." },
            ].map((s) => (
              <article className="process-step" key={s.n}>
                <div className="num">{s.n}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell materials">
          <Reveal>
            <div className="materials-panel">
              <img className="monogram" src="/assets/monogram.png" alt="" aria-hidden />
              <p className="eyebrow" style={{ position: "relative", zIndex: 1 }}>
                Entretien
              </p>
              <p style={{ position: "relative", zIndex: 1, color: "var(--muted)", fontSize: 14, maxWidth: 340 }}>
                Rincez le bracelet métal à l'eau tiède une fois par mois, évitez les bains chauds (joints) et faites réviser
                votre mouvement tous les 4 à 5 ans. L'atelier s'en charge.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 18 }}>Nous joindre</div>
              <h2 style={{ fontSize: "clamp(28px, 3.6vw, 46px)", fontWeight: 300, marginBottom: 26 }}>
                Parlons de votre pièce.
              </h2>
              <dl className="materials-list">
                <div className="materials-row">
                  <dt>Atelier</dt>
                  <dd>
                    {BRAND.city}, {BRAND.country}
                    <small>Sur rendez-vous — {BRAND.hours}</small>
                  </dd>
                </div>
                <div className="materials-row">
                  <dt>WhatsApp</dt>
                  <dd>
                    <a href={`https://wa.me/${BRAND.whatsapp}`} style={{ color: "var(--gold)" }}>
                      +{BRAND.whatsapp.replace(/(\d{3})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5")}
                    </a>
                    <small>Réponse sous 24 h ouvrées, photos et vidéos de la pièce avant expédition.</small>
                  </dd>
                </div>
                <div className="materials-row">
                  <dt>E-mail</dt>
                  <dd>
                    <a href={`mailto:${BRAND.email}`} style={{ color: "var(--gold)" }}>
                      {BRAND.email}
                    </a>
                    <small>Pour vos logos vectoriels, gravures et demandes sur mesure.</small>
                  </dd>
                </div>
                <div className="materials-row">
                  <dt>Livraison</dt>
                  <dd>
                    {BRAND.delivery}
                    <small>Emballage protecteur double coque, numéro de suivi communiqué le jour de l'expédition.</small>
                  </dd>
                </div>
              </dl>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          <div className="cta">
            <img className="mono" src="/assets/monogram.png" alt="" aria-hidden />
            <h2>
              Passez à <em>l'atelier</em>.
            </h2>
            <p>Un café, les échantillons de cadrans et de bracelets, et deux heures pour composer sans se presser.</p>
            <div className="actions">
              <a className="btn btn--solid" href={`https://wa.me/${BRAND.whatsapp}`} target="_blank" rel="noopener noreferrer">
                <span>Prendre rendez-vous</span>
              </a>
              <a className="btn" href={`mailto:${BRAND.email}`}>
                <span>Écrire à l'atelier</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
