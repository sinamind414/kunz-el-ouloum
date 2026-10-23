import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle, Copy, Check, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { registerStudent, registerStudentCode, loginStudent, setApiToken } from '../utils/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** `identifiant` = le code de connexion (XXXX-XXXX) ou l'adresse e-mail. */
  onLogin: (name: string, identifiant: string) => void;
}

type Mode = 'login' | 'register';
type Voie = 'code' | 'email';

/** Messages d'erreur : ce que l'élève doit FAIRE, pas un code technique. */
const MESSAGES: Record<string, string> = {
  missing_name: 'اكتب اسمك الكامل (حرفان على الأقل).',
  weak_pin: 'الرمز السري يجب أن يكون 6 أرقام، وليس متتالية سهلة مثل 123456.',
  invalid_credentials: 'الرمز أو الرمز السري غير صحيح. تحقق من الرمز المكوّن من 8 خانات.',
  code_taken: 'وقع تعارض نادر. أعد المحاولة، سيُمنح لك رمز آخر.',
  storage_unavailable:
    'خدمة الحسابات متوقفة مؤقتًا على هذا الخادم. يمكنك المتابعة كزائر — الوحدة الأولى تعمل كاملة.',
  too_many_attempts: 'محاولات كثيرة. انتظر دقيقة ثم أعد المحاولة.',
  email_exists: 'هذا البريد مسجل بالفعل. ادخل به أو استعمل رمزًا جديدًا.',
  weak_password: 'كلمة المرور قصيرة جدًا — 6 أحرف على الأقل.',
  request_failed: 'تعذّر الاتصال. تحقق من الشبكة وأعد المحاولة.',
};

export default function StudentAuthView({ isOpen, onClose, onLogin }: Props) {
  const [mode, setMode] = useState<Mode>('register');
  const [voie, setVoie] = useState<Voie>('code'); // الدخول بالرمز هو الافتراضي
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [identifiant, setIdentifiant] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  /** Code attribué : affiché une seule fois, en grand, avec copie. */
  const [codeAttribue, setCodeAttribue] = useState<string | null>(null);
  const [copie, setCopie] = useState(false);

  const reset = () => {
    setName('');
    setPin('');
    setIdentifiant('');
    setEmail('');
    setPassword('');
    setError(null);
    setLoading(false);
    setCodeAttribue(null);
    setCopie(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  /**
   * À l'INSCRIPTION, le secret est un code à 6 chiffres : on ne laisse entrer
   * que des chiffres. À la CONNEXION, on accepte ce que l'élève tape — un
   * compte réinitialisé autrefois avec un mot de passe alphabétique doit
   * pouvoir rentrer (sinon il est enfermé dehors : il n'a pas d'e-mail de
   * secours). Défaut de verrouillage corrigé le 14/10/2026.
   */
  const pinSaisi = useMemo(
    () => (mode === 'register' ? (pin || '').replace(/\D/g, '').slice(0, 6) : (pin || '').slice(0, 32)),
    [pin, mode],
  );

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(codeAttribue || '');
      setCopie(true);
      setTimeout(() => setCopie(false), 2500);
    } catch {
      setCopie(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'register' && voie === 'code') {
        if (!name.trim()) throw new Error('missing_name');
        const data = await registerStudentCode(name, pinSaisi);
        setApiToken(data.token);
        // On N'appelle PAS onLogin tout de suite : l'élève doit d'abord VOIR
        // son code. C'est la seule fois où il s'affiche.
        setCodeAttribue(data.code || null);
        if (!data.code) {
          onLogin(data.student?.name || name, data.student?.code || '');
          reset();
          onClose();
        }
      } else if (mode === 'register') {
        if (!name.trim()) throw new Error('missing_name');
        const data = await registerStudent(email, password, name);
        setApiToken(data.token);
        onLogin(data.student.name, data.student.email || email);
        reset();
        onClose();
      } else if (voie === 'code') {
        const data = await loginStudent(identifiant, pinSaisi);
        setApiToken(data.token);
        onLogin(data.student.name, data.student.code || data.student.email || identifiant);
        reset();
        onClose();
      } else {
        const data = await loginStudent(email, password);
        setApiToken(data.token);
        onLogin(data.student.name, data.student.email || email);
        reset();
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'auth_error');
    } finally {
      setLoading(false);
    }
  };

  const validerCodeAttribue = () => {
    const code = codeAttribue || '';
    onLogin(name.trim() || 'تلميذ', code);
    reset();
    onClose();
  };

  const champ =
    'w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1b221e] px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500';
  const ongletActif = 'flex-1 py-2 rounded-xl text-xs font-black bg-white dark:bg-[#1b221e] shadow-sm text-[#006d37] dark:text-emerald-400';
  const ongletInactif = 'flex-1 py-2 rounded-xl text-xs font-bold text-gray-500';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="w-full max-w-md bg-white dark:bg-[#141916] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-black text-base text-gray-900 dark:text-white">
                {codeAttribue ? 'رمزك جاهز' : mode === 'register' ? 'إنشاء حساب بدون بريد' : 'دخول التلميذ'}
              </h3>
              <button onClick={handleClose} aria-label="إغلاق" className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {codeAttribue ? (
              /* ── écran de remise du code : la seule occasion de le montrer ── */
              <div className="p-5 space-y-4 text-right" dir="rtl">
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  هذا رمزك للدخول. <b>دوّنه الآن</b> على ورقة أو دفتر: لن يُعرض عليك مرة أخرى،
                  ولا يوجد بريد إلكتروني لاسترجاعه. إذا فقدته، يستطيع أستاذك أن يجده لك.
                </p>
                <div className="flex items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-emerald-500/60 bg-emerald-50 dark:bg-emerald-950/30 py-4">
                  <span className="text-3xl font-black tracking-[0.2em] text-[#006d37] dark:text-emerald-300 select-all">
                    {codeAttribue}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={copier}
                  className="w-full py-2.5 rounded-xl border border-emerald-600/40 text-[#006d37] dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-2"
                >
                  {copie ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copie ? 'تم النسخ' : 'نسخ الرمز'}
                </button>
                <div className="flex items-start gap-2 rounded-xl bg-gray-50 dark:bg-[#1b221e] border border-gray-200 dark:border-gray-800 p-3 text-[11px] text-gray-600 dark:text-gray-400">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>
                    رمزك السري (6 أرقام) هو الذي اخترته. أرقام الرمز لا تتضمن حروفًا متشابهة
                    (بدون I أو L أو O أو 0 أو 1)، حتى يسهل تدوينه وقراءته.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={validerCodeAttribue}
                  className="w-full py-3 rounded-xl bg-[#006d37] hover:bg-[#00562b] text-white font-black text-sm shadow-md"
                >
                  حفظته، هيا نبدأ
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-4" dir="rtl">
                {/* Deux voies, mais un seul chemin par défaut : le code. */}
                <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-[#0f1310]">
                  <button type="button" onClick={() => { setVoie('code'); setError(null); }} className={voie === 'code' ? ongletActif : ongletInactif}>
                    <span className="flex items-center justify-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5" /> بالرمز
                    </span>
                  </button>
                  <button type="button" onClick={() => { setVoie('email'); setError(null); }} className={voie === 'email' ? ongletActif : ongletInactif}>
                    <span className="flex items-center justify-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> بالبريد (اختياري)
                    </span>
                  </button>
                </div>

                {(mode === 'register') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">الاسم الكامل</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={champ} placeholder="مثال: أحمد بن عمر" />
                  </div>
                )}

                {voie === 'code' ? (
                  <>
                    {mode === 'login' ? (
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">رمز الدخول</label>
                        <input
                          type="text"
                          value={identifiant}
                          onChange={(e) => setIdentifiant(e.target.value)}
                          required
                          dir="ltr"
                          autoCapitalize="characters"
                          autoCorrect="off"
                          spellCheck={false}
                          className={`${champ} text-center tracking-[0.3em] font-black uppercase`}
                          placeholder="XXXX-XXXX"
                        />
                        <p className="mt-1 text-[11px] text-gray-500">
                          الرمز الذي ظهر لك عند التسجيل (8 خانات). الحروف الصغيرة والشرطات غير مهمة.
                        </p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                        لا حاجة إلى بريد إلكتروني ولا إلى رقم هاتف: اختر رمزًا سريًا من 6 أرقام،
                        وسيمنحك التطبيق رمز دخول قصيرًا تكتبه في المرة القادمة.
                      </p>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        {mode === 'register' ? 'الرمز السري (6 أرقام)' : 'الرمز السري'}
                      </label>
                      <input
                        type={mode === 'register' ? 'text' : 'password'}
                        inputMode={mode === 'register' ? 'numeric' : 'text'}
                        pattern={mode === 'register' ? '[0-9]*' : undefined}
                        maxLength={mode === 'register' ? 6 : 32}
                        value={pinSaisi}
                        onChange={(e) => setPin(e.target.value)}
                        required
                        dir="ltr"
                        className={`${champ} text-center tracking-[0.5em] font-black`}
                        placeholder="••••••"
                      />
                      <p className="mt-1 text-[11px] text-gray-500">
                        {mode === 'register' ? '6 أرقام تحفظها أنت (ليست 123456).' : 'الأرقام التي اخترتها عند التسجيل.'}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">البريد الإلكتروني</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        dir="ltr"
                        className={champ}
                        /* L'ancien exemple « eleve@ecole.dz » était une adresse
                           SCOLAIRE que la quasi-totalité des élèves n'ont pas :
                           il suggérait qu'il fallait une adresse de l'école. */
                        placeholder="اسمك@gmail.com"
                      />
                      <p className="mt-1 text-[11px] text-gray-500">
                        اختياري تمامًا. إن لم يكن لديك بريد، استعمل خانة «بالرمز» أعلاه.
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">كلمة المرور</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        dir="ltr"
                        className={champ}
                        placeholder="••••••••"
                      />
                    </div>
                  </>
                )}

                {error && (
                  <div className="flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 p-3 text-xs text-red-700 dark:text-red-300">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{MESSAGES[error] || 'تعذّر إتمام العملية. حاول مرة أخرى.'}</span>
                  </div>
                )}

                <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-[#006d37] hover:bg-[#00562b] text-white font-black text-sm shadow-md disabled:opacity-60">
                  {loading ? 'جاري المعالجة...' : mode === 'register' ? 'إنشاء الحساب' : 'دخول'}
                </button>

                <button
                  type="button"
                  onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
                  className="w-full text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  {mode === 'login'
                    ? voie === 'code' ? 'ليس لديك رمز؟ أنشئ حسابًا في ثوانٍ' : 'ليس لديك حساب؟ سجّل جديد'
                    : 'لديك رمز أو حساب؟ ادخل من هنا'}
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full text-[11px] font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  المتابعة كزائر — الوحدة الأولى متاحة مجاناً بدون حساب
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
