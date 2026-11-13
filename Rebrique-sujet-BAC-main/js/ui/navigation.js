import { replaceContent } from "./dom.js";

export function createScreenNavigator({ screens, onNavigate }) {
  let navigationCount = 0;
  return function showScreen(id) {
    screens().forEach((screen) => screen.classList.add("hidden"));
    const target = document.getElementById(id);
    if (!target) throw new Error(`Unknown screen: ${id}`);
    target.classList.remove("hidden");
    onNavigate(id, { initial: navigationCount === 0 });
    navigationCount += 1;
    window.scrollTo({ top: 0, behavior: "auto" });
  };
}
