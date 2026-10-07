/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function BrandLogo({ className = '', size = 'md', showText = true }: BrandLogoProps) {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Authentic Koi & Co. Concentric Ripple & Koi Vector Insignia */}
      <svg
        className={`${iconDimensions} shrink-0 text-white fill-none stroke-current`}
        viewBox="0 0 100 80"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* Outer Rectangular Border */}
        <rect x="5" y="5" width="90" height="70" strokeWidth="3" />

        {/* Central Concentric Water Ripples */}
        <circle cx="50" cy="40" r="8" />
        <circle cx="50" cy="40" r="16" />
        <circle cx="50" cy="40" r="24" />
        <circle cx="50" cy="40" r="32" />

        {/* Left Circular Ripples */}
        <circle cx="10" cy="40" r="12" />
        <circle cx="10" cy="40" r="22" />
        <circle cx="10" cy="40" r="32" />

        {/* Right Circular Ripples */}
        <circle cx="90" cy="40" r="12" />
        <circle cx="90" cy="40" r="22" />
        <circle cx="90" cy="40" r="32" />

        {/* Left Stylized Koi Fish (Vertical Oval Silhouette with Eye) */}
        <path
          d="M 28 10 C 20 28, 20 52, 28 70 C 36 52, 36 28, 28 10 Z"
          fill="#060913"
          strokeWidth="2.8"
        />
        <circle cx="28" cy="24" r="1.8" fill="currentColor" stroke="none" />

        {/* Right Stylized Koi Fish (Vertical Oval Silhouette with Eye) */}
        <path
          d="M 72 10 C 64 28, 64 52, 72 70 C 80 52, 80 28, 72 10 Z"
          fill="#060913"
          strokeWidth="2.8"
        />
        <circle cx="72" cy="56" r="1.8" fill="currentColor" stroke="none" />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className="font-display tracking-[0.24em] font-extrabold text-white text-base sm:text-lg leading-tight">
            KOI &amp; CO.
          </span>
          <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.22em] text-slate-400 uppercase -mt-0.5">
            BUSINESS STATISTICAL ANALYSIS
          </span>
        </div>
      )}
    </div>
  );
}
