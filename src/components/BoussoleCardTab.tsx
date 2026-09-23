import { MIFTAH_NOMENCLATURE, MIFTAH_VERSION } from '../data/methodologyEngine';
import MiftahCard from './MiftahCard';
import BoussoleCard from './BoussoleCard';


export default function BoussoleCardTab() {

  return (
<>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
              بطاقة {MIFTAH_NOMENCLATURE.miftah} v{MIFTAH_VERSION} — مطابقة 100% للـ HTML المستقل <span className="latin">/miftah.html</span> — تُطبع A4 recto/verso
            </p>
            <div className="flex gap-2">
              <a href="/miftah.html" target="_blank" rel="noopener" className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-xs">فتح HTML المستقل</a>
              <button onClick={() => window.print()} className="px-4 py-2 bg-[#006d37] hover:bg-[#00562b] text-white rounded-xl font-bold text-sm shadow-md">
                طباعة (A4)
              </button>
            </div>
          </div>
          <MiftahCard />
          <details className="print:hidden bg-gray-50 dark:bg-black/20 rounded-xl border p-3 text-xs">
            <summary className="font-bold cursor-pointer">بطاقة البوصلة المدمجة (legacy) — للمرجع السريع</summary>
            <div className="mt-3"><BoussoleCard /></div>
          </details>
        </section>
</>
  );
}
