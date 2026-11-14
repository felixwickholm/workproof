"use client";

import { Mic, Square } from "lucide-react";
import { motion, useReducedMotion, useSpring, useTransform, type MotionValue } from "motion/react";
import { Spinner } from "@/components/ui/spinner";

interface Props {
  level: MotionValue<number>;
  listening: boolean;
  busy: boolean;
  disabled: boolean;
  onPress(): void;
}

/** Soft and quick, so the orb follows the voice without jitter or a long tail. */
const SPRING = { stiffness: 320, damping: 22, mass: 0.6 };

/**
 * One flat accent circle. It grows with the voice (1 to 1.25) through a spring, and a pale disc
 * behind it shows the same level a little wider. With reduced motion nothing grows; the disc
 * only fades with the level.
 */
export function VoiceOrb({ level, listening, busy, disabled, onPress }: Props) {
  const reduce = useReducedMotion();
  const scale = useSpring(useTransform(level, [0, 1], [1, 1.25]), SPRING);
  const haloScale = useSpring(useTransform(level, [0, 1], [1, 1.55]), SPRING);
  const haloOpacity = useTransform(level, [0, 1], [0.1, 0.28]);

  return (
    <div className="relative grid size-[184px] place-items-center">
      <motion.div
        aria-hidden
        className="absolute size-28 rounded-full bg-accent"
        style={{ scale: reduce ? 1.35 : haloScale, opacity: listening ? haloOpacity : 0 }}
      />
      <button
        type="button"
        onClick={onPress}
        disabled={disabled}
        aria-label={listening ? "Stop and read the text" : "Start answering by voice"}
        className="press relative size-28 rounded-full outline-offset-4 disabled:cursor-default"
      >
        <motion.span
          className="grid size-full place-items-center rounded-full bg-accent text-ground"
          style={{ scale: reduce ? 1 : scale }}
        >
          {busy ? <Spinner /> : listening ? <Square size={26} fill="currentColor" strokeWidth={0} /> : <Mic size={34} strokeWidth={2} />}
        </motion.span>
      </button>
    </div>
  );
}
