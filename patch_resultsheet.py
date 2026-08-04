import re

with open('src/components/DocumentAnalysisView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add the "Signal Error" button inside the ResultSheet
pattern = re.compile(r'<p className="text-\[10px\] text-gray-400 leading-5 border-t border-gray-100 dark:border-gray-800 pt-2 mt-1">\s*\{result\.label\}\s*<\/p>', re.DOTALL)
replacement = """<div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-2 mt-1">
        <p className="text-[10px] text-gray-400 leading-5">
          {result.label}
        </p>
        <button
          onClick={() => {
            alert('تم تسجيل إشعارك. سيتولى فريقنا مراجعة هذه الإجابة وتدريب الخوارزمية لتحسين التصحيح.');
          }}
          className="text-[10px] text-rose-500 font-bold hover:underline cursor-pointer flex items-center gap-1"
        >
          <XCircle className="w-3 h-3" /> أبلغ عن خطأ في التصحيح
        </button>
      </div>"""

content = pattern.sub(replacement, content, count=1)

with open('src/components/DocumentAnalysisView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("ResultSheet patched")
