const BLOCKER_LABELS = Object.freeze({
  "inventory-missing": "جرد المهام الرسمية غير موجود",
  "inventory-partial": "جرد المهام الرسمية غير مكتمل",
  "exercise-not-inventoried": "بعض التمارين غير مُدرجة في الجرد",
  "exercise-inventory-incomplete": "بعض التمارين غير مجرودة",
  "task-mapping-incomplete": "ربط المهام بخطوات المنهجية غير مكتمل",
  "scoring-unverified": "سلم التنقيط غير متحقق منه",
  "documents-unreviewed": "بعض الوثائق أو الصفحات غير مراجعة",
  "points-incomplete": "مجموع النقاط غير مكتمل",
  "metadata-invalid": "بيانات الجرد غير صالحة",
  "coverage-unknown": "نسبة التغطية الرسمية غير معروفة"
});

export function simulationBlockersArabic(blockers = []) {
  const values = blockers.length ? blockers : ["coverage-unknown"];
  return values.map((blocker) => BLOCKER_LABELS[blocker] || "دليل الأهلية غير مكتمل").join("؛ ");
}
