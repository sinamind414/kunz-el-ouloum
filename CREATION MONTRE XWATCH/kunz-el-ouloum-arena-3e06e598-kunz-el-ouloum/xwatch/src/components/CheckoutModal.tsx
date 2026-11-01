import { useMemo, useState } from "react";
import { WatchConfig, totalPrice } from "../configurator/catalog";
import { BRAND } from "../lib/brand";
import { configName, configReference, formatMoney, useCurrency } from "../lib/store";
import { toast } from "../lib/toast";

const WILAYAS = [
  "Oran",
  "Alger",
  "Constantine",
  "Annaba",
  "Blida",
  "Sétif",
  "Tlemcen",
  "Béjaïa",
  "Batna",
  "Tizi Ouzou",
  "Mostaganem",
  "Autre wilaya",
  "International",
];

interface Props {
  items: WatchConfig[];
  onClose: () => void;
  onDone?: () => void;
}

export default function CheckoutModal({ items, onClose }: Props) {
  const { currency, setCurrency } = useCurrency();
  const [form, setForm] = useState({ name: "", phone: "", wilaya: "Oran", address: "", notes: "" });
  const total = useMemo(() => items.reduce((s, c) => s + totalPrice(c), 0), [items]);

  const recap = useMemo(() => {
    const lines = items.map((item, i) => {
      return `${i + 1}. ${configName(item)} — Réf. ${configReference(item)} — ${formatMoney(totalPrice(item), currency)}`;
    });
    return [
      "Nouvelle commande XWATCH",
      ...lines,
      "",
      `Total : ${formatMoney(total, currency)}`,
      "",
      `Client : ${form.name || "—"}`,
      `Téléphone : ${form.phone || "—"}`,
      `Wilaya : ${form.wilaya}`,
      `Adresse : ${form.address || "—"}`,
      form.notes ? `Notes : ${form.notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [items, total, currency, form]);

  const sendWhatsApp = () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast("Renseignez votre nom et votre téléphone");
      return;
    }
    const url = `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(recap)}`;
    window.open(url, "_blank", "noopener");
    toast("Commande préparée — envoyez le message WhatsApp");
  };

  const sendMail = () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast("Renseignez votre nom et votre téléphone");
      return;
    }
    const subject = `Commande XWATCH — ${form.name}`;
    window.location.href = `mailto:${BRAND.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(recap)}`;
    toast("E-mail préparé dans votre messagerie");
  };

  return (
    <div className="checkout-overlay" role="dialog" aria-modal="true" aria-label="Finaliser la commande">
      <div className="checkout-backdrop" onClick={onClose} aria-hidden />
      <div className="modal-wrap">
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-head">
            <div>
              <h2>Finaliser la commande</h2>
              <p>Nous vous confirmons la composition et le délai sous 24 h ouvrées.</p>
            </div>
            <button className="icon-btn" onClick={onClose} aria-label="Fermer">
              ✕
            </button>
          </div>

          <div className="modal-body">
            <div className="form-grid">
              <div className="field">
                <label htmlFor="co-name">Nom &amp; prénom</label>
                <input
                  id="co-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Votre nom"
                />
              </div>
              <div className="field">
                <label htmlFor="co-phone">Téléphone / WhatsApp</label>
                <input
                  id="co-phone"
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+213 ..."
                />
              </div>
              <div className="field">
                <label htmlFor="co-wilaya">Wilaya</label>
                <select id="co-wilaya" value={form.wilaya} onChange={(e) => setForm({ ...form, wilaya: e.target.value })}>
                  {WILAYAS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="co-addr">Adresse de livraison</label>
                <input
                  id="co-addr"
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Rue, ville, code postal"
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="co-notes">Précisions (gravure, logo, délai)</label>
              <textarea
                id="co-notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Ex. graver « O.R. 2026 » sur le fond, logo à envoyer par e-mail…"
              />
            </div>

            <div className="modal-summary">
              {items.map((item, i) => (
                <div className="line" key={i}>
                  <span>
                    {configName(item)} · {configReference(item)}
                  </span>
                  <b>{formatMoney(totalPrice(item), currency)}</b>
                </div>
              ))}
              <div className="total">
                <span style={{ fontSize: 10, letterSpacing: "0.26em", textTransform: "uppercase", color: "var(--muted-2)" }}>
                  Total · {currency}
                </span>
                <strong>{formatMoney(total, currency)}</strong>
              </div>
            </div>

            <div className="confirm-actions">
              <button className="btn btn--solid" onClick={sendWhatsApp}>
                <span>Envoyer par WhatsApp</span>
              </button>
              <button className="btn" onClick={sendMail}>
                <span>Envoyer par e-mail</span>
              </button>
              <button className="btn btn--ghost" onClick={() => setCurrency(currency === "EUR" ? "DZD" : "EUR")}>
                <span>Afficher en {currency === "EUR" ? "DZD" : "EUR"}</span>
              </button>
            </div>

            <p className="hint">
              Aucun paiement en ligne à cette étape. Nous confirmons la disponibilité des composants, puis vous réglez par
              virement, CCP ou en espèces à l'atelier d'{BRAND.city}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
