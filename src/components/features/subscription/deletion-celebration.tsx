import { useEffect, useState, useRef } from "react";
import { Check } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

interface DeletionCelebrationProps {
  show: boolean;
  onComplete?: () => void;
}

// Confetti particle colors
const CONFETTI_COLORS = [
  "oklch(0.75 0.15 180)", // teal
  "oklch(0.8 0.15 85)", // yellow
  "oklch(0.7 0.15 165)", // green (success)
  "oklch(0.65 0.15 260)", // purple
  "oklch(0.75 0.12 340)", // pink
];

// Generate random confetti particles
function generateParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100, // percent
    delay: Math.random() * 0.5, // seconds
    duration: 1.5 + Math.random() * 1, // 1.5-2.5 seconds
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 8 + Math.random() * 8, // 8-16px
    rotation: Math.random() * 360,
    isCircle: Math.random() > 0.5, // Pre-compute shape
  }));
}

/**
 * DeletionCelebration shows a celebration animation after successful deletion
 * - Uses CSS keyframes (no canvas-confetti dependency)
 * - Respects prefers-reduced-motion preference
 * - Auto-cleanup after animation ends
 */
export function DeletionCelebration({
  show,
  onComplete,
}: DeletionCelebrationProps) {
  const reducedMotion = useReducedMotion();
  const [particles] = useState(() => generateParticles(20));
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle show changes and animation completion
  useEffect(() => {
    // Start animation when show becomes true
    if (show && !isAnimating) {
      setIsAnimating(true);
      return;
    }

    // Handle animation completion timer
    if (isAnimating) {
      const duration = reducedMotion ? 800 : 2500;
      timerRef.current = setTimeout(() => {
        setIsAnimating(false);
        onComplete?.();
      }, duration);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, isAnimating, reducedMotion]);

  if (!isAnimating) return null;

  // Reduced motion: Show checkmark with pulse animation
  if (reducedMotion) {
    return (
      <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
        <div
          className={cn(
            "flex items-center justify-center w-20 h-20 rounded-full bg-success/20",
            "animate-success-pulse"
          )}
        >
          <Check className="w-10 h-10 text-success" strokeWidth={3} />
        </div>
      </div>
    );
  }

  // Full motion: Confetti particles
  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${particle.left}%`,
            top: "-20px",
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            borderRadius: particle.isCircle ? "50%" : "2px",
            transform: `rotate(${particle.rotation}deg)`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
