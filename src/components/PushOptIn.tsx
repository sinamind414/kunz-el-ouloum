// PushOptIn.tsx — اشتراك صريح في تذكيرات المراجعة المتباعدة (Web Push، M4).
//
// المبدأ: يختار الطالب تلقي الإشعارات. لا إرسال بدون اشتراك؛ لا اشتراك دائم بدون موافقة.
// تُساعَد ساعات الجزائر (لا إشعار بين 22 و 08 بتوقيت UTC+1) وأقصى إشعار واحد في اليوم لكل مستخدم (من السيرفر، /api/push/send).
//
// يُRender هذا المكون في صفحة "خطة المراجعة النهائية" فقط إذا:
//   · يدعم المتصفح الإشعارات وخدمة Worker.
//   · لم يرد المستخدم بعد (يُحفظ الاختيار في localStorage تحت 'kunz_push_choix': 'نعم' | 'لا' | 'لم يحدد').
//   · التطبيق ليس في تطبيق Capacitor (SW معطل في APK عبر main.tsx).

import { useEffect, useState } from 'react';
import { BellOff, Bell, AlertCircle, X } from 'lucide-react';

export type PushChoix = 'نعم' | 'لا' | 'لم يحدد';

const CLE_LOCAL = 'kunz_push_choix';

function estApkCapacitor(): boolean {
  return typeof (window as { Capacitor?: unknown }).Capacitor !== 'undefined';
}

function peutSouscrire(): boolean {
  if (estApkCapacitor()) return false;
  if (!('serviceWorker' in navigator)) return false;
  if (!('PushManager' in window)) return false;
  if (!('Notification' in window)) return false;
  return true;
}

function lectureChoix(): PushChoix {
  if (typeof localStorage === 'undefined') return 'لم يحدد';
  const v = localStorage.getItem(CLE_LOCAL);
  return v === 'نعم' || v === 'لا' || v === 'لم يحدد' ? (v as PushChoix) : 'لم يحدد';
}

function ecrireChoix(c: PushChoix): void {
  try {
    localStorage.setItem(CLE_LOCAL, c);
  } catch {
    // التخزين غير متاح: نبقى في الذاكرة
  }
}

interface PushOptInProps {
  mode?: 'مدمج' | 'كامل';
}

export default function PushOptIn({ mode = 'مدمج' }: PushOptInProps) {
  const [choix, setChoix] = useState<PushChoix>(() => lectureChoix());
  const [demandeEnCours, setDemandeEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [abonne, setAbonne] = useState<boolean | null>(null);

  useEffect(() => {
    // يكشف إن كان هناك اشتراك Push موجود مسبقاً من جانب SW (بجهد أفضل).
    if (!peutSouscrire()) {
      setAbonne(false);
      return;
    }
    navigator.serviceWorker
      .getRegistration('/sw.js')
      .then((reg) => {
        if (!reg) {
          setAbonne(false);
          return;
        }
        return reg.pushManager.getSubscription();
      })
      .then((sub) => {
        setAbonne(!!sub);
      })
      .catch(() => {
        setAbonne(false);
      });
  }, []);

  const estKamil = mode === 'كامل';

  const activerPush = async () => {
    if (!peutSouscrire()) {
      setErreur('متصفحك لا يدعم الإشعارات.');
      return;
    }
    setDemandeEnCours(true);
    setErreur(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setErreur('تم رفض إذن الإشعارات. يمكنك السماح به من إعدادات المتصفح.');
        setDemandeEnCours(false);
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        setErreur('خدمة الإشعارات غير مضبوطة.');
        setDemandeEnCours(false);
        return;
      }

      const applicationServerKey = urlBase64ToUint8Array(vapidKey);
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      // يرسل الاشتراك إلى السيرفر.
      const me = await fetch('/api/auth/me', { credentials: 'include' });
      if (!me.ok) {
        setErreur('يجب تسجيل الدخول لتفعيل التذكيرات.');
        await sub.unsubscribe();
        setDemandeEnCours(false);
        return;
      }

      const payload = {
        endpoint: sub.endpoint,
        p256dh: arrayBufferToBase64(sub.getKey('p256dh')!),
        auth: arrayBufferToBase64(sub.getKey('auth')!),
        userAgent: navigator.userAgent,
      };
      const resp = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        throw new Error(`فشل التسجيل (${resp.status})`);
      }

      ecrireChoix('نعم');
      setChoix('نعم');
      setAbonne(true);
      setDemandeEnCours(false);
    } catch (e: any) {
      setErreur(e.message || 'تعذر تفعيل الإشعارات.');
      setDemandeEnCours(false);
    }
  };

  const refuserPush = () => {
    ecrireChoix('لا');
    setChoix('لا');
    setErreur(null);
  };

  const desactiverPush = async () => {
    if (!peutSouscrire()) return;
    setDemandeEnCours(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
      }
    } catch {
      /* أفضل جهد */
    }
    ecrireChoix('لا');
    setChoix('لا');
    setAbonne(false);
    setDemandeEnCours(false);
    setErreur(null);
  };

  if (choix === 'نعم' && abonne) {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border ${
          estKamil
            ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300'
            : 'border-[#006d37]/30 bg-[#006d37]/5 text-[#006d37]'
        }`}
        dir="rtl"
      >
        <Bell className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
        <span>التذكيرات مفعلة — سيصلك إشعار واحد كحد أقصى في اليوم، بين الساعة 8 صباحاً و10 ليلاً (بتوقيت الجزائر).</span>
        <button
          onClick={desactiverPush}
          className="ml-2 underline decoration-1 hover:no-underline"
          title="إلغاء التفعيل"
        >
          <X className="w-3 h-3" /> <span>إلغاء</span>
        </button>
      </div>
    );
  }

  if (choix === 'لا') {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border ${
          estKamil
            ? 'border-gray-200 bg-gray-50 dark:bg-gray-950/20 text-gray-600 dark:text-gray-400'
            : 'border-[#006d37]/30 bg-[#006d37]/5 text-[#506072]'
        }`}
        dir="rtl"
      >
        <BellOff className="w-3 h-3 text-gray-400" />
        <span>لقد رفضت تذكيرات المراجعة.</span>
        <button
          onClick={activerPush}
          className="ml-2 underline decoration-1 hover:no-underline text-[#006d37]"
          title="تفعيل التذكيرات"
        >
          <Bell className="w-3 h-3" /> <span>تفعيل في وقت لاحق</span>
        </button>
      </div>
    );
  }

  // choix === 'لم يحدد' : يعرض الاشتراك.
  return (
    <div
      className={`rounded-2xl border p-4 ${
        estKamil
          ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm'
          : 'bg-[#006d37]/5 border-[#006d37]/20 text-[#1f1c0b] dark:text-gray-200'
      }`}
      dir="rtl"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className={`w-6 h-6 ${
          estKamil ? 'text-amber-600' : 'text-[#006d37]'
        } flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className={`font-black text-lg sm:text-base ${
              estKamil ? 'text-gray-900 dark:text-white' : 'text-[#006d37]'
            }`}>
              تذكيرات المراجعة المتباعدة
            </h3>
            <span className={`text-xs font-bold tracking-wider ${
              estKamil ? 'text-amber-500' : 'text-[#006d37]'
            }`}>
              M4 — اختياري
            </span>
          </div>
          <p className={`text-sm leading-relaxed ${
            estKamil ? 'text-gray-600 dark:text-gray-300' : 'text-[#506072] dark:text-gray-300'
          } mb-3`}>
            تلقي تذكير خفيف عندما يحين وقت مراجعة درس (خوارزمية التكرار المتباعد).
            <br />
            <strong>خياراتك:</strong> أقصى إشعار واحد في اليوم، ولا إشعار بين 10 ليلاً و8 صباحاً (بتوقيت الجزائر). يمكنك الإلغاء في أي وقت.
          </p>
          {erreur && (
            <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-3">{erreur}</p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={activerPush}
              disabled={demandeEnCours}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 ${
                demandeEnCours
                  ? 'bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
                  : estKamil
                    ? 'bg-[#006d37] text-white hover:opacity-95'
                    : 'bg-[#006d37] text-white hover:opacity-95'
              }`}
            >
              {demandeEnCours ? (
                <span>تفعيل…</span>
              ) : (
                <>
                  <Bell className="w-3 h-3 fill-current" /> <span>تفعيل التذكيرات</span>
                </>
              )}
            </button>
            <button
              onClick={refuserPush}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 ${
                estKamil
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  : 'bg-transparent border border-[#006d37]/40 text-[#006d37] hover:bg-[#006d37]/20'
              }`}
            >
              <X className="w-3 h-3" /> <span>ليس الآن</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** يحول مفتاح VAPID من base64 URL إلى Uint8Array. */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
