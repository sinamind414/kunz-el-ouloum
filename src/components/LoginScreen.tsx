import { useState } from 'react';
import { Mail, Lock, LogIn, UserPlus, ShieldCheck, Trophy, XCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MASCOT_URL } from '../unitCatalog';
import { getSupabaseClient, hasSupabaseCreds } from '../lib/supabase';

export default function LoginScreen() {
  const { signInAsGuest } = useAuth(); // Fallback si le dev n'a pas mis les clés Supabase
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // On récupère le statut réseau réel
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOnline) {
      setError('لا يوجد اتصال بالإنترنت. يرجى الاتصال بالشبكة لإنشاء حسابك أو الدخول.');
      return;
    }
    
    if (!email.trim() || !password.trim()) {
      setError('الرجاء إدخال البريد الإلكتروني وكلمة المرور.');
      return;
    }

    if (password.length < 6) {
      setError('يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const supabase = await getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase configuration missing');
      }

      if (mode === 'register') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        // La redirection ou la session sera gérée par le onAuthStateChange dans AuthContext
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      console.error(err);
      if (err.message === 'Supabase configuration missing') {
        setError('خطأ في إعدادات الخادم (تأكد من ملف .env).');
      } else if (err.message.includes('Invalid login credentials')) {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
      } else if (err.message.includes('User already registered')) {
        setError('هذا البريد مسجل مسبقاً. قم بتسجيل الدخول بدلاً من ذلك.');
      } else {
        setError(err.message || 'حدث خطأ أثناء الاتصال بالخادم.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasSupabaseCreds) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0c0f0d] text-white p-6" dir="rtl">
         <div className="w-full max-w-sm bg-[#141916] border border-amber-500/20 rounded-3xl p-8 shadow-lg text-center space-y-4">
           <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
           <h2 className="font-black text-lg">لم يتم إعداد قاعدة البيانات</h2>
           <p className="text-sm text-gray-400">التطبيق غير متصل بـ Supabase. ليعمل التطبيق بدون حساب أثناء مرحلة التطوير، اضغط على زر الزائر.</p>
           <button onClick={signInAsGuest} className="w-full py-3 rounded-xl bg-amber-500/20 text-amber-500 font-bold mt-4">الدخول كزائر</button>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#fff9ed] text-[#1f1c0b] p-4 relative overflow-hidden" dir="rtl">
      {/* Décors de fond */}
      <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-[#2ecc71]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-[#fed65b]/20 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md bg-white border border-[#e2dabf]/50 rounded-[32px] shadow-[0_20px_40px_-15px_rgba(0,109,55,0.1)] relative z-10 overflow-hidden flex flex-col">
        
        {/* En-tête accrocheur (Le Donnant-Donnant de l'audit) */}
        <div className="bg-[#006d37] p-6 text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
           <img src={MASCOT_URL} alt="Mascot" className="w-20 h-20 mx-auto mb-3 drop-shadow-md relative z-10" />
           <h1 className="text-2xl font-black text-white relative z-10 mb-1 font-display tracking-tight">كنز العلوم</h1>
           <p className="text-[#fed65b] text-xs font-bold relative z-10">منصة المنهجية الأولى للبكالوريا</p>
        </div>

        <div className="p-6 sm:p-8 flex-1 flex flex-col">
           {mode === 'register' && (
             <div className="bg-[#fff9ed] border border-[#fed65b]/40 rounded-2xl p-3 mb-6 flex items-start gap-3">
               <div className="p-2 bg-[#fed65b]/20 rounded-xl shrink-0">
                 <Trophy className="w-5 h-5 text-[#b45309]" />
               </div>
               <div>
                 <h3 className="font-black text-[#944a00] text-sm">هدية الترحيب! 🎁</h3>
                 <p className="text-[11px] text-[#6a5b43] mt-1 font-medium leading-relaxed">
                   أنشئ حسابك المجاني الآن لتحفظ تقدمك في السحابة وتكسب <span className="font-black">50 XP مجاناً</span> للبدء في فتح تحديات البكالوريا.
                 </p>
               </div>
             </div>
           )}

           <form onSubmit={handleSubmit} className="space-y-4">
             {error && (
               <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-bold">
                 <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                 <span>{error}</span>
               </div>
             )}

             <div className="space-y-1.5">
               <label className="text-xs font-black text-[#504441] ml-2">البريد الإلكتروني</label>
               <div className="relative">
                 <Mail className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
                 <input 
                   type="email" 
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="w-full bg-[#f8f9fa] border border-[#e2dabf]/60 rounded-2xl py-3 pr-11 pl-4 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#006d37]/20 focus:border-[#006d37]/40 transition-all text-left"
                   placeholder="student@example.com"
                   dir="ltr"
                   required
                 />
               </div>
             </div>

             <div className="space-y-1.5">
               <label className="text-xs font-black text-[#504441] ml-2">كلمة المرور</label>
               <div className="relative">
                 <Lock className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
                 <input 
                   type="password" 
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full bg-[#f8f9fa] border border-[#e2dabf]/60 rounded-2xl py-3 pr-11 pl-4 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#006d37]/20 focus:border-[#006d37]/40 transition-all text-left"
                   placeholder="••••••••"
                   dir="ltr"
                   required
                   minLength={6}
                 />
               </div>
             </div>

             <button
               type="submit"
               disabled={isLoading || !isOnline}
               className="w-full mt-2 py-3.5 bg-[#006d37] hover:bg-[#00562b] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
             >
               {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
               ) : (
                 mode === 'register' ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />
               )}
               {mode === 'register' ? 'إنشاء حساب مجاني' : 'تسجيل الدخول'}
             </button>
           </form>

           <div className="mt-6 flex flex-col items-center gap-3">
             <button 
               onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError(''); }}
               className="text-xs font-bold text-[#506072] hover:text-[#006d37] transition-colors cursor-pointer"
             >
               {mode === 'register' ? 'لديك حساب بالفعل؟ قم بالدخول' : 'ليس لديك حساب؟ أنشئ حساباً جديداً'}
             </button>
             
             {!isOnline && (
               <p className="text-[10px] text-rose-500 font-bold mt-2 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100 flex items-center gap-1">
                 <ShieldCheck className="w-3 h-3" /> الإنترنت مطلوب في أول مرة فقط لتأمين حسابك
               </p>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
