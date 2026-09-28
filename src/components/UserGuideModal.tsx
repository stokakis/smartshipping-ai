import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Truck,
  Box,
  Layers,
  ArrowRight,
  Download,
  FolderDown,
  ShoppingBag,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info,
  Check,
  ExternalLink,
  RotateCcw,
  ListTodo,
  CheckSquare,
  Square,
  ClipboardCheck
} from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: 'phase1' | 'simulator' | 'database' | 'code' | 'tests' | 'admin') => void;
  onDownloadFullApp: () => void;
  onDownloadModule: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onDownloadFullApp,
  onDownloadModule,
}) => {
  const [activeSection, setActiveSection] = useState<'getting-started' | 'basics' | 'steps' | 'screens' | 'glossary' | 'deployment'>('getting-started');

  // Interactive 3-step checklist state for new merchants
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
  });

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 3) * 100);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/80 border-b border-slate-800">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0 text-slate-950 font-bold">
              <BookOpen className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Οδηγός Χρήσης SmartShipping AI</h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Getting Started • Νέοι Έμποροι
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Μάθετε πώς λειτουργεί η εφαρμογή χωρίς τεχνικούς όρους και ολοκληρώστε τα 3 βήματα έναρξης.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700/50"
            title="Κλείσιμο οδηγού"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs inside the Guide */}
        <div className="flex items-center overflow-x-auto border-b border-slate-800 bg-slate-950/90 px-4 py-2 gap-2 text-xs font-semibold scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveSection('getting-started')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'getting-started'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>⚡ Getting Started (3-Step Checklist)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              completedCount === 3
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-amber-300 border border-amber-400/30'
            }`}>
              {completedCount}/3
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('basics')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'basics'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>💡 1. Τι είναι με απλά λόγια</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('steps')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'steps'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>🚀 2. Πώς το δουλεύετε (4 Βήματα)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('screens')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'screens'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>🖥️ 3. Τι κάνει κάθε καρτέλα (Tabs)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('glossary')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'glossary'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>📖 4. Λεξικό Όρων</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('deployment')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'deployment'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>📦 5. Πώς το κατεβάζετε & στήνετε</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-300">

          {/* NEW SECTION: GETTING STARTED (3-STEP CHECKLIST FOR NEW MERCHANTS) */}
          {activeSection === 'getting-started' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Progress Summary Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <ClipboardCheck className="w-5 h-5 text-amber-400" />
                      <h3 className="text-base font-bold text-white">Getting Started: Οδηγός Έναρξης για Νέους Εμπόρους</h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Ολοκληρώστε τη λίστα ελέγχου 3 βημάτων για να ρυθμίσετε το σύστημα μεταφορικών για το κατάστημά σας.
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-bold text-white">{completedCount} από 3 βήματα</div>
                      <div className="text-[10px] text-emerald-400 font-medium">{progressPercent}% Ολοκληρώθηκε</div>
                    </div>
                    {completedCount === 3 ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center space-x-1.5 shadow-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Ready for Launch!</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-semibold">
                        Σε εξέλιξη
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-400 transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* The 3-Step Interactive Checklist */}
              <div className="space-y-4">
                
                {/* Step 1: Configure initial classes */}
                <div className={`p-5 rounded-2xl border transition-all ${
                  completedSteps[1]
                    ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start space-x-3.5">
                      <button
                        type="button"
                        onClick={() => toggleStep(1)}
                        className="mt-0.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title={completedSteps[1] ? 'Σήμανση ως μη ολοκληρωμένο' : 'Σήμανση ως ολοκληρωμένο'}
                      >
                        {completedSteps[1] ? (
                          <CheckSquare className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <Square className="w-6 h-6 text-slate-500 hover:text-slate-300" />
                        )}
                      </button>

                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            ΒΗΜΑ 1
                          </span>
                          <h4 className="text-sm font-bold text-white">
                            1. Configure initial classes (Διαμόρφωση Αρχικών Κλάσεων Όγκου)
                          </h4>
                          {completedSteps[1] && (
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Ολοκληρώθηκε
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          Ρυθμίστε τις 4 βασικές κλάσεις ογκομετρικής αποστολής (Class 1: Μικρά διακοσμητικά, Class 2: Φωτιστικά/Μεσαία, Class 3: Έπιπλα, Class 4: Ογκώδεις καναπέδες) και καθορίστε τις βασικές τιμές χρέωσης (Base Price) και τη δύναμη απορρόφησης (Absorption Power).
                        </p>

                        {/* Sub-checklist details */}
                        <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-3 space-y-1.5 text-xs text-slate-400">
                          <div className="font-semibold text-slate-300 text-[11px] mb-1">Τι περιλαμβάνει αυτό το βήμα:</div>
                          <div className="flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            <span>Έλεγχος των βασικών χρεώσεων: 5€ για Class 1, 15€ για Class 2, 35€ για Class 3, 79€ για Class 4.</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            <span>Επιβεβαίωση της ιεραρχίας: Μεγαλύτερες κλάσεις απορροφούν μικρότερες (Class 4 &gt; Class 3 &gt; Class 2 &gt; Class 1).</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            <span>Προσαρμογή προσαυξήσεων για νησιωτικές ή δυσπρόσιτες περιοχές (Zone Matrix).</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateTab('admin');
                      }}
                      className="shrink-0 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <span>Ρύθμιση Κλάσεων</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Step 2: Import product associations */}
                <div className={`p-5 rounded-2xl border transition-all ${
                  completedSteps[2]
                    ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start space-x-3.5">
                      <button
                        type="button"
                        onClick={() => toggleStep(2)}
                        className="mt-0.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title={completedSteps[2] ? 'Σήμανση ως μη ολοκληρωμένο' : 'Σήμανση ως ολοκληρωμένο'}
                      >
                        {completedSteps[2] ? (
                          <CheckSquare className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <Square className="w-6 h-6 text-slate-500 hover:text-slate-300" />
                        )}
                      </button>

                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            ΒΗΜΑ 2
                          </span>
                          <h4 className="text-sm font-bold text-white">
                            2. Import product associations (Εισαγωγή & Συσχέτιση Προϊόντων)
                          </h4>
                          {completedSteps[2] && (
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Ολοκληρώθηκε
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          Συσχετίστε κάθε προϊόν του καταλόγου σας με την αντίστοιχη κλάση όγκου. Μπορείτε να εισαγάγετε αρχείο CSV, να συγχρονίσετε απευθείας μέσω PrestaShop REST API, ή να χρησιμοποιήσετε την αυτόματη ταξινόμηση Gemini AI με βάση τις διαστάσεις (Μήκος x Πλάτος x Ύψος x Βάρος).
                        </p>

                        {/* Sub-checklist details */}
                        <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-3 space-y-1.5 text-xs text-slate-400">
                          <div className="font-semibold text-slate-300 text-[11px] mb-1">Τι περιλαμβάνει αυτό το βήμα:</div>
                          <div className="flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            <span>Εισαγωγή καταλόγου μέσω «Import CSV» ή σύνδεση με το κατάστημα μέσω «PrestaShop API Bridge».</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            <span>Εκτέλεση «Run AI Batch Auto-Classification» για να υπολογίσει το AI αυτόματα τον όγκο κάθε είδους.</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            <span>Έγκριση των προτεινόμενων κλάσεων στον πίνακα διαχείρισης (Back-Office grid).</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateTab('admin');
                      }}
                      className="shrink-0 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <span>Εισαγωγή & Κατάλογος</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
                    </button>
                  </div>
                </div>

                {/* Step 3: Verify carrier settings */}
                <div className={`p-5 rounded-2xl border transition-all ${
                  completedSteps[3]
                    ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start space-x-3.5">
                      <button
                        type="button"
                        onClick={() => toggleStep(3)}
                        className="mt-0.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title={completedSteps[3] ? 'Σήμανση ως μη ολοκληρωμένο' : 'Σήμανση ως ολοκληρωμένο'}
                      >
                        {completedSteps[3] ? (
                          <CheckSquare className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <Square className="w-6 h-6 text-slate-500 hover:text-slate-300" />
                        )}
                      </button>

                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            ΒΗΜΑ 3
                          </span>
                          <h4 className="text-sm font-bold text-white">
                            3. Verify carrier settings (Επαλήθευση Ρυθμίσεων Μεταφορέα & Ζωνών)
                          </h4>
                          {completedSteps[3] && (
                            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Ολοκληρώθηκε
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          Επαληθεύστε τη λειτουργία της μηχανής υπολογισμού στον διαδραστικό Προσομοιωτή Καλαθιού (Cart Simulator). Δοκιμάστε παραγγελίες με συνδυασμό ογκωδών και μικρών αντικειμένων σε διάφορους ταχυδρομικούς κώδικες για να βεβαιωθείτε ότι οι εκπτώσεις απορρόφησης εφαρμόζονται σωστά.
                        </p>

                        {/* Sub-checklist details */}
                        <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 p-3 space-y-1.5 text-xs text-slate-400">
                          <div className="font-semibold text-slate-300 text-[11px] mb-1">Τι περιλαμβάνει αυτό το βήμα:</div>
                          <div className="flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                            <span>Έλεγχος πολλαπλασιαστών ζωνών (Zone A: 1.00x, Zone B: 1.15x-1.20x, Zone C: 1.45x νησιά).</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                            <span>Δοκιμή καλαθιού με 1 Καναπέ (Class 4) + 2 Μαξιλάρια (Class 1) ➔ Επιβεβαίωση ότι τα μαξιλάρια απορροφώνται 100%.</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                            <span>Επιβεβαίωση αυτόματης έκδοσης Courier Vouchers (tracking numbers) για ACS / Γενική / DHL.</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateTab('simulator');
                      }}
                      className="shrink-0 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <span>Δοκιμή Προσομοιωτή</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Ready to Deploy Helper Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-white block">Ολοκληρώσατε και τα 3 βήματα;</span>
                  <span className="text-slate-400">
                    Είστε έτοιμοι να κατεβάσετε το PrestaShop Carrier Module (.zip) ή ολόκληρο το project για το Railway!
                  </span>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onDownloadModule();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Module (.zip)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onDownloadFullApp();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-md shadow-emerald-600/20"
                  >
                    <FolderDown className="w-3.5 h-3.5" />
                    <span>Full App (.zip)</span>
                  </button>
                </div>
              </div>

            </div>
          )}
          
          {/* SECTION 1: BASICS */}
          {activeSection === 'basics' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Problem vs Solution Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-2">
                  <div className="flex items-center space-x-2 text-red-400 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-xs">✕</span>
                    <span>Το κλασικό πρόβλημα των e-shop</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Ένας πελάτης αγοράζει ένα <strong>τραπέζι (μεταφορικά 30€)</strong> και <strong>2 μαξιλάρια (5€ το καθένα)</strong>.
                    Τα συνηθισμένα συστήματα προσθέτουν απλά τα ποσά: 
                    <span className="block mt-1 font-mono font-bold text-red-300">30€ + 5€ + 5€ = 40€ μεταφορικά!</span>
                    Ο πελάτης τρομάζει από το κόστος και <strong>εγκαταλείπει το καλάθι</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">✓</span>
                    <span>Η λύση του SmartShipping AI</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Το SmartShipping AI καταλαβαίνει ότι τα μαξιλάρια <strong>χωράνε μέσα στο ίδιο κιβώτιο ή στον χώρο του τραπεζιού</strong> («Απορρόφηση»).
                    <span className="block mt-1 font-mono font-bold text-emerald-300">Τελικά μεταφορικά: ΜΟΝΟ 30€ (τα μαξιλάρια στέλνονται δωρεάν)!</span>
                    Ο πελάτης ολοκληρώνει χαρούμενος την αγορά και εσείς κερδίζετε την παραγγελία.
                  </p>
                </div>
              </div>

              {/* The 4 Classes Explained Simply */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Box className="w-4 h-4 text-amber-400" />
                  <span>Πώς χωρίζονται τα προϊόντα σε μεγέθη (Οι 4 Κλάσεις):</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-xl">🕯️</div>
                    <div className="font-bold text-emerald-400">Κλάση 1: Μικρά Αντικείμενα</div>
                    <div className="text-[11px] text-slate-400">Μαξιλάρια, διακοσμητικά, κεριά, μαχαιροπίρουνα (Βασική τιμή: 5€).</div>
                    <div className="text-[10px] text-emerald-300 font-medium">Απορροφάται 100% από μεγαλύτερα αντικείμενα!</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-xl">💡</div>
                    <div className="font-bold text-blue-400">Κλάση 2: Μεσαία / Φωτιστικά</div>
                    <div className="text-[11px] text-slate-400">Φωτιστικά δαπέδου, σκαμπό, επιτραπέζια ρολόγια (Βασική τιμή: 15€).</div>
                    <div className="text-[10px] text-blue-300 font-medium">Μερική απορρόφηση όταν μπαίνουν 2 ή περισσότερα.</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-xl">🪑</div>
                    <div className="font-bold text-purple-400">Κλάση 3: Έπιπλα / Καρέκλες</div>
                    <div className="text-[11px] text-slate-400">Καρέκλες γραφείου, τραπεζάκια σαλονιού, ράφια (Βασική τιμή: 35€).</div>
                    <div className="text-[10px] text-purple-300 font-medium">Απορροφά όλα τα μικρότερα αντικείμενα.</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-xl">🛋️</div>
                    <div className="font-bold text-amber-400">Κλάση 4: Πολύ Ογκώδη</div>
                    <div className="text-[11px] text-slate-400">Καναπέδες, διπλά κρεβάτια, ντουλάπες (Βασική τιμή: 79€).</div>
                    <div className="text-[10px] text-amber-300 font-medium">Κυρίαρχος όγκος: απορροφά τα πάντα γύρω του!</div>
                  </div>
                </div>
              </div>

              {/* Quick Jump Action */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
                <div className="text-xs">
                  <span className="font-bold text-white block">Θέλετε να το δείτε στην πράξη;</span>
                  <span className="text-slate-400">Δοκιμάστε να προσθέσετε προϊόντα στον Προσομοιωτή Καλαθιού.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateTab('simulator');
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <span>Άνοιγμα Προσομοιωτή</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          )}

          {/* SECTION 2: 4 STEPS */}
          {activeSection === 'steps' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="text-xs text-slate-400">
                Ακολουθήστε αυτά τα 4 απλά βήματα για να εκμεταλλευτείτε πλήρως την εφαρμογή:
              </div>

              {/* Step 1 */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Δείτε και Διαχειριστείτε τα Προϊόντα σας</h4>
                    <p className="text-[11px] text-slate-400">Καρτέλα: «Phase 3: Back-Office Admin»</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 pl-11">
                  Στη λίστα εμφανίζονται όλα τα προϊόντα του καταστήματός σας. Για κάθε προϊόν βλέπετε τις διαστάσεις (Μήκος x Πλάτος x Ύψος), το πραγματικό βάρος και το <strong>ογκομετρικό βάρος</strong>. Μπορείτε να αλλάξετε την κλάση οποιουδήποτε προϊόντος με ένα κλικ.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Αφήστε την Τεχνητή Νοημοσύνη (AI) να ταξινομήσει αυτόματα</h4>
                    <p className="text-[11px] text-slate-400">Κουμπί: «Run AI Batch Auto-Classification» ή «AI Sandbox»</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 pl-11">
                  Δεν χρειάζεται να μαντεύετε εσείς σε ποια κλάση ανήκει κάθε προϊόν! Πατώντας το κουμπί του AI, το σύστημα αναλύει αυτόματα τις διαστάσεις και προτείνει την ιδανική κλάση με εξήγηση στα ελληνικά, εξοικονομώντας σας ώρες χειροκίνητης δουλειάς.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Δοκιμάστε το Καλάθι στον Προσομοιωτή (Simulator)</h4>
                    <p className="text-[11px] text-slate-400">Καρτέλα: «Phase 2: Simulator»</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 pl-11">
                  Μπείτε στον ρόλο του πελάτη: Επιλέξτε έναν καναπέ, δύο λάμπες και τρία μαξιλάρια. Επιλέξτε Ταχυδρομικό Κώδικα (π.χ. Αθήνα, Κρήτη, νησιά). Δείτε πώς η μηχανή υπολογίζει ακαριαία την τελική τιμή μεταφορικών, εξηγώντας ακριβώς ποιο προϊόν απορρόφησε ποιο!
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Εγκατάσταση στο PrestaShop & Έκδοση Vouchers</h4>
                    <p className="text-[11px] text-slate-400">Κουμπί: «PrestaShop Module ZIP» & «Courier API Hub»</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 pl-11">
                  Κατεβάστε το έτοιμο αρχείο zip για το PrestaShop, εγκαταστήστε το στο κατάστημά σας, και συνδέστε τις αγαπημένες σας κούριερ για να εκδίδετε αυτόματα αριθμούς αποστολής (Vouchers) χωρίς χειροκίνητη πληκτρολόγηση.
                </p>
              </div>
            </div>
          )}

          {/* SECTION 3: SCREENS / TABS */}
          {activeSection === 'screens' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="text-xs text-slate-400">
                Αναλυτική περιγραφή κάθε οθόνης / κουμπιού της εφαρμογής:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                
                {/* Tab: Admin */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                      Phase 3: Back-Office Admin
                    </span>
                    <button
                      type="button"
                      onClick={() => { onClose(); onNavigateTab('admin'); }}
                      className="text-[11px] text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      Πήγαινε <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-300">
                    Ο κεντρικός πίνακας ελέγχου. Εδώ ρυθμίζετε τις τιμές ανά κλάση, τον πίνακα γεωγραφικών ζωνών (Zone A, B, C) και συνδέεστε με το PrestaShop WebService.
                  </p>
                </div>

                {/* Tab: Simulator */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-indigo-400" />
                      Phase 2: Cart Simulator
                    </span>
                    <button
                      type="button"
                      onClick={() => { onClose(); onNavigateTab('simulator'); }}
                      className="text-[11px] text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      Πήγαινε <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-300">
                    Δοκιμαστήριο καλαθιού. Προσθέστε ή αφαιρέστε τεμάχια και δείτε σε πραγματικό χρόνο πώς αλλάζει το κόστος και ποιοι κανόνες απορρόφησης ενεργοποιούνται.
                  </p>
                </div>

                {/* Tab: Flowchart */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-amber-400" />
                      Flowchart: Κανόνες Απορρόφησης
                    </span>
                    <button
                      type="button"
                      onClick={() => { onClose(); onNavigateTab('phase1'); }}
                      className="text-[11px] text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      Πήγαινε <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-300">
                    Οπτικό διάγραμμα ροής (Step 1, Step 2, Step 3, Step 4) που δείχνει με βέλη τη μαθηματική λογική υπολογισμού των μεταφορικών.
                  </p>
                </div>

                {/* Tab: Tests */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-sky-400" />
                      PHPUnit Tests & Audit
                    </span>
                    <button
                      type="button"
                      onClick={() => { onClose(); onNavigateTab('tests'); }}
                      className="text-[11px] text-sky-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      Πήγαινε <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-300">
                    Αυτοματοποιημένοι έλεγχοι λογισμικού (35/35 passing tests) που επιβεβαιώνουν ότι δεν υπάρχει κανένα λάθος σε καμία περίπτωση καλαθιού.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* SECTION 4: GLOSSARY */}
          {activeSection === 'glossary' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="text-xs text-slate-400">
                Απλό λεξικό όρων για να μη χαθείτε στις ορολογίες:
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs font-bold text-emerald-400 block">📦 Ογκομετρικό Βάρος (Volumetric Weight)</span>
                  <p className="text-xs text-slate-300 mt-1">
                    Ένα μεγάλο αλλά ελαφρύ αντικείμενο (π.χ. ένα τεράστιο μαξιλάρι 1 κιλού) πιάνει πολύ χώρο στο φορτηγό. Οι κούριερ δεν χρεώνουν μόνο το βάρος, αλλά και τον όγκο. Το σύστημα το υπολογίζει αυτόματα: <code>(Μήκος × Πλάτος × Ύψος) / 5000</code>.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs font-bold text-indigo-400 block">🧲 Απορρόφηση Μεταφορικών (Absorption)</span>
                  <p className="text-xs text-slate-300 mt-1">
                    Η μαγική ιδιότητα όπου ένα μεγαλύτερο έπιπλο «τραβάει μέσα του» τα μεταφορικά των μικρότερων αντικειμένων, ώστε ο πελάτης να μην πληρώνει διπλά και τριπλά μεταφορικά.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs font-bold text-amber-400 block">🗺️ Γεωγραφικές Ζώνες (Zone Matrix)</span>
                  <p className="text-xs text-slate-300 mt-1">
                    Διαφορετικές χρεώσεις ανά περιοχή: π.χ. Ζώνη Α (Κεντρικές Πόλεις - κανονική τιμή), Ζώνη Β (Επαρχία +15%), Ζώνη Γ (Νησιά/Δυσπρόσιτα +45%).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs font-bold text-purple-400 block">🏷️ Voucher (Αριθμός Αποστολής / Tracking)</span>
                  <p className="text-xs text-slate-300 mt-1">
                    Το επίσημο έγγραφο / barcode που κολλάτε στο δέμα για να το παραλάβει η εταιρεία κούριερ (π.χ. ACS, Γενική Ταχυδρομική, DHL).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: DEPLOYMENT */}
          {activeSection === 'deployment' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="text-xs text-slate-400">
                Πώς να κατεβάσετε και να εγκαταστήσετε την εφαρμογή στον υπολογιστή ή στο κατάστημά σας:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Module ZIP download */}
                <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm">
                      <Download className="w-5 h-5" />
                      <span>Εγκατάσταση στο PrestaShop</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Αν έχετε PrestaShop κατάστημα και θέλετε μόνο τον μεταφορέα (Carrier Module):
                    </p>
                    <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1">
                      <li>Πατήστε το κουμπί <strong>«PrestaShop Module ZIP»</strong> παρακάτω.</li>
                      <li>Μπείτε στο PrestaShop σας ➔ Modules ➔ Module Manager.</li>
                      <li>Πατήστε <strong>Upload a module</strong> και επιλέξτε το zip.</li>
                      <li>Ο μεταφορέας ενεργοποιείται αυτόματα!</li>
                    </ol>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onDownloadModule();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Κατέβασμα PrestaShop Module (.zip)</span>
                  </button>
                </div>

                {/* Full Web App download */}
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                      <FolderDown className="w-5 h-5" />
                      <span>Πλήρης Εφαρμογή (Railway / Cloud)</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Αν θέλετε ολόκληρη αυτή την εφαρμογή (Server, AI, React UI, Docker, Railway config):
                    </p>
                    <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1">
                      <li>Πατήστε <strong>«Download Full App (ZIP)»</strong>.</li>
                      <li>Αποσυμπιέστε το στον υπολογιστή σας.</li>
                      <li>Ανεβάστε το στο GitHub σας (<code>git push</code>).</li>
                      <li>Στο Railway πατήστε <strong>New Project from GitHub</strong> και είναι έτοιμο ζωντανά στο διαδίκτυο!</li>
                    </ol>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onDownloadFullApp();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/25"
                  >
                    <FolderDown className="w-4 h-4" />
                    <span>Κατέβασμα Ολόκληρου του App (.zip)</span>
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-slate-800">
          <div className="text-xs text-slate-500 hidden sm:block">
            SmartShipping AI • Σχεδιασμένο για εύκολη χρήση από όλους
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Κατάλαβα, κλείσιμο
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
