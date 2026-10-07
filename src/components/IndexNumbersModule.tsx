/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Calculator, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  ShieldAlert, 
  Sparkles, 
  RotateCcw, 
  Sliders, 
  Play, 
  AlertCircle, 
  CheckCircle2,
  TrendingUp,
  Tag,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  IndexNumbersResult, 
  IndexItemObservation, 
  IndexValidationState,
  IndexNumbersClassification 
} from '../types/statistics';
import { calculateIndexNumbers } from '../statistics/indexNumbers';
import { validateIndexInputs, parseIndexDataset } from '../statistics/validation';
import { formatNumber } from '../statistics/centralTendency';

// Verified KOI & CO. Item-Price Sample Dataset (ΣP0 = 2826, ΣP1 = 3543)
const VERIFIED_KOI_SAMPLE_ITEMS: IndexItemObservation[] = [
  { itemName: 'Espresso Blend (250g)', basePrice: 380, currentPrice: 480 },
  { itemName: 'Cold Brew Reserve (Bottle)', basePrice: 220, currentPrice: 280 },
  { itemName: 'Japanese Matcha Latte', basePrice: 260, currentPrice: 320 },
  { itemName: 'Almond Croissant', basePrice: 190, currentPrice: 240 },
  { itemName: 'Truffle Parmesan Fries', basePrice: 290, currentPrice: 360 },
  { itemName: 'Smoked Salmon Tartine', basePrice: 460, currentPrice: 580 },
  { itemName: 'Basque Burnt Cheesecake', basePrice: 340, currentPrice: 425 },
  { itemName: 'Signature Pour Over Reserve', basePrice: 686, currentPrice: 858 },
];

interface IndexNumbersModuleProps {
  onResultCalculated?: (res: IndexNumbersResult | null) => void;
}

export function IndexNumbersModule({ onResultCalculated }: IndexNumbersModuleProps = {}) {
  // Input dimensions & configuration
  const [itemCount, setItemCount] = useState(8);
  const [basePeriodName, setBasePeriodName] = useState('Base Period (P0)');
  const [currentPeriodName, setCurrentPeriodName] = useState('Current Period (P1)');
  const [showConfig, setShowConfig] = useState(false);

  // Raw inputs for item name, base price P0, and current price P1
  const [itemNames, setItemNames] = useState<string[]>(
    Array.from({ length: 8 }, (_, i) => `Item ${i + 1}`)
  );
  const [basePrices, setBasePrices] = useState<string[]>(Array(8).fill(''));
  const [currentPrices, setCurrentPrices] = useState<string[]>(Array(8).fill(''));

  // Validation & Result states
  const [validationState, setValidationState] = useState<IndexValidationState | null>(null);
  const [result, setResult] = useState<IndexNumbersResult | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [isModuleOpen, setIsModuleOpen] = useState(true);
  const [showCalculation, setShowCalculation] = useState(false);

  // Invalidate analysis when inputs change
  const handleNameChange = (idx: number, val: string) => {
    const updated = [...itemNames];
    updated[idx] = val;
    setItemNames(updated);

    if (hasAnalyzed) {
      setHasAnalyzed(false);
      setResult(null);
      onResultCalculated?.(null);
    }
    if (validationState) {
      setValidationState(null);
    }
  };

  const handleBasePriceChange = (idx: number, val: string) => {
    const updated = [...basePrices];
    updated[idx] = val;
    setBasePrices(updated);

    if (hasAnalyzed) {
      setHasAnalyzed(false);
      setResult(null);
      onResultCalculated?.(null);
    }
    if (validationState) {
      setValidationState(null);
    }
  };

  const handleCurrentPriceChange = (idx: number, val: string) => {
    const updated = [...currentPrices];
    updated[idx] = val;
    setCurrentPrices(updated);

    if (hasAnalyzed) {
      setHasAnalyzed(false);
      setResult(null);
      onResultCalculated?.(null);
    }
    if (validationState) {
      setValidationState(null);
    }
  };

  const handleItemCountChange = (newCount: number) => {
    if (newCount < 2 || newCount > 30) return;
    setItemCount(newCount);

    const newNames = Array.from({ length: newCount }, (_, i) => 
      itemNames[i] || `Item ${i + 1}`
    );
    const newBase = Array.from({ length: newCount }, (_, i) => 
      basePrices[i] || ''
    );
    const newCurr = Array.from({ length: newCount }, (_, i) => 
      currentPrices[i] || ''
    );

    setItemNames(newNames);
    setBasePrices(newBase);
    setCurrentPrices(newCurr);
    setHasAnalyzed(false);
    setResult(null);
    onResultCalculated?.(null);
    setValidationState(null);
  };

  const handleLoadSample = () => {
    setItemCount(VERIFIED_KOI_SAMPLE_ITEMS.length);
    setBasePeriodName('Base Period (P0)');
    setCurrentPeriodName('Current Period (P1)');
    setItemNames(VERIFIED_KOI_SAMPLE_ITEMS.map((item) => item.itemName));
    setBasePrices(VERIFIED_KOI_SAMPLE_ITEMS.map((item) => item.basePrice.toString()));
    setCurrentPrices(VERIFIED_KOI_SAMPLE_ITEMS.map((item) => item.currentPrice.toString()));
    setHasAnalyzed(false);
    setResult(null);
    onResultCalculated?.(null);
    setValidationState(null);
  };

  const handleClear = () => {
    setItemNames(Array.from({ length: itemCount }, (_, i) => `Item ${i + 1}`));
    setBasePrices(Array(itemCount).fill(''));
    setCurrentPrices(Array(itemCount).fill(''));
    setHasAnalyzed(false);
    setResult(null);
    onResultCalculated?.(null);
    setValidationState(null);
  };

  const handleAnalyze = () => {
    const validation = validateIndexInputs(itemNames, basePrices, currentPrices, itemCount);
    setValidationState(validation);

    if (!validation.isValid) {
      setHasAnalyzed(false);
      setResult(null);
      onResultCalculated?.(null);
      return;
    }

    try {
      const parsedItems = parseIndexDataset(itemNames, basePrices, currentPrices);
      const res = calculateIndexNumbers(parsedItems);
      setResult(res);
      setHasAnalyzed(true);
      onResultCalculated?.(res);
    } catch (err) {
      console.error('Index numbers calculation error:', err);
    }
  };

  // Helper count of complete items
  const filledCount = itemNames.filter((name, idx) => 
    name.trim() !== '' && 
    (basePrices[idx] ?? '').trim() !== '' && 
    (currentPrices[idx] ?? '').trim() !== ''
  ).length;
  const isComplete = filledCount === itemCount;

  // Render classification badge with deterministic styling
  const renderClassificationBadge = (classification: IndexNumbersClassification) => {
    switch (classification) {
      case 'EXTREMELY HIGH INCREASE':
      case 'VERY HIGH INCREASE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
            <span>{classification}</span>
          </span>
        );
      case 'HIGH INCREASE':
      case 'MODERATE INCREASE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>{classification}</span>
          </span>
        );
      case 'SLIGHT INCREASE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>{classification}</span>
          </span>
        );
      case 'NO CHANGE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>NO CHANGE</span>
          </span>
        );
      case 'SLIGHT DECREASE':
      case 'MODERATE DECREASE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/40">
            <TrendingUp className="w-3.5 h-3.5 text-teal-400 rotate-180" />
            <span>{classification}</span>
          </span>
        );
      case 'LARGE DECREASE':
      case 'VERY LARGE DECREASE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40">
            <TrendingUp className="w-3.5 h-3.5 text-blue-400 rotate-180" />
            <span>{classification}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono bg-slate-800 text-slate-300">
            {classification}
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/90 shadow-xl overflow-hidden transition-all duration-300 hover:border-slate-700/70">
      
      {/* Module Header */}
      <div className="p-5 sm:p-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 font-semibold tracking-wider">
              06 INDEX NUMBERS
            </span>
            <span className="font-mono text-xs text-slate-500">·</span>
            <span className="font-mono text-xs text-emerald-400">Complete 6-Tool Suite Live</span>
          </div>
          <h2 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">
            SIMPLE AGGREGATIVE PRICE INDEX
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Compare selected business item prices between Base Period (P₀) and Current Period (P₁) using the Simple Aggregative Price Index formula: <code className="text-purple-300 font-mono">(ΣP₁ / ΣP₀) × 100</code>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-mono transition-colors cursor-pointer border border-purple-500/30"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>LOAD SAMPLE VALUES</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModuleOpen(!isModuleOpen)}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            aria-label={isModuleOpen ? 'Collapse Index Numbers Module' : 'Expand Index Numbers Module'}
          >
            {isModuleOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isModuleOpen && (
        <div className="p-5 sm:p-6 space-y-6">

          {/* Action & Configuration Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadSample}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-mono transition-colors cursor-pointer border border-purple-500/30"
              >
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>LOAD SAMPLE VALUES</span>
              </button>

              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                  showConfig
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Configure ({itemCount} Items)</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono transition-colors cursor-pointer border border-slate-800"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span>Base: <strong className="text-slate-200">{basePeriodName}</strong></span>
              <span>·</span>
              <span>Current: <strong className="text-slate-200">{currentPeriodName}</strong></span>
            </div>
          </div>

          {/* Config Expandable Panel */}
          {showConfig && (
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
                    Base Period Label (P₀)
                  </label>
                  <input
                    type="text"
                    value={basePeriodName}
                    onChange={(e) => setBasePeriodName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
                    Current Period Label (P₁)
                  </label>
                  <input
                    type="text"
                    value={currentPeriodName}
                    onChange={(e) => setCurrentPeriodName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
                    Number of Items (n)
                  </label>
                  <div className="flex items-center gap-2">
                    {[4, 6, 8, 10, 12].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => handleItemCountChange(cnt)}
                        className={`px-2 py-1 rounded font-mono text-xs cursor-pointer ${
                          itemCount === cnt
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                            : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        n = {cnt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Input Integrity Header */}
          <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-2">
            <div className="flex items-center gap-2 text-slate-300">
              <Tag className="w-3.5 h-3.5 text-purple-400" />
              <span>Manual Item Price Entry: Enter Item Name, Base Price (P₀), and Current Price (P₁)</span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px]">
              {isComplete ? (
                <span className="inline-flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{filledCount} / {itemCount} Complete ({itemCount * 2} prices)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{filledCount} / {itemCount} Complete</span>
                </span>
              )}
            </div>
          </div>

          {/* Compact Item Observation Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {Array.from({ length: itemCount }).map((_, idx) => {
              const err = validationState?.errors[idx];
              const name = itemNames[idx] ?? '';
              const base = basePrices[idx] ?? '';
              const curr = currentPrices[idx] ?? '';
              const isNameFilled = name.trim() !== '';
              const isBaseFilled = base.trim() !== '';
              const isCurrFilled = curr.trim() !== '';

              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border transition-all flex flex-col gap-1.5 ${
                    err
                      ? 'border-rose-500/80 bg-rose-950/20 shadow-[0_0_8px_rgba(244,63,94,0.1)]'
                      : isNameFilled && isBaseFilled && isCurrFilled
                      ? 'border-slate-700 bg-slate-900/80'
                      : 'border-slate-800 bg-slate-950/60'
                  }`}
                >
                  {/* Row Header with Item Number & Name Input */}
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-slate-500 shrink-0 px-1 py-0.5 rounded bg-slate-950 border border-slate-800">
                      #{String(idx + 1).padStart(2, '0')}
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleNameChange(idx, e.target.value)}
                      placeholder={`Item ${idx + 1}`}
                      className={`w-full px-1.5 py-0.5 text-xs font-mono rounded bg-slate-950/80 border focus:outline-none ${
                        err?.name ? 'border-rose-500 text-rose-300' : 'border-slate-800 text-slate-200 focus:border-purple-500'
                      }`}
                      aria-label={`Item ${idx + 1} Name`}
                    />
                  </div>

                  {/* Dual Price Inputs (Base P0 & Current P1) */}
                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    
                    {/* Base P0 Input */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">P₀:</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={base}
                        onChange={(e) => {
                          const raw = e.target.value;
                          if (/^\d*\.?\d*$/.test(raw) || raw === '') {
                            handleBasePriceChange(idx, raw);
                          }
                        }}
                        placeholder="₹ Base"
                        className={`w-full px-1.5 py-1 font-mono text-xs text-right rounded bg-slate-950/90 border focus:outline-none ${
                          err?.base ? 'border-rose-500 text-rose-300' : 'border-slate-800 text-slate-300 focus:border-purple-500'
                        }`}
                        aria-label={`Item ${idx + 1} Base Price`}
                      />
                    </div>

                    {/* Current P1 Input */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">P₁:</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={curr}
                        onChange={(e) => {
                          const raw = e.target.value;
                          if (/^\d*\.?\d*$/.test(raw) || raw === '') {
                            handleCurrentPriceChange(idx, raw);
                          }
                        }}
                        placeholder="₹ Curr"
                        className={`w-full px-1.5 py-1 font-mono text-xs text-right rounded bg-slate-950/90 border focus:outline-none ${
                          err?.current ? 'border-rose-500 text-rose-300' : 'border-slate-800 text-emerald-300 focus:border-emerald-500'
                        }`}
                        aria-label={`Item ${idx + 1} Current Price`}
                      />
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Validation Notice Banner */}
          {validationState && !validationState.isValid && (
            <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-300 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold text-rose-200">Strict Validation Rule: </span>
                <span>{validationState.generalError}</span>
                <p className="text-[11px] text-rose-400 mt-0.5">
                  Complete all {itemCount} items with strictly positive numerical values (P₀ &gt; 0, P₁ &gt; 0) before analysis. Empty fields are never treated as zero.
                </p>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs font-mono text-slate-500">
              Formula: Price Index = (ΣP₁ / ΣP₀) × 100 · n = {itemCount} items
            </span>

            <button
              type="button"
              onClick={handleAnalyze}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded bg-purple-500 hover:bg-purple-400 text-slate-950 font-semibold text-xs font-mono tracking-wider transition-all duration-200 hover:scale-[1.01] shadow-[0_0_20px_rgba(168,85,247,0.25)] cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>CALCULATE PRICE INDEX</span>
            </button>
          </div>

          {/* Result Section */}
          {result && (
            <div className="space-y-6 pt-4 border-t border-slate-800/80 animate-in fade-in duration-200">

              {/* Four Required Output Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Card 1: BASE PERIOD TOTAL */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 group">
                  <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                    BASE PERIOD TOTAL (ΣP₀)
                  </span>
                  <p className="font-mono text-2xl font-bold text-slate-200">
                    ₹{formatNumber(result.basePeriodTotal)}
                  </p>
                  <p className="text-[11px] font-mono text-slate-500 mt-1">
                    Aggregate across {result.n} selected items
                  </p>
                </div>

                {/* Card 2: CURRENT PERIOD TOTAL */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 group">
                  <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                    CURRENT PERIOD TOTAL (ΣP₁)
                  </span>
                  <p className="font-mono text-2xl font-bold text-emerald-400">
                    ₹{formatNumber(result.currentPeriodTotal)}
                  </p>
                  <p className="text-[11px] font-mono text-slate-500 mt-1">
                    Aggregate across {result.n} selected items
                  </p>
                </div>

                {/* Card 3: PRICE INDEX */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/30 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
                  <span className="font-mono text-[10px] text-purple-400 uppercase tracking-wider block mb-1">
                    PRICE INDEX (P₀₁)
                  </span>
                  <p className="font-mono text-3xl font-extrabold text-white">
                    {formatNumber(result.priceIndex, 2)}
                  </p>
                  <div className="mt-1">
                    {renderClassificationBadge(result.classification)}
                  </div>
                </div>

                {/* Card 4: PERCENTAGE CHANGE */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 group">
                  <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                    PERCENTAGE CHANGE
                  </span>
                  <p className={`font-mono text-3xl font-bold ${
                    result.percentageChange > 0
                      ? 'text-rose-400'
                      : result.percentageChange < 0
                      ? 'text-teal-400'
                      : 'text-indigo-300'
                  }`}>
                    {result.percentageChange > 0 ? '+' : result.percentageChange < 0 ? '−' : ''}
                    {formatNumber(Math.abs(result.percentageChange), 2)}%
                  </p>
                  <p className="text-[11px] font-mono text-slate-500 mt-1">
                    Relative to Base Period (100.00)
                  </p>
                </div>

              </div>

              {/* Statistical & Business Interpretation Block */}
              <div className="rounded-xl bg-gradient-to-r from-purple-950/40 via-slate-900/80 to-slate-950/80 border border-purple-500/30 p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
                  <Lightbulb className="w-4 h-4 text-purple-400" />
                  <h4 className="font-display text-sm font-bold text-white tracking-wide">
                    STATISTICAL INTERPRETATION &amp; BUSINESS IMPLICATION
                  </h4>
                </div>

                <div className="space-y-3 text-xs sm:text-sm leading-relaxed">
                  {/* Statistical Interpretation */}
                  <p className="text-slate-200">
                    <strong className="text-purple-300">Statistical Finding: </strong>
                    {result.interpretation}
                  </p>

                  {/* Business Implication */}
                  <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0" />
                    <div>
                      <span className="font-mono text-xs text-purple-300 font-semibold block mb-0.5">
                        BUSINESS IMPLICATION
                      </span>
                      <p className="text-slate-300 text-xs">{result.businessImplication}</p>
                    </div>
                  </div>

                  {/* Actionable Business Signal */}
                  <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                    <div>
                      <span className="font-mono text-xs text-emerald-400 font-semibold block mb-0.5">
                        ACTIONABLE BUSINESS SIGNAL
                      </span>
                      <p className="text-slate-300 text-xs">{result.businessSignal}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calculation Transparency (VIEW CALCULATION) */}
              <div className="border border-slate-800/90 rounded-xl bg-slate-950/60 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowCalculation(!showCalculation)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-900/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-purple-400" />
                    <span className="font-mono text-xs font-semibold text-white tracking-wide">
                      VIEW CALCULATION &amp; ITEMIZED BREAKDOWN
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <span>{showCalculation ? 'Hide Calculation Table' : 'Show Full Formula & Item Matrix'}</span>
                    {showCalculation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {showCalculation && (
                  <div className="p-4 sm:p-6 border-t border-slate-800/80 space-y-6 text-xs font-mono animate-in fade-in duration-150">
                    
                    {/* Mathematical Formula Steps */}
                    <div className="space-y-3">
                      <h5 className="font-display text-xs font-bold text-purple-300 uppercase tracking-wider">
                        1. Mathematical Formula &amp; Substitution
                      </h5>
                      <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2 text-slate-300">
                        <div>
                          <span className="text-slate-500">Base Period Total (ΣP₀): </span>
                          <span className="text-slate-100 font-bold">{result.steps.sumP0}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Current Period Total (ΣP₁): </span>
                          <span className="text-emerald-400 font-bold">{result.steps.sumP1}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Index Formula: </span>
                          <span className="text-purple-300">{result.steps.indexFormula}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Calculation Step: </span>
                          <span className="text-white font-semibold">{result.steps.indexCalculation}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Percentage Change Step: </span>
                          <span className="text-teal-300 font-semibold">{result.steps.pctChangeCalculation}</span>
                        </div>
                      </div>
                    </div>

                    {/* Itemized Table */}
                    <div className="space-y-3">
                      <h5 className="font-display text-xs font-bold text-purple-300 uppercase tracking-wider">
                        2. Itemized Price Matrix
                      </h5>
                      <div className="overflow-x-auto rounded-lg border border-slate-800">
                        <table className="w-full text-left border-collapse text-[11px]">
                          <thead>
                            <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                              <th className="p-2 text-center">#</th>
                              <th className="p-2">Item Description</th>
                              <th className="p-2 text-right">Base Period (P₀)</th>
                              <th className="p-2 text-right">Current Period (P₁)</th>
                              <th className="p-2 text-right">Difference (P₁ − P₀)</th>
                              <th className="p-2 text-right">% Shift</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 font-mono">
                            {result.items.map((it, idx) => (
                              <tr key={idx} className="hover:bg-slate-900/50">
                                <td className="p-2 text-center text-slate-500">{idx + 1}</td>
                                <td className="p-2 text-slate-200 font-medium">{it.itemName}</td>
                                <td className="p-2 text-right text-slate-300">₹{formatNumber(it.p0)}</td>
                                <td className="p-2 text-right text-emerald-400">₹{formatNumber(it.p1)}</td>
                                <td className="p-2 text-right text-slate-300">
                                  {it.itemDiff >= 0 ? '+' : ''}₹{formatNumber(it.itemDiff)}
                                </td>
                                <td className="p-2 text-right text-slate-400">
                                  {it.itemDiffPercent >= 0 ? '+' : ''}{formatNumber(it.itemDiffPercent, 1)}%
                                </td>
                              </tr>
                            ))}
                            {/* Totals Row */}
                            <tr className="bg-slate-900/90 font-bold border-t-2 border-slate-700 text-slate-200">
                              <td className="p-2 text-center text-purple-400">Σ</td>
                              <td className="p-2 text-purple-400">Totals (n = {result.n} items)</td>
                              <td className="p-2 text-right text-slate-100">₹{formatNumber(result.basePeriodTotal)}</td>
                              <td className="p-2 text-right text-emerald-400">₹{formatNumber(result.currentPeriodTotal)}</td>
                              <td className="p-2 text-right text-slate-200">
                                +₹{formatNumber(result.currentPeriodTotal - result.basePeriodTotal)}
                              </td>
                              <td className="p-2 text-right text-purple-300">
                                Index = {formatNumber(result.priceIndex, 2)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
