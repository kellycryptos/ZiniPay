import React from 'react';

/**
 * AmbientBackground.tsx
 * Renders the deep obsidian background (#070D0C to #0B1513),
 * glowing emerald/teal 3D floating orbs on viewport edges,
 * 3D volumetric organic blobs, and constellation network nodes.
 */
export function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
    >
      {/* 1. Deep Obsidian / Slate Base Radial Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, #0F231D 0%, #070D0C 55%, #050908 100%)',
        }}
      />

      {/* 2. Ambient Soft Green/Teal Atmospheric Glows */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px]" />
      <div className="absolute top-[20%] -left-32 w-[500px] h-[600px] bg-emerald-600/15 rounded-full blur-[130px]" />
      <div className="absolute top-[15%] -right-32 w-[550px] h-[600px] bg-teal-500/15 rounded-full blur-[140px]" />

      {/* 3. Constellation / Network Nodes (Left & Right) */}
      <svg
        className="absolute top-12 left-0 w-[380px] h-[680px] opacity-40 hidden md:block"
        viewBox="0 0 380 680"
        fill="none"
      >
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00E599" stopOpacity="1" />
            <stop offset="100%" stopColor="#00E599" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Connecting Lines */}
        <path
          d="M 20 180 L 90 240 L 40 340 L 120 400 L 60 480 L 150 530 L 80 620"
          stroke="rgba(0, 229, 153, 0.25)"
          strokeWidth="1"
          strokeDasharray="2 3"
        />
        <path
          d="M 90 240 L 180 210 L 220 280 L 120 400 L 240 450"
          stroke="rgba(16, 185, 129, 0.2)"
          strokeWidth="1"
        />
        <path
          d="M 180 210 L 140 120 L 70 80"
          stroke="rgba(0, 229, 153, 0.18)"
          strokeWidth="1"
        />
        <path
          d="M 220 280 L 310 320 L 240 450 L 320 520"
          stroke="rgba(0, 229, 153, 0.15)"
          strokeWidth="1"
        />

        {/* Nodes / Dots */}
        <circle cx="70" cy="80" r="2.5" fill="#00E599" opacity="0.6" />
        <circle cx="140" cy="120" r="3" fill="#00E599" opacity="0.7" />
        <circle cx="20" cy="180" r="2" fill="#00E599" opacity="0.5" />
        <circle cx="180" cy="210" r="3.5" fill="#00E599" opacity="0.8" />
        <circle cx="90" cy="240" r="4" fill="#00E599" opacity="0.9" />
        <circle cx="220" cy="280" r="2.5" fill="#00E599" opacity="0.6" />
        <circle cx="310" cy="320" r="3" fill="#00E599" opacity="0.7" />
        <circle cx="40" cy="340" r="3" fill="#00E599" opacity="0.6" />
        <circle cx="120" cy="400" r="4" fill="#00E599" opacity="0.9" />
        <circle cx="240" cy="450" r="3" fill="#00E599" opacity="0.7" />
        <circle cx="60" cy="480" r="2.5" fill="#00E599" opacity="0.5" />
        <circle cx="320" cy="520" r="2.5" fill="#00E599" opacity="0.6" />
        <circle cx="150" cy="530" r="3.5" fill="#00E599" opacity="0.8" />
        <circle cx="80" cy="620" r="3" fill="#00E599" opacity="0.7" />
      </svg>

      <svg
        className="absolute top-16 right-0 w-[380px] h-[680px] opacity-40 hidden md:block"
        viewBox="0 0 380 680"
        fill="none"
      >
        <path
          d="M 360 160 L 290 220 L 340 310 L 260 380 L 320 460 L 230 520 L 300 610"
          stroke="rgba(0, 229, 153, 0.25)"
          strokeWidth="1"
          strokeDasharray="2 3"
        />
        <path
          d="M 290 220 L 200 190 L 160 260 L 260 380 L 140 430"
          stroke="rgba(16, 185, 129, 0.2)"
          strokeWidth="1"
        />
        <path
          d="M 200 190 L 240 100 L 310 60"
          stroke="rgba(0, 229, 153, 0.18)"
          strokeWidth="1"
        />
        <path
          d="M 160 260 L 70 300 L 140 430 L 60 500"
          stroke="rgba(0, 229, 153, 0.15)"
          strokeWidth="1"
        />

        <circle cx="310" cy="60" r="2.5" fill="#00E599" opacity="0.6" />
        <circle cx="240" cy="100" r="3" fill="#00E599" opacity="0.7" />
        <circle cx="360" cy="160" r="2" fill="#00E599" opacity="0.5" />
        <circle cx="200" cy="190" r="3.5" fill="#00E599" opacity="0.8" />
        <circle cx="290" cy="220" r="4" fill="#00E599" opacity="0.9" />
        <circle cx="160" cy="260" r="2.5" fill="#00E599" opacity="0.6" />
        <circle cx="70" cy="300" r="3" fill="#00E599" opacity="0.7" />
        <circle cx="340" cy="310" r="3" fill="#00E599" opacity="0.6" />
        <circle cx="260" cy="380" r="4" fill="#00E599" opacity="0.9" />
        <circle cx="140" cy="430" r="3" fill="#00E599" opacity="0.7" />
        <circle cx="320" cy="460" r="2.5" fill="#00E599" opacity="0.5" />
        <circle cx="60" cy="500" r="2.5" fill="#00E599" opacity="0.6" />
        <circle cx="230" cy="520" r="3.5" fill="#00E599" opacity="0.8" />
        <circle cx="300" cy="610" r="3" fill="#00E599" opacity="0.7" />
      </svg>

      {/* 4. Ambient Floating 3D Elements matching the visual reference */}

      {/* 4a. Top Left Floating 3D Spherical Orb */}
      <div className="absolute top-20 left-10 md:left-24 animate-pulse duration-1000">
        <div
          className="w-12 h-12 md:w-14 md:h-14 rounded-full relative"
          style={{
            background:
              'radial-gradient(circle at 35% 30%, #5EEAD4 0%, #10B981 35%, #064E3B 70%, #022018 100%)',
            boxShadow:
              '0 0 30px rgba(16, 185, 129, 0.45), inset -2px -3px 6px rgba(0, 0, 0, 0.6), inset 2px 2px 5px rgba(255, 255, 255, 0.6)',
          }}
        >
          {/* Specular Glint */}
          <div className="absolute top-2 left-2.5 w-3.5 h-2 rounded-full bg-white/70 blur-[1px] -rotate-45" />
        </div>
      </div>

      {/* 4b. Mid-Left 3D Organic Fluid Flowing Orb/Blob */}
      <div className="absolute top-[260px] -left-20 md:-left-12 pointer-events-none">
        <div
          className="w-64 h-80 md:w-80 md:h-96 rounded-[42%_58%_70%_30%/45%_45%_55%_55%]"
          style={{
            background:
              'radial-gradient(circle at 45% 35%, #34D399 0%, #059669 35%, #064E3B 65%, #022018 90%)',
            filter: 'blur(1px)',
            boxShadow:
              '0 0 60px rgba(16, 185, 129, 0.35), inset -8px -10px 25px rgba(0, 0, 0, 0.7), inset 6px 8px 20px rgba(167, 243, 208, 0.4)',
            transform: 'rotate(-15deg)',
          }}
        />
      </div>

      {/* 4c. Mid-Right 3D Organic Fluid Flowing Orb/Blob */}
      <div className="absolute top-[230px] -right-24 md:-right-16 pointer-events-none">
        <div
          className="w-72 h-88 md:w-96 md:h-[440px] rounded-[55%_45%_35%_65%/50%_60%_40%_50%]"
          style={{
            background:
              'radial-gradient(circle at 40% 30%, #2DD4BF 0%, #0D9488 35%, #064E3B 65%, #022018 90%)',
            filter: 'blur(1px)',
            boxShadow:
              '0 0 60px rgba(45, 212, 191, 0.35), inset -8px -10px 25px rgba(0, 0, 0, 0.7), inset 6px 8px 20px rgba(153, 246, 228, 0.4)',
            transform: 'rotate(25deg)',
          }}
        />
      </div>

      {/* 4d. Lower-Right Floating 3D Small Orb */}
      <div className="absolute top-[520px] right-24 md:right-48 animate-pulse duration-700">
        <div
          className="w-8 h-8 md:w-10 md:h-10 rounded-full relative"
          style={{
            background:
              'radial-gradient(circle at 35% 30%, #6EE7B7 0%, #10B981 40%, #064E3B 75%, #022018 100%)',
            boxShadow:
              '0 0 25px rgba(16, 185, 129, 0.55), inset -2px -2px 5px rgba(0, 0, 0, 0.6), inset 2px 2px 4px rgba(255, 255, 255, 0.6)',
          }}
        >
          <div className="absolute top-1.5 left-2 w-2.5 h-1.5 rounded-full bg-white/70 blur-[0.5px] -rotate-45" />
        </div>
      </div>
    </div>
  );
}
