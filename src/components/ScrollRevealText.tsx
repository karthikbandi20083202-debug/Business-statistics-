/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';

export interface ScrollRevealTextProps {
  children?: React.ReactNode;
  text?: string;
  className?: string;
  as?: 'p' | 'div' | 'span' | 'h1' | 'h2' | 'h3' | 'h4';
  staggerMs?: number; // default: 40ms per line for subtle ChatGPT stream feel
}

/**
 * Splits text into natural sentence or phrase units for line-by-line reveal.
 */
function splitIntoLines(content: string): string[] {
  if (!content) return [];
  // Split by sentence ends (.!?) or line breaks, keeping punctuation
  const sentences = content.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g);
  if (!sentences || sentences.length <= 1) {
    // If short or no punctuation, return trimmed lines
    return [content];
  }
  return sentences.map((s) => s.trim()).filter(Boolean);
}

/**
 * ScrollRevealText
 * Renders text that reveals line-by-line with a subtle ChatGPT-style
 * streaming animation (smooth fade + slight upward movement) as the user
 * scrolls down. Triggers once and does NOT replay when scrolling back and forth.
 * Respects reduced-motion accessibility settings.
 */
export function ScrollRevealText({
  children,
  text,
  className = '',
  as = 'div',
  staggerMs = 45,
}: ScrollRevealTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setIsReducedMotion(true);
      setIsRevealed(true);
      return;
    }

    const node = containerRef.current;
    if (!node) return;

    // Check if element is already within the initial viewport
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight - 30 && rect.bottom > 0) {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          // Unobserve so it never replays when scrolling back and forth
          observer.unobserve(node);
        }
      },
      {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.05,
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  const Component = as as any;

  // If text is provided, render line-by-line streaming effect
  if (text) {
    const lines = splitIntoLines(text);

    return (
      <Component ref={containerRef} className={`scroll-reveal-group ${className}`}>
        {lines.map((line, idx) => (
          <span
            key={idx}
            className="reveal-line inline-block mr-1.5 transition-all"
            style={{
              opacity: isRevealed || isReducedMotion ? 1 : 0,
              transform: isRevealed || isReducedMotion ? 'translateY(0)' : 'translateY(10px)',
              transitionDuration: isReducedMotion ? '0ms' : '360ms',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              transitionDelay: isReducedMotion ? '0ms' : `${idx * staggerMs}ms`,
            }}
          >
            {line}{idx < lines.length - 1 ? ' ' : ''}
          </span>
        ))}
      </Component>
    );
  }

  // If children provided, wrap children in smooth reveal
  return (
    <Component
      ref={containerRef}
      className={`scroll-text-reveal ${isRevealed || isReducedMotion ? 'is-revealed' : ''} ${className}`}
      style={{
        opacity: isRevealed || isReducedMotion ? 1 : 0,
        transform: isRevealed || isReducedMotion ? 'translateY(0)' : 'translateY(10px)',
        transition: isReducedMotion ? 'none' : 'opacity 360ms cubic-bezier(0.16, 1, 0.3, 1), transform 360ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {children}
    </Component>
  );
}
