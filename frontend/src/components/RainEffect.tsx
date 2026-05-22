import { useMemo } from "react";

interface RainEffectProps {
  /** Number of falling drops. Default 90 for a light shower feel. */
  density?: number;
  /** Tint of the drops. Default is sky-200 with low alpha. */
  color?: string;
  /** Diagonal angle in degrees (positive = leaning to the right). */
  angle?: number;
}

interface Drop {
  id: number;
  leftPct: number;
  delay: number;
  duration: number;
  length: number;
  opacity: number;
}

function generateDrops(count: number): Drop[] {
  const drops: Drop[] = [];
  for (let i = 0; i < count; i++) {
    drops.push({
      id: i,
      leftPct: Math.random() * 100,
      delay: -(Math.random() * 1.4),
      duration: 0.55 + Math.random() * 0.85,
      length: 10 + Math.random() * 22,
      opacity: 0.25 + Math.random() * 0.55,
    });
  }
  return drops;
}

/**
 * Decorative falling-rain overlay. Sits absolutely on top of the map
 * container with `pointer-events: none` so clicks pass through to the
 * underlying Leaflet markers.
 */
export default function RainEffect({
  density = 90,
  color = "rgba(186, 230, 253, 1)",
  angle = 14,
}: RainEffectProps) {
  const drops = useMemo(() => generateDrops(density), [density]);

  return (
    <div
      aria-hidden
      className="
        pointer-events-none absolute inset-0 z-[990] overflow-hidden
        rounded-3xl
      "
      style={{ transform: `skewX(-${angle}deg)`, transformOrigin: "top center" }}
    >
      {drops.map((d) => (
        <span
          key={d.id}
          className="rain-drop"
          style={{
            left: `${d.leftPct}%`,
            width: "1.5px",
            height: `${d.length}px`,
            background: `linear-gradient(180deg, transparent 0%, ${color.replace(
              "1)",
              `${d.opacity})`
            )} 70%, rgba(255,255,255,${d.opacity * 0.7}) 100%)`,
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
            filter: "blur(0.35px)",
          }}
        />
      ))}

      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-24 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,23,42,0.18) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
