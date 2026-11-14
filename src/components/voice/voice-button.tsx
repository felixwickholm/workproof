import { VoiceSoon } from "./voice-soon";

/** The old voice button's props, still accepted so older callers compile. None of them do anything now. */
interface VoiceButtonProps {
  label?: string;
  title?: string;
  prompt?: string;
  maxSeconds?: number;
  maxLength?: number;
  onUse?: (text: string) => void;
  className?: string;
}

/**
 * Voice answers are planned, not live. Older callers get the quiet "Voice coming soon" marker instead of a
 * button that would ask for a microphone. New code uses `VoiceSoon` directly.
 */
export function VoiceButton({ className }: VoiceButtonProps) {
  return <VoiceSoon className={className} />;
}
