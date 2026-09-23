import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MIND_MAPS_DATABASE, 
  MindMapData, 
  MindMapNode 
} from '../../data/mindMapData';
import D3MindMapCanvas from './D3MindMapCanvas';
import MindMapNodeDetails from './MindMapNodeDetails';
import { 
  Network, 
  Search, 
  Layers, 
  Sparkles, 
  BookOpen, 
  ArrowLeft, 
  Maximize2, 
  Minimize2, 
  RotateCcw,
  Zap,
  HelpCircle,
  Share2,
  ChevronDown
} from 'lucide-react';
import { playXPGainSound } from '../../utils/audio';

interface MindMapViewProps {
  initialUnitId?: number;
  onBackToHome?: () => void;
  onStartQuizForUnit?: (unitId: number) => void;
  isDarkMode?: boolean;
}

export default function MindMapView({
  initialUnitId = 1,
  onBackToHome,
  onStartQuizForUnit,
  isDarkMode = false
}: MindMapViewProps) {
  const [activeUnitId, setActiveUnitId] = useState<number>(initialUnitId);
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [layoutMode, setLayoutMode] = useState<'force' | 'radial'>('force');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const currentMapData: MindMapData = useMemo(() => {
    return MIND_MAPS_DATABASE[activeUnitId] || MIND_MAPS_DATABASE[1];
  }, [activeUnitId]);

  // Set default selected node as root node when changing unit
  const handleUnitChange = (unitId: number) => {
    setActiveUnitId(unitId);
    setSelectedNode(null);
    setSearchQuery('');
    playXPGainSound();
  };

  const handleSelectNode = (node: MindMapNode) => {
    setSelectedNode(node);
  };

  // Badges = comptages RÉELS dérivés de MIND_MAPS_DATABASE (P1) :
  // l'ancien hardcode 14/8/9 ne correspondait ni aux nœuds totaux (15/8/8)
  // ni aux concepts hors racine (14/7/7).
  const unitsList = useMemo(() => {
    const meta: Record<number, { title: string; noun: string }> = {
      1: { title: 'الوحدة 1: آليات تركيب البروتين', noun: 'مفهوماً علمياً' },
      2: { title: 'الوحدة 2: بنية ووظيفة البروتين', noun: 'مفاهيم رئيسية' },
      3: { title: 'الوحدة 3: دور البروتينات في الدفاع عن الذات', noun: 'مفاهيم مناعية' },
    };
    return Object.entries(meta).map(([idStr, { title, noun }]) => {
      const id = Number(idStr);
      const map = MIND_MAPS_DATABASE[id];
      const concepts = map ? map.nodes.filter((n) => n.level !== 0).length : 0;
      return { id, title, badge: `${concepts} ${noun}`, concepts };
    });
  }, []);

  return (
    <div className={`space-y-4 pb-20 px-3 sm:px-5 pt-4 bg-[#f8fbfa] dark:bg-gray-950 min-h-full ${
      isFullscreen ? 'fixed inset-0 z-50 p-4 bg-white dark:bg-gray-950 pb-4 overflow-hidden' : ''
    }`} dir="rtl">
      
      {/* Top Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-sm">
        
        <div className="flex items-center gap-3">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="p-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
              title="العودة للرئيسية"
            >
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
                <Network className="w-4 h-4" />
              </div>
              <h2 className="text-lg md:text-xl font-black text-gray-900 dark:text-white">
                الخرائط الذهنية التفاعلية (D3 Engine)
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
              استكشف الترابط المنطقي والعلمي بين مفاهيم المنهاج الوزاري للبكالوريا
            </p>
          </div>
        </div>

        {/* Layout & Fullscreen Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Layout Mode Switcher */}
          <div className="bg-gray-100 dark:bg-gray-800/80 p-1 rounded-2xl flex items-center gap-1 border border-gray-200/70 dark:border-gray-700/60">
            <button
              onClick={() => setLayoutMode('force')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                layoutMode === 'force'
                  ? 'bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>شبكة ديناميكية</span>
            </button>

            <button
              onClick={() => setLayoutMode('radial')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                layoutMode === 'radial'
                  ? 'bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>شجرة هرمية</span>
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
            title={isFullscreen ? 'تصغير الشاشة' : 'ملء الشاشة'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Unit Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {unitsList.map((unit) => {
          const isActive = activeUnitId === unit.id;
          return (
            <button
              key={unit.id}
              onClick={() => handleUnitChange(unit.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border shadow-2xs shrink-0 ${
                isActive
                  ? 'bg-[#006d37] text-white border-[#006d37] shadow-md scale-102'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-800'
              }`}
            >
              <span>{unit.title}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isActive ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
              }`}>
                {unit.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Statistics Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-200/80 dark:border-gray-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن مفهوم (مثال: ريبوزوم، pHi، CMH)..."
            className="w-full pl-3 pr-9 py-2 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              مسح
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs font-bold text-gray-500 dark:text-gray-400 w-full sm:w-auto justify-between sm:justify-end">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{currentMapData.nodes.length} عقدة علمية</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>{currentMapData.links.length} رابط علاقة</span>
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-black">
            منهاج البكالوريا الجزائرية 🇩🇿
          </span>
        </div>
      </div>

      {/* Canvas & Detail Drawer Grid Layout */}
      <div className={`grid grid-cols-1 ${selectedNode ? 'lg:grid-cols-12' : 'grid-cols-1'} gap-4 ${
        isFullscreen ? 'h-[calc(100vh-210px)]' : 'h-[620px]'
      }`}>
        
        {/* Main D3 Interactive Canvas */}
        <div className={`${selectedNode ? 'lg:col-span-7 xl:col-span-8' : 'w-full'} h-full min-h-[420px]`}>
          <D3MindMapCanvas
            data={currentMapData}
            selectedNodeId={selectedNode?.id || null}
            onSelectNode={handleSelectNode}
            onClearSelection={() => setSelectedNode(null)}
            searchQuery={searchQuery}
            layoutMode={layoutMode}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Node Detail Inspector Card */}
        {selectedNode && (
          <div className="lg:col-span-5 xl:col-span-4 h-full">
            <MindMapNodeDetails
              node={selectedNode}
              mapData={currentMapData}
              onClose={() => setSelectedNode(null)}
              onSelectRelatedNode={handleSelectNode}
              onStartQuizForUnit={onStartQuizForUnit}
            />
          </div>
        )}

      </div>

    </div>
  );
}
