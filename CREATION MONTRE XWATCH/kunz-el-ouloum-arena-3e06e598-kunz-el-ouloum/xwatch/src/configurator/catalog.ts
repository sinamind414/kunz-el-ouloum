/**
 * XWATCH — Catalogue du configurateur
 * -----------------------------------
 * Toutes les options, leurs prix (en euros) et leurs paramètres de rendu.
 * Pour ajouter une option : dupliquez une entrée, changez l'id et le rendu suivra.
 */

export type Metal = "silver" | "gold" | "rose" | "black";

export type BezelShape = "dive" | "fluted" | "smooth";

export type DialTexture =
  | "matte"
  | "sunburst"
  | "meteorite"
  | "carbon"
  | "skeleton"
  | "guilloche";

export type IndicesStyle = "baton" | "round" | "arabic" | "roman" | "none";

export interface CaseOption {
  id: string;
  name: string;
  detail: string;
  price: number;
  metal: Metal;
  bezel: BezelShape;
  diameter: number;
  thickness: number;
  lug: number;
  water: number;
  movement: string;
}

export interface DialOption {
  id: string;
  name: string;
  detail: string;
  price: number;
  base: string;
  highlight: string;
  text: string;
  texture: DialTexture;
  indices: IndicesStyle;
}

export interface BezelOption {
  id: string;
  name: string;
  detail: string;
  price: number;
  base: string;
  second?: string;
  metal?: Metal;
  carbon?: boolean;
}

export interface RehautOption {
  id: string;
  name: string;
  detail: string;
  price: number;
  color: string;
  markers: boolean;
  dark?: boolean;
}

export interface HandsOption {
  id: string;
  name: string;
  detail: string;
  price: number;
  metal: Metal;
  shape: "benz" | "baton" | "snowflake" | "nautilus";
}

export interface SecondsOption {
  id: string;
  name: string;
  detail: string;
  price: number;
  color: string;
  tip: "plain" | "red" | "orange" | "lollipop" | "gold";
}

export interface GmtOption {
  id: string;
  name: string;
  detail: string;
  price: number;
  color: string | null;
}

export interface BraceletOption {
  id: string;
  name: string;
  detail: string;
  price: number;
  style: "oyster" | "jubilee" | "rubber" | "nato" | "leather";
  metal?: Metal;
  color: string;
  accent?: string;
  twoTone?: boolean;
}

export interface CasebackOption {
  id: string;
  name: string;
  detail: string;
  price: number;
  transparent: boolean;
}

export type EngravingSpot = "none" | "fond" | "couronne" | "fermoir" | "rotor";

export interface LogoState {
  mode: "brand" | "text" | "image";
  text: string;
  color: string;
  image: string | null;
}

export interface WatchConfig {
  caseId: string;
  dialId: string;
  bezelId: string;
  rehautId: string;
  handsId: string;
  secondsId: string;
  gmtId: string;
  braceletId: string;
  casebackId: string;
  engraving: { spot: EngravingSpot; text: string };
  logo: LogoState;
  magnifier: boolean;
}

export const BASE_PRICE = 349;
export const CURRENCY = "EUR";

export const cases: CaseOption[] = [
  {
    id: "sub-acier",
    name: "Sub 40 — Acier",
    detail: "Acier 316L brossé, lunette plongeuse",
    price: 0,
    metal: "silver",
    bezel: "dive",
    diameter: 40,
    thickness: 13,
    lug: 20,
    water: 200,
    movement: "Seiko NH35",
  },
  {
    id: "sub-rose",
    name: "Sub 40 — Or rose",
    detail: "PVD or rose, lunette plongeuse",
    price: 140,
    metal: "rose",
    bezel: "dive",
    diameter: 40,
    thickness: 13,
    lug: 20,
    water: 200,
    movement: "Seiko NH35",
  },
  {
    id: "sub-or",
    name: "Sub 40 — Or jaune",
    detail: "PVD or 18 carats, lunette plongeuse",
    price: 140,
    metal: "gold",
    bezel: "dive",
    diameter: 40,
    thickness: 13,
    lug: 20,
    water: 200,
    movement: "Seiko NH35",
  },
  {
    id: "sub-noir",
    name: "Sub 40 — Noir mat",
    detail: "PVD noir, lunette plongeuse",
    price: 90,
    metal: "black",
    bezel: "dive",
    diameter: 40,
    thickness: 13,
    lug: 20,
    water: 200,
    movement: "Seiko NH35",
  },
  {
    id: "nautilus-acier",
    name: "Nautilus 40 — Acier",
    detail: "Lunette lisse, fond saphir",
    price: 190,
    metal: "silver",
    bezel: "smooth",
    diameter: 40,
    thickness: 11,
    lug: 20,
    water: 100,
    movement: "Seiko NH35",
  },
  {
    id: "nautilus-rose",
    name: "Nautilus 40 — Or rose",
    detail: "Lunette lisse, fond saphir",
    price: 320,
    metal: "rose",
    bezel: "smooth",
    diameter: 40,
    thickness: 11,
    lug: 20,
    water: 100,
    movement: "Seiko NH35",
  },
  {
    id: "datejust-36",
    name: "Datejust 36 — Acier",
    detail: "Lunette cannelée, bracelet jubilé",
    price: 120,
    metal: "silver",
    bezel: "fluted",
    diameter: 36,
    thickness: 12,
    lug: 20,
    water: 100,
    movement: "Seiko NH35",
  },
  {
    id: "datejust-39",
    name: "Datejust 39 — Or jaune",
    detail: "Lunette cannelée, or 18 carats",
    price: 290,
    metal: "gold",
    bezel: "fluted",
    diameter: 39,
    thickness: 12,
    lug: 20,
    water: 100,
    movement: "Seiko NH35",
  },
  {
    id: "explorer-36",
    name: "Explorer 36 — Acier",
    detail: "Lunette lisse, esprit outdoor",
    price: 80,
    metal: "silver",
    bezel: "smooth",
    diameter: 36,
    thickness: 11,
    lug: 20,
    water: 100,
    movement: "Seiko NH35",
  },
  {
    id: "pilot-38",
    name: "Pilot 38 — Acier",
    detail: "Boîtier brossé, verre saphir bombé",
    price: 40,
    metal: "silver",
    bezel: "smooth",
    diameter: 38,
    thickness: 12,
    lug: 20,
    water: 100,
    movement: "Seiko NH35",
  },
  {
    id: "engineer-40",
    name: "Engineer 40 — Acier",
    detail: "Boîtier intégré, étanchéité 100 m",
    price: 110,
    metal: "silver",
    bezel: "smooth",
    diameter: 40,
    thickness: 12,
    lug: 20,
    water: 100,
    movement: "Seiko NH35",
  },
  {
    id: "octo-40",
    name: "Octo 40 — Acier",
    detail: "Boîtier octogonal, finitions polies",
    price: 150,
    metal: "silver",
    bezel: "smooth",
    diameter: 40,
    thickness: 11,
    lug: 20,
    water: 100,
    movement: "Seiko NH35",
  },
];

export const dials: DialOption[] = [
  {
    id: "noir",
    name: "Noir laqué",
    detail: "Noir profond, index appliqués",
    price: 0,
    base: "#0b0c0e",
    highlight: "#2a2d31",
    text: "#e9e4d8",
    texture: "matte",
    indices: "baton",
  },
  {
    id: "bleu",
    name: "Bleu sunburst",
    detail: "Bleu nuit, reflets radiaux",
    price: 0,
    base: "#12305a",
    highlight: "#3f74b8",
    text: "#e8edf4",
    texture: "sunburst",
    indices: "baton",
  },
  {
    id: "vert",
    name: "Vert sunburst",
    detail: "Vert forêt, reflets radiaux",
    price: 0,
    base: "#0e3528",
    highlight: "#2d7b59",
    text: "#e9efe8",
    texture: "sunburst",
    indices: "baton",
  },
  {
    id: "gris",
    name: "Gris sunburst",
    detail: "Gris acier, reflets radiaux",
    price: 0,
    base: "#3d4147",
    highlight: "#848b94",
    text: "#f1f1ef",
    texture: "sunburst",
    indices: "baton",
  },
  {
    id: "blanc",
    name: "Blanc laqué",
    detail: "Blanc ivoire, index rhodiés",
    price: 0,
    base: "#ece7db",
    highlight: "#fbf8f1",
    text: "#2b2a27",
    texture: "matte",
    indices: "baton",
  },
  {
    id: "tiffany",
    name: "Tiffany",
    detail: "Bleu menthe signature",
    price: 0,
    base: "#8bcfca",
    highlight: "#c2ece8",
    text: "#173a38",
    texture: "matte",
    indices: "baton",
  },
  {
    id: "saumon",
    name: "Saumon",
    detail: "Saumon poudré, finition mate",
    price: 0,
    base: "#e3b49b",
    highlight: "#f3d3bf",
    text: "#3a2b23",
    texture: "guilloche",
    indices: "roman",
  },
  {
    id: "violet",
    name: "Violet sunburst",
    detail: "Prune profond, reflets soyeux",
    price: 0,
    base: "#33203f",
    highlight: "#765590",
    text: "#f0e8f3",
    texture: "sunburst",
    indices: "baton",
  },
  {
    id: "carbone",
    name: "Carbone forgé",
    detail: "Composite marbré, pièce unique",
    price: 29,
    base: "#202124",
    highlight: "#5b5e64",
    text: "#e8e6e0",
    texture: "carbon",
    indices: "baton",
  },
  {
    id: "meteorite",
    name: "Météorite",
    detail: "Tranche de météorite, motifs uniques",
    price: 199,
    base: "#4b4a47",
    highlight: "#a9a69f",
    text: "#f2efe6",
    texture: "meteorite",
    indices: "baton",
  },
  {
    id: "squelette",
    name: "Squelette",
    detail: "Mouvement apparent, ponts anglés",
    price: 59,
    base: "#17181a",
    highlight: "#4a4d52",
    text: "#efe9dc",
    texture: "skeleton",
    indices: "baton",
  },
  {
    id: "arabes-noir",
    name: "Arabes — Noir",
    detail: "Chiffres arabes orientaux",
    price: 0,
    base: "#0b0c0e",
    highlight: "#2a2d31",
    text: "#e9e4d8",
    texture: "matte",
    indices: "arabic",
  },
  {
    id: "arabes-bleu",
    name: "Arabes — Bleu",
    detail: "Chiffres arabes orientaux",
    price: 0,
    base: "#152a44",
    highlight: "#3b5d85",
    text: "#e9eef5",
    texture: "sunburst",
    indices: "arabic",
  },
];

export const bezels: BezelOption[] = [
  {
    id: "acier",
    name: "Acier brossé",
    detail: "Insert acier, sans marquage",
    price: 0,
    base: "#b9bdc3",
    metal: "silver",
  },
  {
    id: "noir",
    name: "Noir céramique",
    detail: "Céramique noire, graduation plongeuse",
    price: 0,
    base: "#0a0b0c",
  },
  {
    id: "bleu",
    name: "Bleu Smurf",
    detail: "Céramique bleue, graduation plongeuse",
    price: 0,
    base: "#1b4f8a",
  },
  {
    id: "vert",
    name: "Vert Starbucks",
    detail: "Céramique verte, graduation plongeuse",
    price: 0,
    base: "#123c2b",
  },
  {
    id: "pepsi",
    name: "Pepsi",
    detail: "Deux tons bleu et rouge",
    price: 19,
    base: "#1c3f7a",
    second: "#a01f2b",
  },
  {
    id: "batman",
    name: "Batman",
    detail: "Deux tons noir et bleu",
    price: 19,
    base: "#131519",
    second: "#1c3f7a",
  },
  {
    id: "rootbeer",
    name: "Rootbeer",
    detail: "Deux tons brun et noir",
    price: 29,
    base: "#5a2a1d",
    second: "#17181b",
  },
  {
    id: "or",
    name: "Or jaune",
    detail: "Insert plaqué or, poli miroir",
    price: 29,
    base: "#d3b061",
    metal: "gold",
  },
  {
    id: "blanc",
    name: "Blanc céramique",
    detail: "Céramique ivoire, graduation plongeuse",
    price: 9,
    base: "#e6e2d8",
  },
  {
    id: "carbone",
    name: "Carbone forgé",
    detail: "Insert composite, motifs uniques",
    price: 59,
    base: "#232427",
    carbon: true,
  },
];

export const rehauts: RehautOption[] = [
  {
    id: "acier",
    name: "Acier poli",
    detail: "Rehaut acier, index imprimés",
    price: 0,
    color: "#c6c9cd",
    markers: false,
  },
  {
    id: "marqueurs",
    name: "Acier à marqueurs",
    detail: "Graduation minutes gravée",
    price: 0,
    color: "#c6c9cd",
    markers: true,
  },
  {
    id: "noir",
    name: "Noir mat",
    detail: "Rehaut noir, discrétion absolue",
    price: 0,
    color: "#111214",
    markers: false,
    dark: true,
  },
  {
    id: "or-rose",
    name: "Or rose",
    detail: "Rehaut or rose, finition satinée",
    price: 29,
    color: "#cf9b83",
    markers: false,
  },
];

export const hands: HandsOption[] = [
  {
    id: "benz-argent",
    name: "Benz argent",
    detail: "Aiguilles Mercedes, Super-LumiNova",
    price: 0,
    metal: "silver",
    shape: "benz",
  },
  {
    id: "benz-or",
    name: "Benz or",
    detail: "Aiguilles Mercedes dorées",
    price: 0,
    metal: "gold",
    shape: "benz",
  },
  {
    id: "benz-rose",
    name: "Benz or rose",
    detail: "Aiguilles Mercedes or rose",
    price: 0,
    metal: "rose",
    shape: "benz",
  },
  {
    id: "benz-noir",
    name: "Benz noir",
    detail: "Aiguilles Mercedes PVD noir",
    price: 9,
    metal: "black",
    shape: "benz",
  },
  {
    id: "baton-argent",
    name: "Bâton argent",
    detail: "Aiguilles droites, lecture précise",
    price: 0,
    metal: "silver",
    shape: "baton",
  },
  {
    id: "flocon-argent",
    name: "Flocon argent",
    detail: "Aiguilles snowflake, lume généreux",
    price: 0,
    metal: "silver",
    shape: "snowflake",
  },
  {
    id: "nautilus-argent",
    name: "Nautilus argent",
    detail: "Aiguilles évidées, finition polie",
    price: 0,
    metal: "silver",
    shape: "nautilus",
  },
];

export const seconds: SecondsOption[] = [
  {
    id: "argent",
    name: "Argent",
    detail: "Trotteuse acier, contrepoids fin",
    price: 0,
    color: "#e3e6ea",
    tip: "plain",
  },
  {
    id: "rouge",
    name: "Pointe rouge",
    detail: "Trotteuse acier, pointe laquée",
    price: 0,
    color: "#d9dde2",
    tip: "red",
  },
  {
    id: "orange",
    name: "Pointe orange",
    detail: "Trotteuse acier, pointe orange",
    price: 0,
    color: "#d9dde2",
    tip: "orange",
  },
  {
    id: "lollipop",
    name: "Lollipop",
    detail: "Pastille lume, esprit vintage",
    price: 19,
    color: "#e3e6ea",
    tip: "lollipop",
  },
  {
    id: "or",
    name: "Or",
    detail: "Trotteuse dorée",
    price: 0,
    color: "#e2c583",
    tip: "gold",
  },
];

export const gmts: GmtOption[] = [
  {
    id: "none",
    name: "Sans GMT",
    detail: "Mouvement NH35, deux fuseaux non",
    price: 0,
    color: null,
  },
  {
    id: "argent",
    name: "Flèche argent",
    detail: "Mouvement NH34, aiguille argent",
    price: 150,
    color: "#dfe3e8",
  },
  {
    id: "or",
    name: "Flèche or",
    detail: "Mouvement NH34, aiguille dorée",
    price: 150,
    color: "#e2c583",
  },
  {
    id: "bleu",
    name: "Flèche bleue",
    detail: "Mouvement NH34, aiguille bleue",
    price: 150,
    color: "#3f74b8",
  },
];

export const bracelets: BraceletOption[] = [
  {
    id: "oyster",
    name: "Oyster acier",
    detail: "Maillons polis, fermoir déployant",
    price: 0,
    style: "oyster",
    metal: "silver",
    color: "#c9cdd2",
  },
  {
    id: "oyster-brosse",
    name: "Oyster brossé",
    detail: "Acier satiné, fermoir déployant",
    price: 0,
    style: "oyster",
    metal: "silver",
    color: "#a9aeb5",
  },
  {
    id: "jubilee",
    name: "Jubilé acier",
    detail: "Cinq rangs, confort absolu",
    price: 19,
    style: "jubilee",
    metal: "silver",
    color: "#d0d4d8",
  },
  {
    id: "jubilee-or",
    name: "Jubilé or",
    detail: "Cinq rangs, finition or jaune",
    price: 49,
    style: "jubilee",
    metal: "gold",
    color: "#cfae67",
    twoTone: true,
  },
  {
    id: "rubber-noir",
    name: "Caoutchouc noir",
    detail: "FKM souple, boucle ardillon",
    price: 0,
    style: "rubber",
    color: "#161719",
  },
  {
    id: "rubber-orange",
    name: "Caoutchouc orange",
    detail: "FKM, touche sportive",
    price: 19,
    style: "rubber",
    color: "#b4551f",
  },
  {
    id: "rubber-bleu",
    name: "Caoutchouc bleu",
    detail: "FKM, bleu profond",
    price: 0,
    style: "rubber",
    color: "#1d3a63",
  },
  {
    id: "nato",
    name: "NATO noir",
    detail: "Nylon tissé, boucle acier",
    price: 19,
    style: "nato",
    color: "#1a1b1d",
    accent: "#8a8f96",
  },
  {
    id: "cuir",
    name: "Cuir brun",
    detail: "Cuir pleine fleur, coutures ton sur ton",
    price: 29,
    style: "leather",
    color: "#4a3023",
    accent: "#c9a875",
  },
];

export const casebacks: CasebackOption[] = [
  {
    id: "plein",
    name: "Fond plein",
    detail: "Acier gravé, étanchéité maximale",
    price: 0,
    transparent: false,
  },
  {
    id: "transparent",
    name: "Fond transparent",
    detail: "Verre saphir, mouvement visible",
    price: 10,
    transparent: true,
  },
];

export const engravingSpots: { id: EngravingSpot; name: string; price: number }[] = [
  { id: "none", name: "Aucune gravure", price: 0 },
  { id: "fond", name: "Fond de boîtier", price: 15 },
  { id: "couronne", name: "Couronne", price: 10 },
  { id: "fermoir", name: "Fermoir", price: 10 },
  { id: "rotor", name: "Rotor", price: 15 },
];

export const logoPrices = { brand: 0, text: 60, image: 60 } as const;

export const defaultConfig: WatchConfig = {
  caseId: "sub-acier",
  dialId: "noir",
  bezelId: "noir",
  rehautId: "marqueurs",
  handsId: "benz-argent",
  secondsId: "rouge",
  gmtId: "none",
  braceletId: "oyster",
  casebackId: "plein",
  engraving: { spot: "none", text: "" },
  logo: { mode: "brand", text: "", color: "#e9e4d8", image: null },
  magnifier: true,
};

export const presetConfigs: { name: string; subtitle: string; config: WatchConfig }[] = [
  {
    name: "La Nuit",
    subtitle: "Noir intégral, lume ivoire",
    config: {
      ...defaultConfig,
      caseId: "sub-noir",
      dialId: "noir",
      bezelId: "noir",
      handsId: "benz-noir",
      secondsId: "orange",
      braceletId: "rubber-noir",
      magnifier: false,
    },
  },
  {
    name: "Tiffany",
    subtitle: "Menthe, acier et jubilé",
    config: {
      ...defaultConfig,
      caseId: "datejust-36",
      dialId: "tiffany",
      bezelId: "acier",
      rehautId: "acier",
      handsId: "baton-argent",
      secondsId: "argent",
      braceletId: "jubilee",
      magnifier: false,
    },
  },
  {
    name: "Or Rose GMT",
    subtitle: "Deux fuseaux, cadran saumon",
    config: {
      ...defaultConfig,
      caseId: "nautilus-rose",
      dialId: "saumon",
      bezelId: "rootbeer",
      rehautId: "or-rose",
      handsId: "benz-rose",
      secondsId: "or",
      gmtId: "or",
      braceletId: "jubilee-or",
      engraving: { spot: "fond", text: "XWATCH · 2026" },
    },
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export function findCase(id: string): CaseOption {
  return cases.find((c) => c.id === id) ?? cases[0];
}
export function findDial(id: string): DialOption {
  return dials.find((d) => d.id === id) ?? dials[0];
}
export function findBezel(id: string): BezelOption {
  return bezels.find((b) => b.id === id) ?? bezels[0];
}
export function findRehaut(id: string): RehautOption {
  return rehauts.find((r) => r.id === id) ?? rehauts[0];
}
export function findHands(id: string): HandsOption {
  return hands.find((h) => h.id === id) ?? hands[0];
}
export function findSeconds(id: string): SecondsOption {
  return seconds.find((s) => s.id === id) ?? seconds[0];
}
export function findGmt(id: string): GmtOption {
  return gmts.find((g) => g.id === id) ?? gmts[0];
}
export function findBracelet(id: string): BraceletOption {
  return bracelets.find((b) => b.id === id) ?? bracelets[0];
}
export function findCaseback(id: string): CasebackOption {
  return casebacks.find((c) => c.id === id) ?? casebacks[0];
}
export function findEngraving(spot: EngravingSpot) {
  return engravingSpots.find((e) => e.id === spot) ?? engravingSpots[0];
}

export interface PriceLine {
  label: string;
  value: number;
}

export function priceBreakdown(config: WatchConfig): PriceLine[] {
  const c = findCase(config.caseId);
  const d = findDial(config.dialId);
  const b = findBezel(config.bezelId);
  const r = findRehaut(config.rehautId);
  const h = findHands(config.handsId);
  const s = findSeconds(config.secondsId);
  const g = findGmt(config.gmtId);
  const br = findBracelet(config.braceletId);
  const cb = findCaseback(config.casebackId);
  const en = findEngraving(config.engraving.spot);
  const logo = logoPrices[config.logo.mode];

  const lines: PriceLine[] = [{ label: "Montre de base", value: BASE_PRICE }];
  const push = (label: string, value: number) => {
    if (value !== 0) lines.push({ label, value });
  };
  push(`Boîtier · ${c.name}`, c.price);
  push(`Cadran · ${d.name}`, d.price);
  push(`Lunette · ${b.name}`, b.price);
  push(`Rehaut · ${r.name}`, r.price);
  push(`Aiguilles · ${h.name}`, h.price);
  push(`Trotteuse · ${s.name}`, s.price);
  push(`GMT · ${g.name}`, g.price);
  push(`Bracelet · ${br.name}`, br.price);
  push(`Fond · ${cb.name}`, cb.price);
  push(`Gravure · ${en.name}`, en.price);
  push(`Signature sur cadran`, logo);
  return lines;
}

export function totalPrice(config: WatchConfig): number {
  return priceBreakdown(config).reduce((sum, line) => sum + line.value, 0);
}

export function optionCount(config: WatchConfig): number {
  let n = 2; // case + bracelet always chosen
  const values = [
    config.dialId,
    config.bezelId,
    config.rehautId,
    config.handsId,
    config.secondsId,
    config.braceletId,
    config.casebackId,
  ];
  n = values.filter(Boolean).length + 1;
  if (config.gmtId !== "none") n++;
  if (config.engraving.spot !== "none") n++;
  if (config.logo.mode !== "brand") n++;
  return n;
}

export function specSummary(config: WatchConfig) {
  const c = findCase(config.caseId);
  const g = findGmt(config.gmtId);
  return {
    diameter: c.diameter,
    thickness: c.thickness,
    lug: c.lug,
    water: c.water,
    movement: g.id === "none" ? c.movement : "Seiko NH34 GMT",
  };
}
