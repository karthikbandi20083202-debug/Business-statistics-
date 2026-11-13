/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Global Scroll Text Reveal Observer
 *
 * Targets line-by-line text blocks within the Business Analyzer modules
 * and across the application, applying a cascading fade-in and upward slide effect
 * as the user scrolls through results.
 *
 * Architecture:
 * - Line-by-line cascading delay (0ms, 45ms, 90ms, 135ms...) for structured text blocks,
 *   interpretations, findings, and decision guidance.
 * - Smooth fade-in (opacity 0 -> 1) paired with upward slide (translateY: 10px -> 0px).
 * - Polished easing curve: cubic-bezier(0.16, 1, 0.3, 1).
 * - Single-trigger: unobserves once revealed so it never replays unnecessarily on reverse scroll.
 * - Viewport presence: elements above the fold on initial mount are revealed immediately without lag.
 * - MutationObserver detects newly generated statistical results dynamically.
 * - Full compliance with prefers-reduced-motion accessibility standards.
 */
export function initGlobalScrollReveal(): () => void {
  if (typeof window === 'undefined') return () => {};

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    document.documentElement.classList.add('reduced-motion');
    return () => {};
  }

  const revealedElements = new WeakSet<Element>();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          el.classList.add('is-revealed');
          revealedElements.add(el);

          // If the element has cascading lines/children, also trigger them
          const cascadeItems = el.querySelectorAll<HTMLElement>(
            '.reveal-line, .cascade-line, [data-cascade-item]'
          );
          cascadeItems.forEach((item) => {
            item.classList.add('is-revealed');
          });

          // Stop observing so it NEVER replays when scrolling back and forth
          observer.unobserve(el);
        }
      });
    },
    {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.08,
    }
  );

  const scanAndObserve = () => {
    const windowHeight = window.innerHeight;

    // 1. Find all Business Analyzer root containers or module sections
    const analyzerModules = document.querySelectorAll<HTMLElement>(
      '[data-business-analyzer], .business-analyzer-container, [data-analyzer-module], .statistical-module'
    );

    // 2. Target line-by-line text blocks within the Business Analyzer modules
    analyzerModules.forEach((moduleContainer) => {
      // Find structured interpretation blocks, takeaways, signals, and multi-line result containers
      const textBlocks = moduleContainer.querySelectorAll<HTMLElement>(
        '.scroll-reveal-group, .reveal-cascade-group, [data-cascade-group], ' +
        '.space-y-3 > div, .space-y-3\\.5 > div, .space-y-4 > div, ' +
        'p.leading-relaxed, .decision-block, .audit-trail-step'
      );

      textBlocks.forEach((block) => {
        if (block.closest('button, input, select, textarea, svg, canvas')) return;
        if (revealedElements.has(block) || block.classList.contains('is-revealed')) return;

        // If block contains .reveal-line (e.g. from ScrollRevealText), set up cascading delays
        const revealLines = block.querySelectorAll<HTMLElement>('.reveal-line');
        if (revealLines.length > 0) {
          revealLines.forEach((line, idx) => {
            line.style.setProperty('--cascade-delay', `${idx * 45}ms`);
            line.style.transitionDelay = `${idx * 45}ms`;
          });
        } else if (
          block.parentElement &&
          (block.parentElement.classList.contains('space-y-3') ||
           block.parentElement.classList.contains('space-y-3.5') ||
           block.parentElement.classList.contains('space-y-4') ||
           block.parentElement.hasAttribute('data-cascade-group'))
        ) {
          // If block is a child line inside a multi-row interpretation container
          const parent = block.parentElement;
          if (!parent.classList.contains('reveal-cascade-group')) {
            parent.classList.add('reveal-cascade-group');
            const siblings = Array.from(parent.children) as HTMLElement[];
            siblings.forEach((sib, idx) => {
              if (sib.matches('button, input, select, textarea')) return;
              sib.classList.add('cascade-line');
              sib.style.setProperty('--cascade-delay', `${idx * 55}ms`);
              sib.style.transitionDelay = `${idx * 55}ms`;
            });

            const parentRect = parent.getBoundingClientRect();
            if (parentRect.top < windowHeight - 20 && parentRect.bottom > 0) {
              parent.classList.add('is-revealed');
              revealedElements.add(parent);
              siblings.forEach((s) => {
                s.classList.add('is-revealed');
                s.style.transitionDelay = '0ms';
              });
              return;
            }
            observer.observe(parent);
            return;
          }
        }
      });
    });

    // 3. Scan all scroll reveal candidates (both module-specific and global)
    const allCandidates = document.querySelectorAll<HTMLElement>(
      '.scroll-text-reveal, .scroll-reveal-group, .reveal-cascade-group, [data-cascade-group="true"], .reveal-on-scroll, [data-scroll-reveal]'
    );

    allCandidates.forEach((el) => {
      if (el.closest('button, input, select, textarea, svg, canvas')) return;
      if (revealedElements.has(el) || el.classList.contains('is-revealed')) return;

      const rect = el.getBoundingClientRect();
      // If already visible in the initial viewport (above the fold), reveal immediately without delay
      if (rect.top < windowHeight - 20 && rect.bottom > 0) {
        el.classList.add('is-revealed');
        revealedElements.add(el);

        const lines = el.querySelectorAll<HTMLElement>('.reveal-line, .cascade-line, [data-cascade-item]');
        lines.forEach((line) => {
          line.classList.add('is-revealed');
          line.style.transitionDelay = '0ms';
        });
        return;
      }

      // If below fold, ensure lines have cascading delays assigned
      const lines = el.querySelectorAll<HTMLElement>('.reveal-line, .cascade-line, [data-cascade-item]');
      if (lines.length > 0) {
        lines.forEach((line, idx) => {
          if (!line.style.transitionDelay) {
            line.style.setProperty('--cascade-delay', `${idx * 45}ms`);
            line.style.transitionDelay = `${idx * 45}ms`;
          }
        });
      }

      observer.observe(el);
    });
  };

  // Run on initialization
  scanAndObserve();

  // Watch for dynamic DOM updates (e.g. results generated, tabs switched, sample data loaded)
  const mutationObserver = new MutationObserver(() => {
    scanAndObserve();
  });

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Re-check on viewport resize
  window.addEventListener('resize', scanAndObserve, { passive: true });

  return () => {
    observer.disconnect();
    mutationObserver.disconnect();
    window.removeEventListener('resize', scanAndObserve);
  };
}
