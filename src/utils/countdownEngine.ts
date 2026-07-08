export const BAC_DATE_TARGET = new Date('2027-06-07T08:00:00+01:00');

type PanicLevel = 'detendue' | 'plan' | 'action' | 'crisis' | 'urgente';

interface TimeLeft { days: number; hours: number; minutes: number; totalSeconds: number; }

export interface CountdownResult {
  timeLeft: TimeLeft;
  level: PanicLevel;
  title: string;
  message: string;
  badgeColor: string;
  recommendation: string;
}

export function calculateCountdown(): CountdownResult {
  const now = new Date().getTime();
  const target = BAC_DATE_TARGET.getTime();
  const diff = target - now;
  if (diff <= 0) return { timeLeft: { days: 0, hours: 0, minutes: 0, totalSeconds: 0 }, level: 'urgente', title: '🎉 يوم الحسم!', message: 'الامتحان اليوم! اذهب مبكراً، لا تتعجل.', badgeColor: '#ef4444', recommendation: 'مراجعة قائمة الأدوات النهائية.' };

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const timeLeftObj: TimeLeft = { days, hours, minutes, totalSeconds };

  if (days >= 90) return { timeLeft: timeLeftObj, level: 'detendue', title: '☕ مرحباً بحار المعرفة', message: 'ما زال وقتك واسعاً. ركز على فهم المفاهيم قبل الحفظ.', badgeColor: '#22c55e', recommendation: 'استخدم المرشد الذكي للتعرف على المفاهيم الأساسية.' };
  if (days >= 45) return { timeLeft: timeLeftObj, level: 'plan', title: '📋 وضع الخطة', message: 'أنت في الفترة الذهبية. حدد نقاط ضعفك الثلاث وتمكن منها.', badgeColor: '#3b82f6', recommendation: 'استخدم التوقع لمعرفة نقاط ضعفك.' };
  if (days >= 15) return { timeLeft: timeLeftObj, level: 'action', title: '⚡ وضع العمل', message: 'الوقت بدأ يضغط. انتقل إلى الأسئلة السريعة والبطاقات.', badgeColor: '#f59e0b', recommendation: 'فعّل مهمة اليوم (3 دقائق/يوم).' };
  if (days >= 7) return { timeLeft: timeLeftObj, level: 'crisis', title: '⚠️ المنطقة الحمراء', message: 'لا داعي للذعر. اكتفِ بحل تمارين نوع BAC وتجنب الدروس الطويلة.', badgeColor: '#ef4444', recommendation: 'ادخل غرفة العمليات كل مساء (10 أسئلة).' };
  return { timeLeft: timeLeftObj, level: 'urgente', title: '🚨 رمز أحمر', message: 'فقط النقاط الأساسية تهم. راجع أخطاءك المتكررة فقط.', badgeColor: '#991b1b', recommendation: 'راجع قائمة أخطائك السابقة، لا شيء غير ذلك.' };
}
