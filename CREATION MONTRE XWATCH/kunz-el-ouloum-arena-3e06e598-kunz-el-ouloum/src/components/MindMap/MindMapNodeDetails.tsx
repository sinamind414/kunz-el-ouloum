import React from 'react';
import { motion } from 'motion/react';
import { MindMapNode, MindMapData } from '../../data/mindMapData';
import { 
  X, 
  Sparkles, 
  HelpCircle, 
  Lightbulb, 
  Layers, 
  ArrowLeft, 
  CheckCircle2, 
  BookOpen,
  ArrowRight,
  Zap,
  Target
} from 'lucide-react';
import { playXPGainSound } from '../../utils/audio';

interface MindMapNodeDetailsProps {
  node: MindMapNode | null;
  mapData: MindMapData;
  onClose: () => void;
  onSelectRelatedNode: (node: MindMapNode) => void;
  onStartQuizForUnit?: (unitId: number) => void;
}

export default function MindMapNodeDetails({
  node,
  mapData,
  onClose,
  onSelectRelatedNode,
  onStartQuizForUnit
}: MindMapNodeDetailsProps) {
  if (!node) return null;

  // Find linked neighbor nodes
  const relatedLinks = mapData.links.filter(l => {
    const srcId = typeof l.source === 'object' ? (l.source as any).id : l.source;
    const tgtId = typeof l.target === 'object' ? (l.target as any).id : l.target;
    return srcId === node.id || tgtId === node.id;
  });

  const relatedNodes = relatedLinks.map(l => {
    const srcId = typeof l.source === 'object' ? (l.source as any).id : l.source;
    const tgtId = typeof l.target === 'object' ? (l.target as any).id : l.target;
    const otherId = srcId === node.id ? tgtId : srcId;
    const neighbor = mapData.nodes.find(n => n.id === otherId);
    return {
      node: neighbor,
      relation: l.relation,
      isSource: srcId === node.id
    };
  }).filter((item): item is { node: MindMapNode; relation: string; isSource: boolean } => Boolean(item.node));

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'core': return { label: 'مفهوم جوهري رئيسي', color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' };
      case 'process': return { label: 'آلية وحركية حيوية', color: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30' };
      case 'molecule': return { label: 'جزيء / إنزيم نوعي', color: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' };
      case 'organelle': return { label: 'عضية / مقر خلوي', color: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30' };
      case 'rule': return { label: 'قاعدة ونظام علمي', color: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30' };
      case 'condition': return { label: 'شرط فيزيولوجي', color: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30' };
      case 'outcome': return { label: 'ناتج وتخصص وظيفي', color: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30' };
      default: return { label: 'مفهوم علمي', color: 'bg-gray-500/15 text-gray-700 dark:text-gray-300 border-gray-500/30' };
    }
  };

  const badge = getCategoryBadge(node.category);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white dark:bg-[#121820] border border-gray-200/90 dark:border-gray-800 rounded-3xl p-5 md:p-6 shadow-xl space-y-5 text-right overflow-y-auto max-h-[80vh] md:max-h-full"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 dark:border-gray-800/80 pb-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${badge.color}`}>
              {badge.label}
            </span>
            <span className="text-xs text-gray-400 font-bold">
              {node.unitTitle}
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full inline-block shrink-0 shadow-xs" 
              style={{ backgroundColor: node.color || '#006d37' }} 
            />
            <span>{node.label}</span>
          </h3>
        </div>

        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 transition-colors cursor-pointer shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Definition & Scientific Summary */}
      <div className="space-y-2">
        <h4 className="text-xs font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>المفهوم والتعريف العلمي الدقيق:</span>
        </h4>
        <p className="text-sm md:text-base font-bold text-gray-800 dark:text-gray-200 leading-relaxed bg-emerald-50/40 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-200/50 dark:border-emerald-900/40">
          {node.summary}
        </p>
      </div>

      {/* BAC Methodology & Exam Tip */}
      <div className="space-y-2 bg-amber-500/10 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-300/40 dark:border-amber-800/40">
        <h4 className="text-xs font-black text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4 text-amber-500 fill-current" />
          <span>نصيحة البكالوريا والمنهجية:</span>
        </h4>
        <p className="text-xs md:text-sm font-bold text-amber-900 dark:text-amber-200 leading-relaxed">
          {node.bacTip}
        </p>
      </div>

      {/* Keywords Tags */}
      {node.keywords && node.keywords.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-black text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>الكلمات المفتاحية في الاستدلال العلمي:</span>
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {node.keywords.map((kw, idx) => (
              <span
                key={idx}
                className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold px-2.5 py-1 rounded-xl border border-gray-200 dark:border-gray-700"
              >
                #{kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Related Connected Concepts */}
      {relatedNodes.length > 0 && (
        <div className="space-y-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
          <h4 className="text-xs font-black text-gray-700 dark:text-gray-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-teal-500" />
              <span>المفاهيم المتصلة بالشبكة الذهنية:</span>
            </span>
            <span className="text-[10px] text-gray-400">({relatedNodes.length} روابط)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {relatedNodes.map(({ node: relNode, relation, isSource }) => (
              <button
                key={relNode.id}
                onClick={() => {
                  playXPGainSound();
                  onSelectRelatedNode(relNode);
                }}
                className="p-2.5 rounded-2xl bg-gray-50 hover:bg-emerald-50 dark:bg-gray-800/60 dark:hover:bg-emerald-950/40 border border-gray-200/80 hover:border-emerald-300 dark:border-gray-700 text-right transition-all flex items-center justify-between gap-2 group cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-xs font-black text-gray-800 dark:text-gray-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                    {relNode.label}
                  </div>
                  <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                    <span>{relation}</span>
                  </div>
                </div>
                <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 group-hover:-translate-x-1 transition-transform shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action footer */}
      {onStartQuizForUnit && (
        <div className="pt-2">
          <button
            onClick={() => onStartQuizForUnit(node.unitId)}
            className="w-full py-3 bg-[#006d37] hover:bg-[#005a2d] text-white font-black text-xs md:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Target className="w-4 h-4" />
            <span>اختبار فوري في مفاهيم {node.unitTitle}</span>
          </button>
        </div>
      )}

    </motion.div>
  );
}
