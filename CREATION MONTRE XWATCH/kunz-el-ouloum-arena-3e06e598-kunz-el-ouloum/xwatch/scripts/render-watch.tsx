import { Resvg } from "@resvg/resvg-js";
import { renderToStaticMarkup } from "react-dom/server";
import { mkdirSync, writeFileSync } from "node:fs";
import Watch from "../src/configurator/Watch";
import { defaultConfig, presetConfigs, type WatchConfig } from "../src/configurator/catalog";

const outDir = new URL("../.preview/", import.meta.url);
mkdirSync(outDir, { recursive: true });

const variants: { name: string; config: WatchConfig }[] = [
  { name: "default", config: defaultConfig },
  ...presetConfigs.map((p) => ({ name: p.name.toLowerCase().replace(/\s+/g, "-").normalize("NFD").replace(/[\u0300-\u036f]/g, ""), config: p.config })),
  {
    name: "meteorite",
    config: { ...defaultConfig, dialId: "meteorite", bezelId: "pepsi", rehautId: "or-rose", handsId: "benz-or", braceletId: "jubilee-or", caseId: "sub-or" },
  },
  {
    name: "skeleton",
    config: { ...defaultConfig, dialId: "squelette", bezelId: "acier", handsId: "nautilus-argent", braceletId: "rubber-noir", caseId: "pilot-38", magnifier: false },
  },
];

for (const v of variants) {
  const svg = renderToStaticMarkup(<Watch config={v.config} idPrefix={`v-${v.name}`} showStrap={false} />);
  writeFileSync(new URL(`watch-${v.name}.svg`, outDir), svg);
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 720 },
    background: "rgba(0,0,0,0)",
  });
  writeFileSync(new URL(`watch-${v.name}.png`, outDir), resvg.render().asPng());
  console.log("rendered", v.name);
}
