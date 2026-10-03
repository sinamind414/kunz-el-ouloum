// BackupPanel.tsx — « نسخة احتياطية » : emporter sa progression (sprint 46).
//
// Cas d'usage réels du public visé : changer de téléphone, vider le cache pour
// libérer de la place, passer du navigateur à l'application installée. Dans
// les trois cas, tout le travail disparaît — brouillons de l'atelier compris.
//
// Ce panneau ne parle pas de « localStorage » : il parle d'un fichier qu'on
// enregistre et qu'on rouvre.

import { useRef, useState } from 'react';
import { Download, Save, Upload } from 'lucide-react';
import { creerBackup, nomFichierBackup, restaurerBackup, serialiserBackup } from '../data/backup';

export default function BackupPanel() {
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState(false);
  const champFichier = useRef<HTMLInputElement>(null);
  const nbCles = creerBackup().nbCles;

  const exporter = () => {
    try {
      const contenu = serialiserBackup();
      const blob = new Blob([contenu], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const lien = document.createElement('a');
      lien.href = url;
      lien.download = nomFichierBackup();
      lien.click();
      URL.revokeObjectURL(url);
      setErreur(false);
      setMessage('تم إنشاء ملف النسخة الاحتياطية. احفظه خارج الهاتف إن أمكن.');
    } catch {
      setErreur(true);
      setMessage('تعذّر إنشاء الملف على هذا المتصفح.');
    }
  };

  const importer = async (fichier: File) => {
    const texte = await fichier.text();
    const resultat = restaurerBackup(texte);
    setErreur(!resultat.ok);
    if (!resultat.ok) {
      setMessage(resultat.erreurAr ?? 'تعذّرت الاستعادة.');
      return;
    }
    const suffixe =
      resultat.ignorees.length > 0 ? ` (تم تجاهل ${resultat.ignorees.length} مفتاحاً غريباً)` : '';
    setMessage(`تمت استعادة ${resultat.restaurees} عنصراً${suffixe}. أعد تحميل الصفحة لرؤية التغييرات.`);
  };

  return (
    <section
      data-testid="backup-panel"
      dir="rtl"
      className="rounded-3xl p-4 bg-white dark:bg-[#141916] border border-[#bbcbbb]/30"
    >
      <h3 className="flex items-center gap-2 text-sm font-black text-[#1f1c0b] dark:text-gray-100 mb-1">
        <Save className="w-4 h-4" />
        نسخة احتياطية من تقدّمك
      </h3>
      <p data-testid="backup-resume" className="text-[12px] leading-6 text-[#506072] dark:text-gray-400 text-right mb-3">
        كل ما أنجزته محفوظ في هذا المتصفح فقط: {nbCles} عنصراً (التقدّم، البطاقات، الخطة، أجوبتك
        المحرَّرة). إن غيّرت الهاتف أو مسحت ذاكرة المتصفح، يضيع كل شيء. احفظ ملفاً و استعده متى شئت.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          data-testid="backup-exporter"
          onClick={exporter}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#006d37] text-white text-xs font-bold cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>احفظ نسخة</span>
        </button>
        <button
          data-testid="backup-importer"
          onClick={() => champFichier.current?.click()}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#f3f4f5] dark:bg-[#1f2622] text-[#006d37] dark:text-[#2ecc71] text-xs font-bold cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>استعد نسخة</span>
        </button>
        <input
          data-testid="backup-fichier"
          ref={champFichier}
          aria-label="اختر ملف النسخة الاحتياطية"
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void importer(f);
            e.target.value = '';
          }}
        />
      </div>

      {message && (
        <p
          data-testid="backup-message"
          className={`mt-3 text-[12px] leading-6 text-right ${
            erreur ? 'text-rose-700 dark:text-rose-400' : 'text-[#006d37] dark:text-[#2ecc71]'
          }`}
        >
          {message}
        </p>
      )}
    </section>
  );
}
