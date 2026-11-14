/**
 * Synthetic people at Espoo Talent Day: recent graduates and experienced professionals, judged on their work.
 * Every name and contact is invented. Contacts use the
 * reserved example.org domain or an unassigned number range. Where someone lives or comes from
 * is never a stored field: it appears only inside their own answers, where the blind layer hides it.
 * `avatar` is identity, like the name: an opaque file under public/people drawn from `SEEKER_LOOKS` in avatars.ts.
 */
export const PEOPLE = {
  mikko: { name: "Mikko Lahtinen", contact: "mikko.lahtinen@example.org", avatar: "/people/s01.svg" },
  joonas: { name: "Joonas Peltonen", contact: "+358 50 000 1102", avatar: "/people/s02.svg" },
  aino: { name: "Aino Mäkelä", contact: "aino.makela@example.org", avatar: "/people/s03.svg" },
  ravi: { name: "Ravi Menon", contact: "ravi.menon@example.org", avatar: "/people/s04.svg" },
  elsa: { name: "Elsa Lindqvist", contact: "+358 40 000 2205", avatar: "/people/s05.svg" },
  oskari: { name: "Oskari Laine", contact: "oskari.laine@example.org", avatar: "/people/s06.svg" },
  mei: { name: "Mei Tanaka", contact: "mei.tanaka@example.org", avatar: "/people/s07.svg" },
  daniel: { name: "Daniel Okafor", contact: "daniel.okafor@example.org", avatar: "/people/s08.svg" },
  hanna: { name: "Hanna Virta", contact: "hanna.virta@example.org", avatar: "/people/s09.svg" },
  samuel: { name: "Samuel Osei", contact: "samuel.osei@example.org", avatar: "/people/s10.svg" },
  leila: { name: "Leila Haddad", contact: "leila.haddad@example.org", avatar: "/people/s11.svg" },
  priya: { name: "Priya Raghunathan", contact: "priya.r@example.org", avatar: "/people/s12.svg" },
  kristjan: { name: "Kristjan Tamm", contact: "kristjan.tamm@example.org", avatar: "/people/s13.svg" },
  hodan: { name: "Hodan Warsame", contact: "hodan.warsame@example.org", avatar: "/people/s14.svg" },
  abdirahman: { name: "Abdirahman Yusuf", contact: "+358 44 000 3317", avatar: "/people/s15.svg" },
  thiago: { name: "Thiago Albuquerque", contact: "thiago.albuquerque@example.org", avatar: "/people/s16.svg" },
  mariana: { name: "Mariana Costa Ribeiro", contact: "mariana.ribeiro@example.org", avatar: "/people/s17.svg" },
  linh: { name: "Linh Nguyen", contact: "linh.nguyen@example.org", avatar: "/people/s18.svg" },
  minh: { name: "Minh Tran", contact: "+358 45 000 4421", avatar: "/people/s19.svg" },
  chiamaka: { name: "Chiamaka Eze", contact: "chiamaka.eze@example.org", avatar: "/people/s20.svg" },
  zainab: { name: "Zainab Al-Rubaie", contact: "zainab.alrubaie@example.org", avatar: "/people/s21.svg" },
  haider: { name: "Haider Kadhim", contact: "haider.kadhim@example.org", avatar: "/people/s22.svg" },
  wei: { name: "Wei Chen", contact: "wei.chen@example.org", avatar: "/people/s23.svg" },
  xiaoling: { name: "Xiaoling Wu", contact: "xiaoling.wu@example.org", avatar: "/people/s24.svg" },
  johan: { name: "Johan Sundqvist", contact: "johan.sundqvist@example.org", avatar: "/people/s25.svg" },
  matilda: { name: "Matilda Grönroos", contact: "+358 40 000 5530", avatar: "/people/s26.svg" },
  dmytro: { name: "Dmytro Shevchuk", contact: "dmytro.shevchuk@example.org", avatar: "/people/s27.svg" },
  iryna: { name: "Iryna Bondar", contact: "iryna.bondar@example.org", avatar: "/people/s28.svg" },
  tuomas: { name: "Tuomas Heikkinen", contact: "tuomas.heikkinen@example.org", avatar: "/people/s29.svg" },
  sari: { name: "Sari Lehtonen", contact: "sari.lehtonen@example.org", avatar: "/people/s30.svg" },
  tomasz: { name: "Tomasz Nowicki", contact: "tomasz.nowicki@example.org", avatar: "/people/s31.svg" },
  ana: { name: "Ana Petrović", contact: "ana.petrovic@example.org", avatar: "/people/s32.svg" },
  kwame: { name: "Kwame Asante", contact: "kwame.asante@example.org", avatar: "/people/s33.svg" },
  nadia: { name: "Nadia Rahimi", contact: "nadia.rahimi@example.org", avatar: "/people/s34.svg" },
  sofia: { name: "Sofía Morales", contact: "sofia.morales@example.org", avatar: "/people/s35.svg" },
  yusuf: { name: "Yusuf Demir", contact: "+358 41 000 6642", avatar: "/people/s36.svg" },
  veera: { name: "Veera Kallio", contact: "veera.kallio@example.org", avatar: "/people/s37.svg" },
  lauri: { name: "Lauri Saari", contact: "+358 50 000 7714", avatar: "/people/s38.svg" },
  fatima: { name: "Fatima Hassan", contact: "fatima.hassan@example.org", avatar: "/people/s39.svg" },
  arjun: { name: "Arjun Patel", contact: "arjun.patel@example.org", avatar: "/people/s40.svg" },
  nora: { name: "Nora Eriksson", contact: "nora.eriksson@example.org", avatar: "/people/s41.svg" },
  mateo: { name: "Mateo García", contact: "mateo.garcia@example.org", avatar: "/people/s42.svg" },
  eetu: { name: "Eetu Ojala", contact: "eetu.ojala@example.org", avatar: "/people/s43.svg" },
  sanni: { name: "Sanni Koivisto", contact: "+358 40 000 8825", avatar: "/people/s44.svg" },
  kofi: { name: "Kofi Mensah", contact: "kofi.mensah@example.org", avatar: "/people/s45.svg" },
  yuki: { name: "Yuki Sato", contact: "yuki.sato@example.org", avatar: "/people/s46.svg" },
} as const satisfies Record<string, { name: string; contact: string; avatar: string }>;

export type PersonKey = keyof typeof PEOPLE;

/** The demo persona the story follows. */
export const PERSONA: PersonKey = "mikko";
