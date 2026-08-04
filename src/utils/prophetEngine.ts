// src/utils/prophetEngine.ts

export interface StudentGrades {
  svt: number
  math: number
  physics: number
}

const MEDIC_THRESHOLD = 16.65

function average(g: StudentGrades): number {
  return (g.svt + g.math + g.physics) / 3
}

export function generateBacPrediction(grades: StudentGrades): string {
  const avg = average(grades)
  const min = Math.max(7, avg - 1.5)
  const max = Math.min(19, avg + 1.5)
  const confidence = avg >= 14 ? 'عالية' : avg >= 10 ? 'متوسطة' : 'منخفضة'

  let message = ''
  if (min >= 16) message = 'أنت في موقف ممتاز! استمر على هذا المنوال لتحقيق 18 فما فوق.'
  else if (min >= 12) message = 'مستوى جيد، لكن انتبه للتفاصيل. طبق خطة مراجعة منظمة للارتفاع فوق 14.'
  else message = '⚠️ تنبيه: مستواك الحالي يعرضك للخطر. ركّز على المواضيع الثلاثة الضعيفة لإنقاذ معدلك.'

  return (
    `🔮 **مكتب تنبؤات البكالوريا**\n\n` +
    `📊 توقعاتنا لنتيجتك القادمة:\n` +
    `من **${min.toFixed(2)}/20** إلى **${max.toFixed(2)}/20**\n` +
    `(درجة الثقة: ${confidence})\n\n` +
    `${message}\n\n` +
    `📈 معدلك الحالي: علوم الحياة ${grades.svt} • رياضيات ${grades.math} • فيزياء ${grades.physics}`
  )
}

export function calculateMedicSuccess(grades: StudentGrades): string {
  const avg = average(grades)
  const passed = avg >= MEDIC_THRESHOLD
  const gap = (MEDIC_THRESHOLD - avg).toFixed(2)

  if (passed) {
    return (
      `🩺 **نسبة القبول في الطب**\n\n` +
      `معدلك المقدر: **${avg.toFixed(2)}/20** 🎉\n` +
      `أنت فوق عتبة الطب (**${MEDIC_THRESHOLD}**)! فرصتك قوية للالتحاق بكلية الطب.\n` +
      `حافظ على وتيرة المراجعة وركّز على المواضيع ذات المعامل العالي.`
    )
  }

  return (
    `🩺 **نسبة القبول في الطب**\n\n` +
    `معدلك المقدر: **${avg.toFixed(2)}/20**\n` +
    `أنت تحت عتبة الطب (**${MEDIC_THRESHOLD}**) بفارق **${gap}** نقطة.\n` +
    `💡 لتجاوز العتبة، ارفع معدلك بـ +${gap} نقطة عبر مراجعة المجالات الثلاثة و الأسئلة الاستنتاجية.`
  )
}
