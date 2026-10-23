// ============================================================
// EcranPaiement.tsx — حاجز الدفع (شاشة القفل التجارية).
// RÈGLES D'HONNÊTETÉ (AGENTS) :
//   · tout ce qui est écrit ici est VRAI : l'unité 1 est réellement
//     ouverte à vie, l'essai dure 30 jours, le prix est celui du
//     propriétaire (1200 DA / saison) ;
//   · AUCUN RIB inventé : le paiement BaridiMob se règle HORS app
//     (le propriétaire communique son CCP où il veut) — l'écran ne
//     gère QUE l'essai et la saisie du code d'activation reçu ;
//   · arabe فصحى uniquement, jamais de dialecte.
// ============================================================
import { useState } from 'react';
import {
  Lock,
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  PRIX_SAISON_DA,
  UNITE_GRATUITE,
  activerCode,
  accesActuel,
  joursRestants,
  rafraichirAcces,
} from '../utils/acces';

/** Erreurs serveur → messages élèves فصحى (jamais l'erreur brute). */
const MESSAGES_ERREUR: Record<string, string> = {
  invalid_code_format: 'صيغة الكود غير صحيحة — تحقق من الأحرف الثمانية بعد KUNZ-',
  code_inconnu: 'هذا الكود غير موجود — راجعه مع من أرسله إليك',
  code_deja_utilise: 'هذا الكود مستعمل من طرف حساب آخر',
  code_appareils_pleins: 'هذا الكود مُثبّت على جهاز واحد فقط. إذا غيّرت هاتفك أو حذفت بيانات المتصفح، راسل الأستاذ عبر واتساب ليصلك كود جديد.',
  too_many_attempts: 'محاولات كثيرة — انتظر قليلاً ثم أعد الكتابة',
  not_connected: 'سجّل الدخول أولاً ثم أدخل الكود',
  network: 'لا يوجد اتصال بالخادم — أعد المحاولة عند توفره',
  request_failed: 'تعذّر التحقق من الكود — أعد المحاولة',
  storage_unavailable: 'الخدمة غير متاحة حالياً — أعد المحاولة لاحقاً',
};

interface Props {
  /** Contexte affiché au-dessus du verrou (nom d'une rubrique, unité…). */
  contexteAr?: string;
  /** Rejoué après un changement d'état (le parent rafraîchit son rendu). */
  onAccesChange?: () => void;
}

export default function EcranPaiement({ contexteAr, onAccesChange }: Props) {
  const [code, setCode] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const etat = accesActuel();
  const jours = joursRestants();

  async function soumettre() {
    if (!code.trim() || enCours) return;
    setEnCours(true);
    setErreur(null);
    setSucces(null);
    const r = await activerCode(code.trim());
    setEnCours(false);
    if (r.ok) {
      setSucces(r.expireLe);
      setCode('');
      await rafraichirAcces();
      onAccesChange?.();
    } else {
      setErreur(MESSAGES_ERREUR[r.erreur] ?? MESSAGES_ERREUR.request_failed);
    }
  }

  return (
    <section
      data-testid="ecran-paiement"
      className="rounded-3xl p-5 bg-white dark:bg-[#141916] border border-[#bbcbbb]/30 text-right"
      dir="rtl"
    >
      <div className="flex items-center gap-2 mb-3">
        <Lock className="w-5 h-5 text-[#006d37]" aria-hidden />
        <h2 className="text-base font-black text-[#1f1c0b] dark:text-gray-100">
          {contexteAr ? `${contexteAr} — مفتاح بالكود` : 'مفتاح بالكود'}
        </h2>
      </div>

      {etat.statut === 'essai' && (
        <p data-testid="essai-compteur" className="text-sm font-bold text-[#006d37] mb-3">
          <Sparkles className="inline w-4 h-4 ml-1 -mt-0.5" aria-hidden />
          التجربة المجانية الكاملة مفتوحة : {jours} يوم متبقٍ — استعمل كل شيء حتى {etat.expireLe}
        </p>
      )}

      {succes && (
        <p data-testid="activation-succes" className="text-sm font-black text-[#006d37] bg-[#eef7f0] dark:bg-[#0f2317] rounded-2xl px-3 py-2 mb-3">
          <CheckCircle2 className="inline w-4 h-4 ml-1 -mt-0.5" aria-hidden />
          تم التفعيل ! اشتراكك مفتوح حتى {succes} (نهاية الموسم الدراسي) — أعد فتح المادة التي تريدها.
        </p>
      )}

      <p className="text-sm text-[#1f1c0b] dark:text-gray-200 mb-2 leading-relaxed">
        الوحدة {UNITE_GRATUITE} وتمارينها <span className="font-black">مجانية دائماً</span> حتى بدون حساب.
        باقي الوحدات والمواضيع تُفتح باشتراك موسم كامل:
      </p>

      <p className="text-sm font-black text-[#1f1c0b] dark:text-gray-100 mb-3">
        {PRIX_SAISON_DA} دج / سنة دراسية — حتى نهاية الموسم (30 جوان)، أيّاً كان تاريخ شرائك.
      </p>

      <ol className="text-xs text-[#1f1c0b] dark:text-gray-300 list-decimal pr-4 mb-4 space-y-1 leading-relaxed">
        <li>ادفع {PRIX_SAISON_DA} دج عبر بريدي موب إلى رقم المعلّم (تصلك معلومات الدفع من مؤسسة التطبيق).</li>
        <li>استلم كود تفعيل مكوّن من ٤ أحرف و ٤ أرقام بالشكل <span className="font-black" dir="ltr">KUNZ-XXXX-XXXX</span>.</li>
        <li>أدخل الكود هنا — يُربط الكود بحسابك وبجهازك (جهاز واحد فقط)، وتُفتح المادة كاملة فوراً حتى 30 جوان. إذا غيّرت هاتفك، راسل الأستاذ عبر واتساب ليصلك كود جديد.</li>
      </ol>

      <div className="flex gap-2" dir="ltr">
        <input
          data-testid="champ-code-activation"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void soumettre();
          }}
          placeholder="KUNZ-XXXX-XXXX"
          className="flex-1 rounded-2xl px-3 py-2.5 text-sm font-bold bg-white dark:bg-black/20 border border-[#bbcbbb]/40 text-[#1f1c0b] dark:text-gray-100 text-center tracking-widest"
          aria-label="كود التفعيل"
        />
        <button
          type="button"
          data-testid="bouton-activer-code"
          onClick={() => void soumettre()}
          disabled={enCours || !code.trim()}
          className="shrink-0 rounded-2xl px-4 py-2.5 text-sm font-black bg-[#006d37] text-white disabled:opacity-40 flex items-center gap-1.5"
        >
          <KeyRound className="w-4 h-4" aria-hidden />
          {enCours ? 'جارٍ التحقق…' : 'تفعيل'}
        </button>
      </div>

      {erreur && (
        <p data-testid="erreur-activation" className="mt-3 text-xs font-bold text-red-700 dark:text-red-400 flex items-start gap-1.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
          {erreur}
        </p>
      )}
    </section>
  );
}
