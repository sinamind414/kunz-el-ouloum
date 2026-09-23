import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { MindMapData, MindMapNode, MindMapLink } from '../../data/mindMapData';
import { playXPGainSound } from '../../utils/audio';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Sparkles, 
  Layers, 
  Move,
  Search,
  Eye,
  CheckCircle2
} from 'lucide-react';

interface D3MindMapCanvasProps {
  data: MindMapData;
  selectedNodeId: string | null;
  onSelectNode: (node: MindMapNode) => void;
  /** Clic sur le fond du canvas → ferme le panneau de détails (P1). */
  onClearSelection?: () => void;
  searchQuery?: string;
  layoutMode?: 'force' | 'radial';
  isDarkMode?: boolean;
}

export default function D3MindMapCanvas({
  data,
  selectedNodeId,
  onSelectNode,
  onClearSelection,
  searchQuery = '',
  layoutMode = 'force',
  isDarkMode = false
}: D3MindMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const simulationRef = useRef<d3.Simulation<any, any> | null>(null);

  // Refs : le rendu D3 (effect à deps stables) capture toujours les callbacks
  // à jour sans relancer la simulation à chaque sélection (deps manquantes P1).
  const onSelectNodeRef = useRef(onSelectNode);
  onSelectNodeRef.current = onSelectNode;
  const onClearSelectionRef = useRef(onClearSelection);
  onClearSelectionRef.current = onClearSelection;
  const selectedNodeIdRef = useRef(selectedNodeId);
  selectedNodeIdRef.current = selectedNodeId;

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 800, height: 600 });
  // Debounce recherche (P1) : le highlight ne rejoue pas à chaque frappe.
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 200);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Handle Container Resizing
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setDimensions({ width, height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Connected nodes map for highlighting active neighbourhood
  const connectedNodeIds = useMemo(() => {
    const activeId = hoveredNodeId || selectedNodeId;
    if (!activeId) return new Set<string>();

    const set = new Set<string>([activeId]);
    data.links.forEach(l => {
      const srcId = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const tgtId = typeof l.target === 'object' ? (l.target as any).id : l.target;
      if (srcId === activeId) set.add(tgtId);
      if (tgtId === activeId) set.add(srcId);
    });
    return set;
  }, [hoveredNodeId, selectedNodeId, data.links]);

  // Main D3 Rendering Effect
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous drawing

    const { width, height } = dimensions;

    // Clone data to avoid in-place mutation issues across renders
    const nodes: (MindMapNode & d3.SimulationNodeDatum)[] = data.nodes.map(d => ({ ...d }));
    const links: any[] = data.links.map(d => ({ ...d }));

    // Define SVG Filters & Gradients (Glow, Drop Shadows, Arrow Markers)
    const defs = svg.append('defs');

    // Arrowhead marker for links
    defs.append('marker')
      .attr('id', 'arrow-head')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 28)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', isDarkMode ? '#4ade80' : '#006d37')
      .attr('opacity', 0.8);

    // Glow filter
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    filter.append('feGaussianBlur')
      .attr('stdDeviation', '6')
      .attr('result', 'coloredBlur');

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Container Group for Zoom and Pan
    const g = svg.append('g').attr('class', 'mindmap-root-group');

    // Setup D3 Zoom Behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Initial Zoom Center
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.85));

    // Force Simulation Setup
    let simulation: d3.Simulation<any, any>;

    if (layoutMode === 'radial') {
      simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id((d: any) => d.id).distance((d: any) => {
          return d.source.level === 0 ? 160 : 110;
        }).strength(0.8))
        .force('charge', d3.forceManyBody().strength(-400))
        .force('collide', d3.forceCollide().radius((d: any) => (d.radius || 25) + 30).iterations(3))
        .force('r', d3.forceRadial((d: any) => {
          if (d.level === 0) return 0;
          if (d.level === 1) return 170;
          if (d.level === 2) return 300;
          return 420;
        }, 0, 0).strength(0.85));
    } else {
      simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id((d: any) => d.id).distance((d: any) => {
          return d.source.level === 0 ? 180 : 130;
        }).strength(0.6))
        .force('charge', d3.forceManyBody().strength(-550))
        .force('collide', d3.forceCollide().radius((d: any) => (d.radius || 25) + 35).iterations(3))
        .force('center', d3.forceCenter(0, 0).strength(0.08));
    }

    simulationRef.current = simulation;

    // Links Layer
    const linkGroup = g.append('g').attr('class', 'links-layer');
    const link = linkGroup.selectAll('g.link-item')
      .data(links)
      .enter()
      .append('g')
      .attr('class', 'link-item');

    const linkPath = link.append('path')
      .attr('stroke', isDarkMode ? '#334155' : '#cbd5e1')
      .attr('stroke-width', (d: any) => d.type === 'primary' ? 2.5 : 1.7)
      .attr('stroke-dasharray', (d: any) => d.type === 'catalytic' ? '5,5' : 'none')
      .attr('fill', 'none')
      .attr('marker-end', 'url(#arrow-head)');

    // Link Text Labels (Relations)
    const linkText = link.append('text')
      .attr('font-size', '10px')
      .attr('font-weight', '700')
      .attr('font-family', 'system-ui, -apple-system, sans-serif')
      .attr('fill', isDarkMode ? '#94a3b8' : '#64748b')
      .attr('text-anchor', 'middle')
      .attr('dy', -4)
      .text((d: any) => d.relation || '');

    // Nodes Layer
    const nodeGroup = g.append('g').attr('class', 'nodes-layer');
    const node = nodeGroup.selectAll('g.node-item')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node-item')
      .attr('cursor', 'pointer')
      .call(
        d3.drag<any, any>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            // Allow nodes to stay anchored or float back
            d.fx = null;
            d.fy = null;
          })
      )
      .on('click', (event, d) => {
        event.stopPropagation();
        playXPGainSound();
        onSelectNodeRef.current(d);
      })
      .on('mouseenter', (event, d) => {
        setHoveredNodeId(d.id);
      })
      .on('mouseleave', () => {
        setHoveredNodeId(null);
      });

    // Outer Aura Pulse for Selected / Root Node
    node.append('circle')
      .attr('r', (d: any) => (d.radius || 25) + 8)
      .attr('fill', (d: any) => d.color || '#006d37')
      .attr('opacity', (d: any) => (d.id === selectedNodeId || d.level === 0 ? 0.25 : 0))
      .attr('class', 'node-pulse');

    // Main Circle
    node.append('circle')
      .attr('r', (d: any) => d.radius || 25)
      .attr('fill', (d: any) => {
        if (d.level === 0) return isDarkMode ? '#006d37' : '#006d37';
        return isDarkMode ? '#1e293b' : '#ffffff';
      })
      .attr('stroke', (d: any) => d.color || '#006d37')
      .attr('stroke-width', (d: any) => d.level === 0 ? 4 : (d.id === selectedNodeId ? 3.5 : 2.5))
      .attr('filter', (d: any) => d.id === selectedNodeId ? 'url(#glow)' : 'none');

    // Category / Level Badge Ring for Subnodes
    node.filter((d: any) => d.level > 0).append('circle')
      .attr('r', (d: any) => (d.radius || 25) - 4)
      .attr('fill', (d: any) => d.color || '#006d37')
      .attr('opacity', 0.12);

    // Node Icons / Numbers
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', (d: any) => d.level === 0 ? '16px' : '12px')
      .attr('font-weight', '900')
      .attr('fill', (d: any) => {
        if (d.level === 0) return '#ffffff';
        return d.color || (isDarkMode ? '#ffffff' : '#0f172a');
      })
      .text((d: any) => {
        if (d.level === 0) return '🧬';
        if (d.category === 'process') return '⚡';
        if (d.category === 'molecule') return '🧪';
        if (d.category === 'organelle') return '🔬';
        if (d.category === 'rule') return '⚖️';
        if (d.category === 'condition') return '🌡️';
        if (d.category === 'outcome') return '🎯';
        return '🔹';
      });

    // Node Text Label Background Pill
    const textGroup = node.append('g')
      .attr('transform', (d: any) => `translate(0, ${(d.radius || 25) + 16})`);

    // Label Text
    textGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', (d: any) => d.level === 0 ? '13px' : '11px')
      .attr('font-weight', '800')
      .attr('font-family', 'system-ui, -apple-system, sans-serif')
      .attr('fill', isDarkMode ? '#f8fafc' : '#0f172a')
      .attr('stroke', isDarkMode ? '#0f172a' : '#ffffff')
      .attr('stroke-width', 3)
      .attr('paint-order', 'stroke')
      .text((d: any) => d.label);

    // Simulation Tick Listener
    simulation.on('tick', () => {
      linkPath.attr('d', (d: any) => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.5; // Slight curved path
        return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      });

      linkText
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Background Click Clears Selection (P1 : handler vide → ferme le drawer)
    svg.on('click', () => {
      onClearSelectionRef.current?.();
    });

    return () => {
      simulation.stop();
    };
    // onSelectNode / onClearSelection / selectedNodeId passent par des refs :
    // on ne redessine la simulation que sur data/layout/dimensions/thème.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, layoutMode, dimensions, isDarkMode]);

  // Update Visual Highlights when selection, hover, or search query changes
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    const hasActiveFocus = Boolean(hoveredNodeId || selectedNodeId || debouncedQuery.trim());
    const query = debouncedQuery.trim().toLowerCase();

    // Node Highlights
    svg.selectAll<SVGGElement, any>('g.node-item').each(function(d: any) {
      const el = d3.select(this);
      const isSelected = d.id === selectedNodeId;
      const isHovered = d.id === hoveredNodeId;
      const isConnected = connectedNodeIds.has(d.id);
      const matchesSearch = query ? (
        d.label.toLowerCase().includes(query) ||
        d.summary.toLowerCase().includes(query) ||
        d.keywords?.some((k: string) => k.toLowerCase().includes(query))
      ) : true;

      const isDimmed = hasActiveFocus && !isConnected && !isSelected && !isHovered && (!query || !matchesSearch);

      el.transition().duration(200)
        .attr('opacity', isDimmed ? 0.25 : 1);

      el.select('circle.node-pulse')
        .transition().duration(200)
        .attr('opacity', isSelected || isHovered || (query && matchesSearch) ? 0.35 : (d.level === 0 ? 0.2 : 0))
        .attr('r', (d.radius || 25) + (isSelected || isHovered ? 12 : 8));
    });

    // Link Highlights
    svg.selectAll<SVGGElement, any>('g.link-item').each(function(d: any) {
      const el = d3.select(this);
      const srcId = typeof d.source === 'object' ? d.source.id : d.source;
      const tgtId = typeof d.target === 'object' ? d.target.id : d.target;

      const isLinkedToActive = (selectedNodeId && (srcId === selectedNodeId || tgtId === selectedNodeId)) ||
                               (hoveredNodeId && (srcId === hoveredNodeId || tgtId === hoveredNodeId));

      const isDimmed = (selectedNodeId || hoveredNodeId) && !isLinkedToActive;

      el.transition().duration(200)
        .attr('opacity', isDimmed ? 0.15 : 1);

      el.select('path')
        .transition().duration(200)
        .attr('stroke', isLinkedToActive ? (isDarkMode ? '#4ade80' : '#006d37') : (isDarkMode ? '#334155' : '#cbd5e1'))
        .attr('stroke-width', isLinkedToActive ? 3.5 : (d.type === 'primary' ? 2.5 : 1.7));
    });

  }, [selectedNodeId, hoveredNodeId, connectedNodeIds, debouncedQuery, isDarkMode]);

  // Programmatic Zoom Controls
  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.3);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.7);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const { width, height } = dimensions;
    d3.select(svgRef.current)
      .transition()
      .duration(500)
      .call(
        zoomBehaviorRef.current.transform,
        d3.zoomIdentity.translate(width / 2, height / 2).scale(0.85)
      );
  };

  return (
    <div ref={containerRef} className="w-full h-full min-h-[460px] relative overflow-hidden bg-slate-50/70 dark:bg-[#0b1015] select-none rounded-3xl border border-gray-200/80 dark:border-gray-800/80">
      
      {/* SVG Stage */}
      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
        style={{ touchAction: 'none' }}
      />

      {/* Floating Canvas Toolbar Controls */}
      <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg z-20">
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
          title="تكبير (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
          title="تصغير (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-0.5" />
        <button
          onClick={handleResetZoom}
          className="w-8 h-8 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
          title="إعادة ضبط وتوسيط الخريطة"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Hint Badge */}
      <div className="absolute top-4 right-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200/80 dark:border-gray-800 text-[11px] font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1.5 shadow-sm z-10 pointer-events-none" dir="rtl">
        <Move className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>اسحب لتحريك المفاهيم أو انقر لاستكشاف التفاصيل</span>
      </div>

    </div>
  );
}
