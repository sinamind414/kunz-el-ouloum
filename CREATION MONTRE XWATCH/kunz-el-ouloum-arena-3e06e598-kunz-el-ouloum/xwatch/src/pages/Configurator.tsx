import { useEffect, useMemo, useRef, useState } from "react";
import Watch from "../configurator/Watch";
import {
  BASE_PRICE,
  BraceletOption,
  CaseOption,
  DialOption,
  engravingSpots,
  findBezel,
  findBracelet,
  findCase,
  findCaseback,
  findDial,
  findEngraving,
  findGmt,
  findHands,
  findRehaut,
  findSeconds,
  logoPrices,
  bezels,
  bracelets,
  cases,
  casebacks,
  dials,
  gmts,
  hands,
  priceBreakdown,
  rehauts,
  seconds,
  specSummary,
  totalPrice,
  WatchConfig,
} from "../configurator/catalog";
import {
  BraceletSwatch,
  BezelSwatch,
  CaseSwatch,
  CasebackSwatch,
  DialSwatch,
  GmtSwatch,
  HandsSwatch,
  LogoSample,
  RehautSwatch,
  SecondsSwatch,
} from "../components/Swatch";
import { configName, configReference, encodeConfig, formatDelta, formatMoney, useCurrency } from "../lib/store";
import { toast } from "../lib/toast";
import { useNow } from "../lib/useNow";

type TabId =
  | "boitier"
  | "cadran"
  | "lunette"
  | "rehaut"
  | "aiguilles"
  | "trotteuse"
  | "gmt"
  | "bracelet"
  | "fond"
  | "gravure"
  | "signature"
  | "recap";

const TABS: { id: TabId; label: string; hint: string }[] = [
  { id: "boitier", label: "Boîtier", hint: "La silhouette et le métal de votre pièce." },
  { id: "cadran", label: "Cadran", hint: "Couleur, matière et index. Le visage de la montre." },
  { id: "lunette", label: "Lunette", hint: "Insert plongeuse, cannelée ou lisse selon le boîtier." },
  { id: "rehaut", label: "Rehaut", hint: "L'anneau intérieur, avec ou sans graduation." },
  { id: "aiguilles", label: "Aiguilles", hint: "Benz, bâton, flocon ou nautilus." },
  { id: "trotteuse", label: "Trotteuse", hint: "Le détail qui signe le poignet." },
  { id: "gmt", label: "GMT", hint: "Optionnel : second fuseau horaire et mouvement NH34." },
  { id: "bracelet", label: "Bracelet", hint: "Métal, caoutchouc, cuir ou NATO." },
  { id: "fond", label: "Fond", hint: "Plein ou transparent, gravure possible." },
  { id: "gravure", label: "Gravure", hint: "Initiales, date, une phrase — sur mesure." },
  { id: "signature", label: "Signature", hint: "Votre nom, votre marque, sur le cadran." },
  { id: "recap", label: "Récapitulatif", hint: "Tout ce qui compose votre pièce, ligne par ligne." },
];

interface Props {
  config: WatchConfig;
  onChange: <K extends keyof WatchConfig>(key: K, value: WatchConfig[K]) => void;
  onReset: () => void;
  onAddToCart: (config: WatchConfig) => void;
}

export default function ConfiguratorPage({ config, onChange, onReset, onAddToCart }: Props) {
  const [tab, setTab] = useState<TabId>("boitier");
  const [showStrap, setShowStrap] = useState(true);
  const now = useNow();
  const { currency } = useCurrency();
  const stageRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  const c = findCase(config.caseId);
  const d = findDial(config.dialId);
  const b = findBracelet(config.braceletId);
  const specs = specSummary(config);
  const total = totalPrice(config);
  const lines = priceBreakdown(config);

  const activeTab = TABS.find((t) => t.id === tab)!;

  const scrollTabs = (dir: number) => {
    const strip = tabsRef.current;
    if (!strip) return;
    if (typeof strip.scrollBy !== "function") return;
    strip.scrollBy({ left: dir * Math.max(220, strip.clientWidth * 0.7), behavior: "smooth" });
  };

  useEffect(() => {
    // keep the active tab visible inside the horizontal tab strip (no page scroll)
    const strip = tabsRef.current;
    const el = strip?.querySelector<HTMLElement>(`[data-tab="${tab}"]`);
    if (!strip || !el) return;
    if (typeof strip.scrollTo !== "function") return;
    const target = el.offsetLeft - strip.clientWidth / 2 + el.clientWidth / 2;
    strip.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [tab]);

  const handleShare = async () => {
    const token = encodeConfig(config);
    const url = `${window.location.origin}${window.location.pathname}#/configurateur?c=${token}`;
    try {
      await navigator.clipboard.writeText(url);
      toast("Lien de votre composition copié");
    } catch {
      toast("Copie impossible — sélectionnez le lien manuellement");
      window.prompt("Lien de votre composition :", url);
    }
  };

  const handleDownload = () => {
    const svg = stageRef.current?.querySelector("svg");
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", "1200");
    clone.setAttribute("height", "1800");
    const xml = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 1800;
      const ctx = canvas.getContext("2d")!;
      const grad = ctx.createRadialGradient(600, 760, 100, 600, 760, 900);
      grad.addColorStop(0, "#191a1c");
      grad.addColorStop(1, "#060607");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((b) => {
        if (!b) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(b);
        a.download = `xwatch-${configReference(config)}.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      }, "image/png");
      toast("Visuel téléchargé");
    };
    img.onerror = () => toast("Export impossible sur ce navigateur");
    img.src = url;
  };

  const shareMarkup = (
    <>
      <div className="stage-tools">
        <button className="icon-btn" title="Partager ma composition" onClick={handleShare} aria-label="Partager">
          ↗
        </button>
        <button className="icon-btn" title="Télécharger le visuel" onClick={handleDownload} aria-label="Télécharger">
          ↓
        </button>
        <button
          className="icon-btn"
          title={showStrap ? "Masquer le bracelet" : "Afficher le bracelet"}
          onClick={() => setShowStrap((v) => !v)}
          data-active={showStrap}
          aria-label="Bracelet"
        >
          ⌖
        </button>
        <button className="icon-btn" title="Réinitialiser" onClick={onReset} aria-label="Réinitialiser">
          ↺
        </button>
      </div>
    </>
  );

  return (
    <main className="configurator">
      <div className="shell configurator-top">
        <div className="breadcrumb">
          <a href="#/">Accueil</a>
          <span>/</span>
          <span style={{ color: "var(--ivory)" }}>Configurateur</span>
        </div>
        <div className="config-actions">
          <span className="eyebrow config-top-label" style={{ alignSelf: "center" }}>
            Réf. {configReference(config)}
          </span>
          <button className="mini-btn" onClick={handleShare}>
            Partager
          </button>
          <button className="mini-btn" data-secondary="true" onClick={handleDownload}>
            Visuel
          </button>
          <button className="mini-btn" data-secondary="true" onClick={onReset}>
            Réinitialiser
          </button>
        </div>
      </div>

      <div className="config-body">
        {/* -------- STAGE -------- */}
        <section className="watch-stage" aria-label="Aperçu de votre montre">
          {shareMarkup}
          <div className="stage-inner" ref={stageRef}>
            <Watch config={config} time={now} showStrap={showStrap} idPrefix="stage" />
          </div>
          <div className="stage-caption">
            <div>
              <h2>{configName(config)}</h2>
              <p>
                {c.metal === "gold" ? "Or jaune" : c.metal === "rose" ? "Or rose" : c.metal === "black" ? "PVD noir" : "Acier"} ·{" "}
                {d.texture === "sunburst" ? "soleil" : d.texture === "meteorite" ? "météorite" : d.texture === "skeleton" ? "squelette" : d.texture}
              </p>
            </div>
            <div className="stage-specs">
              <div>
                <strong>{specs.diameter} mm</strong>
                <span>Diamètre</span>
              </div>
              <div>
                <strong>{specs.movement.replace("Seiko ", "")}</strong>
                <span>Mouvement</span>
              </div>
              <div>
                <strong>{specs.water} m</strong>
                <span>Étanchéité</span>
              </div>
            </div>
          </div>
        </section>

        {/* -------- OPTIONS -------- */}
        <section className="options-pane">
          <div className="tabs-wrap">
            <div className="tabs" ref={tabsRef} role="tablist" aria-label="Catégories">
              {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                data-tab={t.id}
                aria-selected={tab === t.id}
                className="tab"
                data-active={tab === t.id}
                onClick={() => setTab(t.id)}
              >
                {t.label}
                {t.id === "gmt" && config.gmtId !== "none" && <span className="dot" />}
                {t.id === "gravure" && config.engraving.spot !== "none" && <span className="dot" />}
                {t.id === "signature" && config.logo.mode !== "brand" && <span className="dot" />}
              </button>
              ))}
            </div>
            <div className="tabs-fade" aria-hidden />
            <button className="tab-arrow" aria-label="Catégories suivantes" onClick={() => scrollTabs(1)}>
              →
            </button>
          </div>

          <div className="option-body">
            <div className="option-head">
              <h3>{activeTab.label}</h3>
              <p>{activeTab.hint}</p>
            </div>

            {tab === "boitier" && (
              <CaseGrid
                selected={config.caseId}
                onSelect={(id) => {
                  onChange("caseId", id);
                  const next = findCase(id);
                  if (next.bezel !== "dive" && !["acier", "or"].includes(config.bezelId)) {
                    onChange("bezelId", "acier");
                    toast("Lunette ajustée au nouveau boîtier");
                  }
                }}
              />
            )}
            {tab === "cadran" && <DialGrid selected={config.dialId} onSelect={(id) => onChange("dialId", id)} />}
            {tab === "lunette" && (
              <>
                <p className="option-note">
                  {c.bezel === "dive"
                    ? "Inserts compatibles avec la lunette plongeuse de ce boîtier."
                    : "Ce boîtier à lunette " + (c.bezel === "fluted" ? "cannelée" : "lisse") + " reçoit uniquement une finition métal."}
                </p>
                <BezelGrid
                  selected={config.bezelId}
                  onSelect={(id) => onChange("bezelId", id)}
                  allowed={c.bezel === "dive" ? undefined : ["acier", "or"]}
                />
              </>
            )}
            {tab === "rehaut" && <RehautGrid selected={config.rehautId} onSelect={(id) => onChange("rehautId", id)} />}
            {tab === "aiguilles" && <HandsGrid selected={config.handsId} onSelect={(id) => onChange("handsId", id)} />}
            {tab === "trotteuse" && <SecondsGrid selected={config.secondsId} onSelect={(id) => onChange("secondsId", id)} />}
            {tab === "gmt" && (
              <>
                <p className="option-note">
                  Sans GMT, votre montre reçoit un NH35. Avec une aiguille GMT, nous installons un NH34 et réglons le second
                  fuseau.
                </p>
                <GmtGrid selected={config.gmtId} onSelect={(id) => onChange("gmtId", id)} />
              </>
            )}
            {tab === "bracelet" && <BraceletGrid selected={config.braceletId} onSelect={(id) => onChange("braceletId", id)} />}
            {tab === "fond" && (
              <CasebackGrid
                selected={config.casebackId}
                engraving={config.engraving.spot}
                onSelect={(id) => onChange("casebackId", id)}
                onEngraving={(spot) => {
                  onChange("engraving", { ...config.engraving, spot });
                  setTab("gravure");
                }}
              />
            )}
            {tab === "gravure" && <EngravingPanel config={config} onChange={onChange} />}
            {tab === "signature" && <SignaturePanel config={config} onChange={onChange} />}
            {tab === "recap" && (
              <SummaryPanel
                config={config}
                lines={lines}
                total={total}
                currency={currency}
                onAdd={() => onAddToCart(config)}
                onJump={(t) => setTab(t)}
              />
            )}
          </div>

          <div className="price-bar">
            <div className="price-total">
              <span className="label">Total</span>
              <strong>{formatMoney(total, currency)}</strong>
              <small>{priceBreakdown(config).length - 1} options · TVA incl.</small>
            </div>
            <div className="actions">
              <button className="btn" onClick={() => setTab("recap")}>
                <span>Détail</span>
              </button>
              <button className="btn btn--solid" onClick={() => onAddToCart(config)}>
                <span>Ajouter au panier</span>
                <span aria-hidden>→</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Grids                                                               */
/* ------------------------------------------------------------------ */

function OptionCard({
  selected,
  label,
  price,
  currency,
  onClick,
  children,
}: {
  selected: boolean;
  label: string;
  price?: number;
  currency: "EUR" | "DZD";
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button className="option-card" data-selected={selected} onClick={onClick} aria-pressed={selected}>
      <div className="swatch">{children}</div>
      <span className="label">{label}</span>
      {typeof price === "number" && (
        <span className="delta" data-paid={price > 0}>
          {formatDelta(price, currency)}
        </span>
      )}
    </button>
  );
}

function CaseGrid({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const { currency } = useCurrency();
  return (
    <div className="option-grid">
      {cases.map((option: CaseOption) => (
        <OptionCard key={option.id} selected={selected === option.id} label={option.name} price={option.price} currency={currency} onClick={() => onSelect(option.id)}>
          <CaseSwatch option={option} />
        </OptionCard>
      ))}
    </div>
  );
}

function DialGrid({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const { currency } = useCurrency();
  return (
    <div className="option-grid">
      {dials.map((option: DialOption) => (
        <OptionCard key={option.id} selected={selected === option.id} label={option.name} price={option.price} currency={currency} onClick={() => onSelect(option.id)}>
          <DialSwatch option={option} />
        </OptionCard>
      ))}
    </div>
  );
}

function BezelGrid({ selected, onSelect, allowed }: { selected: string; onSelect: (id: string) => void; allowed?: string[] }) {
  const { currency } = useCurrency();
  const list = allowed ? bezels.filter((b) => allowed.includes(b.id)) : bezels;
  return (
    <div className="option-grid">
      {list.map((option) => (
        <OptionCard key={option.id} selected={selected === option.id} label={option.name} price={option.price} currency={currency} onClick={() => onSelect(option.id)}>
          <BezelSwatch option={option} />
        </OptionCard>
      ))}
    </div>
  );
}

function RehautGrid({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const { currency } = useCurrency();
  return (
    <div className="option-grid">
      {rehauts.map((option) => (
        <OptionCard key={option.id} selected={selected === option.id} label={option.name} price={option.price} currency={currency} onClick={() => onSelect(option.id)}>
          <RehautSwatch option={option} />
        </OptionCard>
      ))}
    </div>
  );
}

function HandsGrid({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const { currency } = useCurrency();
  return (
    <div className="option-grid">
      {hands.map((option) => (
        <OptionCard key={option.id} selected={selected === option.id} label={option.name} price={option.price} currency={currency} onClick={() => onSelect(option.id)}>
          <HandsSwatch option={option} />
        </OptionCard>
      ))}
    </div>
  );
}

function SecondsGrid({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const { currency } = useCurrency();
  return (
    <div className="option-grid">
      {seconds.map((option) => (
        <OptionCard key={option.id} selected={selected === option.id} label={option.name} price={option.price} currency={currency} onClick={() => onSelect(option.id)}>
          <SecondsSwatch option={option} />
        </OptionCard>
      ))}
    </div>
  );
}

function GmtGrid({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const { currency } = useCurrency();
  return (
    <div className="option-grid">
      {gmts.map((option) => (
        <OptionCard key={option.id} selected={selected === option.id} label={option.name} price={option.price} currency={currency} onClick={() => onSelect(option.id)}>
          <GmtSwatch option={option} />
        </OptionCard>
      ))}
    </div>
  );
}

function BraceletGrid({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const { currency } = useCurrency();
  return (
    <div className="option-grid">
      {bracelets.map((option: BraceletOption) => (
        <OptionCard key={option.id} selected={selected === option.id} label={option.name} price={option.price} currency={currency} onClick={() => onSelect(option.id)}>
          <BraceletSwatch option={option} />
        </OptionCard>
      ))}
    </div>
  );
}

function CasebackGrid({
  selected,
  engraving,
  onSelect,
  onEngraving,
}: {
  selected: string;
  engraving: string;
  onSelect: (id: string) => void;
  onEngraving: (spot: "none" | "fond" | "couronne" | "fermoir" | "rotor") => void;
}) {
  const { currency } = useCurrency();
  return (
    <>
      <div className="option-grid">
        {casebacks.map((option) => (
          <OptionCard key={option.id} selected={selected === option.id} label={option.name} price={option.price} currency={currency} onClick={() => onSelect(option.id)}>
            <CasebackSwatch option={option} />
          </OptionCard>
        ))}
      </div>
      <p className="hint">
        Le fond transparent laisse apparaître le rotor et les ponts du mouvement. Un fond plein protège mieux l'étanchéité
        et accueille une gravure plus profonde.
      </p>
      <div style={{ marginTop: 22 }}>
        <span className="eyebrow">Gravure du fond</span>
        <div className="option-grid" style={{ marginTop: 12 }}>
          {engravingSpots.map((spot) => (
            <OptionCard
              key={spot.id}
              selected={engraving === spot.id}
              label={spot.name}
              price={spot.price}
              currency={currency}
              onClick={() => onEngraving(spot.id)}
            >
              <div style={{ display: "grid", placeItems: "center", height: "100%" }}>
                <span style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--muted)", letterSpacing: "0.06em" }}>
                  {spot.id === "none" ? "—" : spot.id === "fond" ? "Aa" : spot.id === "couronne" ? "⌾" : spot.id === "fermoir" ? "⌘" : "⟳"}
                </span>
              </div>
            </OptionCard>
          ))}
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Engraving                                                           */
/* ------------------------------------------------------------------ */

function EngravingPanel({
  config,
  onChange,
}: {
  config: WatchConfig;
  onChange: <K extends keyof WatchConfig>(key: K, value: WatchConfig[K]) => void;
}) {
  const { currency } = useCurrency();
  return (
    <>
      <div className="option-grid">
        {engravingSpots.map((spot) => (
          <OptionCard
            key={spot.id}
            selected={config.engraving.spot === spot.id}
            label={spot.name}
            price={spot.price}
            currency={currency}
            onClick={() => onChange("engraving", { ...config.engraving, spot: spot.id })}
          >
            <div style={{ display: "grid", placeItems: "center", height: "100%" }}>
              <span style={{ fontFamily: "var(--serif)", fontSize: 24, color: "var(--muted)", letterSpacing: "0.06em" }}>
                {spot.id === "none" ? "—" : spot.id === "fond" ? "Aa" : spot.id === "couronne" ? "⌾" : spot.id === "fermoir" ? "⌘" : "⟳"}
              </span>
            </div>
          </OptionCard>
        ))}
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="engraving-text">Texte à graver</label>
          <input
            id="engraving-text"
            type="text"
            maxLength={40}
            value={config.engraving.text}
            placeholder="Ex. À toi, 18.10.2026"
            onChange={(e) => onChange("engraving", { ...config.engraving, text: e.target.value })}
            disabled={config.engraving.spot === "none"}
          />
        </div>
        <div className="field">
          <label>Rendu</label>
          <div
            style={{
              border: "1px solid var(--line)",
              padding: "13px 16px",
              fontFamily: "var(--serif)",
              fontSize: 17,
              color: config.engraving.text ? "var(--ivory)" : "var(--muted-2)",
              minHeight: 46,
            }}
          >
            {config.engraving.text || "Votre gravure apparaîtra ici"}
          </div>
        </div>
      </div>
      <p className="hint">
        Gravure laser ou micro-percussion selon la surface. Les gravures de couronne et de fermoir sont réalisées à la main,
        comptez deux jours ouvrés supplémentaires. Un aperçu vous est envoyé avant production.
      </p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Signature                                                           */
/* ------------------------------------------------------------------ */

function SignaturePanel({
  config,
  onChange,
}: {
  config: WatchConfig;
  onChange: <K extends keyof WatchConfig>(key: K, value: WatchConfig[K]) => void;
}) {
  const [busy, setBusy] = useState(false);
  const { currency } = useCurrency();

  const onFile = (file: File | null) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast("Image trop lourde — 2 Mo maximum");
      return;
    }
    if (!/image\/(png|jpeg|webp|svg\+xml)/.test(file.type)) {
      toast("Formats acceptés : PNG, JPG, WEBP, SVG");
      return;
    }
    setBusy(true);
    const reader = new FileReader();
    reader.onload = () => {
      onChange("logo", { ...config.logo, mode: "image", image: String(reader.result) });
      setBusy(false);
      toast("Logo importé sur le cadran");
    };
    reader.onerror = () => {
      setBusy(false);
      toast("Lecture du fichier impossible");
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <div className="option-grid">
        {[
          { id: "brand" as const, name: "Signature XWATCH", price: logoPrices.brand },
          { id: "text" as const, name: "Texte personnalisé", price: logoPrices.text },
          { id: "image" as const, name: "Logo / image", price: logoPrices.image },
        ].map((mode) => (
          <OptionCard
            key={mode.id}
            selected={config.logo.mode === mode.id}
            label={mode.name}
            price={mode.price}
            currency={currency}
            onClick={() => onChange("logo", { ...config.logo, mode: mode.id })}
          >
            <LogoSample
              mode={mode.id}
              text={config.logo.text}
              color={config.logo.color}
              image={config.logo.image}
            />
          </OptionCard>
        ))}
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="logo-text">Texte du cadran</label>
          <input
            id="logo-text"
            type="text"
            maxLength={14}
            value={config.logo.text}
            placeholder="Votre nom, vos initiales…"
            onChange={(e) => {
              onChange("logo", { ...config.logo, text: e.target.value, mode: "text" });
            }}
          />
        </div>
        <div className="field">
          <label htmlFor="logo-color">Couleur d'impression</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              id="logo-color"
              type="color"
              value={config.logo.color}
              onChange={(e) => onChange("logo", { ...config.logo, color: e.target.value })}
              style={{ width: 46, height: 46, background: "none", border: "1px solid var(--line)", padding: 4 }}
            />
            <span style={{ fontSize: 12, color: "var(--muted)" }}>{config.logo.color.toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <label className="upload" style={{ display: "grid" }}>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            style={{ display: "none" }}
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
          {config.logo.image ? (
            <img className="logo-preview" src={config.logo.image} alt="Logo importé" />
          ) : (
            <span style={{ fontSize: 20 }}>⌁</span>
          )}
          <span>{busy ? "Import en cours…" : config.logo.image ? "Remplacer mon logo" : "Importer mon logo — PNG transparent, 2 Mo max."}</span>
          <span style={{ fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted-2)" }}>
            glisser-déposer ou cliquer
          </span>
        </label>
      </div>

      <p className="hint">
        L'impression sur cadran est réalisée en atelier : tampographie ou décalque verni selon la finesse du motif. Les
        logos vectoriels (SVG, AI, PDF) donnent le meilleur résultat — envoyez-les à {`contact@xwatch.dz`} après commande.
      </p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Summary                                                             */
/* ------------------------------------------------------------------ */

function SummaryPanel({
  config,
  lines,
  total,
  currency,
  onAdd,
  onJump,
}: {
  config: WatchConfig;
  lines: { label: string; value: number }[];
  total: number;
  currency: "EUR" | "DZD";
  onAdd: () => void;
  onJump: (t: TabId) => void;
}) {
  const c = findCase(config.caseId);
  const d = findDial(config.dialId);
  const bz = findBezel(config.bezelId);
  const r = findRehaut(config.rehautId);
  const h = findHands(config.handsId);
  const s = findSeconds(config.secondsId);
  const g = findGmt(config.gmtId);
  const br = findBracelet(config.braceletId);
  const cb = findCaseback(config.casebackId);
  const en = findEngraving(config.engraving.spot);

  const rows: { k: string; v: string; tab: TabId }[] = [
    { k: "Boîtier", v: `${c.name} · ${c.diameter} mm`, tab: "boitier" },
    { k: "Cadran", v: d.name, tab: "cadran" },
    { k: "Lunette", v: bz.name, tab: "lunette" },
    { k: "Rehaut", v: r.name, tab: "rehaut" },
    { k: "Aiguilles", v: h.name, tab: "aiguilles" },
    { k: "Trotteuse", v: s.name, tab: "trotteuse" },
    { k: "GMT", v: g.id === "none" ? "Non" : g.name, tab: "gmt" },
    { k: "Bracelet", v: br.name, tab: "bracelet" },
    { k: "Fond", v: cb.name, tab: "fond" },
    { k: "Gravure", v: en.id === "none" ? "Aucune" : `${en.name}${config.engraving.text ? ` · « ${config.engraving.text} »` : ""}`, tab: "gravure" },
    {
      k: "Signature",
      v:
        config.logo.mode === "brand"
          ? "XWATCH"
          : config.logo.mode === "text"
            ? `Texte · ${config.logo.text || "—"}`
            : "Logo importé",
      tab: "signature",
    },
  ];

  return (
    <>
      <div className="summary">
        {rows.map((row) => (
          <div className="summary-row" key={row.k}>
            <span className="k">{row.k}</span>
            <span className="v">
              {row.v}{" "}
              <button
                onClick={() => onJump(row.tab)}
                style={{ color: "var(--gold)", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", marginLeft: 8 }}
              >
                modifier
              </button>
            </span>
          </div>
        ))}
      </div>

      <div className="summary" style={{ marginTop: 34 }}>
        {lines.map((line) => (
          <div className="summary-row" key={line.label}>
            <span className="k">{line.label}</span>
            <span className="v">{line.value === 0 ? "Inclus" : formatMoney(line.value, currency)}</span>
          </div>
        ))}
      </div>

      <div className="summary-total">
        <span>Total · TVA incluse</span>
        <strong>{formatMoney(total, currency)}</strong>
      </div>

      <p className="hint">
        Prix indicatif de la montre de base {formatMoney(BASE_PRICE, currency)}, hors gravure supplémentaire au-delà de 40
        caractères et hors livraison express. Nous confirmons le devis définitif après validation des composants.
      </p>

      <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
        <button className="btn btn--solid" onClick={onAdd}>
          <span>Ajouter au panier</span>
        </button>
        <button className="btn" onClick={() => onJump("boitier")}>
          <span>Continuer la composition</span>
        </button>
      </div>
    </>
  );
}
