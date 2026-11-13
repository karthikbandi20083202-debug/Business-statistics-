/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';

export interface AnimatedNumberProps {
  value: number | string | null | undefined;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number; // duration in ms (default: ~400ms for fast & professional feel)
}

interface TextSegment {
  type: 'text';
  content: string;
}

interface NumberSegment {
  type: 'number';
  target: number;
  decimals: number;
  hasCommas: boolean;
  showPlus: boolean;
}

type ParsedSegment = TextSegment | NumberSegment;

interface ParsedValueResult {
  isParsable: boolean;
  fallback: string;
  segments: ParsedSegment[];
}

function formatWithCommas(numStr: string): string {
  const parts = numStr.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

function formatNumericToken(
  n: number,
  decimals: number,
  hasCommas: boolean,
  showPlus: boolean
): string {
  const safeN = Object.is(n, -0) ? 0 : n;
  let str = decimals > 0 ? safeN.toFixed(decimals) : Math.round(safeN).toString();
  if (str.startsWith('-') && Number(str) === 0) {
    str = str.slice(1);
  }
  if (hasCommas) {
    str = formatWithCommas(str);
  }
  if (showPlus && safeN >= 0) {
    str = `+${str}`;
  }
  return str;
}

/**
 * Parses numeric value(s), prefix, suffix, and formatting rules from input.
 * Supports single numbers and composite metric strings (e.g. "Index: 125.37 (+25.37%)").
 */
function parseSegments(
  raw: number | string | null | undefined,
  explicitDecimals?: number
): ParsedValueResult {
  if (raw === null || raw === undefined) {
    return { isParsable: false, fallback: '—', segments: [] };
  }

  if (typeof raw === 'number') {
    if (!isFinite(raw)) {
      return { isParsable: false, fallback: '—', segments: [] };
    }
    const str = raw.toString();
    const inferredDec = str.includes('.') ? Math.min(str.split('.')[1].length, 6) : 0;
    return {
      isParsable: true,
      fallback: String(raw),
      segments: [
        {
          type: 'number',
          target: raw,
          decimals: explicitDecimals !== undefined ? explicitDecimals : inferredDec,
          hasCommas: Math.abs(raw) >= 1000,
          showPlus: false,
        },
      ],
    };
  }

  const strVal = String(raw);
  const trimmed = strVal.trim();
  if (trimmed === '' || trimmed === '—' || trimmed === '-' || trimmed === 'N/A' || trimmed === 'NO_MODE') {
    return {
      isParsable: false,
      fallback: trimmed === '' ? '—' : strVal,
      segments: [],
    };
  }

  const tokenRegex = /[-+]?\d{1,3}(?:,\d{3})*(?:\.\d+)?|[-+]?\d+(?:\.\d+)?/g;
  const segments: ParsedSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let hasNumber = false;

  while ((match = tokenRegex.exec(strVal)) !== null) {
    const numRaw = match[0];
    const parsedNum = parseFloat(numRaw.replace(/,/g, ''));
    if (isNaN(parsedNum) || !isFinite(parsedNum)) {
      continue;
    }

    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: strVal.slice(lastIndex, match.index),
      });
    }

    const decMatch = numRaw.match(/\.(\d+)/);
    const inferredDec = decMatch ? decMatch[1].length : 0;

    segments.push({
      type: 'number',
      target: parsedNum,
      decimals: explicitDecimals !== undefined ? explicitDecimals : inferredDec,
      hasCommas: numRaw.includes(',') || Math.abs(parsedNum) >= 1000,
      showPlus: numRaw.startsWith('+'),
    });

    hasNumber = true;
    lastIndex = match.index + numRaw.length;
  }

  if (!hasNumber) {
    return { isParsable: false, fallback: strVal, segments: [] };
  }

  if (lastIndex < strVal.length) {
    segments.push({
      type: 'text',
      content: strVal.slice(lastIndex),
    });
  }

  return {
    isParsable: true,
    fallback: strVal,
    segments,
  };
}

function renderSegments(
  segments: ParsedSegment[],
  progress: number,
  explicitPrefix: string,
  explicitSuffix: string
): string {
  const body = segments
    .map((seg) => {
      if (seg.type === 'text') return seg.content;
      const val = progress >= 1 ? seg.target : seg.target * progress;
      return formatNumericToken(val, seg.decimals, seg.hasCommas, seg.showPlus);
    })
    .join('');

  return `${explicitPrefix}${body}${explicitSuffix}`;
}

/**
 * AnimatedNumber Component
 * Rapidly animates any calculated/result number from 0 to its target value
 * with smooth easeOutQuart easing. Handles integers, decimals, and composite metric strings.
 * Respects prefers-reduced-motion accessibility settings.
 */
export function AnimatedNumber({
  value,
  decimals: explicitDecimals,
  prefix: explicitPrefix = '',
  suffix: explicitSuffix = '',
  className = '',
  duration = 400,
}: AnimatedNumberProps) {
  const parsed = parseSegments(value, explicitDecimals);
  const { isParsable, fallback, segments } = parsed;

  const [displayValue, setDisplayValue] = useState<string>(() => {
    if (!isParsable) {
      return fallback;
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return renderSegments(segments, 1, explicitPrefix, explicitSuffix);
    }
    return renderSegments(segments, 0, explicitPrefix, explicitSuffix);
  });

  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isParsable) {
      setDisplayValue(fallback);
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayValue(renderSegments(segments, 1, explicitPrefix, explicitSuffix));
      return;
    }

    // Immediately show 0 before first animation frame, then count smoothly from 0 -> target
    setDisplayValue(renderSegments(segments, 0, explicitPrefix, explicitSuffix));

    const startTime = performance.now();
    // Rapid, professional quartic ease-out (snappy acceleration, crisp deceleration)
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

    const updateFrame = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);

      if (progress < 1) {
        setDisplayValue(renderSegments(segments, easedProgress, explicitPrefix, explicitSuffix));
        animFrameRef.current = requestAnimationFrame(updateFrame);
      } else {
        setDisplayValue(renderSegments(segments, 1, explicitPrefix, explicitSuffix));
        animFrameRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(updateFrame);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [value, explicitDecimals, explicitPrefix, explicitSuffix, duration]);

  if (!isParsable) {
    return <span className={className}>{fallback}</span>;
  }

  return <span className={className}>{displayValue}</span>;
}
