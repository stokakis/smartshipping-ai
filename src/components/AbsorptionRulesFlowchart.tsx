import React, { useState } from 'react';
import {
  GitFork,
  ArrowDown,
  Layers,
  Sparkles,
  CheckCircle2,
  Package,
  TrendingUp,
  Percent,
  Compass,
  Zap,
  Info,
  Sliders,
  Maximize2,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  Boxes,
  HelpCircle,
  Eye
} from 'lucide-react';

interface ScenarioPreset {
  id: string;
  title: string;
  badge: string;
  cartDesc: string;
  activeBranch: 'free' | 'flat10' | 'coleader' | 'partial' | 'all';
  leaderText: string;
  itemText: string;
  mathExplanation: string;
  savingQuote: string;
}

const SCENARIOS: ScenarioPreset[] = [
  {
    id: 'all',
    title: 'Complete Architecture Overview',
    badge: 'Full Ruleset',
    cartDesc: 'Inspect all 4 algorithmic branches simultaneously with active logic flow gates.',
    activeBranch: 'all',
    leaderText: 'Dynamic Evaluation',
    itemText: 'Evaluates each line item i = 1..N',
    mathExplanation: 'The engine sorts all items descending by id_class, binds the highest tier as Leader, and routes each subsequent item through the absorption matrix.',
    savingQuote: 'Prevents checkout abandonment by replacing cumulative freight stacking with physical volume consolidation.'
  },
  {
    id: 'free',
    title: 'Scenario A: 100% Free Absorption',
    badge: 'ΔClass ≥ 2',
    cartDesc: '1x Velvet Sofa (Class 4, €79) + 2x Linen Candles (Class 1, €5 each)',
    activeBranch: 'free',
    leaderText: 'Class 4 (Bulky Velvet Sofa)',
    itemText: 'Class 1 (Linen Candle: 4 - 1 = 3 ≥ 2)',
    mathExplanation: 'Leader: €79.00. Subordinated Class 1 candles fit inside dimensional voids of sofa crate -> +€0.00 surcharge each.',
    savingQuote: 'Customer saves €10.00 shipping! High-margin accessory add-ons cost zero incremental freight.'
  },
  {
    id: 'flat10',
    title: 'Scenario B: Bulky Neighbor Flat Rate',
    badge: 'Leader 4 + Class 3',
    cartDesc: '1x Velvet Sofa (Class 4, €79) + 1x Birch Dining Chair (Class 3, €35)',
    activeBranch: 'flat10',
    leaderText: 'Class 4 (Bulky Velvet Sofa)',
    itemText: 'Class 3 (Dining Chair: 4 - 3 = 1 with Leader 4)',
    mathExplanation: 'Leader: €79.00. Subordinated Class 3 medium furniture adds flat +€10.00 pallet co-dispatch fee instead of €35.00.',
    savingQuote: 'Customer saves €25.00! Total shipping is €89.00 instead of €114.00, securing the multi-room furniture bundle.'
  },
  {
    id: 'coleader',
    title: 'Scenario C: Co-Leader Surcharge',
    badge: 'Class Equal (40%)',
    cartDesc: '1x Velvet Sofa (Class 4, €79) + 1x Solid Oak Dining Table (Class 4, €79)',
    activeBranch: 'coleader',
    leaderText: 'Class 4 (1st Velvet Sofa)',
    itemText: 'Class 4 (2nd Bulky Table: 4 - 4 = 0, Co-Leader)',
    mathExplanation: 'Leader: €79.00. Secondary bulky item incurs 40% of leader base price (0.40 * €79.00 = +€31.60).',
    savingQuote: 'Customer saves €47.40 (60% discount on second bulky piece). Total shipping €110.60 instead of €158.00.'
  },
  {
    id: 'partial',
    title: 'Scenario D: Partial Nesting Discount',
    badge: 'ΔClass = 1 (Tier 3/2)',
    cartDesc: '1x Birch Dining Chair (Class 3, €35) + 1x Floor Lamp (Class 2, €15)',
    activeBranch: 'partial',
    leaderText: 'Class 3 (Birch Dining Chair)',
    itemText: 'Class 2 (Floor Lamp: 3 - 2 = 1, Sub-bulky)',
    mathExplanation: 'Leader: €35.00. Subordinated Class 2 item incurs 30% of its own base price (0.30 * €15.00 = +€4.50).',
    savingQuote: 'Customer saves €10.50 (70% discount on small furniture). Total shipping €39.50 instead of €50.00.'
  }
];

export function AbsorptionRulesFlowchart() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('all');
  const [showMatrixTable, setShowMatrixTable] = useState<boolean>(true);

  const activeScenario = SCENARIOS.find(s => s.id === selectedScenarioId) || SCENARIOS[0];
  const activeBranch = activeScenario.activeBranch;

  const isBranchActive = (branch: 'free' | 'flat10' | 'coleader' | 'partial') => {
    return activeBranch === 'all' || activeBranch === branch;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600/30 to-violet-600/30 text-indigo-400 border border-indigo-500/30 shadow-inner">
              <GitFork className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>'Absorption Power' Algorithm Decision Flowchart</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  CSS Grid Layout
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Visualizing how PrestaShop calculates volumetric nesting, identifies the package leader, and eliminates shipping shock.
              </p>
            </div>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMatrixTable(!showMatrixTable)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/60 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span>{showMatrixTable ? 'Hide Matrix Table' : 'Show Matrix Table'}</span>
          </button>
        </div>
      </div>

      {/* Scenario Filter Pills */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Select Interactive Merchant Scenario:</span>
          </span>
          <span className="text-slate-500 lowercase font-mono">click to illuminate logic branch</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {SCENARIOS.map((sc) => {
            const isSelected = sc.id === selectedScenarioId;
            return (
              <button
                key={sc.id}
                onClick={() => setSelectedScenarioId(sc.id)}
                className={`p-2.5 rounded-xl text-left transition-all border cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-md shadow-indigo-950/50'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {sc.badge}
                  </span>
                  {isSelected && <Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
                <div className="text-xs font-semibold truncate">{sc.title.split(':')[1] || sc.title}</div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{sc.cartDesc.slice(0, 32)}...</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Scenario Info Banner */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-start md:items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 shrink-0">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-white flex items-center gap-2">
              <span>{activeScenario.title}</span>
              <span className="text-[10px] font-mono text-indigo-300 bg-indigo-900/60 px-2 py-0.5 rounded border border-indigo-500/30">
                Cart: {activeScenario.cartDesc}
              </span>
            </div>
            <p className="text-slate-400 mt-0.5 leading-snug">{activeScenario.mathExplanation}</p>
          </div>
        </div>
        <div className="shrink-0 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-emerald-300 text-[11px] font-medium flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{activeScenario.savingQuote}</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* THE FLOWCHART IMPLEMENTED WITH CSS GRID                                  */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner overflow-x-auto">
        <div className="min-w-[760px] space-y-4">
          
          {/* LEVEL 1: Cart Expansion & Catalog Lookup (CSS Grid Single Header Row) */}
          <div className="grid grid-cols-12 gap-3 items-center">
            <div className="col-span-12 p-4 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                  1
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span>STEP 1: Cart Flattening & Class Identification</span>
                    <span className="text-[10px] font-mono text-slate-400 lowercase">(PrestaShop Cart Ingestion)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Unpacks all cart quantities into discrete unit slots and matches product IDs against <code className="text-indigo-300 font-mono">ps_smartshipping_product</code> to retrieve <code className="text-indigo-300 font-mono">id_class (1..4)</code>.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60">
                  Input: Cart Products [p1, p2, ...]
                </span>
              </div>
            </div>
          </div>

          {/* Connector Down Arrow 1 */}
          <div className="flex justify-center -my-1">
            <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 shadow">
              <ArrowDown className="w-4 h-4 text-indigo-400" />
            </div>
          </div>

          {/* LEVEL 2: Leader Sort & Anchor Assignment (CSS Grid Row) */}
          <div className="grid grid-cols-12 gap-3 items-center">
            <div className="col-span-12 p-4 rounded-xl bg-gradient-to-r from-slate-900 via-violet-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                  2
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span>STEP 2: Leadership Selection (Dimensional Anchor)</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      Sort DESC by id_class
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Item #1 in sorted array becomes <strong className="text-white">Cart Leader</strong>. Its base rate is charged in full as the package base shipping fee (Class 4 = €79, Class 3 = €35, Class 2 = €15, Class 1 = €5).
                  </p>
                </div>
              </div>
              <div className="shrink-0 bg-violet-950/80 border border-violet-500/40 px-3 py-1.5 rounded-lg text-right">
                <div className="text-[10px] text-violet-300 font-mono">Leader Base Fee Charged:</div>
                <div className="text-xs font-bold text-white font-mono">BaseLeaderRate (€)</div>
              </div>
            </div>
          </div>

          {/* Connector Down Arrow 2 */}
          <div className="flex justify-center -my-1">
            <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 shadow">
              <ArrowDown className="w-4 h-4 text-violet-400" />
            </div>
          </div>

          {/* LEVEL 3: Subordinated Items Loop Decision Gate (CSS Grid Row) */}
          <div className="grid grid-cols-12 gap-3 items-center">
            <div className="col-span-12 p-3.5 rounded-xl bg-slate-900 border border-indigo-500/40 text-center relative">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-white">
                <Boxes className="w-4 h-4 text-indigo-400" />
                <span>STEP 3: Loop Through Remaining Subordinated Items (i = 2 .. N)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Calculate volumetric difference: <code className="bg-slate-950 px-2 py-0.5 rounded text-indigo-300 font-mono">ΔClass = leader.id_class - item.id_class</code>
              </p>
            </div>
          </div>

          {/* Connector Down: 4-Way Splitting Connector Grid */}
          <div className="grid grid-cols-4 gap-3 text-center -my-1">
            <div className="flex justify-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                isBranchActive('free') ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-600'
              }`}>
                <ArrowDown className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex justify-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                isBranchActive('flat10') ? 'bg-amber-600/30 border-amber-500 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-600'
              }`}>
                <ArrowDown className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex justify-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                isBranchActive('coleader') ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-600'
              }`}>
                <ArrowDown className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex justify-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                isBranchActive('partial') ? 'bg-blue-600/30 border-blue-500 text-blue-300' : 'bg-slate-900 border-slate-800 text-slate-600'
              }`}>
                <ArrowDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* LEVEL 4: 4 PARALLEL DECISION BRANCHES (CSS Grid 4 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            
            {/* BRANCH 1: Free Absorption (ΔClass >= 2) */}
            <div className={`rounded-xl border p-4 space-y-3 transition-all flex flex-col justify-between ${
              isBranchActive('free')
                ? 'bg-emerald-950/40 border-emerald-500/80 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/40'
                : 'bg-slate-950/40 border-slate-800/80 opacity-40'
            }`}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    BRANCH A
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-400">ΔClass ≥ 2</span>
                </div>
                <div className="text-sm font-bold text-white">100% Free Absorption</div>
                <div className="p-2 rounded bg-slate-950/80 border border-emerald-500/20 font-mono text-center">
                  <div className="text-[10px] text-slate-400">Incremental Fee:</div>
                  <div className="text-lg font-black text-emerald-400">+€0.00</div>
                </div>
                <div className="text-[11px] text-slate-300 leading-snug space-y-1">
                  <div className="font-semibold text-emerald-300">Physical Principle:</div>
                  <p className="text-slate-400 text-[10px]">
                    Item fits completely inside dimensional cavities of the bulky leader packaging envelope.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-1">
                <div className="text-[10px] text-slate-400 font-semibold">Qualifying Pairs:</div>
                <div className="text-[10px] font-mono text-slate-300 space-y-0.5">
                  <div>• Leader Cl 4 ➔ Item Cl 1 (+€0)</div>
                  <div>• Leader Cl 4 ➔ Item Cl 2 (+€0)</div>
                  <div>• Leader Cl 3 ➔ Item Cl 1 (+€0)</div>
                </div>
              </div>
            </div>

            {/* BRANCH 2: Bulky Neighbor (Leader 4 + Item 3) */}
            <div className={`rounded-xl border p-4 space-y-3 transition-all flex flex-col justify-between ${
              isBranchActive('flat10')
                ? 'bg-amber-950/40 border-amber-500/80 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/40'
                : 'bg-slate-950/40 border-slate-800/80 opacity-40'
            }`}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                    BRANCH B
                  </span>
                  <span className="text-[10px] font-semibold text-amber-400">L4 + Item 3</span>
                </div>
                <div className="text-sm font-bold text-white">Flat Neighbor Fee</div>
                <div className="p-2 rounded bg-slate-950/80 border border-amber-500/20 font-mono text-center">
                  <div className="text-[10px] text-slate-400">Incremental Fee:</div>
                  <div className="text-lg font-black text-amber-400">+€10.00</div>
                </div>
                <div className="text-[11px] text-slate-300 leading-snug space-y-1">
                  <div className="font-semibold text-amber-300">Physical Principle:</div>
                  <p className="text-slate-400 text-[10px]">
                    Medium furniture cannot fit inside sofa cavity, but shares freight pallet dispatching.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-1">
                <div className="text-[10px] text-slate-400 font-semibold">Exact Formula:</div>
                <div className="text-[10px] font-mono text-slate-300 space-y-0.5">
                  <div>• Fixed Surcharge: <strong className="text-amber-400">€10.00</strong></div>
                  <div>• Normal base rate: €35.00</div>
                  <div className="text-emerald-400 font-semibold">➔ €25.00 Customer Savings</div>
                </div>
              </div>
            </div>

            {/* BRANCH 3: Co-Leader Surcharge (Class Equality) */}
            <div className={`rounded-xl border p-4 space-y-3 transition-all flex flex-col justify-between ${
              isBranchActive('coleader')
                ? 'bg-indigo-950/40 border-indigo-500/80 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500/40'
                : 'bg-slate-950/40 border-slate-800/80 opacity-40'
            }`}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                    BRANCH C
                  </span>
                  <span className="text-[10px] font-semibold text-indigo-400">item == leader</span>
                </div>
                <div className="text-sm font-bold text-white">40% Co-Leader Surcharge</div>
                <div className="p-2 rounded bg-slate-950/80 border border-indigo-500/20 font-mono text-center">
                  <div className="text-[10px] text-slate-400">Incremental Fee:</div>
                  <div className="text-lg font-black text-indigo-400">40% Leader Base</div>
                </div>
                <div className="text-[11px] text-slate-300 leading-snug space-y-1">
                  <div className="font-semibold text-indigo-300">Physical Principle:</div>
                  <p className="text-slate-400 text-[10px]">
                    Identical tier bulky unit takes equal vehicle footprint, but amortizes driver dispatch overhead.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-1">
                <div className="text-[10px] text-slate-400 font-semibold">Tier Rates (60% Off):</div>
                <div className="text-[10px] font-mono text-slate-300 space-y-0.5">
                  <div>• 2nd Cl 4: 0.40 * 79 = <strong className="text-white">+€31.60</strong></div>
                  <div>• 2nd Cl 3: 0.40 * 35 = <strong className="text-white">+€14.00</strong></div>
                  <div>• 2nd Cl 2: 0.40 * 15 = <strong className="text-white">+€6.00</strong></div>
                </div>
              </div>
            </div>

            {/* BRANCH 4: Partial Nesting Discount (ΔClass = 1 non-bulky) */}
            <div className={`rounded-xl border p-4 space-y-3 transition-all flex flex-col justify-between ${
              isBranchActive('partial')
                ? 'bg-blue-950/40 border-blue-500/80 shadow-lg shadow-blue-950/40 ring-1 ring-blue-500/40'
                : 'bg-slate-950/40 border-slate-800/80 opacity-40'
            }`}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                    BRANCH D
                  </span>
                  <span className="text-[10px] font-semibold text-blue-400">ΔClass = 1</span>
                </div>
                <div className="text-sm font-bold text-white">30% Nesting Discount</div>
                <div className="p-2 rounded bg-slate-950/80 border border-blue-500/20 font-mono text-center">
                  <div className="text-[10px] text-slate-400">Incremental Fee:</div>
                  <div className="text-lg font-black text-blue-400">30% Item Base</div>
                </div>
                <div className="text-[11px] text-slate-300 leading-snug space-y-1">
                  <div className="font-semibold text-blue-300">Physical Principle:</div>
                  <p className="text-slate-400 text-[10px]">
                    Subordinated item nests partially within surrounding box geometry.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-1">
                <div className="text-[10px] text-slate-400 font-semibold">Tier Rates (70% Off):</div>
                <div className="text-[10px] font-mono text-slate-300 space-y-0.5">
                  <div>• Cl 3 Leader + Cl 2 Item: <strong className="text-white">+€4.50</strong></div>
                  <div>• Cl 2 Leader + Cl 1 Item: <strong className="text-white">+€1.50</strong></div>
                  <div className="text-slate-400 text-[9px]">(Normal base rates: €15 & €5)</div>
                </div>
              </div>
            </div>

          </div>

          {/* Converge Connector Row */}
          <div className="grid grid-cols-4 gap-3 text-center -my-1">
            <div className="flex justify-center"><ArrowDown className="w-3.5 h-3.5 text-slate-600" /></div>
            <div className="flex justify-center"><ArrowDown className="w-3.5 h-3.5 text-slate-600" /></div>
            <div className="flex justify-center"><ArrowDown className="w-3.5 h-3.5 text-slate-600" /></div>
            <div className="flex justify-center"><ArrowDown className="w-3.5 h-3.5 text-slate-600" /></div>
          </div>

          {/* LEVEL 5: Subtotal Aggregation & Regional Friction Multiplier */}
          <div className="grid grid-cols-12 gap-3 items-center">
            <div className="col-span-12 p-4 rounded-xl bg-gradient-to-r from-indigo-950 via-slate-900 to-violet-950 border border-indigo-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span>STEP 4: Aggregation & Destination Multiplier</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Total = (Subtotal × GeoMultiplier) + Surcharge
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Subtotal = Leader Base + ∑(Absorbed Fees). Engine queries <code className="text-indigo-300 font-mono">ps_smartshipping_geo_zones</code> for delivery ZIP (Zone A: 1.00x, Zone B: 1.15x, Zone C: 1.45x + €35 ferry surcharge for bulky items).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                <div className="text-right font-mono">
                  <div className="text-[10px] text-slate-400">PrestaShop Output:</div>
                  <div className="text-xs font-bold text-emerald-400">getOrderShippingCost()</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2D CSS GRID MATRIX LOOKUP TABLE                                           */}
      {/* ========================================================================= */}
      {showMatrixTable && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>Two-Dimensional Absorption Matrix Quick-Lookup</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              Row = Cart Leader • Column = Additional Item
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-300 font-mono text-[11px]">
                  <th className="p-3 font-semibold text-slate-400">Leader (Rows) \ Item (Cols)</th>
                  <th className="p-3 font-semibold text-indigo-300">Class 1 (Decor, €5)</th>
                  <th className="p-3 font-semibold text-indigo-300">Class 2 (Small Furn., €15)</th>
                  <th className="p-3 font-semibold text-indigo-300">Class 3 (Med Furn., €35)</th>
                  <th className="p-3 font-semibold text-indigo-300">Class 4 (Bulky, €79)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                {/* Row 4 */}
                <tr className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-3 font-bold text-white bg-slate-900/40">
                    <span className="text-slate-400">🛋️</span> Class 4 (€79.00)
                  </td>
                  <td className="p-3 bg-emerald-950/20 text-emerald-400 font-bold">
                    +€0.00 <span className="text-[10px] font-normal text-emerald-500/80">(100% Free)</span>
                  </td>
                  <td className="p-3 bg-emerald-950/20 text-emerald-400 font-bold">
                    +€0.00 <span className="text-[10px] font-normal text-emerald-500/80">(100% Free)</span>
                  </td>
                  <td className="p-3 bg-amber-950/20 text-amber-400 font-bold">
                    +€10.00 <span className="text-[10px] font-normal text-amber-500/80">(Flat Co-Ship)</span>
                  </td>
                  <td className="p-3 bg-indigo-950/20 text-indigo-400 font-bold">
                    +€31.60 <span className="text-[10px] font-normal text-indigo-500/80">(40% Co-Lead)</span>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-3 font-bold text-white bg-slate-900/40">
                    <span className="text-slate-400">🪑</span> Class 3 (€35.00)
                  </td>
                  <td className="p-3 bg-emerald-950/20 text-emerald-400 font-bold">
                    +€0.00 <span className="text-[10px] font-normal text-emerald-500/80">(100% Free)</span>
                  </td>
                  <td className="p-3 bg-blue-950/20 text-blue-400 font-bold">
                    +€4.50 <span className="text-[10px] font-normal text-blue-500/80">(30% Nesting)</span>
                  </td>
                  <td className="p-3 bg-indigo-950/20 text-indigo-400 font-bold">
                    +€14.00 <span className="text-[10px] font-normal text-indigo-500/80">(40% Co-Lead)</span>
                  </td>
                  <td className="p-3 text-slate-500 italic bg-slate-950">
                    [Cl 4 becomes Leader]
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-3 font-bold text-white bg-slate-900/40">
                    <span className="text-slate-400">💡</span> Class 2 (€15.00)
                  </td>
                  <td className="p-3 bg-blue-950/20 text-blue-400 font-bold">
                    +€1.50 <span className="text-[10px] font-normal text-blue-500/80">(30% Nesting)</span>
                  </td>
                  <td className="p-3 bg-indigo-950/20 text-indigo-400 font-bold">
                    +€6.00 <span className="text-[10px] font-normal text-indigo-500/80">(40% Co-Lead)</span>
                  </td>
                  <td className="p-3 text-slate-500 italic bg-slate-950">
                    [Cl 3 becomes Leader]
                  </td>
                  <td className="p-3 text-slate-500 italic bg-slate-950">
                    [Cl 4 becomes Leader]
                  </td>
                </tr>

                {/* Row 1 */}
                <tr className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-3 font-bold text-white bg-slate-900/40">
                    <span className="text-slate-400">🕯️</span> Class 1 (€5.00)
                  </td>
                  <td className="p-3 bg-indigo-950/20 text-indigo-400 font-bold">
                    +€2.00 <span className="text-[10px] font-normal text-indigo-500/80">(40% Co-Lead)</span>
                  </td>
                  <td className="p-3 text-slate-500 italic bg-slate-950">
                    [Cl 2 becomes Leader]
                  </td>
                  <td className="p-3 text-slate-500 italic bg-slate-950">
                    [Cl 3 becomes Leader]
                  </td>
                  <td className="p-3 text-slate-500 italic bg-slate-950">
                    [Cl 4 becomes Leader]
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Merchant Benefits & Psychological Triggers Callouts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>Eliminates Freight Shock</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Standard ecommerce modules add fees linearly (e.g. €79 + €15 + €5 + €5 = €104), causing 68% cart abandonment. SmartShipping AI charges only €79.00 because small decor items fit in empty sofa void space.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            <span>Multi-Item AOV Lift</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Merchants can display "Add any pillow or candle for FREE shipping!" in the checkout funnel, directly converting micro-accessories without eating into shipping profit margins.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
          <div className="flex items-center space-x-2 text-violet-400 font-semibold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>High Performance PrestaShop 1.7</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Executed inside <code className="text-violet-300 font-mono">getOrderShippingCost()</code> via a single indexed query on <code className="text-violet-300 font-mono">ps_smartshipping_product</code> with microsecond execution time and zero external API dependencies.
          </p>
        </div>
      </div>
    </div>
  );
}
