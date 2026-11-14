/**
 * How visitors really type at the table: phone spelling, the name field skipped, a name and an age in
 * the first line, an employer or a district in passing. The known identity is someone else, so every
 * case is caught by a rule, never by a name the person typed into a field.
 */
interface TableInput {
  answer: string;
  /** Strings that must not reach any reader, compared in any case. */
  leaks: string[];
}

/** The author the blind layer is told about. Not the person named in the answers. */
export const TABLE_KNOWN = {
  name: "Leila Haddad",
  contact: "leila@example.org",
  companies: ["Halla Supply", "Saarnivo Grid", "Tuulos Robotics"],
};

/** The work itself, which must survive every case unchanged. */
export const TABLE_WORK = "The while loop has no timeout, so the motor driver can hang.";
const W = ` ${TABLE_WORK}`;

export const TABLE_INPUTS: TableInput[] = [
  // Phone spellings of an introduction.
  { answer: `hi im Mikko from Lahti.${W}`, leaks: ["Mikko", "Lahti"] },
  { answer: `Im Mikko and${W}`, leaks: ["Mikko"] },
  { answer: `i m Mikko.${W}`, leaks: ["Mikko"] },
  { answer: `iam Mikko,${W}`, leaks: ["Mikko"] },
  { answer: `its Mikko here.${W}`, leaks: ["Mikko"] },
  { answer: `this is Mikko.${W}`, leaks: ["Mikko"] },
  { answer: `Mikko here,${W}`, leaks: ["Mikko"] },
  { answer: `hey Mikko here!${W}`, leaks: ["Mikko"] },
  { answer: `my name's Mikko.${W}`, leaks: ["Mikko"] },
  { answer: `name: Mikko\n${TABLE_WORK}`, leaks: ["Mikko"] },
  { answer: `hi im mikko from lahti,${W}`, leaks: ["mikko", "lahti"] },
  // Sign-offs on the last line or at the end of the text.
  { answer: `${TABLE_WORK}\n- Mikko`, leaks: ["Mikko"] },
  { answer: `${TABLE_WORK} /Mikko`, leaks: ["Mikko"] },
  { answer: `${TABLE_WORK} br Mikko`, leaks: ["Mikko"] },
  { answer: `${TABLE_WORK} t. Mikko`, leaks: ["Mikko"] },
  { answer: `${TABLE_WORK} terveisin Mikko`, leaks: ["Mikko"] },
  // Finnish.
  { answer: `olen Mikko ja${W}`, leaks: ["Mikko"] },
  { answer: `nimeni on Mikko.${W}`, leaks: ["Mikko"] },
  { answer: `mä oon Mikko.${W}`, leaks: ["Mikko"] },
  // A full name and an age.
  { answer: `Ahmed Al-Sayed here, 34, from Espoo.${W}`, leaks: ["Ahmed", "Al-Sayed", "34", "Espoo"] },
  { answer: `Ahmed Al-Sayed, 34,${W}`, leaks: ["Ahmed", "Al-Sayed", "34"] },
  { answer: `I'm Ahmed, 34 y/o.${W}`, leaks: ["Ahmed", "34"] },
  { answer: `Mikko 34yo.${W}`, leaks: ["34yo"] },
  { answer: `aged 34.${W}`, leaks: ["34"] },
  { answer: `a 34-year-old nurse.${W}`, leaks: ["34"] },
  { answer: `Mikko, 34 v.${W}`, leaks: ["Mikko", "34 v"] },
  // Employers, whole.
  { answer: `I worked at Halla Supply for two years.${W}`, leaks: ["Halla", "Supply for"] },
  { answer: `Before this I was at halla supply oy.${W}`, leaks: ["halla", "supply oy"] },
  { answer: `I trained at Tuulos Robotics Oy.${W}`, leaks: ["Tuulos", "Robotics", "Oy."] },
  { answer: `Ten years at Stora Enso Oyj.${W}`, leaks: ["Stora", "Enso", "Oyj"] },
  { answer: `I did nights at Nokia Networks.${W}`, leaks: ["Nokia"] },
  // Districts and towns.
  { answer: `I ran a daycare in Kontula.${W}`, leaks: ["Kontula"] },
  { answer: `Asun Kontulassa.${W}`, leaks: ["Kontula"] },
  { answer: `We moved from Itäkeskus to Vuosaari.${W}`, leaks: ["Itäkeskus", "Vuosaari"] },
  { answer: `I commute from Myyrmäki and Tikkurila.${W}`, leaks: ["Myyrmäki", "Tikkurila"] },
  { answer: `Kivenlahdessa ja Espoonlahdessa.${W}`, leaks: ["Kivenlah", "Espoonlah"] },
  { answer: `I grew up in kallio, now in vuosaari.${W}`, leaks: ["kallio", "vuosaari"] },
  { answer: `Ex-teacher from Kouvola and Kangasala.${W}`, leaks: ["Kouvola", "Kangasala"] },
  { answer: `Born in Esbo, live in Vanda.${W}`, leaks: ["Esbo", "Vanda"] },
  { answer: `Hakunilassa ja Korsossa.${W}`, leaks: ["Hakunila", "Korso"] },
];

/** Technical text that looks like the forms above and must come through unchanged. */
export const TABLE_TECHNICAL: string[] = [
  "I'm using Redis for the queue, its TTL is 30 s.",
  "Use im2col before the convolution.",
  "The p95 is here, 34 ms, and the p99 is 80 ms.",
  "Evict aged cache entries first.",
  "The Care plan must list every medicine change.",
  "```python\nname: retry_count = 3\n```",
  "```yaml\nname: Build\non: push\n```",
  "This is Python code, its Kafka consumer is idle.",
  "I'm Running the job at night.",
  "The handler here, 12, 14 and 16 are the retries.",
  "Version 2 v. 3 changed the API.",
  "Tests:\n- Unit tests\n- Load tests\n- Retry with backoff",
  "The team uses a Care home checklist; Home visits come first.",
  "Use a/B testing, then roll back.",
  "olen samaa mieltä: the loop needs a timeout.",
  "Keras and Kafka run on the same node.",
];
