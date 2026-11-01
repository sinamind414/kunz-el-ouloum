import { useMemo, useState } from "react";
import Watch from "../configurator/Watch";
import { findCase, findDial, findEngraving, totalPrice, WatchConfig } from "../configurator/catalog";
import { BRAND } from "../lib/brand";
import { formatMoney, configName, configReference, useCurrency } from "../lib/store";
import CheckoutModal from "./CheckoutModal";

interface Props {
  open: boolean;
  items: WatchConfig[];
  onClose: () => void;
  onRemove: (index: number) => void;
  onCustomize: (config: WatchConfig) => void;
}

export default function CartDrawer({ open, items, onClose, onRemove, onCustomize }: Props) {
  const { currency } = useCurrency();
  const [checkout, setCheckout] = useState(false);
  const total = useMemo(() => items.reduce((s, c) => s + totalPrice(c), 0), [items]);

  return (
    <>
      <div className="scrim" data-open={open && !checkout} onClick={onClose} aria-hidden={!open || checkout} />
      <aside
        className="drawer"
        data-open={open && !checkout}
        aria-hidden={!open || checkout}
        aria-label="Panier"
      >
        <div className="drawer-head">
          <div>
            <h2>Votre sélection</h2>
            <p style={{ margin: 0, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--muted-2)" }}>
              {items.length} pièce{items.length > 1 ? "s" : ""} · pièces uniques
            </p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Fermer le panier">
            ✕
          </button>
        </div>

        <div className="drawer-body">
          {items.length === 0 && (
            <div className="empty">
              <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
                <circle cx="32" cy="32" r="22" />
                <circle cx="32" cy="32" r="16" />
                <path d="M32 4v8M32 52v8M4 32h8M52 32h8" />
                <path d="M32 32V20M32 32l8 6" />
              </svg>
              <h3>Aucune montre sélectionnée</h3>
              <p>Chaque pièce est assemblée à la main dans notre atelier d'Oran.</p>
              <a className="btn" href="#/configurateur" onClick={onClose}>
                <span>Composer ma montre</span>
              </a>
            </div>
          )}

          {items.map((item, index) => {
            return (
              <article className="cart-item" key={index}>
                <div className="thumb">
                  <Watch config={item} idPrefix={`cart-${index}`} showStrap={false} showShadow={false} />
                </div>
                <div>
                  <h4>{configName(item)}</h4>
                  <p>
                    {findCase(item.caseId).name}
                    <br />
                    {findDial(item.dialId).name} · {configReference(item)}
                  </p>
                  <button className="remove" onClick={() => onRemove(index)}>
                    Retirer
                  </button>
                  <button
                    className="remove"
                    style={{ marginLeft: 14, color: "var(--gold)" }}
                    onClick={() => {
                      onCustomize(item);
                      onClose();
                    }}
                  >
                    Reprendre
                  </button>
                </div>
                <div className="price">{formatMoney(totalPrice(item), currency)}</div>
              </article>
            );
          })}
        </div>

        {items.length > 0 && (
          <div className="drawer-foot">
            <div className="row">
              <span>Total</span>
              <strong>{formatMoney(total, currency)}</strong>
            </div>
            <p style={{ margin: "0 0 4px", fontSize: 11, color: "var(--muted-2)" }}>
              {BRAND.delivery}
              <br />
              {currency === "EUR" ? "TVA incluse · hors droits locaux" : `Conversion indicative · 1 € = ${285} DA`}
            </p>
            <button className="btn btn--solid" onClick={() => setCheckout(true)}>
              <span>Finaliser la commande</span>
            </button>
            <button className="btn" style={{ width: "100%", marginTop: 8 }} onClick={onClose}>
              <span>Continuer la composition</span>
            </button>
          </div>
        )}
      </aside>

      {checkout && (
        <CheckoutModal
          items={items}
          onClose={() => setCheckout(false)}
          onDone={() => {
            setCheckout(false);
            onClose();
          }}
        />
      )}
    </>
  );
}
