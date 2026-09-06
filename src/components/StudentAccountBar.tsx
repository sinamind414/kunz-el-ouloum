import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wifi, WifiOff, LogOut, User, ChevronDown } from 'lucide-react';
import { fetchMe, setApiToken, getApiToken, requestPasswordReset, requestTeacherPasswordReset } from '../utils/api';

interface Props {
  onOpenTeacher: () => void;
}

type Mode = 'menu' | 'forgot' | 'reset';

export default function StudentAccountBar({ onOpenTeacher }: Props) {
  const [student, setStudent] = useState<{ id: string; name: string; email: string } | null>(null);
  const [online, setOnline] = useState<boolean>(navigator.onLine);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('menu');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getApiToken();
    if (!token) return;
    fetchMe()
      .then((data) => setStudent(data.student))
      .catch(() => setApiToken(null));
  }, []);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  const handleLogout = () => {
    setApiToken(null);
    setStudent(null);
    setOpen(false);
    setMode('menu');
    setCode('');
    setNewPassword('');
    setMessage(null);
    setError(null);
  };

  const handleResetRequest = async () => {
    setError(null);
    setMessage(null);
    try {
      const data = await requestTeacherPasswordReset(student?.id || '');
      if (data?.code) {
        setMode('reset');
        setMessage(data.code);
      } else {
        setError(data?.error || 'تعذر إنشاء الرمز.');
      }
    } catch {
      setError('تعذر الاتصال بالخادم.');
    }
  };

  const handleResetApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const res = await requestPasswordReset(code, newPassword);
      setMessage('تم تغيير كلمة السر بنجاح.');
      setCode('');
      setNewPassword('');
      setMode('menu');
    } catch (err: any) {
      setError(err?.message || 'رمز غير صالح أو منتهي.');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 bg-white dark:bg-[#141916] border border-gray-200 dark:border-gray-700 rounded-full pl-1 pr-3 py-1 shadow-sm"
      >
        <div className="w-8 h-8 rounded-full bg-[#006d37] text-white flex items-center justify-center">
          <User className="w-4 h-4" />
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-[11px] font-black text-gray-900 dark:text-white leading-none">
            {student?.name || 'ضيف'}
          </div>
          <div className="text-[10px] text-gray-500 dark:text-gray-400 leading-none mt-0.5">
            {student?.email || 'بدون حساب'}
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute left-0 mt-2 w-64 bg-white dark:bg-[#141916] rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden z-50"
          >
            <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              {online ? (
                <Wifi className="w-4 h-4 text-emerald-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-amber-600" />
              )}
              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                {online ? 'متزامن ✓' : 'وضع Hors-ligne — سيُرسل لاحقاً'}
              </span>
            </div>

            {mode === 'menu' && (
              <>
                <button
                  onClick={onOpenTeacher}
                  className="w-full text-right px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  دخول المعلمين
                </button>
                <button
                  onClick={() => setMode('forgot')}
                  className="w-full text-right px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  نسيت كلمة السر؟
                </button>
                {student && (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    تسجيل الخروج
                  </button>
                )}
              </>
            )}

            {mode === 'forgot' && (
              <div className="p-3 space-y-2">
                <div className="text-xs font-black text-gray-900 dark:text-white">إعادة تعيين كلمة السر</div>
                <p className="text-[11px] text-gray-500">اطلب الرمز من المعلم، ثم أدخله هنا مع كلمة السر الجديدة.</p>
                <button
                  onClick={handleResetRequest}
                  className="w-full px-3 py-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-black hover:bg-amber-200"
                >
                  طلب رمز إعادة التعيين
                </button>
                <button
                  onClick={() => setMode('menu')}
                  className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-black hover:bg-gray-200"
                >
                  رجوع
                </button>
              </div>
            )}

            {mode === 'reset' && (
              <form onSubmit={handleResetApply} className="p-3 space-y-2">
                <div className="text-xs font-black text-gray-900 dark:text-white">أدخل الرمز وكلمة السر الجديدة</div>
                {message && <div className="text-[11px] text-emerald-700 dark:text-emerald-300">الرمز: {message}</div>}
                {error && <div className="text-[11px] text-red-600">{error}</div>}
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="الرمز"
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1b221e] px-2 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  type="password"
                  placeholder="كلمة السر الجديدة"
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1b221e] px-2 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                  minLength={6}
                />
                <button
                  type="submit"
                  className="w-full px-3 py-2 rounded-xl bg-[#006d37] hover:bg-[#00562b] text-white text-xs font-black"
                >
                  تأكيد
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setCode(''); setNewPassword(''); setError(null); setMessage(null); }}
                  className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-black hover:bg-gray-200"
                >
                  رجوع
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
