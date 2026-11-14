/**
 * Synthetic people at Espoo Talent Day: recent graduates and experienced professionals, judged on their work.
 * Every name and contact is invented. Contacts use the
 * reserved example.org domain or an unassigned number range. Where someone lives or comes from
 * is never a stored field: it appears only inside their own answers, where the blind layer hides it.
 */
export const PEOPLE = {
  olena: { name: "Olena Kovalenko", contact: "olena.kovalenko@example.org" },
  joonas: { name: "Joonas Peltonen", contact: "+358 50 000 1102" },
  aino: { name: "Aino Mäkelä", contact: "aino.makela@example.org" },
  ravi: { name: "Ravi Menon", contact: "ravi.menon@example.org" },
  elsa: { name: "Elsa Lindqvist", contact: "+358 40 000 2205" },
  oskari: { name: "Oskari Laine", contact: "oskari.laine@example.org" },
  mei: { name: "Mei Tanaka", contact: "mei.tanaka@example.org" },
  daniel: { name: "Daniel Okafor", contact: "daniel.okafor@example.org" },
  hanna: { name: "Hanna Virta", contact: "hanna.virta@example.org" },
  samuel: { name: "Samuel Osei", contact: "samuel.osei@example.org" },
  leila: { name: "Leila Haddad", contact: "leila.haddad@example.org" },
  priya: { name: "Priya Raghunathan", contact: "priya.r@example.org" },
  kristjan: { name: "Kristjan Tamm", contact: "kristjan.tamm@example.org" },
  hodan: { name: "Hodan Warsame", contact: "hodan.warsame@example.org" },
  abdirahman: { name: "Abdirahman Yusuf", contact: "+358 44 000 3317" },
  thiago: { name: "Thiago Albuquerque", contact: "thiago.albuquerque@example.org" },
  mariana: { name: "Mariana Costa Ribeiro", contact: "mariana.ribeiro@example.org" },
  linh: { name: "Linh Nguyen", contact: "linh.nguyen@example.org" },
  minh: { name: "Minh Tran", contact: "+358 45 000 4421" },
  chiamaka: { name: "Chiamaka Eze", contact: "chiamaka.eze@example.org" },
  zainab: { name: "Zainab Al-Rubaie", contact: "zainab.alrubaie@example.org" },
  haider: { name: "Haider Kadhim", contact: "haider.kadhim@example.org" },
  wei: { name: "Wei Chen", contact: "wei.chen@example.org" },
  xiaoling: { name: "Xiaoling Wu", contact: "xiaoling.wu@example.org" },
  johan: { name: "Johan Sundqvist", contact: "johan.sundqvist@example.org" },
  matilda: { name: "Matilda Grönroos", contact: "+358 40 000 5530" },
  dmytro: { name: "Dmytro Shevchuk", contact: "dmytro.shevchuk@example.org" },
  iryna: { name: "Iryna Bondar", contact: "iryna.bondar@example.org" },
  tuomas: { name: "Tuomas Heikkinen", contact: "tuomas.heikkinen@example.org" },
  sari: { name: "Sari Lehtonen", contact: "sari.lehtonen@example.org" },
  tomasz: { name: "Tomasz Nowicki", contact: "tomasz.nowicki@example.org" },
  ana: { name: "Ana Petrović", contact: "ana.petrovic@example.org" },
  kwame: { name: "Kwame Asante", contact: "kwame.asante@example.org" },
  nadia: { name: "Nadia Rahimi", contact: "nadia.rahimi@example.org" },
  sofia: { name: "Sofía Morales", contact: "sofia.morales@example.org" },
  yusuf: { name: "Yusuf Demir", contact: "+358 41 000 6642" },
} as const satisfies Record<string, { name: string; contact: string }>;

export type PersonKey = keyof typeof PEOPLE;

/** The demo persona the story follows. */
export const PERSONA: PersonKey = "olena";
