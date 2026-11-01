import { useId } from "react";
import {
  BraceletOption,
  CaseOption,
  DialOption,
  HandsOption,
  LogoState,
  Metal,
  SecondsOption,
  WatchConfig,
  findBezel,
  findBracelet,
  findCase,
  findCaseback,
  findDial,
  findGmt,
  findHands,
  findRehaut,
  findSeconds,
} from "./catalog";

/* ------------------------------------------------------------------ */
/* Palette                                                             */
/* ------------------------------------------------------------------ */

export interface MetalStops {
  light: string;
  mid: string;
  base: string;
  dark: string;
  deep: string;
}

export const METALS: Record<Metal, MetalStops> = {
  silver: { light: "#ffffff", mid: "#e4e8ed", base: "#b6bcc4", dark: "#7f858d", deep: "#4a5057" },
  gold: { light: "#fff8e2", mid: "#f2d99a", base: "#d3ad61", dark: "#9c7a38", deep: "#5c471c" },
  rose: { light: "#fff1e7", mid: "#f2cdb9", base: "#d29d85", dark: "#9e6c55", deep: "#613f31" },
  black: { light: "#9aa0a7", mid: "#5b6067", base: "#35383d", dark: "#1a1c1f", deep: "#08090a" },
};

function metal(m: Metal | undefined): MetalStops {
  return METALS[m ?? "silver"];
}

/* ------------------------------------------------------------------ */
/* Geometry (viewBox 600 × 900)                                        */
/* ------------------------------------------------------------------ */

const W = 600;
const H = 900;
const CX = 300;
const CY = 428;

const R_CASE = 168;
const R_INSERT_OUT = 160;
const R_INSERT_IN = 132;
const R_REHAUT_OUT = 130;
const R_REHAUT_IN = 124;
const R_DIAL = 124;
const R_CRYSTAL = 132;

const LUG_HALF = 47;
const STRAP_TOP = 124;

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function ringPath(cx: number, cy: number, rOut: number, rIn: number, startDeg: number, endDeg: number) {
  if (Math.abs(endDeg - startDeg) >= 359.9) {
    return `M ${cx - rOut} ${cy} A ${rOut} ${rOut} 0 1 0 ${cx + rOut} ${cy} A ${rOut} ${rOut} 0 1 0 ${cx - rOut} ${cy} Z ` +
      `M ${cx - rIn} ${cy} A ${rIn} ${rIn} 0 1 1 ${cx + rIn} ${cy} A ${rIn} ${rIn} 0 1 1 ${cx - rIn} ${cy} Z`;
  }
  const a = polar(cx, cy, rOut, startDeg);
  const b = polar(cx, cy, rOut, endDeg);
  const c = polar(cx, cy, rIn, endDeg);
  const d = polar(cx, cy, rIn, startDeg);
  const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  return [
    `M ${a.x.toFixed(2)} ${a.y.toFixed(2)}`,
    `A ${rOut} ${rOut} 0 ${large} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`,
    `L ${c.x.toFixed(2)} ${c.y.toFixed(2)}`,
    `A ${rIn} ${rIn} 0 ${large} 0 ${d.x.toFixed(2)} ${d.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

/* ------------------------------------------------------------------ */
/* Bracelet                                                            */
/* ------------------------------------------------------------------ */

function Strap({ bracelet, dir, uid }: { bracelet: BraceletOption; dir: "up" | "down"; uid: string }) {
  const m = metal(bracelet.metal);
  const down = dir === "down";
  const yStart = down ? CY + R_CASE - 46 : CY - R_CASE + 46;
  const yEnd = down ? H + 40 : -40;
  const w0 = STRAP_TOP;
  const w1 = STRAP_TOP * 0.68;
  const length = Math.abs(yEnd - yStart);
  const steps = 22;
  const isMetal = bracelet.style === "oyster" || bracelet.style === "jubilee";

  const edgeColor = isMetal ? m.dark : shade(bracelet.color, 0.55);
  const mainColor = bracelet.color;

  // silhouette: tapered with a slight inward curve
  const halfAt = (t: number) => (w0 / 2) * (1 - 0.32 * t);
  const xAt = (t: number) => 8 * Math.sin(t * Math.PI) * (down ? 1 : -1);

  const leftPts: string[] = [];
  const rightPts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = yStart + (down ? 1 : -1) * length * t;
    const half = halfAt(t);
    const off = xAt(t);
    leftPts.push(`${(CX - half + off).toFixed(2)} ${y.toFixed(2)}`);
    rightPts.push(`${(CX + half + off).toFixed(2)} ${y.toFixed(2)}`);
  }
  const silhouette = `M ${leftPts.join(" L ")} L ${rightPts.reverse().join(" L ")} Z`;

  // cross links
  const links: React.ReactNode[] = [];
  const count = 26;
  for (let i = 1; i < count; i++) {
    const t = i / count;
    const y = yStart + (down ? 1 : -1) * length * t;
    const half = halfAt(t) - 1.2;
    const off = xAt(t);
    const op = 0.55 - t * 0.25;
    if (isMetal) {
      links.push(
        <line
          key={`l${i}`}
          x1={CX - half + off}
          y1={y}
          x2={CX + half + off}
          y2={y}
          stroke="rgba(0,0,0,0.75)"
          strokeWidth={1.6}
          opacity={op}
        />,
      );
      links.push(
        <line
          key={`h${i}`}
          x1={CX - half + off}
          y1={y + 1.4}
          x2={CX + half + off}
          y2={y + 1.4}
          stroke="rgba(255,255,255,0.35)"
          strokeWidth={0.7}
          opacity={op * 0.9}
        />,
      );
      if (bracelet.style === "jubilee") {
        const third = (half * 2) / 3;
        [1, 2].forEach((k) =>
          links.push(
            <line
              key={`v${i}-${k}`}
              x1={CX - half + off + k * third}
              y1={y}
              x2={CX - half + off + k * third}
              y2={y + (down ? 1 : -1) * (length / count) * 0.9}
              stroke="rgba(0,0,0,0.35)"
              strokeWidth={0.8}
              opacity={op}
            />,
          ),
        );
      } else {
        [0.27, 0.73].forEach((k, idx) =>
          links.push(
            <line
              key={`v${i}-${idx}`}
              x1={CX - half + off + k * half * 2}
              y1={y}
              x2={CX - half + off + k * half * 2}
              y2={y + (down ? 1 : -1) * (length / count) * 0.9}
              stroke="rgba(0,0,0,0.28)"
              strokeWidth={0.7}
              opacity={op}
            />,
          ),
        );
      }
    } else if (bracelet.style === "rubber") {
      links.push(
        <path
          key={`r${i}`}
          d={`M ${CX - half + off} ${y} Q ${CX + off} ${y + (down ? 7 : -7)} ${CX + half + off} ${y}`}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={2.4}
          opacity={op}
        />,
      );
    } else if (bracelet.style === "leather") {
      if (i % 2 === 0) {
        const inset = half * 0.72;
        links.push(
          <g key={`s${i}`} opacity={op * 0.9}>
            <line x1={CX - inset + off} y1={y} x2={CX - inset + off} y2={y + (down ? 7 : -7)} stroke={bracelet.accent} strokeWidth={1.6} strokeLinecap="round" />
            <line x1={CX + inset + off} y1={y} x2={CX + inset + off} y2={y + (down ? 7 : -7)} stroke={bracelet.accent} strokeWidth={1.6} strokeLinecap="round" />
          </g>,
        );
      }
    } else {
      // nato — woven ribs
      links.push(
        <line
          key={`n${i}`}
          x1={CX - half + off}
          y1={y}
          x2={CX + half + off}
          y2={y}
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={2}
          opacity={op}
        />,
      );
    }
  }

  const gradId = `${uid}-strap-${dir}`;
  const fadeId = `${uid}-strapfade-${dir}`;
  const maskId = `${uid}-strapmask-${dir}`;

  return (
    <g>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={isMetal ? mix(mainColor, "#000000", 0.6) : mix(mainColor, "#000000", 0.7)} />
          <stop offset="0.08" stopColor={isMetal ? mix(mainColor, "#ffffff", 0.14) : mix(mainColor, "#ffffff", 0.18)} />
          <stop offset="0.3" stopColor={isMetal ? mix(mainColor, "#ffffff", 0.26) : mix(mainColor, "#ffffff", 0.34)} />
          <stop offset="0.46" stopColor={isMetal ? mix(mainColor, "#000000", 0.05) : mix(mainColor, "#000000", 0.12)} />
          <stop offset="0.62" stopColor={isMetal ? mix(mainColor, "#ffffff", 0.18) : mix(mainColor, "#ffffff", 0.22)} />
          <stop offset="0.84" stopColor={isMetal ? mix(mainColor, "#000000", 0.14) : mix(mainColor, "#000000", 0.2)} />
          <stop offset="1" stopColor={isMetal ? mix(mainColor, "#000000", 0.66) : mix(mainColor, "#000000", 0.74)} />
        </linearGradient>
        <linearGradient id={fadeId} x1="0" y1={down ? 0 : 1} x2="0" y2={down ? 1 : 0}>
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.55" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
          <rect x="0" y="0" width={W} height={H} fill={`url(#${fadeId})`} />
        </mask>
      </defs>

      <g mask={`url(#${maskId})`}>
        <path d={silhouette} fill={`url(#${gradId})`} stroke="rgba(0,0,0,0.35)" strokeWidth={0.8} />
        {isMetal && (
          <path d={silhouette} fill={`url(#${gradId})`} opacity={0.5} />
        )}
        <g clipPath={`url(#${uid}-strapclip-${dir})`}>{links}</g>

        {/* edge highlights */}
        <path
          d={`M ${leftPts[0]} L ${leftPts[Math.floor(steps / 2)]}`}
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth={1.2}
        />
        <path
          d={`M ${rightPts[rightPts.length - 1]} L ${rightPts[Math.floor(steps / 2)]}`}
          fill="none"
          stroke="rgba(0,0,0,0.55)"
          strokeWidth={1.6}
        />

        {/* first end link (tucked under the case) */}
        <path
          d={
            down
              ? `M ${CX - STRAP_TOP / 2 - 3} ${CY + R_CASE - 50} L ${CX + STRAP_TOP / 2 + 3} ${CY + R_CASE - 50} L ${CX + STRAP_TOP / 2} ${CY + R_CASE - 18} L ${CX - STRAP_TOP / 2} ${CY + R_CASE - 18} Z`
              : `M ${CX - STRAP_TOP / 2 - 3} ${CY - R_CASE + 50} L ${CX + STRAP_TOP / 2 + 3} ${CY - R_CASE + 50} L ${CX + STRAP_TOP / 2} ${CY - R_CASE + 18} L ${CX - STRAP_TOP / 2} ${CY - R_CASE + 18} Z`
          }
          fill={isMetal ? `url(#${gradId})` : mainColor}
          stroke="rgba(0,0,0,0.4)"
          strokeWidth={0.9}
        />
      </g>

      <defs>
        <clipPath id={`${uid}-strapclip-${dir}`}>
          <path d={silhouette} />
        </clipPath>
      </defs>
    </g>
  );
}

function mix(hex: string, target: string, amount: number) {
  const parse = (h: string) => {
    const s = h.replace("#", "");
    const n = parseInt(s.length === 3 ? s.split("").map((c) => c + c).join("") : s, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const a = parse(hex);
  const b = parse(target);
  const out = a.map((v, i) => Math.round(v + (b[i] - v) * amount));
  return `rgb(${out[0]},${out[1]},${out[2]})`;
}

function shade(hex: string, factor: number) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  const r = Math.min(255, Math.round(((n >> 16) & 255) * factor));
  const g = Math.min(255, Math.round(((n >> 8) & 255) * factor));
  const b = Math.min(255, Math.round((n & 255) * factor));
  return `rgb(${r},${g},${b})`;
}

/* ------------------------------------------------------------------ */
/* Dial texture                                                        */
/* ------------------------------------------------------------------ */

function DialTexture({ dial, uid }: { dial: DialOption; uid: string }) {
  const clip = `url(#${uid}-dialclip)`;
  const t = dial.texture;

  if (t === "sunburst") {
    return (
      <g clipPath={clip}>
        <circle r={R_DIAL} fill={`url(#${uid}-dialglow)`} />
        {Array.from({ length: 180 }).map((_, i) => (
          <path
            key={i}
            d={`M 0 0 L ${polar(0, 0, R_DIAL, i * 2).x} ${polar(0, 0, R_DIAL, i * 2).y} L ${polar(0, 0, R_DIAL, i * 2 + 1.4).x} ${polar(0, 0, R_DIAL, i * 2 + 1.4).y} Z`}
            fill={i % 2 ? "#ffffff" : "#000000"}
            opacity={i % 2 ? 0.07 : 0.06}
          />
        ))}
        <circle r={R_DIAL} fill={`url(#${uid}-matte)`} opacity={0.75} />
      </g>
    );
  }

  if (t === "meteorite") {
    const veins: React.ReactNode[] = [];
    const seedRand = (n: number) => {
      const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
      return x - Math.floor(x);
    };
    for (let i = 0; i < 26; i++) {
      const a0 = seedRand(i) * 360;
      const r0 = 6 + seedRand(i + 40) * 100;
      const len = 24 + seedRand(i + 80) * 70;
      const a1 = a0 + 28 + seedRand(i + 120) * 60;
      const p0 = polar(0, 0, r0, a0);
      const p1 = polar(0, 0, Math.min(r0 + len, R_DIAL - 3), a1);
      const mid = polar(0, 0, r0 + len * 0.45, a0 + 12);
      veins.push(
        <path
          key={i}
          d={`M ${p0.x} ${p0.y} Q ${mid.x} ${mid.y} ${p1.x} ${p1.y}`}
          stroke="#c9c3b4"
          strokeWidth={0.6 + seedRand(i + 7) * 1.1}
          fill="none"
          opacity={0.16 + seedRand(i + 3) * 0.22}
          strokeLinecap="round"
        />,
      );
      veins.push(
        <path
          key={`b${i}`}
          d={`M ${p0.x} ${p0.y} Q ${mid.x} ${mid.y} ${p1.x} ${p1.y}`}
          stroke="#0b0b0c"
          strokeWidth={2.4}
          fill="none"
          opacity={0.28}
          strokeLinecap="round"
        />,
      );
    }
    return (
      <g clipPath={clip}>
        <circle r={R_DIAL} fill="#46453f" />
        <rect x={-R_DIAL} y={-R_DIAL} width={R_DIAL * 2} height={R_DIAL * 2} filter={`url(#${uid}-meteor)`} opacity={0.55} />
        {veins}
        <circle r={R_DIAL} fill={`url(#${uid}-meteor-sheen)`} />
        <circle r={R_DIAL} fill={`url(#${uid}-matte)`} opacity={0.7} />
      </g>
    );
  }

  if (t === "carbon") {
    const cells: React.ReactNode[] = [];
    for (let row = -7; row < 7; row++) {
      for (let col = -7; col < 7; col++) {
        const x = col * 23 + (row % 2 === 0 ? 0 : 11.5);
        const y = row * 15;
        cells.push(
          <rect
            key={`${row}-${col}`}
            x={x}
            y={y}
            width={21}
            height={13}
            rx={2}
            fill={(row + col) % 2 === 0 ? "#3b3e43" : "#26282c"}
            opacity={0.85}
          />,
        );
      }
    }
    return (
      <g clipPath={clip}>
        <circle r={R_DIAL} fill="#1b1c1f" />
        {cells}
        <circle r={R_DIAL} fill={`url(#${uid}-matte)`} opacity={0.8} />
      </g>
    );
  }

  if (t === "guilloche") {
    return (
      <g clipPath={clip}>
        <circle r={R_DIAL} fill={`url(#${uid}-dialglow)`} />
        {Array.from({ length: 64 }).map((_, i) => (
          <circle key={i} r={((i + 1) / 64) * R_DIAL} fill="none" stroke="#ffffff" strokeWidth={0.7} opacity={0.07} />
        ))}
        <circle r={R_DIAL} fill={`url(#${uid}-matte)`} opacity={0.6} />
      </g>
    );
  }

  if (t === "skeleton") {
    return (
      <g clipPath={clip}>
        <circle r={R_DIAL} fill="#111214" />
        <circle r={R_DIAL} fill={`url(#${uid}-skeletonbase)`} />
        {[
          { x: -40, y: -26, r: 38, teeth: 30 },
          { x: 38, y: 22, r: 30, teeth: 24 },
          { x: -10, y: 58, r: 22, teeth: 18 },
          { x: 44, y: -52, r: 17, teeth: 14 },
        ].map((g, i) => (
          <g key={i}>
            <circle cx={g.x} cy={g.y} r={g.r} fill="#1c1e22" opacity={0.9} />
            <circle
              cx={g.x}
              cy={g.y}
              r={g.r}
              fill="none"
              stroke="#8a8272"
              strokeWidth={5}
              strokeDasharray={`${(2 * Math.PI * g.r) / g.teeth / 2} ${(2 * Math.PI * g.r) / g.teeth / 2}`}
              opacity={0.85}
            />
            <circle cx={g.x} cy={g.y} r={g.r - 8} fill="none" stroke="#b3a88f" strokeWidth={2} opacity={0.5} />
            <circle cx={g.x} cy={g.y} r={8} fill="#0b0c0d" stroke="#c2b294" strokeWidth={2.2} />
            <circle cx={g.x} cy={g.y} r={2.4} fill="#b03a2e" />
          </g>
        ))}
        <g opacity={0.8}>
          <rect x={-100} y={-14} width={200} height={13} rx={6} fill="#2c2e33" />
          <rect x={-80} y={44} width={168} height={11} rx={5} fill="#2c2e33" transform="rotate(-16)" />
          <rect x={-120} y={-58} width={130} height={9} rx={4} fill="#2c2e33" transform="rotate(30)" />
        </g>
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <circle key={a} cx={polar(0, 0, 100, a).x} cy={polar(0, 0, 100, a).y} r={3.2} fill="#b03a2e" opacity={0.85} />
        ))}
        <circle r={R_DIAL} fill={`url(#${uid}-matte)`} opacity={0.55} />
      </g>
    );
  }

  return (
    <g clipPath={clip}>
      <circle r={R_DIAL} fill={`url(#${uid}-dialglow)`} />
      <circle r={R_DIAL} fill={`url(#${uid}-matte)`} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Indices                                                             */
/* ------------------------------------------------------------------ */

function Indices({ dial, color }: { dial: DialOption; color: string }) {
  const style = dial.indices;
  const items: React.ReactNode[] = [];

  if (style === "none") {
    for (let i = 0; i < 60; i++) {
      const major = i % 5 === 0;
      const p1 = polar(0, 0, R_DIAL - 4, i * 6);
      const p2 = polar(0, 0, R_DIAL - (major ? 14 : 8), i * 6);
      items.push(
        <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={color} strokeWidth={major ? 1.8 : 1} opacity={major ? 0.9 : 0.5} />,
      );
    }
    return <g>{items}</g>;
  }

  if (style === "baton" || style === "round") {
    for (let i = 0; i < 12; i++) {
      if (i === 3) continue;
      const angle = i * 30;
      const isTwelve = i === 0;
      const p = polar(0, 0, R_DIAL - 22, angle);
      const lum = "#ece7d3";
      if (style === "round") {
        items.push(
          <g key={i} transform={`translate(${p.x} ${p.y})`}>
            <circle r={isTwelve ? 9 : 7} fill={color} stroke="rgba(0,0,0,0.45)" strokeWidth={1} />
            <circle r={isTwelve ? 5 : 3.8} fill={lum} />
          </g>,
        );
      } else {
        const width = isTwelve ? 24 : 9;
        const height = isTwelve ? 28 : i % 3 === 0 ? 22 : 18;
        items.push(
          <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${angle})`}>
            <rect x={-width / 2} y={-height / 2} width={width} height={height} rx={2} fill={color} stroke="rgba(0,0,0,0.45)" strokeWidth={1} />
            <rect x={-width / 2 + 2} y={-height / 2 + 2.4} width={width - 4} height={height - 4.8} rx={1} fill={lum} />
          </g>,
        );
      }
    }
    return <g>{items}</g>;
  }

  const nums =
    style === "arabic"
      ? ["١٢", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩", "١٠", "١١"]
      : ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];

  for (let i = 0; i < 12; i++) {
    if (i === 3) continue;
    const p = polar(0, 0, R_DIAL - 25, i * 30);
    items.push(
      <text
        key={i}
        x={p.x}
        y={p.y}
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontFamily="'Cormorant Garamond', 'Times New Roman', serif"
        fontSize={style === "arabic" ? 25 : 21}
        fontWeight={500}
      >
        {nums[i]}
      </text>,
    );
  }
  return <g>{items}</g>;
}

/* ------------------------------------------------------------------ */
/* Hands                                                               */
/* ------------------------------------------------------------------ */

const LUME = "#ece7d3";

function HourHand({ shape, color }: { shape: HandsOption["shape"]; color: string }) {
  if (shape === "baton") {
    return (
      <g>
        <path d="M -7.5 30 L -6.5 -62 L 0 -74 L 6.5 -62 L 7.5 30 Z" fill={color} stroke="rgba(0,0,0,0.5)" strokeWidth={0.8} />
        <rect x={-3.2} y={-58} width={6.4} height={66} rx={1} fill={LUME} opacity={0.9} />
      </g>
    );
  }
  if (shape === "snowflake") {
    return (
      <g>
        <path d="M -9.5 30 L -8 -52 L -3 -64 L 3 -64 L 8 -52 L 9.5 30 Z" fill={color} stroke="rgba(0,0,0,0.5)" strokeWidth={0.8} />
        <path d="M -5 -4 L -4.4 -48 L 0 -58 L 4.4 -48 L 5 -4 Z" fill={LUME} opacity={0.9} />
        <circle cx={0} cy={-30} r={4.6} fill={color} />
      </g>
    );
  }
  if (shape === "nautilus") {
    return (
      <g>
        <path d="M -10 30 L -7.5 -56 Q 0 -72 7.5 -56 L 10 30 Z" fill="none" stroke={color} strokeWidth={4.6} strokeLinejoin="round" />
        <path d="M 0 -46 L 0 -62" stroke={LUME} strokeWidth={3} opacity={0.9} />
      </g>
    );
  }
  return (
    <g>
      <path d="M -9 32 L -8 -48 L 8 -48 L 9 32 Z" fill={color} stroke="rgba(0,0,0,0.5)" strokeWidth={0.8} />
      <circle cx={0} cy={-58} r={14} fill={color} stroke="rgba(0,0,0,0.45)" strokeWidth={1} />
      <circle cx={0} cy={-58} r={9.2} fill={LUME} opacity={0.95} />
      <path d="M -2.6 -80 L 2.6 -80 L 2.6 -58 L -2.6 -58 Z" fill={color} />
      <path d="M -2.6 -80 L 2.6 -80 L 2.6 -70 L -2.6 -70 Z" fill={LUME} opacity={0.9} />
      <rect x={-3.4} y={-40} width={6.8} height={54} fill={LUME} opacity={0.55} />
    </g>
  );
}

function MinuteHand({ shape, color }: { shape: HandsOption["shape"]; color: string }) {
  if (shape === "benz") {
    return (
      <g>
        <path d="M -6 34 L -5 -90 L 0 -102 L 5 -90 L 6 34 Z" fill={color} stroke="rgba(0,0,0,0.5)" strokeWidth={0.8} />
        <rect x={-2.8} y={-88} width={5.6} height={104} fill={LUME} opacity={0.75} />
      </g>
    );
  }
  if (shape === "snowflake") {
    return (
      <g>
        <path d="M -7.5 34 L -6 -84 L -2 -98 L 2 -98 L 6 -84 L 7.5 34 Z" fill={color} stroke="rgba(0,0,0,0.5)" strokeWidth={0.8} />
        <path d="M -4 -6 L -3.4 -82 L 0 -92 L 3.4 -82 L 4 -6 Z" fill={LUME} opacity={0.9} />
      </g>
    );
  }
  if (shape === "nautilus") {
    return (
      <g>
        <path d="M -7.5 34 L -5.5 -88 L 0 -100 L 5.5 -88 L 7.5 34 Z" fill="none" stroke={color} strokeWidth={3.8} strokeLinejoin="round" />
        <path d="M 0 -62 L 0 -90" stroke={LUME} strokeWidth={2.8} opacity={0.9} />
      </g>
    );
  }
  return (
    <g>
      <path d="M -5.6 34 L -4.8 -92 L 0 -104 L 4.8 -92 L 5.6 34 Z" fill={color} stroke="rgba(0,0,0,0.5)" strokeWidth={0.8} />
      <rect x={-2.4} y={-90} width={4.8} height={104} fill={LUME} opacity={0.6} />
    </g>
  );
}

function SecondsHand({ color, tip }: { color: string; tip: SecondsOption["tip"] }) {
  const tipColor = tip === "red" ? "#b8232f" : tip === "orange" ? "#d9711f" : tip === "gold" ? "#e2c583" : color;
  return (
    <g>
      <rect x={-1} y={-108} width={2} height={154} fill={color} />
      <rect x={-1} y={-108} width={0.6} height={154} fill="#ffffff" opacity={0.4} />
      <circle cx={0} cy={24} r={5.4} fill={color} />
      <circle cx={0} cy={24} r={2.4} fill="#0c0d0f" opacity={0.5} />
      {tip === "lollipop" ? (
        <>
          <circle cx={0} cy={-74} r={7.4} fill={tipColor} />
          <circle cx={0} cy={-74} r={4} fill={LUME} />
        </>
      ) : tip === "plain" ? (
        <rect x={-1.4} y={-108} width={2.8} height={14} fill={color} />
      ) : (
        <path d="M -2.8 -90 L 2.8 -90 L 1.5 -108 L -1.5 -108 Z" fill={tipColor} />
      )}
      <circle cx={0} cy={0} r={4.8} fill={tip === "gold" ? "#e2c583" : "#e6e8ea"} stroke="rgba(0,0,0,0.6)" strokeWidth={0.8} />
      <circle cx={0} cy={0} r={2} fill="#1a1b1d" />
    </g>
  );
}

function GmtHand({ color }: { color: string }) {
  return (
    <g>
      <rect x={-1.2} y={-32} width={2.4} height={84} rx={1} fill={color} />
      <path d="M 0 -112 L 10 -90 L 5.5 -86 L -5.5 -86 L -10 -90 Z" fill={color} stroke="rgba(0,0,0,0.45)" strokeWidth={0.7} />
      <path d="M 0 -105 L 5 -91 L 0 -88 L -5 -91 Z" fill={LUME} opacity={0.8} />
      <circle cx={0} cy={-78} r={4.8} fill={color} />
      <circle cx={0} cy={-78} r={2.2} fill="#0c0d0f" opacity={0.5} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Signature on dial                                                   */
/* ------------------------------------------------------------------ */

function DialLogo({ logo, color, uid }: { logo: LogoState; color: string; uid: string }) {
  const y = -R_DIAL * 0.56;
  if (logo.mode === "image" && logo.image) {
    return (
      <g>
        <clipPath id={`${uid}-logoclip`}>
          <circle cx={0} cy={y} r={17} />
        </clipPath>
        <image
          href={logo.image}
          x={-24}
          y={y - 24}
          width={48}
          height={48}
          clipPath={`url(#${uid}-logoclip)`}
          preserveAspectRatio="xMidYMid slice"
        />
      </g>
    );
  }
  const text = logo.mode === "text" && logo.text.trim() ? logo.text.trim().toUpperCase().slice(0, 14) : "XWATCH";
  const fill = logo.mode === "text" ? logo.color : color;
  return (
    <g>
      <path
        d={`M -7 ${y - 16} L -3 ${y - 7} L 3 ${y - 7} L 7 ${y - 16}`}
        stroke={fill}
        strokeWidth={1.2}
        fill="none"
        opacity={0.95}
        strokeLinejoin="round"
      />
      <path d={`M 0 ${y - 15} L 0 ${y - 8.5}`} stroke={fill} strokeWidth={1.1} opacity={0.95} />
      <text
        x={0}
        y={y + 10}
        textAnchor="middle"
        fill={fill}
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fontSize={text.length > 9 ? 12 : 15}
        fontWeight={600}
        letterSpacing={2.8}
      >
        {text}
      </text>
      <text
        x={0}
        y={y + 21}
        textAnchor="middle"
        fill={fill}
        fontFamily="'Jost', 'Helvetica Neue', sans-serif"
        fontSize={4.6}
        letterSpacing={1.9}
        opacity={0.7}
      >
        AUTOMATIC
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Watch                                                               */
/* ------------------------------------------------------------------ */

export interface WatchProps {
  config: WatchConfig;
  time?: Date | null;
  className?: string;
  showShadow?: boolean;
  showStrap?: boolean;
  idPrefix?: string;
}

export default function Watch({
  config,
  time = null,
  className,
  showShadow = true,
  showStrap = true,
  idPrefix,
}: WatchProps) {
  const autoId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const uid = (idPrefix ?? `w${autoId}`).replace(/[^a-zA-Z0-9_-]/g, "");

  const c: CaseOption = findCase(config.caseId);
  const d: DialOption = findDial(config.dialId);
  const b = findBezel(config.bezelId);
  const r = findRehaut(config.rehautId);
  const h = findHands(config.handsId);
  const s = findSeconds(config.secondsId);
  const g = findGmt(config.gmtId);
  const br: BraceletOption = findBracelet(config.braceletId);
  const cb = findCaseback(config.casebackId);

  const m = metal(c.metal);
  const hm = metal(h.metal);
  const bm = metal(b.metal ?? c.metal);

  const hh = time ? time.getHours() % 12 : 10;
  const mm = time ? time.getMinutes() : 9;
  const ss = time ? time.getSeconds() : 42;
  const ms = time ? time.getMilliseconds() : 0;

  const hourAngle = (hh + mm / 60 + ss / 3600) * 30;
  const minuteAngle = (mm + ss / 60) * 6;
  const secondAngle = (ss + ms / 1000) * 6;
  const gmtAngle = time ? ((time.getUTCHours() % 12) + time.getUTCMinutes() / 60) * 30 : 72;

  const isFluted = c.bezel === "fluted" && b.id === "acier";
  const isSmooth = c.bezel === "smooth" && b.id === "acier";

  const dialText = d.text;
  const darkDial = isDark(d.base);
  const dateBg = darkDial ? "#f5f2e9" : "#fbf9f3";

  return (
    <svg
      viewBox={showStrap ? `0 0 ${W} ${H}` : "24 236 552 384"}
      className={className}
      role="img"
      aria-label={`Montre XWATCH ${c.name}, cadran ${d.name}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${uid}-case`} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor={m.light} />
          <stop offset="0.12" stopColor={m.mid} />
          <stop offset="0.34" stopColor={m.base} />
          <stop offset="0.5" stopColor={m.light} />
          <stop offset="0.66" stopColor={m.base} />
          <stop offset="0.86" stopColor={m.dark} />
          <stop offset="1" stopColor={m.deep} />
        </linearGradient>
        <linearGradient id={`${uid}-bezelring`} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor={bm.light} />
          <stop offset="0.28" stopColor={bm.mid} />
          <stop offset="0.6" stopColor={bm.dark} />
          <stop offset="0.78" stopColor={bm.base} />
          <stop offset="1" stopColor={bm.deep} />
        </linearGradient>
        <linearGradient id={`${uid}-hand`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={hm.dark} />
          <stop offset="0.35" stopColor={hm.light} />
          <stop offset="0.6" stopColor={hm.base} />
          <stop offset="1" stopColor={hm.deep} />
        </linearGradient>
        <radialGradient id={`${uid}-dialglow`} cx="34%" cy="26%" r="82%">
          <stop offset="0" stopColor={d.highlight} />
          <stop offset="0.55" stopColor={d.base} />
          <stop offset="1" stopColor={shade(d.base, 0.72)} />
        </radialGradient>
        <radialGradient id={`${uid}-matte`} cx="34%" cy="26%" r="82%">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.12} />
          <stop offset="0.5" stopColor="#000000" stopOpacity={0} />
          <stop offset="1" stopColor="#000000" stopOpacity={0.5} />
        </radialGradient>
        <radialGradient id={`${uid}-dialvignette`} cx="50%" cy="50%" r="50%">
          <stop offset="0.72" stopColor="#000000" stopOpacity={0} />
          <stop offset="1" stopColor="#000000" stopOpacity={0.5} />
        </radialGradient>
        <radialGradient id={`${uid}-meteor-sheen`} cx="32%" cy="24%" r="80%">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.45} />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="1" stopColor="#000000" stopOpacity={0.5} />
        </radialGradient>
        <radialGradient id={`${uid}-crystal`} cx="32%" cy="24%" r="76%">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.3} />
          <stop offset="0.35" stopColor="#ffffff" stopOpacity={0.06} />
          <stop offset="0.72" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0.08} />
        </radialGradient>
        <linearGradient id={`${uid}-glare`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0.05" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="0.42" stopColor="#ffffff" stopOpacity={0.14} />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity={0.02} />
          <stop offset="0.72" stopColor="#ffffff" stopOpacity={0.07} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
        </linearGradient>
        <radialGradient id={`${uid}-skeletonbase`} cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#3a3d43" />
          <stop offset="0.6" stopColor="#1b1d21" />
          <stop offset="1" stopColor="#0a0b0d" />
        </radialGradient>
        <linearGradient id={`${uid}-caseinner`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity={0.65} />
          <stop offset="0.45" stopColor="#000" stopOpacity={0.12} />
          <stop offset="1" stopColor="#000" stopOpacity={0.7} />
        </linearGradient>
        <linearGradient id={`${uid}-crown`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={m.deep} />
          <stop offset="0.2" stopColor={m.light} />
          <stop offset="0.5" stopColor={m.base} />
          <stop offset="0.8" stopColor={m.dark} />
          <stop offset="1" stopColor={m.deep} />
        </linearGradient>

        <pattern id={`${uid}-carbonpattern`} width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(26)">
          <rect width="18" height="18" fill="#1e2023" />
          <rect width="9" height="9" fill="#2f3237" />
          <rect x="9" y="9" width="9" height="9" fill="#2f3237" />
        </pattern>

        <filter id={`${uid}-softshadow`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="20" stdDeviation="18" floodColor="#000000" floodOpacity="0.6" />
        </filter>
        <filter id={`${uid}-handshadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2.5" dy="4" stdDeviation="2.6" floodColor="#000000" floodOpacity="0.45" />
        </filter>
        <filter id={`${uid}-lumeshadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#c9d8b8" floodOpacity="0.25" />
        </filter>

        <filter id={`${uid}-meteor`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.011 0.026" numOctaves={5} seed={7} result="noise" />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 0.45
                    0 0 0 0 0.43
                    0 0 0 0 0.39
                    0.85 0.65 0.4 0 0"
          />
          <feComposite operator="in" in2="SourceGraphic" />
        </filter>

        <clipPath id={`${uid}-dialclip`}>
          <circle cx={0} cy={0} r={R_DIAL} />
        </clipPath>
      </defs>



      {/* ---------- Bracelet ---------- */}
      <g opacity={showStrap ? 1 : 0} display={showStrap ? "inline" : "none"}>
        <Strap bracelet={br} dir="up" uid={uid} />
        <Strap bracelet={br} dir="down" uid={uid} />
      </g>

      {/* ---------- Crown ---------- */}
      <g>
        <path
          d={`M ${CX + R_CASE - 6} ${CY - 30} L ${CX + R_CASE + 20} ${CY - 21} L ${CX + R_CASE + 20} ${CY + 21} L ${CX + R_CASE - 6} ${CY + 30} Z`}
          fill={`url(#${uid}-crown)`}
          stroke="rgba(0,0,0,0.5)"
          strokeWidth={0.9}
        />
        {Array.from({ length: 7 }).map((_, i) => (
          <rect
            key={i}
            x={CX + R_CASE + 2}
            y={CY - 19 + i * 5.6}
            width={16}
            height={2.4}
            rx={1}
            fill={m.deep}
            opacity={0.6}
          />
        ))}
        <ellipse cx={CX + R_CASE + 19} cy={CY} rx={3.4} ry={15} fill={m.mid} opacity={0.45} />
      </g>

      {/* ---------- Case ---------- */}
      <g filter={`url(#${uid}-softshadow)`}>
        <circle cx={CX} cy={CY} r={R_CASE} fill={`url(#${uid}-case)`} />
        <circle cx={CX} cy={CY} r={R_CASE - 2.5} fill="none" stroke={m.deep} strokeWidth={1.4} opacity={0.5} />
        {/* brushed/circular finish */}
        <circle cx={CX} cy={CY} r={R_CASE - 6} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={3} opacity={0.5} />
        <circle cx={CX} cy={CY} r={R_CASE - 12} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={2} opacity={0.5} />
      </g>

      {/* ---------- Bezel ---------- */}
      <g>
        {isFluted ? (
          <>
            <circle cx={CX} cy={CY} r={R_CASE - 4} fill={`url(#${uid}-bezelring)`} />
            <g>
              {Array.from({ length: 84 }).map((_, i) => {
                const a = i * (360 / 84);
                const p1 = polar(CX, CY, R_INSERT_IN - 2, a);
                const p2 = polar(CX, CY, R_CASE - 6, a + 1.6);
                const p3 = polar(CX, CY, R_CASE - 6, a + 3.6);
                return (
                  <path
                    key={i}
                    d={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} Z`}
                    fill={i % 2 === 0 ? bm.light : bm.dark}
                    opacity={i % 2 === 0 ? 0.7 : 0.5}
                  />
                );
              })}
            </g>
            <circle cx={CX} cy={CY} r={R_INSERT_IN - 4} fill="none" stroke={bm.deep} strokeWidth={2} opacity={0.5} />
            <circle cx={CX} cy={CY} r={R_CASE - 5} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={1} opacity={0.7} />
          </>
        ) : isSmooth ? (
          <>
            <circle cx={CX} cy={CY} r={R_CASE - 4} fill={`url(#${uid}-bezelring)`} />
            <circle cx={CX} cy={CY} r={R_CASE - 14} fill="none" stroke={bm.light} strokeWidth={1.4} opacity={0.45} />
            <circle cx={CX} cy={CY} r={R_INSERT_IN - 2} fill="none" stroke={bm.deep} strokeWidth={2.4} opacity={0.45} />
            <path
              d={`M ${CX - 60} ${CY - R_CASE + 22} A ${R_CASE - 8} ${R_CASE - 8} 0 0 1 ${CX + 70} ${CY - R_CASE + 12}`}
              fill="none"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth={3}
              opacity={0.55}
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            {/* knurled bezel edge */}
            <circle cx={CX} cy={CY} r={R_CASE - 3} fill={`url(#${uid}-bezelring)`} />
            <g opacity={0.55}>
              {Array.from({ length: 96 }).map((_, i) => {
                const a = i * (360 / 96);
                const p1 = polar(CX, CY, R_INSERT_OUT + 1, a);
                const p2 = polar(CX, CY, R_CASE - 3, a);
                return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={bm.deep} strokeWidth={1.1} opacity={i % 2 ? 0.55 : 0.3} />;
              })}
            </g>

            {/* insert */}
            {b.second ? (
              <>
                <path d={ringPath(CX, CY, R_INSERT_OUT, R_INSERT_IN, -90, 90)} fill={b.base} />
                <path d={ringPath(CX, CY, R_INSERT_OUT, R_INSERT_IN, 90, 270)} fill={b.second} />
              </>
            ) : (
              <path
                d={ringPath(CX, CY, R_INSERT_OUT, R_INSERT_IN, -90, 270)}
                fill={b.carbon ? `url(#${uid}-carbonpattern)` : b.base}
              />
            )}
            <circle cx={CX} cy={CY} r={(R_INSERT_OUT + R_INSERT_IN) / 2} fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth={8} />

            {/* graduations */}
            {Array.from({ length: 60 }).map((_, i) => {
              const major = i % 5 === 0;
              const a = i * 6;
              const p1 = polar(CX, CY, R_INSERT_OUT - 1.5, a);
              const p2 = polar(CX, CY, R_INSERT_OUT - (major ? 11 : 6), a);
              const light = !isLight(b.base) || !!b.second;
              const c1 = b.base === "#e6e2d8" ? "rgba(0,0,0,0.7)" : light ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.55)";
              return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={c1} strokeWidth={major ? 1.9 : 1} opacity={major ? 0.95 : 0.6} />;
            })}

            {/* 12 o'clock triangle */}
            <g transform={`translate(${CX} ${CY - R_INSERT_OUT + 10})`}>
              <path d="M 0 9 L -8 -1 L 8 -1 Z" fill={LUME} opacity={0.95} />
              <path d="M 0 5 L -4.6 -0.2 L 4.6 -0.2 Z" fill="#9fb49a" opacity={0.65} />
            </g>
            {/* 15/30/45 marks */}
            {[15, 30, 45].map((a) => {
              const p = polar(CX, CY, R_INSERT_OUT - 20, a * 6);
              return (
                <circle key={a} cx={p.x} cy={p.y} r={2.2} fill={b.base === "#e6e2d8" ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.85)"} opacity={0.85} />
              );
            })}

            <circle cx={CX} cy={CY} r={R_INSERT_OUT} fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth={1.2} />
            <circle cx={CX} cy={CY} r={R_INSERT_IN} fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth={1.2} />
            <circle cx={CX} cy={CY} r={R_INSERT_IN + 1} fill={`url(#${uid}-caseinner)`} opacity={0.55} />
          </>
        )}
      </g>

      {/* ---------- Dial assembly ---------- */}
      <g>
        <circle cx={CX} cy={CY} r={R_CRYSTAL} fill={`url(#${uid}-dialglow)`} />

        <g transform={`translate(${CX} ${CY})`}>
          <DialTexture dial={d} uid={uid} />
          <circle r={R_DIAL} fill={`url(#${uid}-dialvignette)`} pointerEvents="none" />

          {/* rehaut */}
          <circle cx={0} cy={0} r={(R_REHAUT_OUT + R_REHAUT_IN) / 2} fill="none" stroke={r.color} strokeWidth={R_REHAUT_OUT - R_REHAUT_IN} />
          <circle cx={0} cy={0} r={R_REHAUT_IN} fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth={1.4} />
          {r.markers &&
            Array.from({ length: 60 }).map((_, i) => {
              const major = i % 5 === 0;
              const p1 = polar(0, 0, R_REHAUT_OUT + 1, i * 6);
              const p2 = polar(0, 0, R_REHAUT_IN + 0.5, i * 6);
              return (
                <line
                  key={i}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={r.dark ? "#ddd8c8" : "#2a2a2a"}
                  strokeWidth={major ? 1.5 : 0.8}
                  opacity={major ? 0.85 : 0.5}
                />
              );
            })}

          <Indices dial={d} color={dialText} />

          {/* date window */}
          {(() => {
            const dx = 86;
            const w = 30;
            const hgt = 26;
            return (
              <g>
                <rect x={dx - w / 2 - 1.6} y={-hgt / 2 - 1.6} width={w + 3.2} height={hgt + 3.2} rx={3} fill="rgba(0,0,0,0.6)" />
                <rect x={dx - w / 2} y={-hgt / 2} width={w} height={hgt} rx={2} fill={dateBg} />
                <text
                  x={dx}
                  y={1.8}
                  textAnchor="middle"
                  fontSize={17}
                  fontFamily="'Jost', 'Helvetica Neue', Arial, sans-serif"
                  fill="#191919"
                  fontWeight={500}
                >
                  {time ? String(time.getDate()).padStart(2, "0") : "18"}
                </text>
                <rect x={dx - w / 2} y={-hgt / 2} width={w} height={hgt} rx={2} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth={1} />
              </g>
            );
          })()}

          {/* signature */}
          <DialLogo logo={config.logo} color={dialText} uid={uid} />
          <text
            x={0}
            y={R_DIAL * 0.47}
            textAnchor="middle"
            fill={dialText}
            opacity={0.7}
            fontSize={4.6}
            fontFamily="'Jost', 'Helvetica Neue', sans-serif"
            letterSpacing={1.7}
          >
            {`${c.water} M · SAPPHIRE · ${g.id === "none" ? "NH35" : "NH34"}`}
          </text>

          {/* hands */}
          <g filter={`url(#${uid}-handshadow)`}>
            {g.color && (
              <g transform={`rotate(${gmtAngle})`}>
                <GmtHand color={g.color} />
              </g>
            )}
            <g transform={`rotate(${hourAngle})`}>
              <HourHand shape={h.shape} color={`url(#${uid}-hand)`} />
            </g>
            <g transform={`rotate(${minuteAngle})`}>
              <MinuteHand shape={h.shape} color={`url(#${uid}-hand)`} />
            </g>
            <g transform={`rotate(${secondAngle})`}>
              <SecondsHand color={s.color} tip={s.tip} />
            </g>
          </g>

          {/* crystal sheen */}
          <circle r={R_CRYSTAL - 1} fill={`url(#${uid}-crystal)`} pointerEvents="none" />
          <ellipse cx={-44} cy={-54} rx={64} ry={30} fill="#ffffff" opacity={0.09} transform="rotate(-36)" pointerEvents="none" />
          <path
            d={`M ${-R_CRYSTAL + 8} ${-R_CRYSTAL + 46} A ${R_CRYSTAL} ${R_CRYSTAL} 0 0 1 ${-46} ${-R_CRYSTAL + 3}`}
            fill="none"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth={1.4}
            pointerEvents="none"
          />
          <rect x={-R_CRYSTAL} y={-R_CRYSTAL} width={R_CRYSTAL * 2} height={R_CRYSTAL * 2} fill={`url(#${uid}-glare)`} transform="rotate(28)" pointerEvents="none" />
        </g>

        {/* dial rim shadow */}
        <circle cx={CX} cy={CY} r={R_CRYSTAL} fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth={8} opacity={0.5} />
        <circle cx={CX} cy={CY} r={R_CRYSTAL + 0.8} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={1.2} />

        {/* magnifier */}
        {config.magnifier && (() => {
          const p = polar(CX, CY, 86, 90);
          return (
            <g pointerEvents="none">
              <circle cx={p.x} cy={p.y} r={25} fill="rgba(255,255,255,0.05)" />
              <circle cx={p.x} cy={p.y} r={25} fill={`url(#${uid}-crystal)`} opacity={0.85} />
              <circle cx={p.x} cy={p.y} r={25} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={0.8} />
              <circle cx={p.x} cy={p.y} r={26.4} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth={2} />
              <ellipse cx={p.x - 7} cy={p.y - 9} rx={10} ry={6} fill="#fff" opacity={0.14} transform={`rotate(-30 ${p.x} ${p.y})`} />
            </g>
          );
        })()}
      </g>

      {/* case side lighting */}
      <path
        d={`M ${CX - 92} ${CY - 132} A ${R_CASE - 3} ${R_CASE - 3} 0 0 1 ${CX + 44} ${CY - R_CASE + 3}`}
        fill="none"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth={2.2}
        strokeLinecap="round"
        opacity={0.8}
      />
      <path
        d={`M ${CX + R_CASE - 3} ${CY + 26} A ${R_CASE - 3} ${R_CASE - 3} 0 0 1 ${CX + 40} ${CY + R_CASE - 3}`}
        fill="none"
        stroke="rgba(0,0,0,0.45)"
        strokeWidth={5}
        strokeLinecap="round"
        opacity={0.8}
      />
      <path
        d={`M ${CX - 40} ${CY - R_CASE + 3} A ${R_CASE - 3} ${R_CASE - 3} 0 0 1 ${CX + 110} ${CY - 118}`}
        fill="none"
        stroke="rgba(0,0,0,0.35)"
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.7}
      />

      {cb.transparent && (
        <title>Fond transparent : mouvement visible</title>
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Utils                                                               */
/* ------------------------------------------------------------------ */

function isDark(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 120;
}

function isLight(hex: string) {
  return !isDark(hex);
}
