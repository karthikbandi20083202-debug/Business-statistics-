/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Clock, Lock } from 'lucide-react';

interface FutureModuleCardProps {
  number: string;
  title: string;
  description: string;
  stageBadge: string;
}

export function FutureModuleCard({
  number,
  title,
  description,
  stageBadge,
}: FutureModuleCardProps) {
  return (
    <div className="rounded-xl bg-[#090e1d]/50 border border-slate-800/60 p-5 sm:p-6 opacity-75 hover:opacity-90 transition-opacity">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
            {number}
          </span>
          <h4 className="font-display text-sm sm:text-base font-bold text-slate-300 tracking-wide">
            {title}
          </h4>
        </div>

        <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-slate-400 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded">
          <Lock className="w-3 h-3 text-slate-500" />
          <span>{stageBadge}</span>
        </span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed mb-4">
        {description}
      </p>

      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
        <span className="inline-flex items-center gap-1.5 text-slate-400">
          <Clock className="w-3 h-3" />
          <span>Coming in next analysis module</span>
        </span>
        <span className="text-slate-600">Reserved Pipeline</span>
      </div>
    </div>
  );
}
