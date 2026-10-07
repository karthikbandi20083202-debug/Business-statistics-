/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Compass, 
  TrendingUp, 
  ShieldAlert, 
  AlertCircle, 
  CheckCircle2, 
  Lightbulb, 
  Target, 
  Layers, 
  Activity, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  Sliders, 
  HelpCircle,
  FileSpreadsheet,
  Cpu,
  BarChart3,
  Calendar,
  Clock,
  Tag,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  DiagnosisEvidenceState, 
  BusinessDiagnosisReport,
  HealthSignalItem,
  EvidenceLevel 
} from '../types/statistics';
import { generateBusinessDiagnosis } from '../statistics/businessDiagnosis';

interface BusinessDiagnosisProps {
  evidence: DiagnosisEvidenceState;
  onLoadAllVerifiedData?: () => void;
  onNavigateToModule?: (moduleKey: '01' | '02' | '03' | '04' | '05' | '06') => void;
}

export function BusinessDiagnosis({ 
  evidence, 
  onLoadAllVerifiedData,
  onNavigateToModule 
}: BusinessDiagnosisProps) {
  const report: BusinessDiagnosisReport = generateBusinessDiagnosis(evidence);
  const [activeLoopStep, setActiveLoopStep] = useState<number>(0);

  const loopSteps = [
    {
      step: '01',
      title: 'MEASURE',
      tagline: 'Empirical Baseline Collection',
      description: 'Capture clean, verified observations across POS tickets, daily footfall, menu item prices, and operating hours without skipping or guessing data.',
    },
    {
      step: '02',
      title: 'IDENTIFY',
      tagline: 'Statistical Signal Extraction',
      description: 'Apply the 6 statistical tools to isolate underlying trends, quantify dispersion volatility, measure linear associations, and assess price movements.',
    },
    {
      step: '03',
      title: 'TEST',
      tagline: 'Formulate Business Hypothesis',
      description: 'Design low-risk, targeted operational experiments (e.g. midweek afternoon coffee pairings or flexible staffing shifts) addressing identified bottlenecks.',
    },
    {
      step: '04',
      title: 'IMPLEMENT',
      tagline: 'Disciplined Execution',
      description: 'Roll out the operational adjustment across the Sainikpuri cafe with standardized barista training, clear menu displays, and inventory checkpoints.',
    },
    {
      step: '05',
      title: 'RE-MEASURE',
      tagline: 'Evidence Verification Loop',
      description: 'Re-run the statistical analyzers against the new operating window to verify whether demand volatility decreased or margin contribution expanded.',
    },
  ];

  const renderEvidenceBadge = (level: EvidenceLevel) => {
    switch (level) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Check className="w-3 h-3" />
            <span>HIGH EVIDENCE</span>
          </span>
        );
      case 'MODERATE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
            <span>MODERATE EVIDENCE</span>
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span>LOW EVIDENCE</span>
          </span>
        );
    }
  };

  return (
    <div id="business-diagnosis-section" className="space-y-10 animate-in fade-in duration-300">
      
      {/* ==================================================
          HEADER & STATUS BANNER
          ================================================== */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900/90 via-purple-950/40 to-slate-900/90 border border-purple-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.24em] text-purple-400 mb-2">
              <span className="w-2 h-0.5 bg-purple-400" />
              <span>KOI &amp; CO. • EXECUTIVE DECISION INTELLIGENCE</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              BUSINESS DIAGNOSIS &amp; GROWTH STRATEGY
            </h2>
            <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-3xl font-medium">
              What the data tells us about the business — and what to do next.
            </p>
          </div>

          {/* Completeness Badge & Quick Synthesis Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <div className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold border inline-flex items-center gap-2 ${
              report.completeness === 'COMPLETE'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : report.completeness === 'PARTIAL'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                report.completeness === 'COMPLETE' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`} />
              <span>
                {report.completeness === 'COMPLETE'
                  ? 'COMPLETE 6-TOOL DIAGNOSIS'
                  : report.completeness === 'PARTIAL'
                  ? `PARTIAL BUSINESS DIAGNOSIS (${report.completedCount}/${report.totalTools} Active)`
                  : 'ANALYSIS INCOMPLETE (Need Data)'}
              </span>
            </div>

            {onLoadAllVerifiedData && (
              <button
                type="button"
                onClick={onLoadAllVerifiedData}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-400 text-slate-950 font-mono text-xs font-bold transition-all duration-200 hover:scale-[1.02] shadow-[0_0_20px_rgba(168,85,247,0.3)] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                <span>SYNTHESIZE ALL 6 VERIFIED DATASETS</span>
              </button>
            )}
          </div>
        </div>

        {/* Evidence Status Matrix (Available vs Missing) */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500">Evidence Status:</span>
            {report.availableTools.map((tool) => (
              <span 
                key={tool}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900/90 text-emerald-300 border border-emerald-500/30 text-[11px]"
              >
                <Check className="w-3 h-3 text-emerald-400" />
                <span>{tool}</span>
              </span>
            ))}
            {report.missingTools.map((tool) => (
              <span 
                key={tool}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900/90 text-slate-500 border border-slate-800 text-[11px]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                <span>{tool} (Pending)</span>
              </span>
            ))}
          </div>

          <span className="text-slate-500 text-[11px]">
            Grounded in empirical observations at Sainikpuri, Hyderabad
          </span>
        </div>
      </div>

      {/* ==================================================
          1. BUSINESS HEALTH SNAPSHOT (Executive Summary)
          ================================================== */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800/90 p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80">
          <Activity className="w-5 h-5 text-emerald-400" />
          <h3 className="font-display text-base sm:text-lg font-bold text-white tracking-wide">
            BUSINESS HEALTH SNAPSHOT
          </h3>
        </div>

        <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
          {report.executiveSummary}
        </p>

        <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-rose-400 font-bold block mb-1">PRIMARY BUSINESS CONCERN:</span>
            <p className="text-slate-300">{report.managementTakeaway.biggestWeakness}</p>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-emerald-400 font-bold block mb-1">PRIMARY GROWTH OPPORTUNITY:</span>
            <p className="text-slate-300">{report.managementTakeaway.biggestOpportunity}</p>
          </div>
        </div>
      </div>

      {/* ==================================================
          2. BUSINESS HEALTH SIGNALS (6 Core Dimensions)
          ================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" />
            <h3 className="font-display text-sm font-bold text-slate-300 uppercase tracking-wider">
              KEY DATA SIGNALS
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">6 Core Operating Dimensions</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {report.healthSignals.map((signal) => (
            <div
              key={signal.dimension}
              className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                  {signal.dimension}
                </span>
                <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                  signal.tone === 'positive'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : signal.tone === 'warning'
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : signal.tone === 'caution'
                    ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {signal.status}
                </span>
              </div>

              <div className="font-mono text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                {signal.metric}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {signal.interpretation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ==================================================
          3 & 4. STRENGTHS & WEAKNESSES
          ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* STRENGTHS */}
        <div className="rounded-xl bg-slate-900/60 border border-slate-800/90 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h4 className="font-display text-sm font-bold text-white tracking-wide uppercase">
              BUSINESS STRENGTHS
            </h4>
          </div>

          <div className="space-y-3">
            {report.strengths.map((s, idx) => (
              <div key={idx} className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-xs">
                <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{s.strength}</span>
                </div>
                <div className="font-mono text-slate-400 text-[11px]">
                  <strong className="text-slate-500">Evidence: </strong>{s.evidence}
                </div>
                <p className="text-emerald-300/90 text-[11px] leading-relaxed">
                  <strong>Business Value: </strong>{s.businessValue}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* WEAKNESSES */}
        <div className="rounded-xl bg-slate-900/60 border border-slate-800/90 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <h4 className="font-display text-sm font-bold text-white tracking-wide uppercase">
              BUSINESS WEAKNESSES
            </h4>
          </div>

          <div className="space-y-3">
            {report.weaknesses.map((w, idx) => (
              <div key={idx} className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-xs">
                <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>{w.weakness}</span>
                </div>
                <div className="font-mono text-slate-400 text-[11px]">
                  <strong className="text-slate-500">Evidence: </strong>{w.evidence}
                </div>
                <p className="text-amber-300/90 text-[11px] leading-relaxed">
                  <strong>Business Impact: </strong>{w.businessImpact}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ==================================================
          5 & 6. OPPORTUNITIES & RISKS
          ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* OPPORTUNITIES */}
        <div className="rounded-xl bg-slate-900/60 border border-slate-800/90 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
            <Lightbulb className="w-4 h-4 text-purple-400" />
            <h4 className="font-display text-sm font-bold text-white tracking-wide uppercase">
              GROWTH OPPORTUNITIES
            </h4>
          </div>

          <div className="space-y-3">
            {report.opportunities.map((o, idx) => (
              <div key={idx} className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-xs">
                <div className="font-semibold text-purple-200">
                  {o.opportunity}
                </div>
                <div className="font-mono text-slate-400 text-[11px]">
                  <strong className="text-slate-500">Observed Signals: </strong>{o.evidence}
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  <strong className="text-purple-300">Strategic Mechanism: </strong>{o.mechanism}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* RISKS */}
        <div className="rounded-xl bg-slate-900/60 border border-slate-800/90 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h4 className="font-display text-sm font-bold text-white tracking-wide uppercase">
              RISK SIGNALS
            </h4>
          </div>

          <div className="space-y-3">
            {report.risks.map((r, idx) => (
              <div key={idx} className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-xs">
                <div className="font-semibold text-rose-200">
                  {r.risk}
                </div>
                <div className="font-mono text-slate-400 text-[11px]">
                  <strong className="text-slate-500">Evidence: </strong>{r.evidence}
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  <strong className="text-rose-300">Why It Matters: </strong>{r.whyItMatters}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ==================================================
          7. CROSS-TOOL INTELLIGENCE (Most Important Section)
          ================================================== */}
      <div className="rounded-xl bg-gradient-to-r from-purple-950/30 via-slate-900/90 to-indigo-950/30 border border-purple-500/30 p-6 sm:p-8 space-y-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-purple-400" />
            <h3 className="font-display text-base sm:text-lg font-bold text-white tracking-wide">
              CROSS-TOOL INSIGHTS
            </h3>
          </div>
          <span className="font-mono text-xs text-slate-400">
            Multi-Perspective Syntheses (No Isolated Metrics)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.crossToolInsights.map((insight, idx) => (
            <div 
              key={idx}
              className="p-5 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {insight.toolsInvolved.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-purple-300">
                        {t}
                      </span>
                    ))}
                  </div>
                  {renderEvidenceBadge(insight.evidenceLevel)}
                </div>

                <h5 className="font-display text-sm font-bold text-white tracking-tight">
                  {insight.title}
                </h5>

                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  {insight.insight}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/60 text-xs">
                <strong className="text-emerald-400 font-semibold block mb-0.5 font-mono text-[10px] uppercase">
                  Business Implication:
                </strong>
                <p className="text-slate-300 text-xs">{insight.businessImplication}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================================================
          8 & 9. WHAT SHOULD KOI & CO. DO NEXT? (Prioritized Action Plan)
          ================================================== */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800/90 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase text-emerald-400 tracking-wider mb-1">
              <span>Decision Support Engine</span>
            </div>
            <h3 className="font-display text-base sm:text-xl font-bold text-white tracking-wide">
              WHAT SHOULD KOI &amp; CO. DO NEXT?
            </h3>
          </div>
          <span className="font-mono text-xs text-slate-400">Prioritized Action Hierarchy</span>
        </div>

        <div className="space-y-4">
          {report.prioritizedActions.map((action, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-xl border transition-all space-y-2.5 ${
                action.priority === 'P1'
                  ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.08)]'
                  : action.priority === 'P2'
                  ? 'bg-teal-950/20 border-teal-500/30'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                    action.priority === 'P1'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                      : action.priority === 'P2'
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/50'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {action.priorityLabel}
                  </span>
                  <h4 className="font-display text-sm font-bold text-white">
                    {action.action}
                  </h4>
                </div>

                {renderEvidenceBadge(action.evidenceLevel)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3 rounded bg-slate-900/80 border border-slate-800/80">
                  <span className="text-slate-500 font-mono text-[10px] uppercase block mb-0.5">
                    Empirical Reason
                  </span>
                  <p className="text-slate-300">{action.reason}</p>
                </div>
                <div className="p-3 rounded bg-slate-900/80 border border-slate-800/80">
                  <span className="text-emerald-400 font-mono text-[10px] uppercase block mb-0.5 font-bold">
                    Expected Business Purpose
                  </span>
                  <p className="text-slate-200 font-medium">{action.expectedBusinessPurpose}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================================================
          10. KOI & CO. GROWTH STRATEGY (5 Pillars)
          ================================================== */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800/90 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-800/80">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h3 className="font-display text-base sm:text-lg font-bold text-white tracking-wide">
            KOI &amp; CO. GROWTH STRATEGY
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {report.growthStrategy.map((p, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="font-mono text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">
                  {p.pillar}
                </span>
                <h5 className="font-display text-sm font-bold text-white">
                  {p.whatToDo}
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {p.why}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                <span className="text-slate-500 block">Data Evidence:</span>
                <span className="text-slate-300">{p.dataEvidence}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================================================
          11. DATA-DRIVEN GROWTH LOOP (Visual Interactive Cycle)
          ================================================== */}
      <div className="rounded-xl bg-slate-950/80 border border-slate-800/90 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800/80">
          <div>
            <span className="font-mono text-xs uppercase text-purple-400 tracking-wider">Iterative Decision Protocol</span>
            <h3 className="font-display text-base sm:text-lg font-bold text-white">
              DATA-DRIVEN GROWTH LOOP
            </h3>
          </div>
          <span className="font-mono text-xs text-slate-500">Measure → Identify → Test → Implement → Re-Measure</span>
        </div>

        {/* Horizontal Loop Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {loopSteps.map((step, idx) => (
            <button
              key={step.step}
              type="button"
              onClick={() => setActiveLoopStep(idx)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                activeLoopStep === idx
                  ? 'bg-purple-950/40 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-purple-400 font-bold">
                  STAGE {step.step}
                </span>
                {idx < 4 && <ArrowRight className="w-3.5 h-3.5 text-slate-600 hidden lg:block" />}
              </div>
              <h5 className="font-display text-sm font-bold text-white mb-1">
                {step.title}
              </h5>
              <p className="text-[11px] font-mono text-slate-400">
                {step.tagline}
              </p>
            </button>
          ))}
        </div>

        {/* Active Stage Details Card */}
        <div className="p-4 rounded-xl bg-slate-900 border border-purple-500/30 text-xs font-mono space-y-1 animate-in fade-in duration-150">
          <span className="text-purple-400 font-bold">
            STAGE {loopSteps[activeLoopStep].step}: {loopSteps[activeLoopStep].title} — {loopSteps[activeLoopStep].tagline}
          </span>
          <p className="text-slate-300 leading-relaxed font-sans text-xs">
            {loopSteps[activeLoopStep].description}
          </p>
        </div>
      </div>

      {/* ==================================================
          12. WHAT THE DATA DOES NOT SUPPORT (Analytical Discipline)
          ================================================== */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800/90 p-6 sm:p-8 space-y-5 shadow-xl">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <h4 className="font-display text-sm font-bold text-white tracking-wide uppercase">
            WHAT THE DATA DOES NOT SUPPORT
          </h4>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Analytical discipline requires knowing the boundaries of empirical data. Avoid these flawed assumptions:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.unsupportedClaims.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs space-y-1">
              <span className="font-semibold text-rose-300 block">
                ✕ {item.claim}
              </span>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                {item.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ==================================================
          13. MANAGEMENT TAKEAWAY (Final Executive Summary)
          ================================================== */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-purple-950/40 border border-emerald-500/40 p-6 sm:p-8 space-y-5 shadow-2xl">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h4 className="font-display text-sm sm:text-base font-bold text-white tracking-wide uppercase">
            MANAGEMENT TAKEAWAY
          </h4>
        </div>

        <div className="space-y-4">
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
            {report.managementTakeaway.summaryParagraph}
          </p>

          <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">CURRENT STATE</span>
              <span className="text-slate-200 font-bold text-xs">{report.healthSignals[0]?.status || 'Evaluated'}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">CORE ASSET</span>
              <span className="text-emerald-400 font-bold text-xs">Demand Momentum</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">CORE RISK</span>
              <span className="text-amber-400 font-bold text-xs">Traffic Volatility</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">IMMEDIATE ACTION</span>
              <span className="text-purple-300 font-bold text-xs">Buffer &amp; Audit</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
