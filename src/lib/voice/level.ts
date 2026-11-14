/** Root mean square of one frame of samples centred on 128, mapped so normal speech fills 0..1. */
export function levelFromSamples(samples: Uint8Array): number {
  if (samples.length === 0) return 0;
  let sum = 0;
  for (const sample of samples) {
    const centred = (sample - 128) / 128;
    sum += centred * centred;
  }
  const rms = Math.sqrt(sum / samples.length);
  // Speech sits around 0.02 to 0.25 RMS; the gain makes a normal voice move the orb clearly.
  return Math.min(1, rms * 4);
}

/**
 * Reads the loudness of a microphone stream for the orb. Returns a stop function.
 * The stream's tracks are left alone, so the caller decides when the microphone turns off.
 */
export function meterStream(stream: MediaStream, onLevel: (level: number) => void): () => void {
  const context = new AudioContext();
  const analyser = context.createAnalyser();
  analyser.fftSize = 512;
  context.createMediaStreamSource(stream).connect(analyser);
  const samples = new Uint8Array(analyser.fftSize);
  let frame = 0;
  const read = () => {
    analyser.getByteTimeDomainData(samples);
    onLevel(levelFromSamples(samples));
    frame = requestAnimationFrame(read);
  };
  frame = requestAnimationFrame(read);
  return () => {
    cancelAnimationFrame(frame);
    void context.close();
  };
}

/**
 * Opens the microphone only to measure loudness. Resolves with a stop function, or null when the
 * microphone is not available or not allowed; the orb then shows a calm pulse instead.
 */
export async function startLevelMeter(onLevel: (level: number) => void): Promise<(() => void) | null> {
  if (typeof AudioContext === "undefined" || !navigator.mediaDevices?.getUserMedia) return null;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const stopMeter = meterStream(stream, onLevel);
    return () => {
      stopMeter();
      for (const track of stream.getTracks()) track.stop();
    };
  } catch {
    return null;
  }
}
