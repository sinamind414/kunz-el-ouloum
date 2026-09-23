import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UserPlus, LogIn, AlertTriangle } from 'lucide-react';
import { registerStudent, loginStudent, setApiToken } from '../utils/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (name: string, email: string) => void;
}

type Mode = 'login' | 'register';

export default function StudentAuthView({ isOpen, onClose, onLogin }: Props) {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setName('');
    setEmail('');
    setPassword('');
    setError(null);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'register') {
        if (!name.trim()) throw new Error('missing_name');
        const data = await registerStudent(email, password, name);
        setApiToken(data.token);
        onLogin(data.student.name, data.student.email);
      } else {
        const data = await loginStudent(email, password);
        setApiToken(data.token);
        onLogin(data.student.name, data.student.email);
      }
      reset();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'auth_error');
    } finally {
      setLoading(false);
    }
  };

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
            className="w-full max-w-md bg-white dark:bg-[#141916] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-black text-base text-gray-900 dark:text-white">
                {mode === 'login' ? 'دخول التلميذ' : 'إنشاء حساب جديد'}
              </h3>
              <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">الاسم الكامل</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1b221e] px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="مثال: أحمد بن عمر"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1b221e] px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="eleve@ecole.dz"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">كلمة المرور</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1b221e] px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 p-3 text-xs text-red-700 dark:text-red-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    {error === 'missing_name'
                      ? 'يرجى إدخال الاسم الكامل.'
                      : error === 'email_exists'
                        ? 'هذا البريد مسجل بالفعل.'
                        : error === 'weak_password'
                          ? 'كلمة المرور قصيرة جدا — 6 أحرف على الأقل.'
                          : error === 'invalid_credentials'
                            ? 'البريد أو كلمة المرور غير صحيحة.'
                            : 'خطأ أثناء المصادقة. حاول مرة أخرى.'}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#006d37] hover:bg-[#00562b] text-white font-black text-sm shadow-md disabled:opacity-60"
              >
                {loading ? 'جاري المعالجة...' : mode === 'login' ? 'دخول' : 'تسجيل الحساب'}
              </button>

              <button
                type="button"
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
                className="w-full text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                {mode === 'login' ? 'ليس لديك حساب؟ سجّل جديد' : 'لديك حساب؟ ادخل من هنا'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
