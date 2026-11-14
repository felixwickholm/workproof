/**
 * Illustrated profile pictures for the synthetic people, drawn once with DiceBear "lorelei" (CC0) by
 * `scripts/render-avatars.mjs` into public/people. This file has no imports, so the script can read it directly.
 *
 * A job seeker's file name is an opaque number (s01, s02, ...), never their name: the picture is identity,
 * like the name, and the path must not give the name away. Company and city people are named, since they may show theirs.
 */

export interface AvatarLook {
  /** Kept consistent with the first name. */
  gender: "man" | "woman";
  /** Skin colour, hex without "#". */
  skin: string;
  /** Hair colour, hex without "#". */
  hairColor: string;
  /** Lorelei hair variant number. Short styles for men, longer styles for women. */
  hair: number;
  beard?: boolean;
  glasses?: boolean;
}

const SKIN = { fair: "f2d3b1", light: "ecc19c", medium: "d7a27a", tan: "b67b52", brown: "8a5434", deep: "5e3a24" } as const;
const HAIR = {
  black: "1f1a17",
  darkBrown: "3b2618",
  brown: "6a4026",
  lightBrown: "9c6b3e",
  blonde: "d6b06a",
  auburn: "8e3b1f",
  grey: "a7a7a7",
} as const;

const man = (skin: string, hairColor: string, hair: number, extra: Partial<AvatarLook> = {}): AvatarLook => ({ gender: "man", skin, hairColor, hair, ...extra });
const woman = (skin: string, hairColor: string, hair: number, extra: Partial<AvatarLook> = {}): AvatarLook => ({ gender: "woman", skin, hairColor, hair, ...extra });

/** Job seekers, by opaque file id. `people.ts` points each person at one of these. */
export const SEEKER_LOOKS: Readonly<Record<string, AvatarLook>> = {
  s01: man(SKIN.fair, HAIR.lightBrown, 3),
  s02: man(SKIN.fair, HAIR.blonde, 8),
  s03: woman(SKIN.fair, HAIR.blonde, 15),
  s04: man(SKIN.tan, HAIR.black, 22, { beard: true }),
  s05: woman(SKIN.fair, HAIR.lightBrown, 41),
  s06: man(SKIN.fair, HAIR.brown, 4, { glasses: true }),
  s07: woman(SKIN.light, HAIR.black, 19),
  s08: man(SKIN.deep, HAIR.black, 39),
  s09: woman(SKIN.fair, HAIR.auburn, 24),
  s10: man(SKIN.brown, HAIR.black, 28, { beard: true }),
  s11: woman(SKIN.medium, HAIR.darkBrown, 35),
  s12: woman(SKIN.tan, HAIR.black, 33),
  s13: man(SKIN.fair, HAIR.blonde, 12),
  s14: woman(SKIN.deep, HAIR.black, 40),
  s15: man(SKIN.brown, HAIR.black, 47, { beard: true }),
  s16: man(SKIN.medium, HAIR.darkBrown, 5),
  s17: woman(SKIN.medium, HAIR.darkBrown, 32),
  s18: woman(SKIN.light, HAIR.black, 16),
  s19: man(SKIN.light, HAIR.black, 6),
  s20: woman(SKIN.deep, HAIR.black, 18),
  s21: woman(SKIN.medium, HAIR.black, 21),
  s22: man(SKIN.medium, HAIR.black, 2, { beard: true }),
  s23: man(SKIN.light, HAIR.black, 7, { glasses: true }),
  s24: woman(SKIN.light, HAIR.black, 13),
  s25: man(SKIN.fair, HAIR.lightBrown, 9),
  s26: woman(SKIN.fair, HAIR.blonde, 42),
  s27: man(SKIN.fair, HAIR.darkBrown, 1),
  s28: woman(SKIN.fair, HAIR.lightBrown, 31),
  s29: man(SKIN.fair, HAIR.brown, 43, { glasses: true }),
  s30: woman(SKIN.fair, HAIR.brown, 23),
  s31: man(SKIN.fair, HAIR.lightBrown, 44),
  s32: woman(SKIN.fair, HAIR.darkBrown, 45),
  s33: man(SKIN.deep, HAIR.black, 25, { beard: true }),
  s34: woman(SKIN.medium, HAIR.darkBrown, 26),
  s35: woman(SKIN.medium, HAIR.black, 29),
  s36: man(SKIN.medium, HAIR.darkBrown, 22, { beard: true }),
  s37: woman(SKIN.fair, HAIR.blonde, 46),
  s38: man(SKIN.fair, HAIR.brown, 4),
  s39: woman(SKIN.medium, HAIR.black, 14),
  s40: man(SKIN.tan, HAIR.black, 9, { glasses: true }),
  s41: woman(SKIN.fair, HAIR.lightBrown, 17),
  s42: man(SKIN.medium, HAIR.darkBrown, 3, { beard: true }),
  s43: man(SKIN.fair, HAIR.blonde, 47),
  s44: woman(SKIN.fair, HAIR.auburn, 48),
  s45: man(SKIN.deep, HAIR.black, 39, { glasses: true }),
  s46: woman(SKIN.light, HAIR.black, 21),
};

/** Company and city people, by full name. They may show their pictures. */
export const STAFF_LOOKS: Readonly<Record<string, AvatarLook>> = {
  "Laura Niemi": woman(SKIN.fair, HAIR.brown, 23, { glasses: true }),
  "Mira Salo": woman(SKIN.fair, HAIR.blonde, 13),
  "Elias Virta": man(SKIN.fair, HAIR.brown, 2),
  "Tomas Berg": man(SKIN.fair, HAIR.blonde, 6, { beard: true }),
  "Riikka Aalto": woman(SKIN.fair, HAIR.auburn, 32),
  "Pekka Harjula": man(SKIN.fair, HAIR.grey, 25, { beard: true, glasses: true }),
  "Noora Saarinen": woman(SKIN.fair, HAIR.darkBrown, 33),
  "Ville Kantola": man(SKIN.fair, HAIR.lightBrown, 5),
  "Iida Rantanen": woman(SKIN.light, HAIR.blonde, 26),
  "Elina Heikkilä": woman(SKIN.fair, HAIR.brown, 19),
  "Antti Koskinen": man(SKIN.fair, HAIR.darkBrown, 7, { glasses: true }),
  "Henna Laakso": woman(SKIN.fair, HAIR.blonde, 41),
  "Jari Mononen": man(SKIN.fair, HAIR.grey, 28, { beard: true }),
  "Katariina Ström": woman(SKIN.fair, HAIR.darkBrown, 35),
  "Amir Rostami": man(SKIN.medium, HAIR.black, 3, { beard: true }),
  "Helmi Kivelä": woman(SKIN.fair, HAIR.auburn, 45),
  "Oliver Grahn": man(SKIN.fair, HAIR.lightBrown, 12),
  "Petra Huotari": woman(SKIN.fair, HAIR.black, 16),
  "Sanna Mattila": woman(SKIN.fair, HAIR.brown, 42),
};

/** "Elina Heikkilä" becomes "elina-heikkila". */
export function nameSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** The picture of a company or city person. */
export function avatarOfName(name: string): string {
  return `/people/${nameSlug(name)}.svg`;
}

/** The picture of a job seeker, by opaque file id. */
export function seekerAvatar(fileId: keyof typeof SEEKER_LOOKS & string): string {
  return `/people/${fileId}.svg`;
}
