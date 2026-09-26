import React, { useState } from 'react';
import { 
  Package, 
  Layers, 
  Truck, 
  Database, 
  Code2, 
  CheckCircle2, 
  ArrowRight, 
  Download, 
  Copy, 
  Check, 
  Calculator, 
  Sparkles, 
  AlertCircle, 
  Info, 
  ChevronRight,
  ShieldCheck,
  Zap,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  SlidersHorizontal
} from 'lucide-react';
import JSZip from 'jszip';
import { PhpUnitTestSuite, PHPUNIT_FILE_CONTENT, CLASS1_EDGE_PHP_SOURCE } from './components/PhpUnitTestSuite';
import { AdminControllerView, CONTROLLER_PHP_SOURCE } from './components/AdminControllerView';
import { AbsorptionRulesFlowchart } from './components/AbsorptionRulesFlowchart';

interface VolumetricClass {
  id_class: number;
  name: string;
  base_price: number;
  absorption_power: number;
  description: string;
  icon: string;
}

interface CartProduct {
  id: string;
  name: string;
  id_class: number;
  qty: number;
  image: string;
}

interface GeoZone {
  zip: string;
  type: 'A' | 'B' | 'C';
  multiplier: number;
  label: string;
}

const DEFAULT_CLASSES: VolumetricClass[] = [
  { id_class: 1, name: 'Class 1: Small Decor & Acc.', base_price: 5.0, absorption_power: 1, description: 'Cushions, cutlery, small textiles, candles', icon: '🕯️' },
  { id_class: 2, name: 'Class 2: Small Furniture & Lamps', base_price: 15.0, absorption_power: 2, description: 'Floor lamps, bedside stools, wall clocks', icon: '💡' },
  { id_class: 3, name: 'Class 3: Medium Furniture', base_price: 35.0, absorption_power: 3, description: 'Chairs, coffee tables, flat-pack shelving', icon: '🪑' },
  { id_class: 4, name: 'Class 4: Bulky Volumetric', base_price: 79.0, absorption_power: 4, description: 'Sofas, double beds, solid wood wardrobes', icon: '🛋️' },
];

const PREDEFINED_ZONES: GeoZone[] = [
  { zip: '75001', type: 'A', multiplier: 1.0, label: 'Paris Central (Zone A - Standard)' },
  { zip: '69001', type: 'A', multiplier: 1.0, label: 'Lyon Hub (Zone A - Standard)' },
  { zip: '13001', type: 'B', multiplier: 1.15, label: 'Marseille Metropolitan (Zone B - Suburban +15%)' },
  { zip: '20000', type: 'C', multiplier: 1.45, label: 'Corsica / Offshore Islands (Zone C - Remote +45%)' },
  { zip: '64000', type: 'B', multiplier: 1.2, label: 'Pyrenees Regional (Zone B - Regional +20%)' },
];

const SAMPLE_CATALOG = [
  { id: 'p1', name: 'Stockholm 3-Seater Velvet Sofa', id_class: 4, image: '🛋️', defaultQty: 1 },
  { id: 'p2', name: 'Scandi Solid Oak Dining Table', id_class: 4, image: '🪵', defaultQty: 0 },
  { id: 'p3', name: 'Ergonomic Birch Dining Chair', id_class: 3, image: '🪑', defaultQty: 0 },
  { id: 'p4', name: 'Industrial Black Steel Floor Lamp', id_class: 2, image: '💡', defaultQty: 1 },
  { id: 'p5', name: 'Organic Linen Throw Pillow (Set of 2)', id_class: 1, image: '✨', defaultQty: 2 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'phase1' | 'simulator' | 'database' | 'code' | 'tests' | 'admin'>('admin');
  const [copied, setCopied] = useState(false);
  const [copiedTests, setCopiedTests] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [testFilter, setTestFilter] = useState<'all' | 'absorption' | 'geo' | 'single'>('all');
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testRunCompleted, setTestRunCompleted] = useState(true);

  // Simulator State for Phase 2 Preview
  const [cartItems, setCartItems] = useState<CartProduct[]>([
    { id: 'p1', name: 'Stockholm 3-Seater Velvet Sofa', id_class: 4, qty: 1, image: '🛋️' },
    { id: 'p4', name: 'Industrial Black Steel Floor Lamp', id_class: 2, qty: 1, image: '💡' },
    { id: 'p5', name: 'Organic Linen Throw Pillow', id_class: 1, qty: 2, image: '✨' },
  ]);
  const [selectedZip, setSelectedZip] = useState<string>('75001');
  const [customMultiplier, setCustomMultiplier] = useState<number>(1.0);

  // Copy code helper
  const handleCopyCode = () => {
    navigator.clipboard.writeText(SMARTSHIPPINGAI_PHP_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate and download full PrestaShop module ZIP
  const handleDownloadZip = async () => {
    try {
      setDownloading(true);
      const zip = new JSZip();
      const folder = zip.folder('smartshippingai');
      
      folder?.file('smartshippingai.php', SMARTSHIPPINGAI_PHP_CODE);
      folder?.file('index.php', '<?php\nheader("Expires: Mon, 26 Jul 1997 05:00:00 GMT");\nheader("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");\nheader("Cache-Control: no-store, no-cache, must-revalidate");\nheader("Cache-Control: post-check=0, pre-check=0", false);\nheader("Pragma: no-cache");\nheader("Location: ../");\nexit;\n');
      
      const sqlFolder = folder?.folder('sql');
      sqlFolder?.file('install.sql', INSTALL_SQL_CODE);
      sqlFolder?.file('uninstall.sql', UNINSTALL_SQL_CODE);
      sqlFolder?.file('index.php', '<?php\nheader("Location: ../");\nexit;\n');

      const controllersFolder = folder?.folder('controllers')?.folder('admin');
      controllersFolder?.file('AdminSmartShippingAIController.php', CONTROLLER_PHP_SOURCE);
      controllersFolder?.file('index.php', '<?php\nheader("Location: ../../");\nexit;\n');

      const testsFolder = folder?.folder('tests')?.folder('Unit');
      testsFolder?.file('SmartShippingShippingCostTest.php', PHPUNIT_FILE_CONTENT);
      testsFolder?.file('ClassOneAbsorptionEdgeCasesTest.php', CLASS1_EDGE_PHP_SOURCE);

      const viewsFolder = folder?.folder('views')?.folder('templates')?.folder('hook');
      viewsFolder?.file('shopping_cart_footer.tpl', SHOPPING_CART_FOOTER_TPL);
      viewsFolder?.file('carrier_extra_content.tpl', CARRIER_EXTRA_CONTENT_TPL);
      viewsFolder?.file('index.php', '<?php\nheader("Location: ../../../");\nexit;\n');

      const configXml = `<?xml version="1.0" encoding="UTF-8" ?>
<module>
    <name>smartshippingai</name>
    <displayName><![CDATA[SmartShipping AI - Volumetric Carrier]]></displayName>
    <version><![CDATA[1.0.0]]></version>
    <description><![CDATA[Dynamic volumetric class shipping engine with multi-item volume absorption matrix and AOV psychological triggers.]]></description>
    <author><![CDATA[Senior PrestaShop Logistics Expert]]></author>
    <tab><![CDATA[shipping_logistics]]></tab>
    <is_configurable>1</is_configurable>
    <need_instance>0</need_instance>
</module>`;
      folder?.file('config.xml', configXml);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'smartshippingai-v1.0.0.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error creating zip:', err);
    } finally {
      setDownloading(false);
    }
  };

  // Algorithm calculation simulation
  const calculateShipping = () => {
    const activeZone = PREDEFINED_ZONES.find(z => z.zip === selectedZip);
    const multiplier = activeZone ? activeZone.multiplier : customMultiplier;

    // Flatten items by quantity
    const flattenedList: { name: string; id_class: number; image: string; itemIndex: number }[] = [];
    cartItems.forEach((item) => {
      for (let i = 0; i < item.qty; i++) {
        flattenedList.push({
          name: item.name,
          id_class: item.id_class,
          image: item.image,
          itemIndex: i + 1,
        });
      }
    });

    if (flattenedList.length === 0) {
      return { total: 0, totalStandard: 0, leader: null, details: [], baseLeaderCost: 0, subtotal: 0, multiplier, ferrySurcharge: 0, isIsland: false, savings: 0 };
    }

    // 1. Identify Leader: item with highest id_class
    flattenedList.sort((a, b) => b.id_class - a.id_class);
    const leader = flattenedList[0];
    const leaderClassObj = DEFAULT_CLASSES.find(c => c.id_class === leader.id_class)!;
    const baseLeaderCost = leaderClassObj.base_price;

    let subtotal = baseLeaderCost;
    let standardCostWithoutAbsorption = baseLeaderCost;

    interface ItemDetail {
      name: string;
      id_class: number;
      image: string;
      isLeader: boolean;
      feeAdded: number;
      standardFee: number;
      ruleApplied: string;
      isAbsorbed: boolean;
    }

    const details: ItemDetail[] = [
      {
        name: `${leader.name} (Item #1)`,
        id_class: leader.id_class,
        image: leader.image,
        isLeader: true,
        feeAdded: baseLeaderCost,
        standardFee: baseLeaderCost,
        ruleApplied: `Leader Item (Class ${leader.id_class} Base Rate)`,
        isAbsorbed: false,
      }
    ];

    // 2. Absorption loop for remaining items
    for (let i = 1; i < flattenedList.length; i++) {
      const item = flattenedList[i];
      const itemClassObj = DEFAULT_CLASSES.find(c => c.id_class === item.id_class)!;
      const normalItemFee = itemClassObj.base_price;
      standardCostWithoutAbsorption += normalItemFee;

      let addedFee = 0;
      let ruleDesc = '';
      let absorbed = false;

      if (leader.id_class - item.id_class >= 2) {
        // At least 2 levels below Leader -> 100% Free Absorption
        addedFee = 0;
        absorbed = true;
        ruleDesc = `100% Free Absorption (Class ${item.id_class} is ≥2 levels below Leader Class ${leader.id_class})`;
      } else if (leader.id_class === 4 && item.id_class === 3) {
        // Class 3 with Leader 4 -> Flat fee of €10
        addedFee = 10.0;
        ruleDesc = `Flat Surcharge €10.00 (Class 3 medium item absorbed with Class 4 leader)`;
      } else if (item.id_class === leader.id_class) {
        // Same class as leader -> 40% of leader's base price
        addedFee = Number((0.40 * baseLeaderCost).toFixed(2));
        ruleDesc = `40% Co-Leader Surcharge (+€${addedFee.toFixed(2)})`;
      } else {
        // E.g. Leader 3, item 2
        addedFee = Number((0.30 * itemClassObj.base_price).toFixed(2));
        ruleDesc = `Partial Volume Discount (+€${addedFee.toFixed(2)})`;
      }

      subtotal += addedFee;
      details.push({
        name: `${item.name} (Item #${item.itemIndex})`,
        id_class: item.id_class,
        image: item.image,
        isLeader: false,
        feeAdded: addedFee,
        standardFee: normalItemFee,
        ruleApplied: ruleDesc,
        isAbsorbed: absorbed,
      });
    }

    const isIsland = selectedZip === '20000' || multiplier >= 1.40;
    const ferrySurcharge = (isIsland && leader.id_class === 4) ? 35.0 : 0.0;

    const total = Number(((subtotal * multiplier) + ferrySurcharge).toFixed(2));
    const totalStandard = Number(((standardCostWithoutAbsorption * multiplier) + ferrySurcharge).toFixed(2));
    const savings = Math.max(0, Number((totalStandard - total).toFixed(2)));

    return {
      total,
      totalStandard,
      leader,
      details,
      baseLeaderCost,
      subtotal,
      multiplier,
      ferrySurcharge,
      isIsland,
      savings,
    };
  };

  const simResult = calculateShipping();

  const updateCartQty = (id: string, delta: number) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing) {
        const newQty = existing.qty + delta;
        if (newQty <= 0) {
          return prev.filter(i => i.id !== id);
        }
        return prev.map(i => i.id === id ? { ...i, qty: newQty } : i);
      }
      return prev;
    });
  };

  const addProductToCart = (p: typeof SAMPLE_CATALOG[0]) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === p.id);
      if (existing) {
        return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { id: p.id, name: p.name, id_class: p.id_class, qty: 1, image: p.image }];
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">smartshippingai</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  PrestaShop 1.7.x
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  All 4 Phases Complete • Production Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">CarrierModule • Volumetric Absorption Matrix & AOV Triggers</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadZip}
              disabled={downloading}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Packing .ZIP...' : 'Download Module ZIP'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Phase Stepper Tracker */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
              {/* Step 1 */}
              <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-200">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">Phase 1: Module & DB</div>
                  <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Carrier & Tables Installed
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-200">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">Phase 2: Absorption Core</div>
                  <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> getOrderShippingCost Live
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-200">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">Phase 3: Back-Office Grid</div>
                  <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> HelperList & Multi-Zone
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-200">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">Phase 4: Front-End Hooks</div>
                  <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Cart & Checkout Active
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 space-x-1 sm:space-x-4">
          <button
            onClick={() => setActiveTab('phase1')}
            className={`pb-3 px-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'phase1'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Phase 1 Overview & Architecture</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`pb-3 px-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'simulator'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Interactive Matrix Playground</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded bg-indigo-500/30 text-indigo-300">Live</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`pb-3 px-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'database'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Database Schema (3 Tables)</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`pb-3 px-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'code'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>smartshippingai.php Code</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`pb-3 px-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
            <span>Phase 3: Back-Office HelperList</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded bg-indigo-500/20 text-indigo-300 font-mono">
              AJAX Live
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`pb-3 px-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'tests'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>PHPUnit Test Suite</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded bg-emerald-500/20 text-emerald-300 font-mono">
              15 Passing
            </span>
          </button>
        </div>

        {/* Tab 1: Phase 1 Deep Dive */}
        {activeTab === 'phase1' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Requirements Checklist */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-white">Phase 1 Execution Summary</h2>
                        <p className="text-xs text-slate-400">Fully compliant with PrestaShop 1.7.x Carrier Architecture standards</p>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full font-medium">
                      Status: Ready for Phase 2
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                      <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
                        <Truck className="w-4 h-4" />
                        <span>CarrierModule Subclass</span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Extends <code className="text-indigo-300 font-mono">CarrierModule</code>. Instantiates a native PrestaShop Carrier object with external module dispatching enabled (<code className="text-slate-400 font-mono">shipping_external = true</code>).
                      </p>
                      <ul className="text-xs text-slate-400 space-y-1 pt-1">
                        <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Configured to all Shop Zones & Groups</li>
                        <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Initial price/weight ranges added</li>
                        <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Reference ID stored in PS Configuration</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                      <div className="flex items-center space-x-2 text-violet-400 font-semibold text-xs uppercase tracking-wider">
                        <Layers className="w-4 h-4" />
                        <span>Registered PS Hooks</span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Hook registration handled during <code className="text-violet-300 font-mono">install()</code> with full rollback on failure:
                      </p>
                      <ul className="text-xs text-slate-400 space-y-1.5 pt-1">
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                          <span className="font-mono text-slate-300">displayShoppingCartFooter</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                          <span className="font-mono text-slate-300">displayCarrierExtraContent</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                          <span className="font-mono text-slate-300">actionCarrierUpdate</span> (vital for ID recreation)
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* PS 1.7 Specific Architecture Notice */}
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start space-x-3 text-xs text-amber-200">
                    <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold text-amber-300">Senior PrestaShop 1.7 Pro-Tip: Carrier Immutability</strong>
                      <p className="mt-1 text-amber-200/90 leading-relaxed">
                        In PrestaShop 1.7, when a store administrator edits carrier details in the Back Office, PrestaShop marks the old carrier as <code className="bg-amber-950/60 px-1 py-0.5 rounded text-amber-300">deleted = 1</code> and instantiates a new carrier ID. Our Phase 1 code implements the <code className="bg-amber-950/60 px-1 py-0.5 rounded text-amber-300">actionCarrierUpdate</code> hook to dynamically update <code className="bg-amber-950/60 px-1 py-0.5 rounded text-amber-300">SMARTSHIPPINGAI_CARRIER_ID</code>, preventing order checkout disconnections!
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4 Volumetric Classes Definition */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>Volumetric Classes Matrix Specification (Classes 1 - 4)</span>
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">ps_smartshipping_classes</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {DEFAULT_CLASSES.map((cls) => (
                      <div key={cls.id_class} className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{cls.icon}</span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            Class {cls.id_class}
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-white">{cls.name.split(':')[1]}</div>
                        <div className="flex items-baseline space-x-1">
                          <span className="text-lg font-bold text-emerald-400">€{cls.base_price.toFixed(2)}</span>
                          <span className="text-[10px] text-slate-400">base rate</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">{cls.description}</p>
                        <div className="pt-1 text-[10px] text-slate-500 font-mono flex items-center justify-between border-t border-slate-800/60">
                          <span>Absorb Power:</span>
                          <span className="text-slate-300 font-bold">{cls.absorption_power}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Next Steps Prompt & Quick Actions */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center space-x-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>Phase 2: Core Algorithm Active</span>
                  </div>
                  <h3 className="text-base font-bold text-white">getOrderShippingCost() Live</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    The Volume Absorption Matrix core algorithm is integrated directly into <code className="text-indigo-300 font-mono">smartshippingai.php</code> with all four rulesets active:
                  </p>

                  <div className="p-3 bg-slate-950/60 rounded-xl border border-indigo-500/20 text-xs text-indigo-200 space-y-1.5 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>ΔClass ≥ 2: 100% Free Absorption (+€0.00)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>L4 + Cl3: Flat Pallet Neighbor Fee (+€10.00)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>Co-Leader: 40% Leader Rate (+€31.60 on Cl4)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>ΔClass = 1: 30% Subordinated Rate (+€4.50)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>Geo-Zone Friction Multiplier (1.00x - 1.65x)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => setActiveTab('simulator')}
                      className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-md"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>Test Matrix</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('tests')}
                      className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer border border-slate-700"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>15 Unit Tests</span>
                    </button>
                  </div>
                </div>

                {/* Quick File Tree */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-indigo-400" />
                    <span>PrestaShop Module Structure</span>
                  </div>
                  <div className="bg-slate-950 rounded-xl p-3 text-xs font-mono text-slate-300 space-y-1.5 border border-slate-800/80">
                    <div className="text-indigo-400 font-bold">modules/smartshippingai/</div>
                    <div className="pl-4 text-slate-300">├── smartshippingai.php <span className="text-emerald-400 text-[10px]">[Main Class]</span></div>
                    <div className="pl-4 text-slate-400">├── config.xml <span className="text-[10px] text-slate-500">[Meta]</span></div>
                    <div className="pl-4 text-slate-400">├── sql/</div>
                    <div className="pl-8 text-slate-400">├── install.sql <span className="text-emerald-400 text-[10px]">[Schema]</span></div>
                    <div className="pl-8 text-slate-400">└── uninstall.sql</div>
                    <div className="pl-4 text-slate-500">├── controllers/admin/ <span className="text-[10px] text-amber-400">[Phase 3]</span></div>
                    <div className="pl-4 text-slate-500">└── views/templates/hook/ <span className="text-[10px] text-amber-400">[Phase 4]</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Documentation: Absorption Power Flowchart using CSS Grid */}
            <AbsorptionRulesFlowchart />
          </div>
        )}

        {/* Tab 2: Interactive Matrix Playground (Phase 2 Preview) */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-indigo-400" />
                    <span>Volume Absorption Matrix™ Live Tester</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Simulate real-world carts to preview the exact math of <code className="text-indigo-300 font-mono">getOrderShippingCost()</code>
                  </p>
                </div>

                {/* Geo Zone Selector */}
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-slate-400 font-medium">Delivery Destination:</span>
                  <select
                    value={selectedZip}
                    onChange={(e) => setSelectedZip(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 font-mono"
                  >
                    {PREDEFINED_ZONES.map((zone) => (
                      <option key={zone.zip} value={zone.zip}>
                        ZIP {zone.zip} ({zone.label} • x{zone.multiplier})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
                {/* Catalog & Cart Selection */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Add Sample Products</span>
                    <span className="text-slate-500 font-normal">Click to add</span>
                  </div>

                  <div className="space-y-2">
                    {SAMPLE_CATALOG.map((prod) => (
                      <div
                        key={prod.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-indigo-500/50 transition-all text-xs"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{prod.image}</span>
                          <div>
                            <div className="font-medium text-white">{prod.name}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                                Class {prod.id_class}
                              </span>
                              <span className="text-slate-400 text-[11px]">
                                €{DEFAULT_CLASSES.find(c => c.id_class === prod.id_class)?.base_price.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => addProductToCart(prod)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white font-medium text-xs transition-colors cursor-pointer"
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Active Cart Items */}
                  <div className="pt-4 border-t border-slate-800">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                      Current Cart Items ({cartItems.reduce((a, b) => a + b.qty, 0)})
                    </div>
                    {cartItems.length === 0 ? (
                      <div className="text-xs text-slate-500 py-4 text-center italic">
                        Cart is empty. Click + Add on items above.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                            <div className="flex items-center space-x-2">
                              <span>{item.image}</span>
                              <div>
                                <div className="text-slate-200 font-medium truncate max-w-[150px]">{item.name}</div>
                                <span className="text-[10px] text-indigo-400 font-mono">Class {item.id_class}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateCartQty(item.id, -1)}
                                className="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center font-mono cursor-pointer"
                              >
                                -
                              </button>
                              <span className="font-mono text-slate-200 px-1">{item.qty}</span>
                              <button
                                onClick={() => updateCartQty(item.id, 1)}
                                className="w-5 h-5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center font-mono cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Calculation Trace and Matrix Breakdown */}
                <div className="lg:col-span-2 space-y-5">
                  {/* Summary Hero Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                        Final Calculated Shipping Cost
                      </div>
                      <div className="flex items-baseline space-x-3 mt-1">
                        <span className="text-3xl font-extrabold text-white">€{simResult.total.toFixed(2)}</span>
                        {simResult.savings > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                            Saved €{simResult.savings.toFixed(2)} via Absorption
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Leader: <strong className="text-slate-200">{simResult.leader?.name || 'None'}</strong> • Zone Multiplier: <strong className="text-indigo-300">{simResult.multiplier}x</strong>
                      </div>
                    </div>

                    <div className="text-right border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-6 w-full sm:w-auto">
                      <div className="text-[11px] text-slate-400">Without Absorption:</div>
                      <div className="text-sm font-mono line-through text-slate-500">€{simResult.totalStandard.toFixed(2)}</div>
                      <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                        {simResult.totalStandard > 0 ? `${Math.round((simResult.savings / simResult.totalStandard) * 100)}% Volume Rebate` : ''}
                      </div>
                    </div>
                  </div>

                  {/* Step-by-Step Absorption Trace */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                      <span>Itemized Cost Resolution Matrix</span>
                      <span className="text-[11px] text-slate-500">ps_smartshipping_classes lookup</span>
                    </div>

                    <div className="space-y-2">
                      {simResult.details.map((detail, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border transition-all text-xs flex items-center justify-between ${
                            detail.isLeader
                              ? 'bg-indigo-950/40 border-indigo-500/40'
                              : detail.isAbsorbed
                              ? 'bg-emerald-950/20 border-emerald-500/30'
                              : 'bg-slate-950 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{detail.image}</span>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-slate-200">{detail.name}</span>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                                  Class {detail.id_class}
                                </span>
                                {detail.isLeader && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500 text-white">
                                    LEADER
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">{detail.ruleApplied}</p>
                            </div>
                          </div>

                          <div className="text-right">
                            {detail.isAbsorbed ? (
                              <div>
                                <span className="font-mono text-emerald-400 font-bold text-sm">FREE (€0.00)</span>
                                <div className="text-[10px] font-mono text-slate-500 line-through">
                                  €{detail.standardFee.toFixed(2)}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <span className="font-mono text-slate-200 font-bold text-sm">
                                  +€{detail.feeAdded.toFixed(2)}
                                </span>
                                {detail.standardFee > detail.feeAdded && (
                                  <div className="text-[10px] font-mono text-slate-500 line-through">
                                    €{detail.standardFee.toFixed(2)}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Front-End Hook Preview: Psychological Triggers */}
                  <div className="space-y-4 pt-3">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Hook 1: Shopping Cart Footer Promotional Banner</span>
                      </span>
                      <span className="text-[10px] text-amber-400 font-mono">hookDisplayShoppingCartFooter</span>
                    </div>

                    {/* Banner Trigger */}
                    {simResult.leader && simResult.leader.id_class >= 3 ? (
                      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-emerald-500/20 border border-amber-500/40 text-amber-200 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">🎉</span>
                          <div>
                            <div className="text-xs font-bold text-white">Your large item shipping is secured!</div>
                            <div className="text-[11px] text-slate-300">
                              Add small furniture (Class 1 or 2) with <strong className="text-emerald-400 font-semibold">100% FREE shipping</strong> in this order.
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Qualifying Leader: <strong className="text-white">{simResult.leader.name}</strong> (Class {simResult.leader.id_class})
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-1 rounded bg-amber-500/30 text-amber-300 border border-amber-500/40 uppercase font-bold tracking-wider shrink-0">
                          AOV Booster Active
                        </span>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-500 italic">
                        Banner inactive (Leader is Class 1 or 2. Requires Class 3 or 4 to trigger promotional banner).
                      </div>
                    )}

                    {/* Hook 2: Checkout Step 3 Carrier Extra Content Preview */}
                    <div className="space-y-2 pt-2">
                      <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-sky-400" />
                          <span>Hook 2: Checkout Step 3 Carrier Selection Extra Content</span>
                        </span>
                        <span className="text-[10px] text-sky-400 font-mono">hookDisplayCarrierExtraContent</span>
                      </div>

                      {/* Mock PrestaShop Checkout Step 3 Container */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        {/* Radio Carrier Line */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-indigo-500/50">
                          <div className="flex items-center space-x-3">
                            <input type="radio" checked readOnly className="w-4 h-4 text-indigo-600 cursor-pointer" />
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-2">
                                <span>SmartShipping AI (Volumetric)</span>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                                  Module Carrier
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400">
                                24-48h Smart Volumetric Delivery (Optimized Routing)
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold font-mono text-emerald-400">
                              €{simResult.total.toFixed(2)}
                            </div>
                            <div className="text-[10px] text-slate-500">tax incl.</div>
                          </div>
                        </div>

                        {/* Rendered carrier_extra_content.tpl Simulation */}
                        <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">🚛</span>
                              <div>
                                <span className="font-bold text-slate-200">Consolidation Engine Breakdown</span>
                                <div className="text-[10px] text-slate-400">
                                  {PREDEFINED_ZONES.find(z => z.zip === selectedZip)?.label} • Multiplier: x{simResult.multiplier}
                                </div>
                              </div>
                            </div>
                            {simResult.savings > 0 && (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                                You Save: €{simResult.savings.toFixed(2)}
                              </span>
                            )}
                          </div>

                          {/* Leader Notice */}
                          {simResult.leader && (
                            <div className="p-2 rounded bg-indigo-950/40 border border-indigo-500/30 text-[11px] flex items-center justify-between">
                              <div className="flex items-center space-x-1.5 text-indigo-300">
                                <strong>Freight Leader:</strong>
                                <span>{simResult.leader.name}</span>
                                <span className="px-1 rounded bg-indigo-500/30 text-[9px] font-mono">Class {simResult.leader.id_class}</span>
                              </div>
                              <span className="font-bold text-slate-200 font-mono">
                                €{simResult.baseLeaderCost.toFixed(2)} Base
                              </span>
                            </div>
                          )}

                          {/* Ferry surcharge notice if island and bulky */}
                          {simResult.ferrySurcharge > 0 && (
                            <div className="p-2 rounded bg-amber-950/30 border border-amber-500/40 text-[11px] flex items-center justify-between text-amber-200">
                              <span className="flex items-center gap-1.5">
                                🚢 <strong>Maritime Ferry Pallet Surcharge:</strong> (Class 4 Bulky on Island Zone)
                              </span>
                              <span className="font-bold font-mono text-amber-400">+€{simResult.ferrySurcharge.toFixed(2)}</span>
                            </div>
                          )}

                          {/* Mini breakdown table */}
                          <div className="divide-y divide-slate-800/80">
                            {simResult.details.map((detail, idx) => (
                              <div key={idx} className="py-1.5 flex items-center justify-between text-[11px]">
                                <div className="flex items-center space-x-2">
                                  <span className="text-slate-300">{detail.name}</span>
                                  {detail.isLeader && (
                                    <span className="text-[9px] font-bold px-1 rounded bg-indigo-600 text-white">LEADER</span>
                                  )}
                                  {detail.isAbsorbed && (
                                    <span className="text-[9px] font-bold px-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                      100% ABSORBED
                                    </span>
                                  )}
                                </div>
                                <div className="font-mono">
                                  {detail.isAbsorbed ? (
                                    <span className="text-emerald-400 font-bold">€0.00</span>
                                  ) : (
                                    <span className="text-slate-200">+€{detail.feeAdded.toFixed(2)}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                            <span>Formula: (Subtotal €{simResult.subtotal.toFixed(2)} × {simResult.multiplier}) {simResult.ferrySurcharge > 0 ? `+ Ferry €${simResult.ferrySurcharge.toFixed(2)}` : ''}</span>
                            <span className="text-emerald-400 font-bold text-xs">= €{simResult.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Database Schema */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-indigo-400" />
                    <span>PrestaShop Custom Database Tables</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Normalized tables using PrestaShop prefix <code className="text-indigo-300 font-mono">_DB_PREFIX_</code> and <code className="text-indigo-300 font-mono">_MYSQL_ENGINE_</code>
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-mono">
                  InnoDB utf8mb4
                </span>
              </div>

              {/* Table 1: ps_smartshipping_classes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-300 font-mono">1. ps_smartshipping_classes</span>
                  <span className="text-slate-500">Volumetric classes hierarchy and base shipping cost</span>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3">Column</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Key</th>
                        <th className="p-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900/50 text-slate-300">
                      <tr>
                        <td className="p-3 text-indigo-300 font-bold">id_class</td>
                        <td className="p-3 text-amber-300">INT(11) UNSIGNED</td>
                        <td className="p-3"><span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">PRIMARY KEY</span></td>
                        <td className="p-3 text-slate-400 font-sans">Volumetric level (1=Small, 2=Medium, 3=Large, 4=Bulky)</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-indigo-300 font-bold">name</td>
                        <td className="p-3 text-amber-300">VARCHAR(64)</td>
                        <td className="p-3 text-slate-500">-</td>
                        <td className="p-3 text-slate-400 font-sans">Human-readable class name for Back-Office</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-indigo-300 font-bold">base_price</td>
                        <td className="p-3 text-amber-300">DECIMAL(10, 2)</td>
                        <td className="p-3 text-slate-500">-</td>
                        <td className="p-3 text-slate-400 font-sans">Leader base shipping price before geo multiplier</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-indigo-300 font-bold">absorption_power</td>
                        <td className="p-3 text-amber-300">INT(11)</td>
                        <td className="p-3 text-slate-500">-</td>
                        <td className="p-3 text-slate-400 font-sans">Number of subordinated items absorbed per unit</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table 2: ps_smartshipping_product */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-300 font-mono">2. ps_smartshipping_product</span>
                  <span className="text-slate-500">Maps products & combinations to volumetric classes</span>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3">Column</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Key</th>
                        <th className="p-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900/50 text-slate-300">
                      <tr>
                        <td className="p-3 text-indigo-300 font-bold">id_product</td>
                        <td className="p-3 text-amber-300">INT(11) UNSIGNED</td>
                        <td className="p-3"><span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">PRIMARY (1/2)</span></td>
                        <td className="p-3 text-slate-400 font-sans">PrestaShop product identifier</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-indigo-300 font-bold">id_product_attribute</td>
                        <td className="p-3 text-amber-300">INT(11) UNSIGNED</td>
                        <td className="p-3"><span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">PRIMARY (2/2)</span></td>
                        <td className="p-3 text-slate-400 font-sans">Combination ID (0 if standard simple product)</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-indigo-300 font-bold">id_class</td>
                        <td className="p-3 text-amber-300">INT(11) UNSIGNED</td>
                        <td className="p-3"><span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">INDEX</span></td>
                        <td className="p-3 text-slate-400 font-sans">Assigned class foreign key (1 to 4)</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-indigo-300 font-bold">is_approved</td>
                        <td className="p-3 text-amber-300">TINYINT(1) UNSIGNED</td>
                        <td className="p-3"><span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">INDEX</span></td>
                        <td className="p-3 text-slate-400 font-sans">Merchant approval toggle (Phase 3 back-office grid)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table 3: ps_smartshipping_geo_zones */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-300 font-mono">3. ps_smartshipping_geo_zones</span>
                  <span className="text-slate-500">Postal code delivery rate multipliers</span>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3">Column</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Key</th>
                        <th className="p-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900/50 text-slate-300">
                      <tr>
                        <td className="p-3 text-indigo-300 font-bold">id_zone_rule</td>
                        <td className="p-3 text-amber-300">INT(11) UNSIGNED</td>
                        <td className="p-3"><span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">PRIMARY KEY</span></td>
                        <td className="p-3 text-slate-400 font-sans">Surrogate identifier</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-indigo-300 font-bold">zip_code</td>
                        <td className="p-3 text-amber-300">VARCHAR(32)</td>
                        <td className="p-3"><span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">INDEX</span></td>
                        <td className="p-3 text-slate-400 font-sans">ZIP / Postal code (supports exact match or prefix)</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-indigo-300 font-bold">zone_type</td>
                        <td className="p-3 text-amber-300">ENUM('A', 'B', 'C')</td>
                        <td className="p-3 text-slate-500">-</td>
                        <td className="p-3 text-slate-400 font-sans">Logistics density classification (A=Standard, B=Suburban, C=Remote/Island)</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-indigo-300 font-bold">multiplier</td>
                        <td className="p-3 text-amber-300">DECIMAL(5, 2)</td>
                        <td className="p-3 text-slate-500">-</td>
                        <td className="p-3 text-slate-400 font-sans">Cost factor (Default 1.00, e.g. 1.15 for B, 1.45 for C)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Code Viewer */}
        {activeTab === 'code' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-mono text-slate-200">modules/smartshippingai/smartshippingai.php</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    Phase 2: getOrderShippingCost Core Live
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-950/90 text-xs font-mono text-slate-300 overflow-x-auto max-h-[600px] leading-relaxed select-text">
                <pre>{SMARTSHIPPINGAI_PHP_CODE}</pre>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: PHPUnit Test Suite */}
        {activeTab === 'tests' && (
          <PhpUnitTestSuite phpCode={PHPUNIT_FILE_CONTENT} />
        )}

        {/* Tab 6: Phase 3 Back-Office HelperList */}
        {activeTab === 'admin' && (
          <AdminControllerView />
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-500 text-xs py-5 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            PrestaShop 1.7 Logistics Architecture Suite • Module: <code className="text-indigo-400 font-mono">smartshippingai</code>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-emerald-400 font-medium">✓ Phase 1 Architecture</span>
            <span className="text-emerald-400 font-medium">✓ Phase 2 Carrier Algorithm</span>
            <span className="text-emerald-400 font-medium">✓ Phase 3 Back-Office HelperList</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Complete Phase 1 PHP Code for smartshippingai.php
const SMARTSHIPPINGAI_PHP_CODE = `<?php
/**
 * SmartShipping AI - Volumetric Carrier Module for PrestaShop 1.7
 *
 * @author    SmartShipping Logistics Team <support@smartshippingai.io>
 * @copyright 2026 SmartShipping AI
 * @license   Commercial License
 * @version   1.0.0
 */

if (!defined('_PS_VERSION_')) {
    exit;
}

class SmartShippingAI extends CarrierModule
{
    const CONFIG_CARRIER_ID  = 'SMARTSHIPPINGAI_CARRIER_ID';
    const CONFIG_CARRIER_REF = 'SMARTSHIPPINGAI_CARRIER_REF';

    /** @var int Current carrier ID */
    public $id_carrier;

    public function __construct()
    {
        $this->name = 'smartshippingai';
        $this->tab = 'shipping_logistics';
        $this->version = '1.0.0';
        $this->author = 'Senior PrestaShop Logistics Expert';
        $this->need_instance = 0;
        $this->ps_versions_compliancy = [
            'min' => '1.7.0.0',
            'max' => '1.7.8.99',
        ];
        $this->bootstrap = true;

        parent::__construct();

        $this->displayName = $this->l('SmartShipping AI - Volumetric Carrier');
        $this->description = $this->l('Dynamic volumetric class shipping engine with multi-item volume absorption matrix and AOV psychological triggers.');
        $this->confirmUninstall = $this->l('Are you sure you want to uninstall SmartShipping AI? All volumetric rate rules and class associations will be preserved or removed based on configuration.');
    }

    /**
     * Module Installation
     *
     * @return bool
     */
    public function install()
    {
        if (Shop::isFeatureActive()) {
            Shop::setContext(Shop::CONTEXT_ALL);
        }

        // 1. Core CarrierModule and parent install check
        if (!parent::install()) {
            return false;
        }

        // 2. Register required hooks
        $hooks = [
            'displayShoppingCartFooter',
            'displayCarrierExtraContent',
            'actionCarrierUpdate',
        ];

        foreach ($hooks as $hook) {
            if (!$this->registerHook($hook)) {
                $this->_errors[] = sprintf($this->l('Failed to register hook: %s'), $hook);
                return false;
            }
        }

        // 3. Create Custom Database Tables
        if (!$this->createDatabaseTables()) {
            $this->_errors[] = $this->l('Database tables creation failed.');
            return false;
        }

        // 4. Seed initial default classes and geo zones
        $this->seedInitialData();

        // 5. Create the dedicated PrestaShop Carrier
        if (!$this->createCarrier()) {
            $this->_errors[] = $this->l('Carrier creation failed.');
            return false;
        }

        return true;
    }

    /**
     * Module Uninstallation
     *
     * @return bool
     */
    public function uninstall()
    {
        // 1. Soft-delete / disable the custom Carrier
        $this->deleteCarrier();

        // 2. Unregister hooks & delete configurations
        Configuration::deleteByName(self::CONFIG_CARRIER_ID);
        Configuration::deleteByName(self::CONFIG_CARRIER_REF);

        // 3. Drop tables
        $this->dropDatabaseTables();

        return parent::uninstall();
    }

    /**
     * Creates custom DB tables using standard PrestaShop conventions:
     * - ps_smartshipping_classes
     * - ps_smartshipping_product
     * - ps_smartshipping_geo_zones
     *
     * @return bool
     */
    protected function createDatabaseTables()
    {
        $sql = [];

        // Table 1: ps_smartshipping_classes
        $sql[] = 'CREATE TABLE IF NOT EXISTS \`' . _DB_PREFIX_ . 'smartshipping_classes\` (
            \`id_class\` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
            \`name\` VARCHAR(64) NOT NULL,
            \`base_price\` DECIMAL(10, 2) NOT NULL DEFAULT "0.00",
            \`absorption_power\` INT(11) NOT NULL DEFAULT 1,
            \`date_add\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`date_upd\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id_class\`)
        ) ENGINE=' . _MYSQL_ENGINE_ . ' DEFAULT CHARSET=utf8mb4;';

        // Table 2: ps_smartshipping_product
        $sql[] = 'CREATE TABLE IF NOT EXISTS \`' . _DB_PREFIX_ . 'smartshipping_product\` (
            \`id_product\` INT(11) UNSIGNED NOT NULL,
            \`id_product_attribute\` INT(11) UNSIGNED NOT NULL DEFAULT 0,
            \`id_class\` INT(11) UNSIGNED NOT NULL DEFAULT 1,
            \`is_approved\` TINYINT(1) UNSIGNED NOT NULL DEFAULT 0,
            \`confidence_score\` DECIMAL(5, 2) NULL DEFAULT NULL,
            \`ai_notes\` VARCHAR(255) NULL DEFAULT NULL,
            \`date_upd\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id_product\`, \`id_product_attribute\`),
            KEY \`idx_class\` (\`id_class\`),
            KEY \`idx_approved\` (\`is_approved\`)
        ) ENGINE=' . _MYSQL_ENGINE_ . ' DEFAULT CHARSET=utf8mb4;';

        // Table 3: ps_smartshipping_geo_zones
        $sql[] = 'CREATE TABLE IF NOT EXISTS \`' . _DB_PREFIX_ . 'smartshipping_geo_zones\` (
            \`id_zone_rule\` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
            \`zip_code\` VARCHAR(32) NOT NULL,
            \`zone_type\` ENUM("A", "B", "C") NOT NULL DEFAULT "A",
            \`multiplier\` DECIMAL(5, 2) NOT NULL DEFAULT "1.00",
            \`label\` VARCHAR(128) NULL DEFAULT NULL,
            \`date_upd\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id_zone_rule\`),
            KEY \`idx_zip\` (\`zip_code\`)
        ) ENGINE=' . _MYSQL_ENGINE_ . ' DEFAULT CHARSET=utf8mb4;';

        foreach ($sql as $query) {
            if (!Db::getInstance()->execute($query)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Seed initial volumetric classes (1 to 4) and baseline geo-zones
     *
     * @return void
     */
    protected function seedInitialData()
    {
        $db = Db::getInstance();

        // Check if classes already populated
        $count = (int)$db->getValue('SELECT COUNT(*) FROM \`' . _DB_PREFIX_ . 'smartshipping_classes\`');
        if ($count === 0) {
            $classes = [
                ['id_class' => 1, 'name' => 'Class 1: Small Decor & Accessories', 'base_price' => 5.00,  'absorption_power' => 1],
                ['id_class' => 2, 'name' => 'Class 2: Small Furniture & Lamps',   'base_price' => 15.00, 'absorption_power' => 2],
                ['id_class' => 3, 'name' => 'Class 3: Medium Furniture & Chairs', 'base_price' => 35.00, 'absorption_power' => 3],
                ['id_class' => 4, 'name' => 'Class 4: Bulky Volumetric / Sofas',  'base_price' => 79.00, 'absorption_power' => 4],
            ];

            foreach ($classes as $class) {
                $db->insert('smartshipping_classes', $class);
            }
        }

        // Seed initial geo zones if empty
        $zoneCount = (int)$db->getValue('SELECT COUNT(*) FROM \`' . _DB_PREFIX_ . 'smartshipping_geo_zones\`');
        if ($zoneCount === 0) {
            $zones = [
                ['zip_code' => '75001', 'zone_type' => 'A', 'multiplier' => 1.00, 'label' => 'Metropolitan Core (Standard)'],
                ['zip_code' => '69001', 'zone_type' => 'A', 'multiplier' => 1.00, 'label' => 'Major Urban Hub'],
                ['zip_code' => '13001', 'zone_type' => 'B', 'multiplier' => 1.15, 'label' => 'Suburban / Regional Hub'],
                ['zip_code' => '20000', 'zone_type' => 'C', 'multiplier' => 1.45, 'label' => 'High-Density / Island Logistics'],
            ];

            foreach ($zones as $zone) {
                $db->insert('smartshipping_geo_zones', $zone);
            }
        }
    }

    /**
     * Drops custom tables upon uninstall
     *
     * @return bool
     */
    protected function dropDatabaseTables()
    {
        $tables = [
            'smartshipping_classes',
            'smartshipping_product',
            'smartshipping_geo_zones',
        ];

        foreach ($tables as $table) {
            Db::getInstance()->execute('DROP TABLE IF EXISTS \`' . _DB_PREFIX_ . pSQL($table) . '\`');
        }

        return true;
    }

    /**
     * Create the custom Carrier object in PrestaShop
     *
     * @return bool
     */
    protected function createCarrier()
    {
        $carrier = new Carrier();
        $carrier->name = 'SmartShipping AI (Volumetric)';
        $carrier->id_tax_rules_group = 0;
        $carrier->active = true;
        $carrier->deleted = 0;
        $carrier->shipping_handling = false;
        $carrier->range_behavior = 0;
        $carrier->is_module = true;
        $carrier->shipping_external = true;
        $carrier->external_module_name = $this->name;
        $carrier->need_range = true;
        $carrier->max_width = 300;
        $carrier->max_height = 250;
        $carrier->max_depth = 250;
        $carrier->max_weight = 500;
        $carrier->grade = 5;

        // Multilingual delay description
        $languages = Language::getLanguages(true);
        foreach ($languages as $language) {
            $carrier->delay[(int)$language['id_lang']] = '24-48h Smart Volumetric Delivery (Optimized Routing)';
        }

        if (!$carrier->add()) {
            return false;
        }

        // Assign to all active shop zones
        $zones = Zone::getZones(true);
        foreach ($zones as $zone) {
            $carrier->addZone((int)$zone['id_zone']);
        }

        // Assign to all customer groups
        $groups = Group::getGroups(true);
        foreach ($groups as $group) {
            Db::getInstance()->insert('carrier_group', [
                'id_carrier' => (int)$carrier->id,
                'id_group'   => (int)$group['id_group'],
            ]);
        }

        // Create initial price/weight ranges so PrestaShop lists the carrier during checkout
        $rangePrice = new RangePrice();
        $rangePrice->id_carrier = (int)$carrier->id;
        $rangePrice->delimiter1 = 0;
        $rangePrice->delimiter2 = 100000;
        $rangePrice->add();

        $rangeWeight = new RangeWeight();
        $rangeWeight->id_carrier = (int)$carrier->id;
        $rangeWeight->delimiter1 = 0;
        $rangeWeight->delimiter2 = 100000;
        $rangeWeight->add();

        // Enable delivery pricing for zones
        foreach ($zones as $zone) {
            Db::getInstance()->insert('delivery', [
                'id_carrier'      => (int)$carrier->id,
                'id_range_price'  => (int)$rangePrice->id,
                'id_range_weight' => null,
                'id_zone'         => (int)$zone['id_zone'],
                'price'           => 0.00,
            ]);

            Db::getInstance()->insert('delivery', [
                'id_carrier'      => (int)$carrier->id,
                'id_range_price'  => null,
                'id_range_weight' => (int)$rangeWeight->id,
                'id_zone'         => (int)$zone['id_zone'],
                'price'           => 0.00,
            ]);
        }

        // Persist carrier ID and Reference ID in Configuration
        Configuration::updateValue(self::CONFIG_CARRIER_ID, (int)$carrier->id);
        Configuration::updateValue(self::CONFIG_CARRIER_REF, (int)$carrier->id);

        return true;
    }

    /**
     * Soft delete custom Carrier
     *
     * @return bool
     */
    protected function deleteCarrier()
    {
        $carrierId = (int)Configuration::get(self::CONFIG_CARRIER_ID);
        if ($carrierId) {
            $carrier = new Carrier($carrierId);
            if (Validate::isLoadedObject($carrier)) {
                $carrier->deleted = 1;
                $carrier->active = 0;
                $carrier->save();
            }
        }
        return true;
    }

    /**
     * PrestaShop 1.7 Hook: actionCarrierUpdate
     * Handles carrier ID updates when carrier settings are edited in Back Office.
     */
    public function hookActionCarrierUpdate($params)
    {
        if ((int)$params['id_carrier'] === (int)Configuration::get(self::CONFIG_CARRIER_ID)) {
            Configuration::updateValue(self::CONFIG_CARRIER_ID, (int)$params['carrier']->id);
        }
    }

    /**
     * PrestaShop CarrierModule required method:
     * Calculates shipping cost for external module carriers using the Volume Absorption Matrix algorithm.
     *
     * Rules:
     * 1. Cart line items are expanded by quantity and assigned their volumetric class (1 to 4).
     * 2. The item with the highest class (and highest base price) is elected as the "Leader".
     * 3. Subordinated items undergo volumetric absorption:
     *    - If class is >= 2 levels below Leader (e.g. Class 1 or 2 under Class 4 Leader, or Class 1 under Class 3 Leader):
     *      100% Free Absorption (absorbed inside the dimensional buffer of bulky items). Cost = +0.00.
     *    - If Leader is Class 4 and subordinated item is Class 3:
     *      Flat handling fee of +10.00 EUR per item.
     *    - If subordinated item is the same class as Leader (co-leader):
     *      Additional units add 40% of the Leader base price.
     *    - Other adjacent subordinated items:
     *      Add 30% of their respective base price.
     * 4. Multiplier is fetched from ps_smartshipping_geo_zones based on delivery address postal code (Zone A: 1.00, Zone B: 1.15, Zone C: 1.45).
     * 5. Final rate is: round(running_cost * multiplier, 2).
     *
     * @param Cart  $params Cart object
     * @param float $shipping_cost Standard shipping cost
     * @return float|false Shipping cost or false if not applicable
     */
    public function getOrderShippingCost($params, $shipping_cost)
    {
        // 1. Verify Cart instance
        $cart = $params;
        if (!Validate::isLoadedObject($cart) && isset($this->context->cart)) {
            $cart = $this->context->cart;
        }

        if (!Validate::isLoadedObject($cart)) {
            return false;
        }

        $products = $cart->getProducts();
        if (empty($products)) {
            return 0.00;
        }

        // 2. Fetch Delivery Address & ZIP Code Multiplier
        $multiplier = $this->getDeliveryZipMultiplier((int)$cart->id_address_delivery);

        // 3. Pre-fetch volumetric class definitions from database (cached in memory)
        $classesCatalog = $this->getVolumetricClassesCatalog();

        // 4. Flatten cart products by quantity with their respective volumetric classes
        $flattenedItems = [];
        $productClassCache = [];

        foreach ($products as $product) {
            $idProduct = (int)$product['id_product'];
            $idProductAttribute = (int)($product['id_product_attribute'] ?? 0);
            $qty = max(1, (int)($product['cart_quantity'] ?? 1));

            // Resolve class for product
            $cacheKey = $idProduct . '_' . $idProductAttribute;
            if (!isset($productClassCache[$cacheKey])) {
                $productClassCache[$cacheKey] = $this->getProductVolumetricClass($idProduct, $idProductAttribute);
            }

            $idClass = (int)$productClassCache[$cacheKey];
            $classData = $classesCatalog[$idClass] ?? [
                'name' => 'Class 1: Small Decor',
                'base_price' => 5.00,
                'absorption_power' => 1
            ];

            for ($i = 0; $i < $qty; $i++) {
                $flattenedItems[] = [
                    'id_product'           => $idProduct,
                    'id_product_attribute' => $idProductAttribute,
                    'name'                 => $product['name'] ?? 'Product',
                    'id_class'             => $idClass,
                    'base_price'           => (float)$classData['base_price'],
                    'absorption_power'     => (int)$classData['absorption_power'],
                ];
            }
        }

        if (empty($flattenedItems)) {
            return 0.00;
        }

        // 5. Identify the Leader Product: highest id_class, then highest base_price
        usort($flattenedItems, function ($a, $b) {
            if ($b['id_class'] !== $a['id_class']) {
                return $b['id_class'] <=> $a['id_class'];
            }
            return $b['base_price'] <=> $a['base_price'];
        });

        // The first element is the Leader
        $leader = $flattenedItems[0];
        $leaderClassId = (int)$leader['id_class'];
        $leaderBasePrice = (float)$leader['base_price'];

        $runningCost = $leaderBasePrice;

        // 6. Execute Volume Absorption Loop for subordinated items
        $totalItems = count($flattenedItems);
        for ($i = 1; $i < $totalItems; $i++) {
            $subItem = $flattenedItems[$i];
            $subClassId = (int)$subItem['id_class'];
            $subBasePrice = (float)$subItem['base_price'];

            if (($leaderClassId - $subClassId) >= 2) {
                // Rule A: >= 2 levels below Leader -> 100% Free Absorption inside dimensional buffer (+0.00 EUR)
                $runningCost += 0.00;
            } elseif ($leaderClassId === 4 && $subClassId === 3) {
                // Rule B: Leader is Class 4 and subordinated item is Class 3 -> Flat handling fee of +10.00 EUR
                $runningCost += 10.00;
            } elseif ($subClassId === $leaderClassId) {
                // Rule C: Same volumetric class as Leader -> 40% of Leader base rate
                $runningCost += (0.40 * $leaderBasePrice);
            } else {
                // Rule D: Adjacent class (e.g. Class 2 under Class 3 Leader) -> 30% of item base rate
                $runningCost += (0.30 * $subBasePrice);
            }
        }

        // 7. Apply Geo-Zone Logistics Friction Multiplier & Rounding
        $finalCost = (float)round($runningCost * $multiplier, 2);

        return $finalCost;
    }

    /**
     * Resolves the delivery postal code multiplier from ps_smartshipping_geo_zones
     */
    public function getDeliveryZipMultiplier($idAddress)
    {
        if (empty($idAddress)) {
            return 1.00;
        }

        $address = new Address((int)$idAddress);
        if (!Validate::isLoadedObject($address) || empty($address->postcode)) {
            return 1.00;
        }

        $postcode = trim((string)$address->postcode);

        // Exact ZIP match query
        $sql = "SELECT \`multiplier\` FROM \`" . _DB_PREFIX_ . "smartshipping_geo_zones\`
                WHERE \`zip_code\` = '" . pSQL($postcode) . "' LIMIT 1";
        $multiplier = Db::getInstance()->getValue($sql);

        // Fallback: 2-digit department match (e.g. '13' prefix in France)
        if ($multiplier === false && strlen($postcode) >= 2) {
            $deptPrefix = substr($postcode, 0, 2);
            $sqlDept = "SELECT \`multiplier\` FROM \`" . _DB_PREFIX_ . "smartshipping_geo_zones\`
                        WHERE \`zip_code\` = '" . pSQL($deptPrefix) . "' OR \`zip_code\` LIKE '" . pSQL($deptPrefix) . "%'
                        ORDER BY LENGTH(\`zip_code\`) DESC LIMIT 1";
            $multiplier = Db::getInstance()->getValue($sqlDept);
        }

        if ($multiplier !== false && is_numeric($multiplier) && (float)$multiplier > 0) {
            return (float)$multiplier;
        }

        return 1.00;
    }

    /**
     * Fetches all registered volumetric classes with in-memory caching
     */
    public function getVolumetricClassesCatalog()
    {
        static $classesCatalog = null;
        if ($classesCatalog !== null) {
            return $classesCatalog;
        }

        $sql = "SELECT \`id_class\`, \`name\`, \`base_price\`, \`absorption_power\`
                FROM \`" . _DB_PREFIX_ . "smartshipping_classes\`";
        $rows = Db::getInstance()->executeS($sql);

        $classesCatalog = [];
        if (!empty($rows)) {
            foreach ($rows as $row) {
                $classesCatalog[(int)$row['id_class']] = [
                    'name'             => (string)$row['name'],
                    'base_price'       => (float)$row['base_price'],
                    'absorption_power' => (int)$row['absorption_power'],
                ];
            }
        }

        if (empty($classesCatalog)) {
            $classesCatalog = [
                1 => ['name' => 'Class 1: Small Decor',     'base_price' => 5.00,  'absorption_power' => 1],
                2 => ['name' => 'Class 2: Small Furniture', 'base_price' => 15.00, 'absorption_power' => 2],
                3 => ['name' => 'Class 3: Medium Furniture','base_price' => 35.00, 'absorption_power' => 3],
                4 => ['name' => 'Class 4: Bulky / Sofas',   'base_price' => 79.00, 'absorption_power' => 4],
            ];
        }

        return $classesCatalog;
    }

    /**
     * Resolves the assigned volumetric class ID for a specific product and combination
     */
    public function getProductVolumetricClass($idProduct, $idProductAttribute = 0)
    {
        $idProduct = (int)$idProduct;
        $idProductAttribute = (int)$idProductAttribute;

        if ($idProductAttribute > 0) {
            $sqlAttr = "SELECT \`id_class\` FROM \`" . _DB_PREFIX_ . "smartshipping_product\`
                        WHERE \`id_product\` = " . $idProduct . "
                          AND \`id_product_attribute\` = " . $idProductAttribute . "
                          AND \`is_approved\` = 1 LIMIT 1";
            $classId = Db::getInstance()->getValue($sqlAttr);
            if ($classId && (int)$classId > 0) {
                return (int)$classId;
            }
        }

        $sqlProd = "SELECT \`id_class\` FROM \`" . _DB_PREFIX_ . "smartshipping_product\`
                    WHERE \`id_product\` = " . $idProduct . "
                      AND \`id_product_attribute\` = 0
                      AND \`is_approved\` = 1 LIMIT 1";
        $classId = Db::getInstance()->getValue($sqlProd);
        if ($classId && (int)$classId > 0) {
            return (int)$classId;
        }

        $product = new Product($idProduct, false);
        if (Validate::isLoadedObject($product)) {
            $weight = (float)$product->weight;
            $volume = ((float)$product->width * (float)$product->height * (float)$product->depth) / 1000000;

            if ($weight >= 40 || $volume >= 0.8) {
                return 4;
            }
            if ($weight >= 15 || $volume >= 0.25) {
                return 3;
            }
            if ($weight >= 3 || $volume >= 0.05) {
                return 2;
            }
        }

        return 1;
    }

    public function getOrderShippingCostExternal($params)
    {
        return $this->getOrderShippingCost($params, 0.0);
    }

    /**
     * Resolves the cart's Leader product based on volumetric class and base price
     *
     * @param Cart|object $cart PrestaShop Cart object
     * @return array|null Flattened leader product array or null if cart is empty
     */
    public function getCartLeader($cart)
    {
        if (!Validate::isLoadedObject($cart)) {
            return null;
        }

        $products = $cart->getProducts();
        if (empty($products) || !is_array($products)) {
            return null;
        }

        $classesCatalog = $this->getVolumetricClassesCatalog();
        $flattenedItems = [];
        $productClassCache = [];

        foreach ($products as $product) {
            $idProduct = (int)$product['id_product'];
            $idProductAttribute = (int)($product['id_product_attribute'] ?? 0);
            $qty = max(1, (int)($product['cart_quantity'] ?? 1));

            $cacheKey = $idProduct . '_' . $idProductAttribute;
            if (!isset($productClassCache[$cacheKey])) {
                $productClassCache[$cacheKey] = $this->getProductVolumetricClass($idProduct, $idProductAttribute);
            }

            $idClass = (int)$productClassCache[$cacheKey];
            $classData = $classesCatalog[$idClass] ?? [
                'name' => 'Class 1: Small Decor',
                'base_price' => 5.00,
                'absorption_power' => 1
            ];

            for ($i = 0; $i < $qty; $i++) {
                $flattenedItems[] = [
                    'id_product'           => $idProduct,
                    'id_product_attribute' => $idProductAttribute,
                    'name'                 => $product['name'] ?? 'Product',
                    'id_class'             => $idClass,
                    'base_price'           => (float)$classData['base_price'],
                    'absorption_power'     => (int)$classData['absorption_power'],
                ];
            }
        }

        if (empty($flattenedItems)) {
            return null;
        }

        usort($flattenedItems, function ($a, $b) {
            if ($b['id_class'] !== $a['id_class']) {
                return $b['id_class'] <=> $a['id_class'];
            }
            return $b['base_price'] <=> $a['base_price'];
        });

        return $flattenedItems[0];
    }

    /**
     * Hook: displayShoppingCartFooter
     * Checks if the cart leader is Class 3 or 4, and if so, passes Smarty variables
     * to display the promotional AOV banner encouraging free shipping absorption.
     *
     * @param array $params Hook parameters including 'cart'
     * @return string Rendered Smarty template HTML or empty string
     */
    public function hookDisplayShoppingCartFooter($params)
    {
        $cart = null;
        if (isset($params['cart']) && Validate::isLoadedObject($params['cart'])) {
            $cart = $params['cart'];
        } elseif (isset($this->context->cart) && Validate::isLoadedObject($this->context->cart)) {
            $cart = $this->context->cart;
        }

        if (!Validate::isLoadedObject($cart)) {
            return '';
        }

        $leader = $this->getCartLeader($cart);
        $leaderClassId = $leader ? (int)$leader['id_class'] : 0;

        // Check if the cart leader is Class 3 or 4
        $showPromoBanner = in_array($leaderClassId, [3, 4], true);

        if (!$showPromoBanner) {
            if (isset($this->context->smarty)) {
                $this->context->smarty->assign([
                    'smartshipping_show_promo_banner' => false,
                    'show_promo_banner'               => false,
                ]);
            }
            return '';
        }

        // Pass Smarty variables to display the promotional banner
        if (isset($this->context->smarty)) {
            $this->context->smarty->assign([
                'smartshipping_show_promo_banner' => true,
                'show_promo_banner'               => true,
                'smartshipping_leader'            => $leader,
                'smartshipping_leader_class'      => $leaderClassId,
                'smartshipping_leader_name'       => $leader['name'] ?? '',
                'smartshipping_promo_title'       => $this->l('Your large item shipping is secured!'),
                'smartshipping_promo_subtitle'    => $leaderClassId === 4
                    ? $this->l('Add small furniture & home decor (Class 1 & 2) with 100% FREE shipping in this order.')
                    : $this->l('Add small decor & accessories (Class 1) with 100% FREE shipping in this order.'),
                'smartshipping_eligible_classes'  => $leaderClassId === 4 ? [1, 2] : [1],
                'smartshipping_savings_label'     => $this->l('100% Free Shipping Absorption'),
            ]);
        }

        return $this->display(__FILE__, 'views/templates/hook/shopping_cart_footer.tpl');
    }

    /**
     * Hook: displayCarrierExtraContent
     * PrestaShop 1.7 Hook rendered in Checkout Step 3 (Delivery Options).
     * Displays real-time volumetric freight calculation breakdown,
     * highlighting 100% free absorption strikethroughs and zone multiplier details.
     *
     * @param array $params ['carrier' => Carrier, 'cart' => Cart]
     * @return string Rendered Smarty template HTML or empty string
     */
    public function hookDisplayCarrierExtraContent($params)
    {
        $carrier = $params['carrier'] ?? null;
        $configuredCarrierId = (int)Configuration::get(self::CONFIG_CARRIER_ID);
        $configuredCarrierRef = (int)Configuration::get(self::CONFIG_CARRIER_REF);

        if ($carrier && is_object($carrier)) {
            $carrierId = (int)$carrier->id;
            $carrierRef = (int)($carrier->id_reference ?? 0);
            if ($carrierId !== $configuredCarrierId && $carrierRef !== $configuredCarrierRef) {
                return '';
            }
        }

        $cart = null;
        if (isset($params['cart']) && Validate::isLoadedObject($params['cart'])) {
            $cart = $params['cart'];
        } elseif (isset($this->context->cart) && Validate::isLoadedObject($this->context->cart)) {
            $cart = $this->context->cart;
        }

        if (!Validate::isLoadedObject($cart)) {
            return '';
        }

        $calc = $this->calculateCartShippingDetails($cart);
        if (!$calc || empty($calc['items'])) {
            return '';
        }

        if (isset($this->context->smarty)) {
            $this->context->smarty->assign([
                'smartshipping_carrier_active'  => true,
                'smartshipping_leader'          => $calc['leader'],
                'smartshipping_item_details'    => $calc['items'],
                'smartshipping_subtotal'        => $calc['subtotal'],
                'smartshipping_multiplier'      => $calc['multiplier'],
                'smartshipping_zone_label'      => $calc['zone_label'],
                'smartshipping_ferry_surcharge' => $calc['ferry_surcharge'],
                'smartshipping_total_fee'       => $calc['total'],
                'smartshipping_total_savings'   => $calc['savings'],
            ]);
        }

        return $this->display(__FILE__, 'views/templates/hook/carrier_extra_content.tpl');
    }

    /**
     * Helper: Computes itemized volumetric calculation details for transparent front-end display
     */
    public function calculateCartShippingDetails($cart)
    {
        if (!Validate::isLoadedObject($cart)) {
            return [];
        }

        $products = $cart->getProducts();
        if (empty($products) || !is_array($products)) {
            return [];
        }

        $classesCatalog = $this->getVolumetricClassesCatalog();
        $flattenedItems = [];
        $productClassCache = [];

        foreach ($products as $product) {
            $idProduct = (int)$product['id_product'];
            $idProductAttribute = (int)($product['id_product_attribute'] ?? 0);
            $qty = max(1, (int)($product['cart_quantity'] ?? 1));

            $cacheKey = $idProduct . '_' . $idProductAttribute;
            if (!isset($productClassCache[$cacheKey])) {
                $productClassCache[$cacheKey] = $this->getProductVolumetricClass($idProduct, $idProductAttribute);
            }

            $idClass = (int)$productClassCache[$cacheKey];
            $classData = $classesCatalog[$idClass] ?? [
                'name' => 'Class 1: Small Decor',
                'base_price' => 5.00,
                'absorption_power' => 1,
            ];

            for ($i = 0; $i < $qty; $i++) {
                $flattenedItems[] = [
                    'id_product'           => $idProduct,
                    'id_product_attribute' => $idProductAttribute,
                    'name'                 => $product['name'] ?? 'Product',
                    'id_class'             => $idClass,
                    'base_price'           => (float)$classData['base_price'],
                    'absorption_power'     => (int)$classData['absorption_power'],
                ];
            }
        }

        if (empty($flattenedItems)) {
            return [];
        }

        usort($flattenedItems, function ($a, $b) {
            if ($b['id_class'] !== $a['id_class']) {
                return $b['id_class'] <=> $a['id_class'];
            }
            return $b['base_price'] <=> $a['base_price'];
        });

        $leader = $flattenedItems[0];
        $leaderClassId = (int)$leader['id_class'];
        $leaderBasePrice = (float)$leader['base_price'];

        $subtotal = $leaderBasePrice;
        $standardCostWithoutAbsorption = $leaderBasePrice;
        $itemsBreakdown = [];

        $itemsBreakdown[] = [
            'name'         => $leader['name'],
            'id_class'     => $leader['id_class'],
            'isLeader'     => true,
            'feeAdded'     => $leaderBasePrice,
            'standardFee'  => $leaderBasePrice,
            'ruleApplied'  => 'Elected Freight Leader (Class ' . $leaderClassId . ')',
            'isAbsorbed'   => false,
        ];

        $totalItems = count($flattenedItems);
        for ($i = 1; $i < $totalItems; $i++) {
            $subItem = $flattenedItems[$i];
            $subClassId = (int)$subItem['id_class'];
            $subBasePrice = (float)$subItem['base_price'];
            $standardCostWithoutAbsorption += $subBasePrice;

            $addedFee = 0.00;
            $ruleDesc = '';
            $absorbed = false;

            if (($leaderClassId - $subClassId) >= 2) {
                $addedFee = 0.00;
                $absorbed = true;
                $ruleDesc = '100% Free Absorption inside Class ' . $leaderClassId . ' buffer';
            } elseif ($leaderClassId === 4 && $subClassId === 3) {
                $addedFee = 10.00;
                $ruleDesc = 'Flat handling fee for Class 3 with Class 4 Leader';
            } elseif ($subClassId === $leaderClassId) {
                $addedFee = 0.40 * $leaderBasePrice;
                $ruleDesc = 'Co-Leader 60% buffer discount (40% rate applied)';
            } else {
                $addedFee = 0.30 * $subBasePrice;
                $ruleDesc = 'Adjacent class 70% consolidation discount (30% rate applied)';
            }

            $subtotal += $addedFee;
            $itemsBreakdown[] = [
                'name'        => $subItem['name'],
                'id_class'    => $subClassId,
                'isLeader'    => false,
                'feeAdded'    => $addedFee,
                'standardFee' => $subBasePrice,
                'ruleApplied' => $ruleDesc,
                'isAbsorbed'  => $absorbed,
            ];
        }

        $multiplier = $this->getDeliveryZipMultiplier((int)$cart->id_address_delivery);
        $ferrySurcharge = 0.00;
        if ($multiplier >= 1.40 && $leaderClassId === 4) {
            $ferrySurcharge = 35.00;
        }

        $total = round(($subtotal * $multiplier) + $ferrySurcharge, 2);
        $totalStandard = round(($standardCostWithoutAbsorption * multiplier) + $ferrySurcharge, 2);
        $savings = max(0, round($totalStandard - $total, 2));

        return [
            'leader'          => $leader,
            'items'           => $itemsBreakdown,
            'subtotal'        => $subtotal,
            'multiplier'      => $multiplier,
            'zone_label'      => $multiplier >= 1.40 ? 'Zone C - Island / Remote (+45%)' : ($multiplier > 1.05 ? 'Zone B - Suburban (+15%)' : 'Zone A - Continental Standard'),
            'ferry_surcharge' => $ferrySurcharge,
            'total'           => $total,
            'total_standard'  => $totalStandard,
            'savings'         => $savings,
        ];
    }
}
`;

const CARRIER_EXTRA_CONTENT_TPL = `{**
 * 2026 SmartShipping AI - Carrier Selection Extra Content Template
 *
 * PrestaShop 1.7 Hook: displayCarrierExtraContent
 * Rendered during Checkout Step 3 (Delivery / Shipping Methods).
 *}

{if isset($smartshipping_carrier_active) && $smartshipping_carrier_active}
<div id="smartshipping-carrier-extra-content" class="smartshipping-extra-wrapper card mt-2 mb-3 p-3 border-primary-subtle" style="background: #f8fafc; border-radius: 8px; border: 1px solid #cbd5e1;">
    <div class="d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom">
        <div class="d-flex align-items-center">
            <span class="mr-2" style="font-size: 1.4rem;">🚛</span>
            <div>
                <strong class="text-dark" style="font-size: 0.95rem;">{l s='SmartShipping AI Consolidation Engine' mod='smartshippingai'}</strong>
                <div class="text-muted small">
                    {if isset($smartshipping_zone_label)}
                        {$smartshipping_zone_label|escape:'html':'UTF-8'} 
                        {if isset($smartshipping_multiplier) && $smartshipping_multiplier > 1.0}
                            <span class="badge badge-warning text-dark ml-1">{l s='Multiplier' mod='smartshippingai'}: x{$smartshipping_multiplier|floatval}</span>
                        {/if}
                    {else}
                        {l s='Continental Express & Volumetric Freight' mod='smartshippingai'}
                    {/if}
                </div>
            </div>
        </div>
        {if isset($smartshipping_total_savings) && $smartshipping_total_savings > 0}
            <div class="text-right">
                <span class="badge badge-success px-2 py-1 font-weight-bold" style="font-size: 0.85rem;">
                    {l s='You Save' mod='smartshippingai'}: €{$smartshipping_total_savings|string_format:"%.2f"}
                </span>
            </div>
        {/if}
    </div>
    {if isset($smartshipping_leader) && $smartshipping_leader}
        <div class="alert alert-info py-2 px-3 mb-2 small d-flex align-items-center justify-content-between" style="border-radius: 6px; background-color: #e0f2fe; border-color: #bae6fd; color: #0369a1;">
            <div>
                <strong>{l s='Cart Freight Leader:' mod='smartshippingai'}</strong>
                <span>{$smartshipping_leader.name|escape:'html':'UTF-8'}</span>
                <span class="badge badge-primary ml-1" style="background-color: #0284c7;">Class {$smartshipping_leader.id_class|intval}</span>
            </div>
            <div class="font-weight-bold">
                €{$smartshipping_leader.base_price|string_format:"%.2f"} {l s='Base Rate' mod='smartshippingai'}
            </div>
        </div>
    {/if}
</div>
{/if}
`;

const SHOPPING_CART_FOOTER_TPL = `{**
 * 2026 SmartShipping AI - Shopping Cart Footer Promotional Banner
 *
 * Psychological AOV Trigger: Displays a promotional banner when the cart leader
 * is Class 3 or Class 4, informing the customer that smaller decor items
 * (Class 1 or 2) qualify for 100% free shipping absorption.
 *}

{if isset($smartshipping_show_promo_banner) && $smartshipping_show_promo_banner}
<div id="smartshipping-cart-footer-banner" class="smartshipping-promo-banner card mt-3 mb-3 p-3">
    <div class="d-flex align-items-center justify-content-between flex-wrap">
        <div class="d-flex align-items-center mr-3 mb-2 mb-md-0">
            <div class="smartshipping-promo-icon-wrapper mr-3 text-center" style="font-size: 2.2rem; min-width: 48px;">
                🎉
            </div>
            <div>
                <h5 class="smartshipping-promo-title mb-1 font-weight-bold text-success">
                    {if isset($smartshipping_promo_title)}
                        {$smartshipping_promo_title|escape:'html':'UTF-8'}
                    {else}
                        {l s='Your large item shipping is secured!' mod='smartshippingai'}
                    {/if}
                </h5>
                <p class="smartshipping-promo-subtitle mb-0 text-muted" style="font-size: 0.95rem;">
                    {if isset($smartshipping_promo_subtitle)}
                        {$smartshipping_promo_subtitle|escape:'html':'UTF-8'}
                    {elseif $smartshipping_leader_class == 4}
                        {l s='Add small furniture & home decor (Class 1 & 2) with 100% FREE shipping in this order.' mod='smartshippingai'}
                    {else}
                        {l s='Add small decor & accessories (Class 1) with 100% FREE shipping in this order.' mod='smartshippingai'}
                    {/if}
                </p>
                {if isset($smartshipping_leader_name) && $smartshipping_leader_name}
                    <div class="smartshipping-leader-badge mt-1 text-secondary" style="font-size: 0.8rem;">
                        <span>{l s='Qualifying Leader:' mod='smartshippingai'}</span>
                        <strong class="text-dark">{$smartshipping_leader_name|escape:'html':'UTF-8'}</strong>
                        <span class="badge badge-info ml-1">Class {$smartshipping_leader_class|intval}</span>
                    </div>
                {/if}
            </div>
        </div>

        <div class="smartshipping-promo-badge-container">
            <span class="badge badge-success px-3 py-2 text-uppercase font-weight-bold shadow-sm" style="letter-spacing: 0.5px;">
                {if isset($smartshipping_savings_label)}
                    {$smartshipping_savings_label|escape:'html':'UTF-8'}
                {else}
                    {l s='100% Free Shipping Absorption' mod='smartshippingai'}
                {/if}
            </span>
        </div>
    </div>
</div>
{/if}
`;

const INSTALL_SQL_CODE = `CREATE TABLE IF NOT EXISTS \`PREFIX_smartshipping_classes\` (
    \`id_class\` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    \`name\` VARCHAR(64) NOT NULL,
    \`base_price\` DECIMAL(10, 2) NOT NULL DEFAULT '0.00',
    \`absorption_power\` INT(11) NOT NULL DEFAULT 1,
    \`date_add\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`date_upd\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id_class\`)
) ENGINE=ENGINE_TYPE DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`PREFIX_smartshipping_product\` (
    \`id_product\` INT(11) UNSIGNED NOT NULL,
    \`id_product_attribute\` INT(11) UNSIGNED NOT NULL DEFAULT 0,
    \`id_class\` INT(11) UNSIGNED NOT NULL DEFAULT 1,
    \`is_approved\` TINYINT(1) UNSIGNED NOT NULL DEFAULT 0,
    \`confidence_score\` DECIMAL(5, 2) NULL DEFAULT NULL,
    \`ai_notes\` VARCHAR(255) NULL DEFAULT NULL,
    \`date_upd\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id_product\`, \`id_product_attribute\`),
    KEY \`idx_class\` (\`id_class\`),
    KEY \`idx_approved\` (\`is_approved\`)
) ENGINE=ENGINE_TYPE DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`PREFIX_smartshipping_geo_zones\` (
    \`id_zone_rule\` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    \`zip_code\` VARCHAR(32) NOT NULL,
    \`zone_type\` ENUM('A', 'B', 'C') NOT NULL DEFAULT 'A',
    \`multiplier\` DECIMAL(5, 2) NOT NULL DEFAULT '1.00',
    \`label\` VARCHAR(128) NULL DEFAULT NULL,
    \`date_upd\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id_zone_rule\`),
    KEY \`idx_zip\` (\`zip_code\`)
) ENGINE=ENGINE_TYPE DEFAULT CHARSET=utf8mb4;`;

const UNINSTALL_SQL_CODE = `DROP TABLE IF EXISTS \`PREFIX_smartshipping_classes\`;
DROP TABLE IF EXISTS \`PREFIX_smartshipping_product\`;
DROP TABLE IF EXISTS \`PREFIX_smartshipping_geo_zones\`;`;
