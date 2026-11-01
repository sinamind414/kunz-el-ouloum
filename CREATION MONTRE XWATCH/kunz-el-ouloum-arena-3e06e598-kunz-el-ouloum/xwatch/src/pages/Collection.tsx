import Watch from "../configurator/Watch";
import { defaultConfig, presetConfigs, totalPrice, WatchConfig } from "../configurator/catalog";
import { formatMoney, useCurrency } from "../lib/store";
import { useNow } from "../lib/useNow";
import Reveal from "../components/Reveal";

const EXTRA: { name: string; subtitle: string; config: WatchConfig }[] = [
  {
    name: "Acier & Météorite",
    subtitle: "Cadran météorite, lunette Pepsi",
    config: {
      ...defaultConfig,
      caseId: "sub-acier",
      dialId: "meteorite",
      bezelId: "pepsi",
      handsId: "benz-argent",
      braceletId: "oyster-brosse",
      rehautId: "marqueurs",
    },
  },
  {
    name: "Squelette", subtitle: "Mouvement visible, boîtier Pilot",
    config: {
      ...defaultConfig,
      caseId: "pilot-38",
      dialId: "squelette",
      bezelId: "acier",
      handsId: "nautilus-argent",
      braceletId: "cuir",
      magnifier: false,
    },
  },
  {
    name: "Noir intégral", subtitle: "PVD noir, lume ivoire",
    config: {
      ...defaultConfig,
      caseId: "sub-noir",
      dialId: "noir",
      bezelId: "carbone",
      handsId: "benz-argent",
      secondsId: "orange",
      braceletId: "rubber-noir",
      magnifier: false,
    },
  },
];

interface Props {
  onPreset: (config: WatchConfig) => void;
  onNavigate: (to: string) => void;
}

export default function Collection({ onPreset }: Props) {
  const now = useNow();
  const { currency } = useCurrency();
  const all = [...presetConfigs, ...EXTRA];

  return (
    <main>
      <section className="page-head">
        <div className="shell">
          <div className="eyebrow" style={{ marginBottom: 22 }}>
            Collection · Édition atelier
          </div>
          <h1>
            Des compositions prêtes à porter,
            <br />
            <em style={{ fontStyle: "italic", color: "var(--gold)" }}>toutes personnalisables.</em>
          </h1>
          <p>
            Chaque modèle ci-dessous est une base : ouvrez-la dans le configurateur et changez le cadran, la lunette ou le
            bracelet. Le prix se met à jour à chaque geste.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 52 }}>
        <div className="shell">
          <div className="presets">
            {all.map((p, i) => (
              <Reveal key={p.name} delay={i * 60}>
                <article className="preset-card">
                  <span className="arrow">Réf. 0{i + 1}</span>
                  <div className="stage">
                    <Watch config={p.config} time={now} idPrefix={`col-${i}`} showShadow={false} showStrap={false} />
                  </div>
                  <div className="meta">
                    <div>
                      <h3>{p.name}</h3>
                      <p>{p.subtitle}</p>
                    </div>
                    <div className="price">{formatMoney(totalPrice(p.config), currency)}</div>
                  </div>
                  <button className="btn" style={{ width: "100%", marginTop: 18 }} onClick={() => onPreset(p.config)}>
                    <span>Personnaliser ce modèle</span>
                  </button>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          <div className="cta">
            <h2>
              Aucun modèle ne vous ressemble ? <em>Composez-le.</em>
            </h2>
            <p>Le configurateur vous laisse assembler chaque pièce, du boîtier au fermoir gravé.</p>
            <div className="actions">
              <a className="btn btn--solid" href="#/configurateur">
                <span>Ouvrir le configurateur</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
