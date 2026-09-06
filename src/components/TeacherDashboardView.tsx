import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Loader2, LogIn } from 'lucide-react';
import {
  fetchTeacherDashboard,
  fetchTeacherEntries,
  fetchTeacherExport,
  loginTeacher,
  setTeacherApiToken,
  getTeacherApiToken,
  requestTeacherPasswordReset,
} from '../utils/api';

interface Props {
  onBack: () => void;
}

type StudentAgg = {
  id: string;
  name: string;
  email: string;
  productions: number;
  avgIcm: number;
  dominantErrors: Array<{ tag: string; count: number }>;
  lastProduction: string | null;
  quizCount: number;
  missionCount: number;
  avgQuizPercent: number | null;
};

type Entry = {
  id: string;
  verbId: string;
  theme: string;
  stage: number;
  text: string;
  icm: number;
  errorTags: string[];
  createdAt: string;
};

export default function TeacherDashboardView({ onBack }: Props) {
  const [students, setStudents] = useState<StudentAgg[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [resetCode, setResetCode] = useState<string | null>(null);
  const [resetTarget, setResetTarget] = useState<string | null>(null);
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // 401 du serveur (jeton expiré/révoqué) → on déconnecte l'enseignant
  // et on retombe sur le formulaire de connexion au lieu d'un écran bloqué.
  const isAuthFailure = (err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    return msg === 'invalid_token' || msg === 'missing_token';
  };

  const loadDashboard = () => {
    setLoading(true);
    setError(null);
    fetchTeacherDashboard()
      .then((data) => {
        const enriched = (data.students || []).map((s: any) => {
          const quizEvents = (s.activities || []).filter((a: any) => a.type === 'quiz');
          const missionEvents = (s.activities || []).filter((a: any) => a.type === 'mission');
          const avgQuizPercent = quizEvents.length ? Math.round(quizEvents.reduce((acc: number, a: any) => acc + (a.payload?.percent || 0), 0) / quizEvents.length) : null;
          return {
            ...s,
            quizCount: quizEvents.length,
            missionCount: missionEvents.length,
            avgQuizPercent,
          };
        });
        setStudents(enriched);
      })
      .catch((err) => {
        if (isAuthFailure(err)) setTeacherApiToken(null);
        else setError('تعذر تحميل لوحة المتابعة.');
      })
      .finally(() => setLoading(false));
  };

  const handleTeacherLogout = () => {
    setTeacherApiToken(null);
    setStudents([]);
    setEntries([]);
    setSelectedStudentId(null);
    setError(null);
    setAuthError(null);
    setResetCode(null);
    setResetTarget(null);
  };

  useEffect(() => {
    if (!getTeacherApiToken()) {
      setLoading(false);
      return;
    }
    loadDashboard();
  }, []);

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const data = await loginTeacher(teacherEmail, teacherPassword);
      setTeacherApiToken(data.token);
      setTeacherEmail('');
      setTeacherPassword('');
      loadDashboard();
    } catch (err: any) {
      setAuthError(
        err?.message === 'invalid_credentials'
          ? 'البريد أو كلمة المرور غير صحيحة.'
          : 'تعذر تسجيل الدخول. حاول مرة أخرى.'
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const openStudent = async (studentId: string) => {
    setSelectedStudentId(studentId);
    setResetCode(null);
    setResetTarget(null);
    try {
      const data = await fetchTeacherEntries(studentId);
      setEntries(data.entries);
    } catch (err: any) {
      setEntries([]);
      if (isAuthFailure(err)) handleTeacherLogout();
    }
  };

  const handleResetPassword = async (studentId: string) => {
    try {
      const data = await requestTeacherPasswordReset(studentId);
      if (data?.code) {
        setResetCode(data.code);
        setResetTarget(studentId);
      } else {
        alert(data?.error || 'تعذر إنشاء رمز إعادة التعيين.');
      }
    } catch (err: any) {
      if (isAuthFailure(err)) {
        handleTeacherLogout();
        return;
      }
      alert('تعذر الاتصال بالخادم.');
    }
  };

  const handleExportCsv = async (studentId?: string) => {
    try {
      const blob = await fetchTeacherExport(studentId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = studentId ? `boussole-export-${studentId}.csv` : 'boussole-export-all.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('تعذر تصدير CSV.');
    }
  };

  const handleTeacherLogoutConfirm = () => {
    if (window.confirm('تسجيل الخروج من حساب المعلم؟')) handleTeacherLogout();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!getTeacherApiToken()) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300">
          <ArrowLeft className="w-4 h-4" />
          رجوع
        </button>
        <div className="max-w-md mx-auto bg-white dark:bg-[#141916] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <LogIn className="w-5 h-5 text-emerald-600" />
            <h3 className="font-black text-base text-gray-900 dark:text-white">دخول المعلمين</h3>
          </div>
          <form onSubmit={handleTeacherLogin} className="space-y-3">
            <div>
              <label htmlFor="teacher-email" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">البريد الإلكتروني</label>
              <input
                id="teacher-email"
                type="email"
                autoComplete="email"
                value={teacherEmail}
                onChange={(e) => setTeacherEmail(e.target.value)}
                required
                aria-required="true"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1b221e] px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="prof@ecole.dz"
              />
            </div>
            <div>
              <label htmlFor="teacher-password" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">كلمة المرور</label>
              <input
                id="teacher-password"
                type="password"
                autoComplete="current-password"
                value={teacherPassword}
                onChange={(e) => setTeacherPassword(e.target.value)}
                required
                aria-required="true"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1b221e] px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="••••••••"
              />
            </div>
            {authError && (
              <div role="alert" className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 p-3 text-xs text-red-700 dark:text-red-300">
                {authError}
              </div>
            )}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-xl bg-[#006d37] hover:bg-[#00562b] text-white font-black text-sm shadow-md disabled:opacity-60"
            >
              {authLoading ? 'جاري المعالجة...' : 'دخول'}
            </button>
          </form>
          <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-400 text-center">
            يتم إنشاء حساب المعلم من طرف مسؤول التطبيق.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300 mb-4">
          <ArrowLeft className="w-4 h-4" />
          رجوع
        </button>
        <div className="rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 p-4 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      </div>
    );
  }

  if (selectedStudentId) {
    const student = students.find((s) => s.id === selectedStudentId);
    return (
      <div className="p-4 md:p-6 space-y-4">
        <button onClick={() => { setSelectedStudentId(null); setEntries([]); }} className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300">
          <ArrowLeft className="w-4 h-4" />
          رجوع للقائمة
        </button>
        <div className="bg-white dark:bg-[#141916] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
          <h3 className="font-black text-base text-gray-900 dark:text-white mb-1">{student?.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{student?.email}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-gray-50 dark:bg-[#1b221e] p-3 border border-gray-200 dark:border-gray-700">
              <div className="text-[11px] text-gray-500 dark:text-gray-400 font-bold">الproductions</div>
              <div className="text-xl font-black text-gray-900 dark:text-white">{student?.productions}</div>
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-[#1b221e] p-3 border border-gray-200 dark:border-gray-700">
              <div className="text-[11px] text-gray-500 dark:text-gray-400 font-bold"> moyenne ICM</div>
              <div className="text-xl font-black text-gray-900 dark:text-white">{student?.avgIcm ?? 0}%</div>
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-[#1b221e] p-3 border border-gray-200 dark:border-gray-700">
              <div className="text-[11px] text-gray-500 dark:text-gray-400 font-bold">آخر نشاط</div>
              <div className="text-sm font-black text-gray-900 dark:text-white">
                {student?.lastProduction ? new Date(student.lastProduction).toLocaleString('ar-DZ') : '—'}
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => handleResetPassword(student.id)}
              className="px-3 py-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-black hover:bg-amber-200"
            >
              إعادة تعيين كلمة السر
            </button>
            <button
              onClick={() => handleExportCsv(student.id)}
              className="px-3 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-black hover:bg-emerald-200"
            >
              تصدير ملف هذا التلميذ
            </button>
          </div>
          {resetCode && resetTarget === student?.id && (
            <div className="mt-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-3 text-xs text-amber-800 dark:text-amber-300">
              <div className="font-black mb-1">رمز إعادة التعيين (صالح 30 دقيقة):</div>
              <div className="font-mono text-sm">{resetCode}</div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-[#141916] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
          <h4 className="font-black text-sm text-gray-900 dark:text-white mb-3">Productions récentes</h4>
          <div className="space-y-2">
            {entries.length === 0 && <p className="text-xs text-gray-500">لا توجد إنتاجات بعد.</p>}
            {entries.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-gray-100 dark:border-gray-800 p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-gray-900 dark:text-white">ICM {entry.icm}%</span>
                  <span className="text-[10px] text-gray-500">{new Date(entry.createdAt).toLocaleString('ar-DZ')}</span>
                </div>
                <p className="text-[11px] text-gray-700 dark:text-gray-300 line-clamp-3">{entry.text}</p>
                {entry.errorTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {entry.errorTags.map((tag) => (
                      <span key={tag} className="text-[10px] bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full font-bold">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300">
        <ArrowLeft className="w-4 h-4" />
        رجوع
      </button>
      <div className="bg-white dark:bg-[#141916] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h3 className="font-black text-base text-gray-900 dark:text-white mb-1">لوحة المتابعة</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">ملخص كل تلميذ مسجل في التطبيق.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportCsv()}
                className="px-3 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-black hover:bg-emerald-200"
              >
                تصدير Excel (CSV)
              </button>
              <button
                onClick={handleTeacherLogoutConfirm}
                className="px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-black hover:bg-red-100"
              >
                خروج المعلم
              </button>
            </div>
          </div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {students.length === 0 && <p className="text-xs text-gray-500">لا تلاميذ مسجلين بعد.</p>}
        {students.map((student) => (
          <button
            key={student.id}
            onClick={() => openStudent(student.id)}
            className="w-full text-right bg-white dark:bg-[#141916] rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm hover:border-emerald-500/60 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-black text-gray-900 dark:text-white">{student.name}</div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">{student.email}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-left">
                  <div className="text-[10px] text-gray-500 font-bold">ICM moyen</div>
                  <div className="text-sm font-black text-gray-900 dark:text-white">{student.avgIcm}%</div>
                </div>
                <div className="text-left">
                  <div className="text-[10px] text-gray-500 font-bold">Productions</div>
                  <div className="text-sm font-black text-gray-900 dark:text-white">{student.productions}</div>
                </div>
                <div className="text-left">
                  <div className="text-[10px] text-gray-500 font-bold">اختبارات / مهام</div>
                  <div className="text-sm font-black text-gray-900 dark:text-white">{student.quizCount} / {student.missionCount}</div>
                </div>
                {student.avgQuizPercent !== null && (
                  <div className="text-left">
                    <div className="text-[10px] text-gray-500 font-bold">متوسط الاختبارات</div>
                    <div className="text-sm font-black text-gray-900 dark:text-white">{student.avgQuizPercent}%</div>
                  </div>
                )}
              </div>
            </div>
            {student.dominantErrors.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {student.dominantErrors.map((err) => (
                  <span key={err.tag} className="text-[10px] bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full font-bold">
                    {err.tag} ({err.count})
                  </span>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
