import React from "react";

export default function BrainBytesLogo({ size = "default", showText = true, className = "" }) {
  const isLarge = size === "large";
  const isSmall = size === "small";

  const iconWidth = isLarge ? 56 : isSmall ? 28 : 38;
  const iconHeight = isLarge ? 56 : isSmall ? 28 : 38;

  return (
    <div className={`brainbytes-brand-wrapper ${className}`} style={{ display: "inline-flex", alignItems: "center", gap: isSmall ? "8px" : "12px" }}>
      <svg
        width={iconWidth}
        height={iconHeight}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="brainbytes-logo-svg"
        style={{ filter: "drop-shadow(0 0 10px rgba(0, 242, 254, 0.45))" }}
      >
        <defs>
          <linearGradient id="bb-cyan-violet" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00F2FE" />
            <stop offset="50%" stopColor="#4FACFE" />
            <stop offset="100%" stopColor="#9D4EDD" />
          </linearGradient>
          <linearGradient id="bb-bolt" x1="24" y1="12" x2="40" y2="52" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF3B0" />
            <stop offset="50%" stopColor="#FFD166" />
            <stop offset="100%" stopColor="#FF007A" />
          </linearGradient>
          <radialGradient id="bb-core-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#9D4EDD" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient energy aura */}
        <circle cx="32" cy="32" r="28" fill="url(#bb-core-glow)" opacity="0.25" />

        {/* Left Brain Hemisphere (Logic & Circuit Nodes) */}
        <path
          d="M 28 14 C 20 14, 12 18, 10 26 C 8 32, 10 38, 13 41 C 12 45, 14 50, 20 52 C 24 53, 27 50, 28 48"
          stroke="url(#bb-cyan-violet)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="rgba(0, 242, 254, 0.08)"
        />
        {/* Left Hemisphere Circuit Grooves */}
        <path d="M 13 26 C 18 25, 23 27, 26 25" stroke="#00F2FE" strokeWidth="2" strokeLinecap="round" />
        <path d="M 12 37 C 17 38, 22 34, 26 36" stroke="#00F2FE" strokeWidth="2" strokeLinecap="round" />
        {/* Left Byte Nodes */}
        <circle cx="13" cy="26" r="2.2" fill="#00F2FE" />
        <circle cx="26" cy="25" r="1.8" fill="#FFF" />
        <circle cx="12" cy="37" r="2.2" fill="#00F2FE" />

        {/* Right Brain Hemisphere (Creative & Byte Processing) */}
        <path
          d="M 36 14 C 44 14, 52 18, 54 26 C 56 32, 54 38, 51 41 C 52 45, 50 50, 44 52 C 40 53, 37 50, 36 48"
          stroke="url(#bb-cyan-violet)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="rgba(157, 78, 221, 0.08)"
        />
        {/* Right Hemisphere Circuit Grooves */}
        <path d="M 51 26 C 46 25, 41 27, 38 25" stroke="#9D4EDD" strokeWidth="2" strokeLinecap="round" />
        <path d="M 52 37 C 47 38, 42 34, 38 36" stroke="#9D4EDD" strokeWidth="2" strokeLinecap="round" />
        {/* Right Byte Nodes */}
        <circle cx="51" cy="26" r="2.2" fill="#9D4EDD" />
        <circle cx="38" cy="25" r="1.8" fill="#FFF" />
        <circle cx="52" cy="37" r="2.2" fill="#9D4EDD" />

        {/* Center 1v1 Battle Duel Energy Bolt (The clash of intelligence) */}
        <path
          d="M 35 12 L 27 30 L 34 30 L 29 52 L 40 28 L 33 28 Z"
          fill="url(#bb-bolt)"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 6px rgba(255, 209, 102, 0.8))" }}
        />
      </svg>

      {showText && (
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
          <span
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: isLarge ? "1.75rem" : isSmall ? "1.05rem" : "1.35rem",
              letterSpacing: "-0.03em",
              color: "#FFFFFF",
              textTransform: "none"
            }}
          >
            Brain<span style={{ color: "#00F2FE", textShadow: "0 0 12px rgba(0, 242, 254, 0.6)" }}>Bytes</span>
          </span>
          <span
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: isLarge ? "0.72rem" : isSmall ? "0.55rem" : "0.62rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
              color: "#9D4EDD",
              textTransform: "uppercase"
            }}
          >
            1v1 Arena • Class 7+
          </span>
        </div>
      )}
    </div>
  );
}
