/**
 * Draws the illustrated profile pictures into public/people, once, so the app ships plain SVG files and
 * needs no avatar code at runtime. Style: DiceBear "lorelei" by Lisa Wischofsky, CC0 1.0.
 * Run: node scripts/render-avatars.mjs (Node 22.18 or newer reads the TypeScript looks file directly).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createAvatar } from "@dicebear/core";
import * as lorelei from "@dicebear/lorelei";
import { nameSlug, SEEKER_LOOKS, STAFF_LOOKS } from "../src/lib/seed/avatars.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", "people");
mkdirSync(out, { recursive: true });

/** Soft backgrounds from the WorkProof palette: grey, peach, sand, sky, sage. */
const BACKGROUNDS = ["dfe5eb", "fde6db", "f6e7cf", "dbe6f6", "e1ece3"];

const variants = (...n) => n.map((i) => `variant${String(i).padStart(2, "0")}`);
const MEN_EYES = variants(2, 4, 5, 8, 10, 13, 14, 16, 17, 20, 21, 24);
const WOMEN_EYES = variants(2, 4, 6, 7, 9, 11, 12, 14, 20, 23, 24);
/** Friendly faces only: soft smiles and calm brows, no teeth, tongues or frowns. */
const MOUTHS = ["happy01", "happy02", "happy03", "happy04", "happy05", "happy06", "happy10", "happy14"];
const BROWS = variants(1, 2, 3, 5, 7, 8, 9, 10);

function draw(fileId, look, index) {
  const svg = createAvatar(lorelei, {
    seed: fileId,
    hair: variants(look.hair),
    hairColor: [look.hairColor],
    skinColor: [look.skin],
    backgroundColor: [BACKGROUNDS[index % BACKGROUNDS.length]],
    beard: ["variant01", "variant02"],
    beardProbability: look.beard ? 100 : 0,
    glassesProbability: look.glasses ? 100 : 0,
    earringsProbability: look.gender === "woman" ? 30 : 0,
    hairAccessoriesProbability: 0,
    frecklesProbability: 10,
    // No winks. Eyes with long lashes read as a woman's in this style, so men get the plain ones.
    eyes: look.gender === "man" ? MEN_EYES : WOMEN_EYES,
    mouth: MOUTHS,
    eyebrows: BROWS,
  }).toString();
  writeFileSync(join(out, `${fileId}.svg`), `${svg}\n`);
}

const seekers = Object.entries(SEEKER_LOOKS);
seekers.forEach(([fileId, look], i) => draw(fileId, look, i));
Object.entries(STAFF_LOOKS).forEach(([name, look], i) => draw(nameSlug(name), look, i + seekers.length));
process.stdout.write(`Drew ${seekers.length + Object.keys(STAFF_LOOKS).length} pictures into public/people.\n`);
