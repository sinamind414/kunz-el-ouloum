import {
  BezelOption,
  BraceletOption,
  CaseOption,
  CasebackOption,
  DialOption,
  GmtOption,
  HandsOption,
  LogoState,
  Metal,
  RehautOption,
  SecondsOption,
} from "../configurator/catalog";
import { METALS } from "../configurator/Watch";

const S = 120;
const H = 74;

function MetalDefs({ id, metal }: { id: string; metal?: Metal }) {
  const m = METALS[metal ?? "silver"];
  return (
    <linearGradient id={id} x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0" stopColor={m.light} />
      <stop offset="0.32" stopColor={m.mid} />
      <stop offset="0.55" stopColor={m.base} />
      <stop offset="0.78" stopColor={m.dark} />
      <stop offset="1" stopColor={m.deep} />
    </linearGradient>
  );
}

export function CaseSwatch({ option }: { option: CaseOption }) {
  const m = METALS[option.metal];
  const id = `cs-${option.id}`;
  return (
    <svg viewBox={`0 0 ${S} ${H}`} width="100%" height="100%" aria-hidden>
      <defs>
        <MetalDefs id={id} metal={option.metal} />
        <radialGradient id={`${id}-d`} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#2b2d31" />
          <stop offset="1" stopColor="#08090a" />
        </radialGradient>
      </defs>
      <circle cx={S / 2} cy={H / 2} r={27} fill={`url(#${id})`} />
      <circle cx={S / 2} cy={H / 2} r={20.5} fill={option.metal === "gold" || option.metal === "rose" ? "#241a12" : "#101113"} />
      <circle cx={S / 2} cy={H / 2} r={20.5} fill={`url(#${id}-d)`} opacity={0.9} />
      {option.bezel === "fluted" && (
        <g>
          {Array.from({ length: 28 }).map((_, i) => {
            const a = (i * 360) / 28;
            const rad = ((a - 90) * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={S / 2 + Math.cos(rad) * 21}
                y1={H / 2 + Math.sin(rad) * 21}
                x2={S / 2 + Math.cos(rad) * 26}
                y2={H / 2 + Math.sin(rad) * 26}
                stroke={i % 2 ? m.light : m.dark}
                strokeWidth={1.6}
                opacity={0.8}
              />
            );
          })}
        </g>
      )}
      {option.bezel === "dive" && (
        <circle cx={S / 2} cy={H / 2} r={24} fill="none" stroke={m.deep} strokeWidth={3} opacity={0.55} />
      )}
      <circle cx={S / 2} cy={H / 2} r={27} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth={0.8} />
      <rect x={S / 2 + 26} y={H / 2 - 4} width={4} height={8} rx={1.6} fill={`url(#${id})`} />
    </svg>
  );
}

export function DialSwatch({ option }: { option: DialOption }) {
  const id = `ds-${option.id}`;
  return (
    <svg viewBox={`0 0 ${S} ${H}`} width="100%" height="100%" aria-hidden>
      <defs>
        <radialGradient id={id} cx="34%" cy="28%" r="80%">
          <stop offset="0" stopColor={option.highlight} />
          <stop offset="0.6" stopColor={option.base} />
          <stop offset="1" stopColor={option.base} />
        </radialGradient>
      </defs>
      <circle cx={S / 2} cy={H / 2} r={27} fill={`url(#${id})`} />
      {option.texture === "sunburst" &&
        Array.from({ length: 36 }).map((_, i) => (
          <line
            key={i}
            x1={S / 2}
            y1={H / 2}
            x2={S / 2 + Math.cos(((i * 10 - 90) * Math.PI) / 180) * 27}
            y2={H / 2 + Math.sin(((i * 10 - 90) * Math.PI) / 180) * 27}
            stroke="#fff"
            strokeWidth={0.7}
            opacity={0.12}
          />
        ))}
      {option.texture === "guilloche" &&
        Array.from({ length: 7 }).map((_, i) => (
          <circle key={i} cx={S / 2} cy={H / 2} r={5 + i * 3.4} fill="none" stroke="#fff" strokeWidth={0.6} opacity={0.16} />
        ))}
      {option.texture === "carbon" && (
        <g opacity={0.8}>
          {Array.from({ length: 18 }).map((_, i) => (
            <rect
              key={i}
              x={S / 2 - 26 + (i % 6) * 9}
              y={H / 2 - 24 + Math.floor(i / 6) * 8}
              width={7}
              height={6}
              rx={1}
              fill={i % 2 ? "#3c4045" : "#24262a"}
            />
          ))}
        </g>
      )}
      {option.texture === "meteorite" && (
        <g opacity={0.5}>
          {Array.from({ length: 14 }).map((_, i) => (
            <circle key={i} cx={S / 2 - 20 + ((i * 37) % 40)} cy={H / 2 - 20 + ((i * 23) % 40)} r={1.6 + (i % 3)} fill="#cfc9bb" opacity={0.5} />
          ))}
        </g>
      )}
      {option.texture === "skeleton" && (
        <g opacity={0.85}>
          <circle cx={S / 2 - 7} cy={H / 2 - 3} r={9} fill="none" stroke="#9c8f76" strokeWidth={2.6} strokeDasharray="2 2" />
          <circle cx={S / 2 + 8} cy={H / 2 + 6} r={6} fill="none" stroke="#9c8f76" strokeWidth={2} strokeDasharray="2 2" />
          <rect x={S / 2 - 18} y={H / 2 + 12} width={30} height={3} fill="#2c2e33" />
        </g>
      )}
      {/* indices hint */}
      {option.indices === "baton" && (
        <g fill={option.text}>
          {[0, 90, 180, 270].map((a) => {
            const rad = ((a - 90) * Math.PI) / 180;
            return <rect key={a} x={S / 2 + Math.cos(rad) * 20 - 1.4} y={H / 2 + Math.sin(rad) * 20 - 1.4} width={2.8} height={2.8} rx={0.6} />;
          })}
        </g>
      )}
      {option.indices === "arabic" && (
        <text x={S / 2} y={H / 2 + 2} textAnchor="middle" fontSize={11} fill={option.text} fontFamily="serif">
          ١٢
        </text>
      )}
      {option.indices === "roman" && (
        <text x={S / 2} y={H / 2 + 2} textAnchor="middle" fontSize={10} fill={option.text} fontFamily="serif">
          XII
        </text>
      )}
      <circle cx={S / 2} cy={H / 2} r={27} fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth={1} />
      <circle cx={S / 2} cy={H / 2} r={27} fill="url(#ds-crystal)" opacity={0.25} />
      <defs>
        <radialGradient id="ds-crystal" cx="32%" cy="24%" r="70%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.6" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function BezelSwatch({ option }: { option: BezelOption }) {
  const id = `bs-${option.id}`;
  return (
    <svg viewBox={`0 0 ${S} ${H}`} width="100%" height="100%" aria-hidden>
      <defs>
        <MetalDefs id={id} metal={option.metal} />
        <pattern id={`${id}-carbon`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(26)">
          <rect width="8" height="8" fill="#1e2023" />
          <rect width="4" height="4" fill="#33363c" />
          <rect x="4" y="4" width="4" height="4" fill="#33363c" />
        </pattern>
      </defs>
      <circle cx={S / 2} cy={H / 2} r={27} fill={`url(#${id})`} />
      <g transform={`translate(${S / 2} ${H / 2})`}>
        <circle r={22.5} fill={option.carbon ? `url(#${id}-carbon)` : option.base} />
        {option.second && <path d="M -22.5 0 A 22.5 22.5 0 0 1 22.5 0 Z" fill={option.second} />}
        {Array.from({ length: 24 }).map((_, i) => {
          const a = ((i * 15 - 90) * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={Math.cos(a) * 19}
              y1={Math.sin(a) * 19}
              x2={Math.cos(a) * 22}
              y2={Math.sin(a) * 22}
              stroke={option.base === "#e6e2d8" ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.8)"}
              strokeWidth={i % 2 === 0 ? 1.2 : 0.7}
              opacity={0.85}
            />
          );
        })}
        <circle r={22.5} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth={0.8} />
      </g>
      <circle cx={S / 2} cy={H / 2} r={13.5} fill="#0a0b0c" />
      <circle cx={S / 2} cy={H / 2} r={27} fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth={1} />
    </svg>
  );
}

export function RehautSwatch({ option }: { option: RehautOption }) {
  const id = `rs-${option.id}`;
  return (
    <svg viewBox={`0 0 ${S} ${H}`} width="100%" height="100%" aria-hidden>
      <circle cx={S / 2} cy={H / 2} r={27} fill={option.color} />
      <circle cx={S / 2} cy={H / 2} r={18} fill="#0a0b0c" />
      {Array.from({ length: 30 }).map((_, i) => {
        const a = ((i * 12 - 90) * Math.PI) / 180;
        return (
          <line
            key={i}
            x1={S / 2 + Math.cos(a) * 19}
            y1={H / 2 + Math.sin(a) * 19}
            x2={S / 2 + Math.cos(a) * 26}
            y2={H / 2 + Math.sin(a) * 26}
            stroke={option.dark ? "#d8d3c4" : "#2b2b2b"}
            strokeWidth={i % 5 === 0 ? 1.3 : 0.6}
            opacity={option.markers ? 0.85 : 0.25}
          />
        );
      })}
      <circle cx={S / 2} cy={H / 2} r={27} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth={1} />
    </svg>
  );
}

export function HandsSwatch({ option }: { option: HandsOption }) {
  const id = `hs-${option.id}`;
  const m = METALS[option.metal];
  return (
    <svg viewBox={`0 0 ${S} ${H}`} width="100%" height="100%" aria-hidden>
      <defs>
        <MetalDefs id={id} metal={option.metal} />
      </defs>
      <circle cx={S / 2} cy={H / 2} r={27} fill="#0b0c0e" />
      <g transform={`translate(${S / 2} ${H / 2})`}>
        {option.shape === "benz" ? (
          <>
            <rect x={-2.6} y={-6} width={5.2} height={34} rx={1} fill={`url(#${id})`} />
            <rect x={-1.9} y={-6} width={1.6} height={30} fill="#ece7d3" />
            <circle cy={-10} r={7} fill={`url(#${id})`} />
            <circle cy={-10} r={4.4} fill="#ece7d3" />
            <path d="M -1.3 -13 L 1.3 -13 L 1.3 -21 L -1.3 -21 Z" fill={`url(#${id})`} />
          </>
        ) : option.shape === "baton" ? (
          <>
            <rect x={-3.4} y={-6} width={6.8} height={34} rx={1} fill={`url(#${id})`} />
            <rect x={-1.8} y={-4} width={3.6} height={30} fill="#ece7d3" />
          </>
        ) : option.shape === "snowflake" ? (
          <>
            <path d="M -4 -6 L -3 -26 L 0 -30 L 3 -26 L 4 -6 Z" fill={`url(#${id})`} />
            <path d="M -2 -8 L -1.7 -24 L 0 -27 L 1.7 -24 L 2 -8 Z" fill="#ece7d3" opacity={0.85} />
          </>
        ) : (
          <>
            <path d="M -4 -6 L -3 -28 L 0 -32 L 3 -28 L 4 -6" fill="none" stroke={`url(#${id})`} strokeWidth={2.2} />
          </>
        )}
      </g>
      <circle cx={S / 2} cy={H / 2} r={27} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
      <circle cx={S / 2} cy={H / 2} r={1.4} fill={m.base} />
    </svg>
  );
}

export function SecondsSwatch({ option }: { option: SecondsOption }) {
  return (
    <svg viewBox={`0 0 ${S} ${H}`} width="100%" height="100%" aria-hidden>
      <circle cx={S / 2} cy={H / 2} r={27} fill="#0b0c0e" />
      <g transform={`translate(${S / 2} ${H / 2})`}>
        <rect x={-0.9} y={-25} width={1.8} height={44} fill={option.color} />
        {option.tip === "lollipop" && <circle cy={-10} r={5} fill={option.color} />}
        {option.tip === "red" && <path d="M -2.2 -14 L 2.2 -14 L 1.2 -25 L -1.2 -25 Z" fill="#b8232f" />}
        {option.tip === "orange" && <path d="M -2.2 -14 L 2.2 -14 L 1.2 -25 L -1.2 -25 Z" fill="#d9711f" />}
        {option.tip === "gold" && <rect x={-0.9} y={-25} width={1.8} height={44} fill="#e2c583" />}
        <circle r={4} fill="#dfe3e8" />
      </g>
    </svg>
  );
}

export function GmtSwatch({ option }: { option: GmtOption }) {
  return (
    <svg viewBox={`0 0 ${S} ${H}`} width="100%" height="100%" aria-hidden>
      <circle cx={S / 2} cy={H / 2} r={27} fill="#0b0c0e" />
      {option.color ? (
        <g transform={`translate(${S / 2} ${H / 2})`}>
          <rect x={-1} y={-6} width={2} height={32} fill={option.color} />
          <path d="M 0 -26 L 7 -12 L 4 -9 L -4 -9 L -7 -12 Z" fill={option.color} />
          <circle cy={-1} r={5} fill={option.color} />
          <circle cy={-1} r={2.4} fill="#0c0d0f" />
        </g>
      ) : (
        <g stroke="#6f6a5f" strokeWidth={1} opacity={0.8}>
          <line x1={S / 2 - 14} y1={H / 2} x2={S / 2 + 14} y2={H / 2} />
          <line x1={S / 2 - 14} y1={H / 2} x2={S / 2 + 14} y2={H / 2} transform={`rotate(60 ${S / 2} ${H / 2})`} />
        </g>
      )}
    </svg>
  );
}

export function BraceletSwatch({ option }: { option: BraceletOption }) {
  const id = `brs-${option.id}`;
  const isMetal = option.style === "oyster" || option.style === "jubilee";
  return (
    <svg viewBox={`0 0 ${S} ${H}`} width="100%" height="100%" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={isMetal ? "#e8ecf0" : option.color} />
          <stop offset="0.45" stopColor={option.color} />
          <stop offset="1" stopColor={isMetal ? "#585e65" : "rgba(0,0,0,0.8)"} />
        </linearGradient>
      </defs>
      <g transform="rotate(-18 60 37)">
        <rect x={22} y={20} width={76} height={34} rx={3} fill={`url(#${id})`} stroke="rgba(0,0,0,0.4)" strokeWidth={0.8} />
        {option.style === "oyster" &&
          Array.from({ length: 6 }).map((_, i) => (
            <g key={i}>
              <line x1={22 + i * 12.6} y1={20} x2={22 + i * 12.6} y2={54} stroke="rgba(0,0,0,0.5)" strokeWidth={0.8} />
              <line x1={27} y1={20 + i * 5.6} x2={93} y2={20 + i * 5.6} stroke="rgba(255,255,255,0.16)" strokeWidth={0.6} />
            </g>
          ))}
        {option.style === "jubilee" &&
          Array.from({ length: 7 }).map((_, i) => (
            <line key={i} x1={22 + i * 11} y1={20} x2={22 + i * 11} y2={54} stroke="rgba(0,0,0,0.45)" strokeWidth={0.8} />
          ))}
        {option.style === "jubilee" && (
          <>
            <line x1={22} y1={20} x2={98} y2={20} stroke="rgba(255,255,255,0.3)" strokeWidth={0.7} />
            <line x1={22} y1={54} x2={98} y2={54} stroke="rgba(255,255,255,0.3)" strokeWidth={0.7} />
          </>
        )}
        {option.style === "rubber" &&
          Array.from({ length: 5 }).map((_, i) => (
            <line key={i} x1={24} y1={24 + i * 6} x2={96} y2={24 + i * 6} stroke="rgba(255,255,255,0.09)" strokeWidth={1.6} />
          ))}
        {option.style === "nato" &&
          Array.from({ length: 10 }).map((_, i) => (
            <line key={i} x1={22 + i * 7.6} y1={20} x2={22 + i * 7.6} y2={54} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
          ))}
        {option.style === "leather" &&
          [0, 1].map((k) => (
            <line
              key={k}
              x1={k ? 90 : 30}
              y1={22}
              x2={k ? 90 : 30}
              y2={52}
              stroke={option.accent}
              strokeWidth={1}
              strokeDasharray="2 2"
              opacity={0.8}
            />
          ))}
      </g>
    </svg>
  );
}

export function CasebackSwatch({ option }: { option: CasebackOption }) {
  return (
    <svg viewBox={`0 0 ${S} ${H}`} width="100%" height="100%" aria-hidden>
      <defs>
        <MetalDefs id="cbs" metal="silver" />
      </defs>
      <circle cx={S / 2} cy={H / 2} r={26} fill="url(#cbs)" />
      <circle cx={S / 2} cy={H / 2} r={21} fill={option.transparent ? "#0c0e12" : "#9aa0a7"} />
      {option.transparent ? (
        <g opacity={0.9}>
          <circle cx={S / 2 - 4} cy={H / 2 - 2} r={8} fill="none" stroke="#b7a98c" strokeWidth={2.4} strokeDasharray="2 2" />
          <circle cx={S / 2 + 6} cy={H / 2 + 6} r={5} fill="none" stroke="#b7a98c" strokeWidth={1.8} strokeDasharray="2 2" />
          <rect x={S / 2 - 12} y={H / 2 + 10} width={22} height={3} fill="#3a3d42" />
        </g>
      ) : (
        <g opacity={0.5}>
          {Array.from({ length: 4 }).map((_, i) => (
            <circle key={i} cx={S / 2} cy={H / 2} r={5 + i * 4} fill="none" stroke="#5f656c" strokeWidth={0.8} />
          ))}
        </g>
      )}
      <circle cx={S / 2} cy={H / 2} r={26} fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth={1} />
    </svg>
  );
}

export function LogoSample({ mode, text, color, image }: LogoState) {
  return (
    <svg viewBox={`0 0 ${S} ${H}`} width="100%" height="100%" aria-hidden>
      <circle cx={S / 2} cy={H / 2} r={27} fill="#0b0c0e" />
      {mode === "image" && image ? (
        <>
          <clipPath id="logosmp">
            <circle cx={S / 2} cy={H / 2} r={20} />
          </clipPath>
          <image href={image} x={S / 2 - 20} y={H / 2 - 20} width={40} height={40} clipPath="url(#logosmp)" preserveAspectRatio="xMidYMid slice" />
        </>
      ) : (
        <text
          x={S / 2}
          y={H / 2 + 1}
          textAnchor="middle"
          fontSize={mode === "text" && text ? (text.length > 8 ? 8 : 11) : 9}
          letterSpacing={2}
          fill={mode === "text" ? color : "#f2ede3"}
          fontFamily="'Cormorant Garamond', serif"
        >
          {(mode === "text" && text ? text : "XWATCH").toUpperCase().slice(0, 12)}
        </text>
      )}
      <text x={S / 2} y={H / 2 + 10} textAnchor="middle" fontSize={3.4} letterSpacing={1.4} fill="rgba(242,237,227,0.55)" fontFamily="Jost, sans-serif">
        AUTOMATIC
      </text>
      <circle cx={S / 2} cy={H / 2} r={27} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
    </svg>
  );
}
