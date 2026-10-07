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
  ArrowRight,
  Calendar,
  Clock,
  Layers
} from 'lucide-react';
import { 
  TimeSeriesResult, 
  TimeSeriesObservation, 
  TimeSeriesValidationState 
} from '../types/statistics';
import { 
  calculateTimeSeries, 
  predictTimeSeriesValue 
} from '../statistics/timeSeries';
import { 
  validateTimeSeriesInputs, 
  parseTimeSeriesDataset 
} from '../statistics/validation';
import { formatNumber } from '../statistics/centralTendency';

// Verified KOI & CO. Customer Footfall Sample Dataset (15 Observations: 24 Aug - 7 Sep)
const KOI_TIMELINE_SAMPLE = [
  { period: '24 Aug', value: 85 },
  { period: '25 Aug', value: 65 },
  { period: '26 Aug', value: 70 },
  { period: '27 Aug', value: 72 },
  { period: '28 Aug', value: 80 },
  { period: '29 Aug', value: 1050 },
  { period: '30 Aug', value: 1000 },
  { period: '31 Aug', value: 419 },
  { period: '1 Sep', value: 85 },
  { period: '2 Sep', value: 565 },
  { period: '3 Sep', value: 517 },
  { period: '4 Sep', value: 550 },
  { period: '5 Sep', value: 819 },
  { period: '6 Sep', value: 1010 },
  { period: '7 Sep', value: 100 },
];

interface TimeSeriesModuleProps {
  onResultCalculated?: (res: TimeSeriesResult | null) => void;
}

export function TimeSeriesModule({ onResultCalculated }: TimeSeriesModuleProps = {}) {
  // Input configuration
  const [variableName, setVariableName] = useState('Customer Footfall');
  const [periodCount, setPeriodCount] = useState(12);
  const [showConfig, setShowConfig] = useState(false);

  // Raw period and value inputs
  const [periodLabels, setPeriodLabels] = useState<string[]>(
    Array.from({ length: 12 }, (_, i) => `Period ${i + 1}`)
  );
  const [values, setValues] = useState<string[]>(Array(12).fill(''));

  // Validation & Result states
  const [validationState, setValidationState] = useState<TimeSeriesValidationState | null>(null);
  const [result, setResult] = useState<TimeSeriesResult | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [isModuleOpen, setIsModuleOpen] = useState(true);
  const [showCalculation, setShowCalculation] = useState(false);

  // Interactive Custom Forecast state
  const [customForecastT, setCustomForecastT] = useState<string>('13');
  const [customForecastResult, setCustomForecastResult] = useState<number | null>(null);

  // Hover chart point
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Input change handlers
  const handlePeriodChange = (idx: number, val: string) => {
    const updated = [...periodLabels];
    updated[idx] = val;
    setPeriodLabels(updated);

    if (hasAnalyzed) {
      setHasAnalyzed(false);
      setResult(null);
      setCustomForecastResult(null);
      onResultCalculated?.(null);
    }
    if (validationState) {
      setValidationState(null);
    }
  };

  const handleValueChange = (idx: number, val: string) => {
    const updated = [...values];
    updated[idx] = val;
    setValues(updated);

    if (hasAnalyzed) {
      setHasAnalyzed(false);
      setResult(null);
      setCustomForecastResult(null);
      onResultCalculated?.(null);
    }
    if (validationState) {
      setValidationState(null);
    }
  };

  const handlePeriodCountChange = (newCount: number) => {
    if (newCount < 3 || newCount > 40) return;
    setPeriodCount(newCount);

    const newLabels = Array.from({ length: newCount }, (_, i) => 
      periodLabels[i] || `Period ${i + 1}`
    );
    const newVals = Array.from({ length: newCount }, (_, i) => 
      values[i] || ''
    );

    setPeriodLabels(newLabels);
    setValues(newVals);
    setCustomForecastT(String(newCount + 1));
    setHasAnalyzed(false);
    setResult(null);
    setCustomForecastResult(null);
    onResultCalculated?.(null);
    setValidationState(null);
  };

  const handleLoadSample = () => {
    setPeriodCount(KOI_TIMELINE_SAMPLE.length);
    setVariableName('Customer Footfall');
    setPeriodLabels(KOI_TIMELINE_SAMPLE.map((s) => s.period));
    setValues(KOI_TIMELINE_SAMPLE.map((s) => s.value.toString()));
    setCustomForecastT(String(KOI_TIMELINE_SAMPLE.length + 1));
    setHasAnalyzed(false);
    setResult(null);
    setCustomForecastResult(null);
    onResultCalculated?.(null);
    setValidationState(null);
  };

  const handleClear = () => {
    setPeriodLabels(Array.from({ length: periodCount }, (_, i) => `Period ${i + 1}`));
    setValues(Array(periodCount).fill(''));
    setHasAnalyzed(false);
    setResult(null);
    setCustomForecastResult(null);
    onResultCalculated?.(null);
    setValidationState(null);
  };

  const handleAnalyze = () => {
    const validation = validateTimeSeriesInputs(periodLabels, values, periodCount);
    setValidationState(validation);

    if (!validation.isValid) {
      setHasAnalyzed(false);
      setResult(null);
      setCustomForecastResult(null);
      onResultCalculated?.(null);
      return;
    }

    try {
      const parsed = parseTimeSeriesDataset(periodLabels, values);
      const res = calculateTimeSeries(parsed, variableName);
      setResult(res);
      setHasAnalyzed(true);
      onResultCalculated?.(res);

      // Default custom forecast computation
      const targetT = parseInt(customForecastT, 10);
      if (!isNaN(targetT) && targetT > 0) {
        setCustomForecastResult(predictTimeSeriesValue(res.intercept, res.slope, targetT));
      }
    } catch (err) {
      console.error('Time series calculation error:', err);
    }
  };

  const handleCustomForecastCalculate = () => {
    if (!result) return;
    const targetT = parseInt(customForecastT, 10);
    if (!isNaN(targetT) && targetT > 0) {
      setCustomForecastResult(predictTimeSeriesValue(result.intercept, result.slope, targetT));
    }
  };

  // Helper count of completed observations
  const filledCount = values.filter((v, idx) => v.trim() !== '' && (periodLabels[idx] ?? '').trim() !== '').length;
  const isComplete = filledCount === periodCount;

  // Render Trajectory Badge
  const renderTrajectoryBadge = (trajectory: string) => {
    switch (trajectory) {
      case 'STRONG EXPANSION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>STRONG EXPANSION</span>
          </span>
        );
      case 'MODERATE EXPANSION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/40">
            <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
            <span>MODERATE EXPANSION</span>
          </span>
        );
      case 'STABLE / MINIMAL TREND':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>STABLE / MINIMAL TREND</span>
          </span>
        );
      case 'MODERATE CONTRACTION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>MODERATE CONTRACTION</span>
          </span>
        );
      case 'SIGNIFICANT CONTRACTION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>SIGNIFICANT CONTRACTION</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono bg-slate-800 text-slate-300">
            {trajectory}
          </span>
        );
    }
  };

  // Prepare SVG coordinates for Trend Chart
  const renderSvgChart = (res: TimeSeriesResult) => {
    const audit = res.auditRows;
    const forecasts = res.forecasts;
    if (audit.length === 0) return null;

    const width = 800;
    const height = 280;
    const padX = 55;
    const padY = 35;

    const allValues = [
      ...audit.map((a) => a.y),
      ...audit.map((a) => a.trendValue),
      ...audit.filter((a) => a.movingAverage3 !== null).map((a) => a.movingAverage3 as number),
      ...forecasts.map((f) => f.forecastedValue),
    ];

    const minY = Math.min(...allValues);
    const maxY = Math.max(...allValues);
    const ySpan = maxY - minY || 1;
    const paddedMinY = Math.max(0, minY - ySpan * 0.1);
    const paddedMaxY = maxY + ySpan * 0.1;
    const totalYSpan = paddedMaxY - paddedMinY;

    const totalPoints = audit.length + forecasts.length;
    const getX = (t: number) => padX + ((t - 1) / (totalPoints - 1)) * (width - padX * 2);
    const getY = (v: number) => height - padY - ((v - paddedMinY) / totalYSpan) * (height - padY * 2);

    // Actual Line Path
    const actualPath = audit
      .map((row, i) => `${i === 0 ? 'M' : 'L'} ${getX(row.t)} ${getY(row.y)}`)
      .join(' ');

    // Trend Line Path (Across historical and forecast periods)
    const trendStart = { t: 1, val: res.intercept + res.slope * 1 };
    const trendEnd = { t: totalPoints, val: res.intercept + res.slope * totalPoints };
    const trendPath = `M ${getX(trendStart.t)} ${getY(trendStart.val)} L ${getX(trendEnd.t)} ${getY(trendEnd.val)}`;

    // Moving Average Path
    const validMaRows = audit.filter((a) => a.movingAverage3 !== null);
    const maPath = validMaRows
      .map((row, i) => `${i === 0 ? 'M' : 'L'} ${getX(row.t)} ${getY(row.movingAverage3!)}`)
      .join(' ');

    // Forecast Dotted Line Path
    const lastHist = audit[audit.length - 1];
    const forecastPath = [
      `M ${getX(lastHist.t)} ${getY(lastHist.trendValue)}`,
      ...forecasts.map((f) => `L ${getX(f.t)} ${getY(f.forecastedValue)}`),
    ].join(' ');

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-400 rounded-full" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <span className="text-slate-300">Observed Actual ({res.variableName})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-t-2 border-dashed border-indigo-400 inline-block" />
              <span className="text-indigo-300">Secular Trend Line (T_t)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 bg-amber-400/90 rounded-full inline-block" />
              <span className="text-amber-300">3-Period Moving Average</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t-2 border-dotted border-purple-400 inline-block" />
              <span className="w-2 h-2 rounded-full border border-purple-400 bg-purple-950 inline-block" />
              <span className="text-purple-300">Forecast Extrapolation</span>
            </div>
          </div>
          <span className="text-slate-500 text-[11px]">Hover nodes for exact period figures</span>
        </div>

        <div className="relative rounded-lg bg-slate-950/90 border border-slate-800 p-3 overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto min-w-[620px] select-none"
          >
            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const yVal = paddedMinY + totalYSpan * (1 - pct);
              const yPos = padY + pct * (height - padY * 2);
              return (
                <g key={idx}>
                  <line
                    x1={padX}
                    y1={yPos}
                    x2={width - padX}
                    y2={yPos}
                    stroke="#1e293b"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padX - 8}
                    y={yPos + 3.5}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {formatNumber(yVal, 0)}
                  </text>
                </g>
              );
            })}

            {/* Historical Boundary Divider */}
            <line
              x1={getX(audit.length) + (getX(audit.length + 1) - getX(audit.length)) / 2}
              y1={padY}
              x2={getX(audit.length) + (getX(audit.length + 1) - getX(audit.length)) / 2}
              y2={height - padY}
              stroke="#6366f1"
              strokeWidth="1"
              strokeDasharray="2 4"
              opacity="0.4"
            />
            <text
              x={getX(audit.length) + (getX(audit.length + 1) - getX(audit.length)) / 2 + 4}
              y={padY + 12}
              fill="#818cf8"
              fontSize="8.5"
              fontFamily="monospace"
            >
              PROJECTION WINDOW →
            </text>

            {/* Secular Trend Line (Dashed) */}
            <path
              d={trendPath}
              fill="none"
              stroke="#818cf8"
              strokeWidth="2"
              strokeDasharray="6 4"
              opacity="0.85"
            />

            {/* 3-Period Moving Average Line */}
            {maPath && (
              <path
                d={maPath}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2.5"
                opacity="0.9"
              />
            )}

            {/* Forecast Dotted Line */}
            <path
              d={forecastPath}
              fill="none"
              stroke="#c084fc"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Actual Line */}
            <path
              d={actualPath}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
            />

            {/* Observed Nodes */}
            {audit.map((row, idx) => {
              const cx = getX(row.t);
              const cy = getY(row.y);
              const isHovered = hoveredIdx === idx;

              return (
                <g key={row.t} className="cursor-pointer" onMouseEnter={() => setHoveredIdx(idx)} onMouseLeave={() => setHoveredIdx(null)}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 6 : 4}
                    fill={isHovered ? '#34d399' : '#10b981'}
                    stroke="#020617"
                    strokeWidth="2"
                    className="transition-all"
                  />
                  {/* Period label on X-axis */}
                  <text
                    x={cx}
                    y={height - padY + 15}
                    textAnchor="middle"
                    fill={isHovered ? '#34d399' : '#64748b'}
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {row.periodLabel}
                  </text>
                </g>
              );
            })}

            {/* Forecast Nodes */}
            {forecasts.map((f, fIdx) => {
              const cx = getX(f.t);
              const cy = getY(f.forecastedValue);
              const globalIdx = audit.length + fIdx;
              const isHovered = hoveredIdx === globalIdx;

              return (
                <g key={f.t} className="cursor-pointer" onMouseEnter={() => setHoveredIdx(globalIdx)} onMouseLeave={() => setHoveredIdx(null)}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 6 : 4}
                    fill="#0f172a"
                    stroke="#c084fc"
                    strokeWidth="2.5"
                    className="transition-all"
                  />
                  <text
                    x={cx}
                    y={height - padY + 15}
                    textAnchor="middle"
                    fill={isHovered ? '#c084fc' : '#94a3b8'}
                    fontSize="8.5"
                    fontFamily="monospace"
                  >
                    {f.periodLabel}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Hover Node Tooltip Card */}
          {hoveredIdx !== null && (
            <div className="mt-2 p-2.5 rounded bg-slate-900 border border-slate-700/80 text-xs font-mono grid grid-cols-2 sm:grid-cols-4 gap-2 animate-in fade-in duration-100">
              {hoveredIdx < audit.length ? (
                <>
                  <div>
                    <span className="text-slate-500 block">Period Label:</span>
                    <span className="text-white font-bold">{audit[hoveredIdx].periodLabel} (t={audit[hoveredIdx].t})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Observed Actual:</span>
                    <span className="text-emerald-400 font-bold">{formatNumber(audit[hoveredIdx].y)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Trend Line (T_t):</span>
                    <span className="text-indigo-300 font-bold">{formatNumber(audit[hoveredIdx].trendValue)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">3-Period Moving Avg:</span>
                    <span className="text-amber-300 font-bold">
                      {audit[hoveredIdx].movingAverage3 !== null
                        ? formatNumber(audit[hoveredIdx].movingAverage3!)
                        : 'Boundary Edge'}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="text-slate-500 block">Forecast Horizon:</span>
                    <span className="text-purple-300 font-bold">{forecasts[hoveredIdx - audit.length].periodLabel}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Index (t):</span>
                    <span className="text-slate-300 font-bold">t = {forecasts[hoveredIdx - audit.length].t}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Projected Value (T_t = a + bt):</span>
                    <span className="text-purple-400 font-bold text-sm">
                      {formatNumber(forecasts[hoveredIdx - audit.length].forecastedValue)}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/90 shadow-xl overflow-hidden transition-all duration-300 hover:border-slate-700/70">
      
      {/* Module Header */}
      <div className="p-5 sm:p-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-semibold tracking-wider">
              05 TIME SERIES
            </span>
            <span className="font-mono text-xs text-slate-500">·</span>
            <span className="font-mono text-xs text-emerald-400">Live Stage 5 Engine</span>
          </div>
          <h2 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">
            TIME SERIES &amp; SECULAR TREND ANALYSIS
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Chronological Least-Squares Secular Trend Line (T = a + bt), 3-Period Moving Average Smoothing, 
            and Multi-Period Forward Extrapolation for KOI &amp; CO. business activity.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-mono transition-colors cursor-pointer border border-indigo-500/30"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>LOAD SAMPLE VALUES</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModuleOpen(!isModuleOpen)}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            aria-label={isModuleOpen ? 'Collapse Time Series Module' : 'Expand Time Series Module'}
          >
            {isModuleOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isModuleOpen && (
        <div className="p-5 sm:p-6 space-y-6">

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadSample}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-mono transition-colors cursor-pointer border border-indigo-500/30"
              >
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>LOAD SAMPLE VALUES</span>
              </button>

              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                  showConfig
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Configure Timeline ({periodCount} Periods)</span>
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

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Metric: <strong className="text-slate-200">{variableName}</strong></span>
            </div>
          </div>

          {/* Config Expandable Panel */}
          {showConfig && (
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
                    Tracked Variable / Business Series
                  </label>
                  <input
                    type="text"
                    value={variableName}
                    onChange={(e) => setVariableName(e.target.value)}
                    placeholder="e.g. Daily Cafe Revenue (₹)"
                    className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono uppercase text-[10px]">
                    Chronological Periods (n)
                  </label>
                  <div className="flex items-center gap-2">
                    {[8, 10, 12, 14, 16].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => handlePeriodCountChange(cnt)}
                        className={`px-2 py-1 rounded font-mono text-xs cursor-pointer ${
                          periodCount === cnt
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
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

          {/* Input Header & Progress Status */}
          <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-2">
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sequential Chronological Input: Time Period &amp; Actual Value</span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px]">
              {isComplete ? (
                <span className="inline-flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{filledCount} / {periodCount} Complete ({periodCount * 2} values)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{filledCount} / {periodCount} Complete</span>
                </span>
              )}
            </div>
          </div>

          {/* Observation Grid (Compact multi-column layout) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {Array.from({ length: periodCount }).map((_, idx) => {
              const err = validationState?.errors[idx];
              const pLabel = periodLabels[idx] ?? '';
              const val = values[idx] ?? '';
              const isPLabelFilled = pLabel.trim() !== '';
              const isValFilled = val.trim() !== '';

              return (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border transition-all flex items-center gap-2 ${
                    err
                      ? 'border-rose-500/80 bg-rose-950/20 shadow-[0_0_8px_rgba(244,63,94,0.1)]'
                      : isPLabelFilled && isValFilled
                      ? 'border-slate-700 bg-slate-900/80'
                      : 'border-slate-800 bg-slate-950/60'
                  }`}
                >
                  {/* Period Index */}
                  <span className="font-mono text-[10px] text-slate-500 shrink-0 px-1.5 py-0.5 border-r border-slate-800">
                    t={String(idx + 1).padStart(2, '0')}
                  </span>

                  {/* Period Date Label Input */}
                  <div className="flex-1 flex items-center gap-1 min-w-[90px]">
                    <span className="text-[10px] font-mono text-slate-400">Date:</span>
                    <input
                      type="text"
                      value={pLabel}
                      onChange={(e) => handlePeriodChange(idx, e.target.value)}
                      placeholder="e.g. 24 Aug"
                      className={`w-full px-1.5 py-1 font-mono text-xs rounded bg-slate-950/90 border focus:outline-none ${
                        err?.period ? 'border-rose-500 text-rose-300' : 'border-slate-800 text-indigo-300 focus:border-indigo-500'
                      }`}
                      aria-label={`Time Period ${idx + 1} Label`}
                    />
                  </div>

                  {/* Observed Value Input */}
                  <div className="flex-1 flex items-center gap-1">
                    <span className="text-[10px] font-mono text-slate-400">Val:</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={val}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (/^-?\d*\.?\d*$/.test(raw) || raw === '') {
                          handleValueChange(idx, raw);
                        }
                      }}
                      placeholder="—"
                      className={`w-full px-1.5 py-1 font-mono text-xs text-right rounded bg-slate-950/90 border focus:outline-none ${
                        err?.value ? 'border-rose-500 text-rose-300' : 'border-slate-800 text-emerald-300 focus:border-emerald-500'
                      }`}
                      aria-label={`Time Period ${idx + 1} Observed Value`}
                    />
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
                  Complete all {periodCount} time series periods and values before analysis. Missing values are never treated as zero.
                </p>
              </div>
            </div>
          )}

          {/* Analyze Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs font-mono text-slate-500">
              Requires full timeline integrity · n = {periodCount} periods
            </span>

            <button
              type="button"
              onClick={handleAnalyze}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-semibold text-xs font-mono tracking-wider transition-all duration-200 hover:scale-[1.01] shadow-[0_0_20px_rgba(99,102,241,0.25)] cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>ANALYZE TIME SERIES</span>
            </button>
          </div>

          {/* Result Section */}
          {result && (
            <div className="space-y-6 pt-4 border-t border-slate-800/80 animate-in fade-in duration-200">

              {/* Top Analytical Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Card 1: Secular Trend Equation */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-500/30 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                  <span className="font-mono text-[10px] text-indigo-400 uppercase tracking-wider block mb-1">
                    Secular Trend Equation
                  </span>
                  <p className="font-mono text-base font-bold text-white tracking-tight break-all">
                    {result.trendEquation}
                  </p>
                  <div className="mt-2 text-[11px] font-mono text-slate-400 space-y-0.5">
                    <div>Slope (b): <strong className="text-indigo-300">{formatNumber(result.slope, 4)} / period</strong></div>
                    <div>Baseline (a): <strong className="text-slate-300">{formatNumber(result.intercept, 2)}</strong></div>
                  </div>
                </div>

                {/* Card 2: Trajectory & Growth */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 group">
                  <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                    Trajectory &amp; Velocity
                  </span>
                  <div className="mb-2">
                    {renderTrajectoryBadge(result.trajectory)}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
                    <div>Pacing: <strong className="text-emerald-400">{formatNumber(result.growthRatePercent, 2)}%</strong> / period</div>
                    <div>Direction: <span className="text-slate-300">{result.slope >= 0 ? 'Upward secular shift' : 'Downwards secular drift'}</span></div>
                  </div>
                </div>

                {/* Card 3: Historical Baseline Midpoint */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 group">
                  <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                    Historical Baseline
                  </span>
                  <p className="font-mono text-2xl font-bold text-white">
                    {formatNumber(result.meanY, 2)}
                  </p>
                  <div className="mt-2 text-[11px] font-mono text-slate-400 space-y-0.5">
                    <div>Total Volume (ΣY): <strong className="text-slate-300">{formatNumber(result.sumY)}</strong></div>
                    <div>Timeline Depth: <strong className="text-slate-300">n = {result.n} periods</strong></div>
                  </div>
                </div>

                {/* Card 4: Smoothing & Fit Accuracy (MAPE) */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 group">
                  <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                    Trend Fit (MAPE)
                  </span>
                  <p className="font-mono text-2xl font-bold text-teal-300">
                    {formatNumber(result.mape, 2)}%
                  </p>
                  <div className="mt-2 text-[11px] font-mono text-slate-400 space-y-0.5">
                    <div>Moving Avg Span: <strong className="text-amber-300">3 Periods</strong></div>
                    <div>Fit Reliability: <span className="text-slate-300">{result.mape < 10 ? 'High Fit Tracking' : 'Moderate Variance'}</span></div>
                  </div>
                </div>

              </div>

              {/* Time Series SVG Chart with Trend, Moving Average & Forecast */}
              <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    <h3 className="font-display text-sm font-bold text-white tracking-wide">
                      MULTI-PERIOD TIME SERIES TRAJECTORY &amp; FORECAST
                    </h3>
                  </div>
                  <span className="font-mono text-xs text-slate-500">
                    n = {result.n} Observed + 3 Future Projections
                  </span>
                </div>

                {renderSvgChart(result)}
              </div>

              {/* Forward Forecast Horizon & Custom Period Extrapolator */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Immediate Next 3 Projections */}
                <div className="lg:col-span-7 p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <h4 className="font-display text-xs sm:text-sm font-bold text-white tracking-wide">
                      FORWARD FORECAST HORIZON (NEXT 3 PERIODS)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400">
                    Linear trend projections evaluated via formula <code className="text-purple-300 font-mono">T_t = {result.trendEquation.replace('T_t = ', '')}</code>:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {result.forecasts.map((fc) => (
                      <div
                        key={fc.t}
                        className="p-3 rounded-lg bg-slate-900/80 border border-purple-500/20 hover:border-purple-500/40 transition-colors"
                      >
                        <span className="font-mono text-[10px] text-purple-400 block mb-0.5">
                          Index t = {fc.t}
                        </span>
                        <div className="font-mono text-xs text-slate-300 font-semibold mb-1">
                          {fc.periodLabel}
                        </div>
                        <div className="font-mono text-base font-bold text-white">
                          {formatNumber(fc.forecastedValue)}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 mt-1">
                          {variableName}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Period Extrapolator */}
                <div className="lg:col-span-5 p-4 sm:p-5 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator className="w-4 h-4 text-emerald-400" />
                      <h4 className="font-display text-xs sm:text-sm font-bold text-white tracking-wide">
                        CUSTOM PERIOD EXTRAPOLATOR
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Forecast any future chronological period index using the secular trend model.
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <label htmlFor="custom-t-input" className="text-xs font-mono text-slate-400 shrink-0">
                        Period t:
                      </label>
                      <input
                        id="custom-t-input"
                        type="number"
                        min="1"
                        max="100"
                        value={customForecastT}
                        onChange={(e) => setCustomForecastT(e.target.value)}
                        placeholder="e.g. 15"
                        className="w-24 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={handleCustomForecastCalculate}
                        className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Compute
                      </button>
                    </div>
                  </div>

                  {customForecastResult !== null && (
                    <div className="mt-3 p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/30">
                      <span className="text-[10px] font-mono text-indigo-300 block mb-0.5">
                        Forecast for Period t = {customForecastT}:
                      </span>
                      <div className="font-mono text-lg font-bold text-white">
                        {formatNumber(customForecastResult)}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        T = {formatNumber(result.intercept, 2)} + ({formatNumber(result.slope, 4)} × {customForecastT})
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Commercial Business Signal & Tactical Action */}
              <div className="rounded-xl bg-gradient-to-r from-indigo-950/40 via-slate-900/80 to-emerald-950/30 border border-indigo-500/30 p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
                  <Lightbulb className="w-4 h-4 text-indigo-400" />
                  <h4 className="font-display text-sm font-bold text-white tracking-wide">
                    EXECUTIVE BUSINESS INTELLIGENCE &amp; COMMERCIAL RECOMMENDATION
                  </h4>
                </div>

                <div className="space-y-3 text-xs sm:text-sm leading-relaxed">
                  <p className="text-slate-300">
                    <strong className="text-indigo-300">Trend Assessment: </strong>
                    {result.interpretation}
                  </p>

                  <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                    <div>
                      <span className="font-mono text-xs text-emerald-400 font-semibold block mb-0.5">
                        COMMERCIAL SIGNAL
                      </span>
                      <p className="text-slate-300 text-xs">{result.businessSignal}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                    <div>
                      <span className="font-mono text-xs text-indigo-400 font-semibold block mb-0.5">
                        TACTICAL ACTION FOR KOI &amp; CO.
                      </span>
                      <p className="text-slate-300 text-xs">{result.action}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Mathematical Calculation & Audit Table (Collapsible) */}
              <div className="border border-slate-800/90 rounded-xl bg-slate-950/60 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowCalculation(!showCalculation)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-900/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-indigo-400" />
                    <span className="font-mono text-xs font-semibold text-white tracking-wide">
                      STEP-BY-STEP CALCULATION ENGINE &amp; AUDIT MATRIX
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <span>{showCalculation ? 'Hide Audit Breakdown' : 'Show Detailed Equations & Audit Table'}</span>
                    {showCalculation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {showCalculation && (
                  <div className="p-4 sm:p-6 border-t border-slate-800/80 space-y-6 text-xs font-mono animate-in fade-in duration-150">
                    
                    {/* Normal Equations & Slope Derivation */}
                    <div className="space-y-3">
                      <h5 className="font-display text-xs font-bold text-indigo-300 uppercase tracking-wider">
                        1. Least-Squares Secular Trend Derivation
                      </h5>
                      <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2 text-slate-300">
                        <div>
                          <span className="text-slate-500">Summary Totals: </span>
                          <span>n = {result.steps.n} · Σt = {result.steps.sumT} · ΣY = {result.steps.sumY} · Σ(t·Y) = {result.steps.sumTY} · Σt² = {result.steps.sumT2}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Slope Formula: </span>
                          <span className="text-indigo-300">{result.steps.slopeFormula}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Slope Substitution: </span>
                          <span className="text-white">{result.steps.slopeCalculation}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Intercept Formula: </span>
                          <span className="text-indigo-300">{result.steps.interceptFormula}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Intercept Substitution: </span>
                          <span className="text-white">{result.steps.interceptCalculation}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Pacing Velocity: </span>
                          <span className="text-emerald-400">{result.steps.growthRateCalculation}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Trend Tracking Fit: </span>
                          <span className="text-teal-300">{result.steps.mapeCalculation}</span>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Time Series Audit Table */}
                    <div className="space-y-3">
                      <h5 className="font-display text-xs font-bold text-indigo-300 uppercase tracking-wider">
                        2. Period-by-Period Audit Matrix
                      </h5>
                      <div className="overflow-x-auto rounded-lg border border-slate-800">
                        <table className="w-full text-left border-collapse text-[11px]">
                          <thead>
                            <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                              <th className="p-2 text-center">t</th>
                              <th className="p-2">Period Label</th>
                              <th className="p-2 text-right">Actual Y</th>
                              <th className="p-2 text-right">t · Y</th>
                              <th className="p-2 text-right">t²</th>
                              <th className="p-2 text-right text-indigo-300">Trend T_t</th>
                              <th className="p-2 text-right text-amber-300">3-Period SMA</th>
                              <th className="p-2 text-right text-teal-300">Residual (Y − T)</th>
                              <th className="p-2 text-right text-slate-400">% Dev</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 font-mono">
                            {result.auditRows.map((row) => (
                              <tr key={row.t} className="hover:bg-slate-900/50">
                                <td className="p-2 text-center text-slate-500">{row.t}</td>
                                <td className="p-2 text-slate-300 font-semibold">{row.periodLabel}</td>
                                <td className="p-2 text-right text-emerald-400">{formatNumber(row.y)}</td>
                                <td className="p-2 text-right text-slate-300">{formatNumber(row.ty)}</td>
                                <td className="p-2 text-right text-slate-400">{row.t2}</td>
                                <td className="p-2 text-right text-indigo-300 font-medium">{formatNumber(row.trendValue)}</td>
                                <td className="p-2 text-right text-amber-300">
                                  {row.movingAverage3 !== null ? formatNumber(row.movingAverage3) : '—'}
                                </td>
                                <td className="p-2 text-right text-teal-300">
                                  {row.residual >= 0 ? '+' : ''}{formatNumber(row.residual)}
                                </td>
                                <td className="p-2 text-right text-slate-400">
                                  {row.residualPercent >= 0 ? '+' : ''}{formatNumber(row.residualPercent, 1)}%
                                </td>
                              </tr>
                            ))}
                            {/* Totals Row */}
                            <tr className="bg-slate-900/90 font-bold border-t-2 border-slate-700 text-slate-200">
                              <td className="p-2 text-center text-indigo-400">Σ</td>
                              <td className="p-2 text-indigo-400">Totals (n={result.n})</td>
                              <td className="p-2 text-right text-emerald-400">{formatNumber(result.sumY)}</td>
                              <td className="p-2 text-right text-slate-200">{formatNumber(result.sumTY)}</td>
                              <td className="p-2 text-right text-slate-200">{result.sumT2}</td>
                              <td className="p-2 text-right text-indigo-300">—</td>
                              <td className="p-2 text-right text-amber-300">—</td>
                              <td className="p-2 text-right text-teal-300">Σ = 0.00</td>
                              <td className="p-2 text-right text-slate-400">MAPE={formatNumber(result.mape, 1)}%</td>
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
