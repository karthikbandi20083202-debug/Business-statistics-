/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  ChevronRight, 
  Layers, 
  Activity, 
  TrendingUp, 
  Target, 
  Database,
  BarChart2,
  Sparkles
} from 'lucide-react';
import { BrandLogo } from './components/BrandLogo';
import { BusinessAnalyzer } from './components/BusinessAnalyzer';

export default function App() {
  // Page mode: 'landing' or 'analyzer'
  const [currentView, setCurrentView] = useState<'landing' | 'analyzer'>('landing');

  // Smooth scroll handler
  const scrollToSection = (id: string) => {
    if (currentView !== 'landing') {
      setCurrentView('landing');
      setTimeout(() => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 relative selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Background Ambience: Subtle technical grid & restrained gradient glow */}
      <div className="fixed inset-0 pointer-events-none bg-tech-grid opacity-30 z-0" />
      <div 
        className="fixed inset-0 pointer-events-none z-0" 
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(30, 58, 138, 0.22), rgba(88, 28, 135, 0.12) 45%, rgba(6, 9, 19, 0) 80%)'
        }}
      />
      
      {/* Top Subtle Glow Line */}
      <div className="fixed top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent z-50 pointer-events-none" />

      {/* ==================================================
          2. BRANDING & NAVIGATION HEADER
          ================================================== */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#060913]/90 border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          
          {/* Brand Wordmark & Official Insignia Zone */}
          <button 
            type="button"
            onClick={() => setCurrentView('landing')}
            className="group flex items-center text-left cursor-pointer"
          >
            <BrandLogo size="md" />
          </button>

          {/* Nav Links (clean, unboxed text links) */}
          <nav className="hidden md:flex items-center gap-7 text-xs uppercase tracking-widest text-slate-400 font-medium">
            <button 
              type="button" 
              onClick={() => scrollToSection('hero')} 
              className={`hover:text-white transition-colors cursor-pointer ${currentView === 'landing' ? 'text-slate-200' : 'text-slate-500'}`}
            >
              Overview
            </button>
            <button 
              type="button" 
              onClick={() => scrollToSection('framework')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Framework
            </button>
            <button 
              type="button" 
              onClick={() => scrollToSection('value')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Business Value
            </button>
            <button 
              type="button" 
              onClick={() => scrollToSection('perspectives')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Perspectives
            </button>
            <button 
              type="button" 
              onClick={() => setCurrentView('analyzer')} 
              className={`hover:text-emerald-400 transition-colors cursor-pointer ${currentView === 'analyzer' ? 'text-emerald-400 font-semibold' : ''}`}
            >
              Analyzer Workspace
            </button>
          </nav>

          {/* Action / View Switcher */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sainikpuri · Hyd</span>
            </div>

            {currentView === 'landing' ? (
              <button 
                type="button"
                onClick={() => setCurrentView('analyzer')}
                className="text-xs font-mono tracking-wider px-3.5 py-1.5 border border-emerald-500/40 hover:border-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 hover:text-emerald-200 rounded transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(16,185,129,0.25)] whitespace-nowrap cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>OPEN ANALYZER</span>
                <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            ) : (
              <button 
                type="button"
                onClick={() => setCurrentView('landing')}
                className="text-xs font-mono tracking-wider px-3.5 py-1.5 border border-slate-700/80 hover:border-slate-600 bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white rounded transition-all whitespace-nowrap cursor-pointer"
              >
                Introduction View
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10">
        
        {/* ==================================================
            VIEW A: BUSINESS ANALYZER WORKSPACE (V1 + V2)
            ================================================== */}
        {currentView === 'analyzer' ? (
          <BusinessAnalyzer onBackToLanding={() => setCurrentView('landing')} />
        ) : (
          /* ==================================================
              VIEW B: POLISHED INTRODUCTION PAGE (PRESERVED & ANIMATED)
              ================================================== */
          <>
            {/* ==================================================
                3. HERO SECTION
                ================================================== */}
            <motion.section 
              id="hero" 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-7xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32"
            >
              <div className="max-w-4xl">
                
                {/* Small Eyebrow */}
                <div className="inline-flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.28em] text-emerald-400/90 mb-6">
                  <span className="w-2 h-0.5 bg-emerald-400" />
                  <span>KOI &amp; CO. • SAINIKPURI, HYDERABAD</span>
                </div>

                {/* Main Heading */}
                <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08] mb-8 text-balance">
                  BUSINESS <br />
                  <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    STATISTICAL ANALYSIS
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-xl sm:text-2xl text-slate-200 font-medium tracking-tight mb-6">
                  Transforming business data into actionable insight.
                </p>

                {/* Supporting Paragraph */}
                <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl font-normal mb-10">
                  A data-driven framework designed to understand business performance, identify patterns, 
                  measure uncertainty, and support better business decisions through statistical analysis.
                </p>

                {/* Interactive Action Row */}
                <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-800/80">
                  <button 
                    type="button"
                    onClick={() => setCurrentView('analyzer')}
                    className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded text-sm tracking-wide transition-all duration-300 hover:scale-[1.02] shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] cursor-pointer group"
                  >
                    <span>LAUNCH BUSINESS ANALYZER</span>
                    <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button 
                    type="button"
                    onClick={() => scrollToSection('framework')}
                    className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <span>Examine Framework</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>

              </div>

              {/* Minimalist Data Metric Highlights Bar */}
              <div className="mt-20 pt-8 border-t border-slate-800/60 grid grid-cols-2 sm:grid-cols-4 gap-6 text-left">
                <div className="group">
                  <p className="font-mono text-xs text-slate-500 tracking-wider uppercase mb-1">Methodology</p>
                  <p className="text-sm font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">Empirical &amp; Quantitative</p>
                </div>
                <div className="group">
                  <p className="font-mono text-xs text-slate-500 tracking-wider uppercase mb-1">Perspective Count</p>
                  <p className="text-sm font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">06 Analytical Dimensions</p>
                </div>
                <div className="group">
                  <p className="font-mono text-xs text-slate-500 tracking-wider uppercase mb-1">Objective</p>
                  <p className="text-sm font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">Evidence-Based Action</p>
                </div>
                <div className="group">
                  <p className="font-mono text-xs text-slate-500 tracking-wider uppercase mb-1">Application Scope</p>
                  <p className="text-sm font-semibold text-emerald-400">KOI &amp; CO. Commercial Growth</p>
                </div>
              </div>
            </motion.section>

            {/* ==================================================
                4. WHAT THIS SYSTEM DOES: FROM DATA TO DECISION
                ================================================== */}
            <motion.section 
              id="framework" 
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-800/70"
            >
              <div className="mb-14">
                <p className="font-mono text-xs tracking-[0.24em] text-emerald-400/90 uppercase mb-2">
                  Operational Sequence
                </p>
                <h2 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-tight">
                  FROM DATA TO DECISION
                </h2>
              </div>

              {/* 3 Concise Stages Visually Connected */}
              <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                
                {/* Visual connector line across cards on desktop */}
                <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-emerald-500/20 via-slate-700/60 to-emerald-500/20 -translate-y-12 z-0 pointer-events-none" />

                {/* Stage 1: ANALYZE */}
                <div className="relative z-10 p-8 rounded-lg bg-slate-900/40 border border-slate-800/90 hover:border-slate-700/80 hover:bg-slate-900/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.4)] group flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <span className="font-mono text-xs text-emerald-400/90 tracking-widest">
                        STAGE // 01
                      </span>
                      <div className="w-8 h-8 rounded border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-colors">
                        <Database className="w-4 h-4" />
                      </div>
                    </div>

                    <h3 className="font-display text-xl font-bold tracking-tight text-white mb-3 group-hover:text-emerald-300 transition-colors">
                      ANALYZE
                    </h3>

                    <p className="text-slate-400 text-sm leading-relaxed">
                      Convert business data into measurable statistical information.
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500 font-mono">
                    <span>Input Layer</span>
                    <span className="text-slate-400">Structured Data</span>
                  </div>
                </div>

                {/* Stage 2: IDENTIFY */}
                <div className="relative z-10 p-8 rounded-lg bg-slate-900/40 border border-slate-800/90 hover:border-slate-700/80 hover:bg-slate-900/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.4)] group flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <span className="font-mono text-xs text-emerald-400/90 tracking-widest">
                        STAGE // 02
                      </span>
                      <div className="w-8 h-8 rounded border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-colors">
                        <Activity className="w-4 h-4" />
                      </div>
                    </div>

                    <h3 className="font-display text-xl font-bold tracking-tight text-white mb-3 group-hover:text-emerald-300 transition-colors">
                      IDENTIFY
                    </h3>

                    <p className="text-slate-400 text-sm leading-relaxed">
                      Reveal patterns, variation, relationships, trends, and important signals within the data.
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500 font-mono">
                    <span>Pattern Layer</span>
                    <span className="text-slate-400">Signal Extraction</span>
                  </div>
                </div>

                {/* Stage 3: DECIDE */}
                <div className="relative z-10 p-8 rounded-lg bg-slate-900/40 border border-slate-800/90 hover:border-emerald-500/40 hover:bg-slate-900/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(16,185,129,0.1)] group flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <span className="font-mono text-xs text-emerald-400/90 tracking-widest">
                        STAGE // 03
                      </span>
                      <div className="w-8 h-8 rounded border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-colors">
                        <Target className="w-4 h-4" />
                      </div>
                    </div>

                    <h3 className="font-display text-xl font-bold tracking-tight text-white mb-3 group-hover:text-emerald-300 transition-colors">
                      DECIDE
                    </h3>

                    <p className="text-slate-400 text-sm leading-relaxed">
                      Translate statistical evidence into practical business actions and priorities.
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500 font-mono">
                    <span>Execution Layer</span>
                    <span className="text-emerald-400 font-medium">Business Impact</span>
                  </div>
                </div>

              </div>
            </motion.section>

            {/* ==================================================
                5. WHY IT MATTERS FOR BUSINESS
                ================================================== */}
            <motion.section 
              id="value" 
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-800/70"
            >
              <div className="mb-14">
                <p className="font-mono text-xs tracking-[0.24em] text-emerald-400/90 uppercase mb-2">
                  Strategic Rationale
                </p>
                <h2 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-tight">
                  WHY STATISTICAL ANALYSIS MATTERS
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                
                {/* Point 1: UNDERSTAND PERFORMANCE */}
                <div className="p-8 rounded-lg bg-slate-900/30 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50 transition-all duration-300 group">
                  <div className="flex items-baseline gap-4 mb-3">
                    <span className="font-mono text-xs text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform">01</span>
                    <h3 className="font-display text-lg font-bold text-slate-100 group-hover:text-white transition-colors tracking-tight">
                      UNDERSTAND PERFORMANCE
                    </h3>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed pl-8">
                    Measure what is happening in the business instead of relying only on assumptions.
                  </p>
                </div>

                {/* Point 2: IDENTIFY VARIATION */}
                <div className="p-8 rounded-lg bg-slate-900/30 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50 transition-all duration-300 group">
                  <div className="flex items-baseline gap-4 mb-3">
                    <span className="font-mono text-xs text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform">02</span>
                    <h3 className="font-display text-lg font-bold text-slate-100 group-hover:text-white transition-colors tracking-tight">
                      IDENTIFY VARIATION
                    </h3>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed pl-8">
                    Understand consistency, volatility, and unusual changes in business activity.
                  </p>
                </div>

                {/* Point 3: DISCOVER RELATIONSHIPS */}
                <div className="p-8 rounded-lg bg-slate-900/30 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50 transition-all duration-300 group">
                  <div className="flex items-baseline gap-4 mb-3">
                    <span className="font-mono text-xs text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform">03</span>
                    <h3 className="font-display text-lg font-bold text-slate-100 group-hover:text-white transition-colors tracking-tight">
                      DISCOVER RELATIONSHIPS
                    </h3>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed pl-8">
                    Examine how important business variables move together and identify meaningful patterns.
                  </p>
                </div>

                {/* Point 4: MAKE BETTER DECISIONS */}
                <div className="p-8 rounded-lg bg-slate-900/30 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50 transition-all duration-300 group">
                  <div className="flex items-baseline gap-4 mb-3">
                    <span className="font-mono text-xs text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform">04</span>
                    <h3 className="font-display text-lg font-bold text-slate-100 group-hover:text-white transition-colors tracking-tight">
                      MAKE BETTER DECISIONS
                    </h3>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed pl-8">
                    Use quantitative evidence to support more informed business decisions.
                  </p>
                </div>

              </div>
            </motion.section>

            {/* ==================================================
                6. SIX ANALYTICAL PERSPECTIVES
                ================================================== */}
            <motion.section 
              id="perspectives" 
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-800/70"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
                <div>
                  <p className="font-mono text-xs tracking-[0.24em] text-emerald-400/90 uppercase mb-2">
                    Core Analytical Architecture
                  </p>
                  <h2 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-tight">
                    SIX ANALYTICAL PERSPECTIVES
                  </h2>
                </div>
                
                <p className="text-xs font-mono text-slate-400 max-w-xs">
                  Systematic statistical dimensions integrated into the KOI &amp; CO. Business Analyzer.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* 01 CENTRAL TENDENCY */}
                <div className="p-6 rounded-lg bg-slate-900/40 border border-slate-800/90 hover:border-emerald-500/50 hover:bg-slate-900/60 transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <span className="font-mono text-sm font-semibold text-emerald-400/90">
                        01
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400/80 uppercase tracking-wider font-semibold">
                        V1 Live
                      </span>
                    </div>
                    <h3 className="font-display text-base font-bold text-white tracking-wide uppercase mb-2 group-hover:text-emerald-300 transition-colors">
                      CENTRAL TENDENCY
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Establish operational centerpoints, representative revenue medians, and weighted operational benchmarks.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-800/50 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>Metrics</span>
                    <span className="text-slate-400">Mean · Median · Mode</span>
                  </div>
                </div>

                {/* 02 DISPERSION */}
                <div className="p-6 rounded-lg bg-slate-900/40 border border-slate-800/90 hover:border-emerald-500/50 hover:bg-slate-900/60 transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <span className="font-mono text-sm font-semibold text-emerald-400/90">
                        02
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400/80 uppercase tracking-wider font-semibold">
                        V2 Live
                      </span>
                    </div>
                    <h3 className="font-display text-base font-bold text-white tracking-wide uppercase mb-2 group-hover:text-emerald-300 transition-colors">
                      DISPERSION
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Gauge performance stability, quantify operational variance, and measure sales deviation across business cycles.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-800/50 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>Metrics</span>
                    <span className="text-slate-400">Range · Variance · Std Dev</span>
                  </div>
                </div>

                {/* 03 CORRELATION */}
                <div className="p-6 rounded-lg bg-slate-900/40 border border-slate-800/90 hover:border-teal-500/50 hover:bg-slate-900/60 transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <span className="font-mono text-sm font-semibold text-teal-400/90">
                        03
                      </span>
                      <span className="text-[11px] font-mono text-teal-400/80 uppercase tracking-wider font-semibold">
                        V3 Live
                      </span>
                    </div>
                    <h3 className="font-display text-base font-bold text-white tracking-wide uppercase mb-2 group-hover:text-teal-300 transition-colors">
                      CORRELATION
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Discover directional associations between customer footfall, average order values, and marketing spend.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-800/50 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>Metrics</span>
                    <span className="text-slate-400">Pearson r · Spearman ρ</span>
                  </div>
                </div>

                {/* 04 REGRESSION */}
                <div className="p-6 rounded-lg bg-slate-900/40 border border-slate-800/90 hover:border-teal-500/50 hover:bg-slate-900/60 transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <span className="font-mono text-sm font-semibold text-teal-400/90">
                        04
                      </span>
                      <span className="text-[11px] font-mono text-teal-400/80 uppercase tracking-wider font-semibold">
                        V4 Live
                      </span>
                    </div>
                    <h3 className="font-display text-base font-bold text-white tracking-wide uppercase mb-2 group-hover:text-teal-300 transition-colors">
                      REGRESSION
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Project future business outcomes and quantify dependent variable sensitivities for strategic planning.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-800/50 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>Metrics</span>
                    <span className="text-slate-400">Slope · Intercept · R²</span>
                  </div>
                </div>

                {/* 05 TIME SERIES */}
                <div className="p-6 rounded-lg bg-slate-900/40 border border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/60 transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <span className="font-mono text-sm font-semibold text-slate-500">
                        05
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                        Stage 4
                      </span>
                    </div>
                    <h3 className="font-display text-base font-bold text-slate-300 tracking-wide uppercase mb-2 group-hover:text-white transition-colors">
                      TIME SERIES
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Decompose seasonal patterns, detect cyclical shifts, and track long-term trajectory over operating quarters.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-800/50 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>Metrics</span>
                    <span className="text-slate-400">Trend · Seasonality · Cycles</span>
                  </div>
                </div>

                {/* 06 INDEX NUMBERS */}
                <div className="p-6 rounded-lg bg-slate-900/40 border border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/60 transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <span className="font-mono text-sm font-semibold text-slate-500">
                        06
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                        Stage 4
                      </span>
                    </div>
                    <h3 className="font-display text-base font-bold text-slate-300 tracking-wide uppercase mb-2 group-hover:text-white transition-colors">
                      INDEX NUMBERS
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Benchmark periodic growth relative to baseline periods and track price-volume composite indices.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-800/50 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>Metrics</span>
                    <span className="text-slate-400">Base Period · Relatives</span>
                  </div>
                </div>

              </div>
            </motion.section>

            {/* ==================================================
                7. TRANSITION TO THE ANALYZER
                ================================================== */}
            <motion.section 
              id="stage-transition" 
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-7xl mx-auto px-6 py-24 border-t border-slate-800/70"
            >
              <div className="p-10 md:p-14 rounded-xl bg-gradient-to-b from-slate-900/60 to-slate-950/90 border border-slate-800/90 relative overflow-hidden">
                
                {/* Subtle corner highlight */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-3xl">
                  
                  <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.24em] text-emerald-400 mb-4">
                    <span>DECISION ENGINE READY</span>
                    <span>•</span>
                    <span>V1 + V2 ACTIVE</span>
                  </div>

                  <h2 className="font-display text-3xl sm:text-5xl font-bold text-white tracking-tight mb-6">
                    FROM EVIDENCE TO ACTION
                  </h2>

                  <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8">
                    The next stage transforms raw business data into measurable statistical results, 
                    interprets those results through defined analytical rules, and converts the evidence 
                    into practical business insights.
                  </p>

                  <div>
                    {/* Subtle, premium hover effect: slight glow + scale */}
                    <button
                      type="button"
                      onClick={() => setCurrentView('analyzer')}
                      className="inline-flex items-center gap-3 px-7 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg text-sm tracking-wide transition-all duration-300 hover:scale-[1.02] shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_35px_rgba(16,185,129,0.45)] cursor-pointer group"
                    >
                      <span>ENTER BUSINESS ANALYZER</span>
                      <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                </div>
              </div>
            </motion.section>
          </>
        )}

      </main>

      {/* ==================================================
          FOOTER
          ================================================== */}
      <footer className="border-t border-slate-800/80 bg-[#04060d] text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <BrandLogo size="sm" showText={false} />
            <div>
              <p className="font-display font-bold text-slate-200 tracking-wider text-sm mb-0.5">
                KOI &amp; CO.
              </p>
              <p className="font-mono text-[11px] text-slate-400">
                BUSINESS STATISTICAL ANALYSIS • SAINIKPURI, HYDERABAD
              </p>
            </div>
          </div>

          <div className="flex flex-col md:items-end gap-1 font-mono text-[11px] text-slate-500">
            <p>One-Page Architecture · Deterministic Business Intelligence Engine</p>
            <p className="text-slate-600">Decision Intelligence Architecture © {new Date().getFullYear()} KOI &amp; CO.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
