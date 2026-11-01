import { useCallback, useEffect, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import { Toaster, toast } from "./lib/toast";
import { WatchConfig, defaultConfig } from "./configurator/catalog";
import { decodeConfig, useConfigurator } from "./lib/store";
import Home from "./pages/Home";
import Collection from "./pages/Collection";
import Atelier from "./pages/Atelier";
import ConfiguratorPage from "./pages/Configurator";
import { useCart } from "./lib/store";

function parseHash(): { route: string; token?: string } {
  const raw = window.location.hash.replace(/^#/, "") || "/";
  const [path, query] = raw.split("?");
  const params = new URLSearchParams(query ?? "");
  return { route: path || "/", token: params.get("c") ?? undefined };
}

export default function App() {
  const [route, setRoute] = useState<string>(() => parseHash().route);
  const [cartOpen, setCartOpen] = useState(false);
  const { config, update, reset, set } = useConfigurator();
  const cart = useCart();

  // deep-link / shared composition
  useEffect(() => {
    const { token, route: r } = parseHash();
    if (r === "/configurateur" && token) {
      const decoded = decodeConfig(token);
      if (decoded) {
        set(decoded);
        toast("Composition partagée chargée");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onHash = () => {
      const next = parseHash();
      setRoute(next.route);
      if (next.route === "/configurateur" && next.token) {
        const decoded = decodeConfig(next.token);
        if (decoded) set(decoded);
      }
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [set]);

  const navigate = useCallback((to: string) => {
    window.location.hash = to;
    setRoute(to);
  }, []);

  const usePreset = useCallback(
    (preset: WatchConfig) => {
      set({ ...defaultConfig, ...preset });
      navigate("/configurateur");
      toast("Modèle chargé — personnalisez-le");
    },
    [navigate, set],
  );

  const addToCart = useCallback(
    (c: WatchConfig) => {
      cart.add(c);
      setCartOpen(true);
      toast("Pièce ajoutée à votre sélection");
    },
    [cart],
  );

  return (
    <>
      <Header route={route} onNavigate={navigate} onOpenCart={() => setCartOpen(true)} />

      {route === "/" && <Home onNavigate={navigate} onPreset={usePreset} />}
      {route === "/collection" && <Collection onPreset={usePreset} onNavigate={navigate} />}
      {route === "/atelier" && <Atelier />}
      {route === "/configurateur" && (
        <ConfiguratorPage config={config} onChange={update} onReset={reset} onAddToCart={addToCart} />
      )}

      {route !== "/configurateur" && <Footer onNavigate={navigate} />}

      <CartDrawer
        open={cartOpen}
        items={cart.items}
        onClose={() => setCartOpen(false)}
        onRemove={cart.remove}
        onCustomize={(c) => {
          set(c);
          navigate("/configurateur");
          toast("Composition rechargée");
        }}
      />
      <Toaster />
    </>
  );
}
