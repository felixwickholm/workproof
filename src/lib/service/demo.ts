import { buildSeed } from "@/lib/seed";
import { getStore } from "@/lib/store";
import { clock } from "./support";

/** Restores the synthetic Espoo Talent Day, with times relative to now. */
export async function resetDemo(): Promise<{ ok: true }> {
  await getStore().replace(buildSeed(clock.now()));
  return { ok: true };
}
