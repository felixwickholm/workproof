/** The parts of a `SpeechSynthesisVoice` the choice depends on. */
interface VoiceInfo {
  name: string;
  lang: string;
  localService: boolean;
}

/** Names that mark the newer, natural-sounding voices on Chrome, Edge and Safari. */
const NATURAL = /natural|neural|premium|enhanced|online|google/i;

function languageOf(tag: string) {
  return tag.toLowerCase().split(/[-_]/)[0];
}

/**
 * Picks the most natural voice for the language: an exact match before a same-language one,
 * and a natural-sounding name before a robotic default. Undefined when none speaks the language.
 */
export function pickVoice<T extends VoiceInfo>(voices: readonly T[], lang: string): T | undefined {
  const exact = lang.toLowerCase().replace("_", "-");
  const rank = (voice: T) => {
    const tag = voice.lang.toLowerCase().replace("_", "-");
    if (languageOf(tag) !== languageOf(exact)) return -1;
    return (tag === exact ? 4 : 0) + (NATURAL.test(voice.name) ? 2 : 0) + (voice.localService ? 0 : 1);
  };
  let best: T | undefined;
  let bestRank = -1;
  for (const voice of voices) {
    const value = rank(voice);
    if (value > bestRank) {
      best = voice;
      bestRank = value;
    }
  }
  return best;
}

/** Voices load late in Chrome; wait for them briefly, then go on with what there is. */
function loadVoices(synth: SpeechSynthesis): Promise<SpeechSynthesisVoice[]> {
  const now = synth.getVoices();
  if (now.length) return Promise.resolve(now);
  return new Promise((resolve) => {
    const done = () => {
      synth.removeEventListener("voiceschanged", done);
      resolve(synth.getVoices());
    };
    synth.addEventListener("voiceschanged", done);
    window.setTimeout(done, 1000);
  });
}

/** Speaks with the browser's own voices. Resolves when speech ends or is cancelled. */
export async function speakInBrowser(text: string, lang: string): Promise<void> {
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  const voice = pickVoice(await loadVoices(synth), lang);
  if (voice) utterance.voice = voice;
  await new Promise<void>((resolve) => {
    utterance.onend = () => resolve();
    // A cancel shows up as an error event; either way the prompt stays on screen as text.
    utterance.onerror = () => resolve();
    synth.speak(utterance);
  });
}

export function stopBrowserSpeech(): void {
  if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
}
