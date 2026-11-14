/**
 * Identity written into work in the forms people really use, from an independent review: other languages,
 * lowercase, code comments, obfuscated emails, handles, ids and personal statements. Each case lists the
 * strings that must not reach a reviewer. The author is always "Leila Haddad", leila@example.org.
 */
interface RedactionCase {
  title: string;
  answer: string;
  explain?: string;
  leaks: string[];
}

const BASE = "Split by grasp attempt, not by frame, because frames of one attempt leak into test. ";

export const REDACTION_CASES: RedactionCase[] = [
  { title: "signature no sign-off", answer: BASE + "\n\nLeila Haddad", leaks: ["Leila", "Haddad"] },
  { title: "lowercase name", answer: BASE + " i'm leila haddad btw", leaks: ["leila", "haddad"] },
  { title: "other person's name intro", answer: BASE + " My name is Sanna Virtanen.", leaks: ["Sanna", "Virtanen"] },
  { title: "name intro lowercase", answer: BASE + " my name is sanna virtanen.", leaks: ["sanna", "virtanen"] },
  { title: "call me", answer: BASE + " Call me Sanna. Sanna Virtanen here.", leaks: ["Sanna", "Virtanen"] },
  { title: "Finnish intro", answer: BASE + " Nimeni on Sanna Virtanen.", leaks: ["Sanna", "Virtanen"] },
  { title: "Swedish intro", answer: BASE + " Jag heter Sanna Virtanen.", leaks: ["Sanna", "Virtanen"] },
  { title: "email at dot", answer: BASE + " Mail me: sanna at example dot com", leaks: ["sanna at example dot com", "example dot com"] },
  { title: "email brackets", answer: BASE + " sanna[at]example[dot]com", leaks: ["sanna[at]example"] },
  { title: "email spaced", answer: BASE + " sanna @ example . com", leaks: ["sanna @ example"] },
  { title: "phone +358 compact", answer: BASE + " Phone +358401234567", leaks: ["401234567"] },
  { title: "phone 040", answer: BASE + " Phone 040 123 4567", leaks: ["123 4567"] },
  { title: "phone 040-1234567", answer: BASE + " Phone 040-1234567", leaks: ["1234567"] },
  { title: "phone (+358) 40", answer: BASE + " Phone (+358) 40 1234567", leaks: ["1234567"] },
  { title: "phone 00358", answer: BASE + " Phone 00358 40 123 4567", leaks: ["123 4567"] },
  { title: "phone dots words", answer: BASE + " Phone: four zero one two three four five six seven", leaks: ["four zero one two"] },
  { title: "linkedin no domain", answer: BASE + " Find me on LinkedIn as sannavirtanen", leaks: ["sannavirtanen"] },
  { title: "github handle", answer: BASE + " My GitHub is @sannav", leaks: ["@sannav"] },
  { title: "github handle2", answer: BASE + " gh: sannav-dev", leaks: ["sannav-dev"] },
  { title: "twitter handle", answer: BASE + " Twitter @sanna_v", leaks: ["@sanna_v"] },
  { title: "school not on list", answer: BASE + " I studied at Hanken School of Economics and Tampere Uni.", leaks: ["Tampere Uni", "Hanken"] },
  { title: "school lower", answer: BASE + " studied in aalto university and lut", leaks: ["aalto", "lut"] },
  { title: "school abbreviation", answer: BASE + " I have a degree from HY and an exchange at KU Leuven.", leaks: ["KU Leuven", " HY "] },
  { title: "school Turun yliopisto", answer: BASE + " Opiskelin Turun yliopistossa.", leaks: ["Turun"] },
  { title: "city not on list", answer: BASE + " I live in Lohja and grew up in Rauma.", leaks: ["Lohja", "Rauma"] },
  { title: "city lowercase", answer: BASE + " I live in espoo.", leaks: ["espoo"] },
  { title: "city other", answer: BASE + " Moved from Kraków to Tampere.", leaks: ["Kraków"] },
  { title: "age I am 34", answer: BASE + " I am 34.", leaks: ["34"] },
  { title: "age 34yo", answer: BASE + " 34yo engineer.", leaks: ["34yo"] },
  { title: "age born", answer: BASE + " Born 1991.", leaks: ["1991"] },
  { title: "age class of", answer: BASE + " Class of 2012, graduated 2015.", leaks: ["2012"] },
  { title: "age words", answer: BASE + " I am thirty-four years old.", leaks: ["thirty-four"] },
  { title: "age 60", answer: BASE + " I'm 61 and retired early.", leaks: ["61"] },
  { title: "nationality lower", answer: BASE + " As a syrian engineer I care.", leaks: ["syrian"] },
  { title: "nationality not on list", answer: BASE + " I am Eritrean and Vietnamese-Finnish.", leaks: ["Eritrean"] },
  { title: "nationality Finnish native", answer: BASE + " Native Finnish, fluent Swedish.", leaks: ["Native Finnish"] },
  { title: "mother tongue", answer: BASE + " My mother tongue is Arabic.", leaks: ["Arabic"] },
  { title: "religion", answer: BASE + " As a practising Muslim I pray at noon.", leaks: ["Muslim"] },
  { title: "gender pronoun", answer: BASE + " As a woman in tech I noticed this.", leaks: ["woman"] },
  { title: "gender she", answer: BASE + " (she/her)", leaks: ["she/her"] },
  { title: "non-latin name", answer: BASE + " 我叫王伟。", leaks: ["王伟"] },
  { title: "arabic name", answer: BASE + " اسمي ليلى حداد", leaks: ["ليلى"] },
  { title: "cyrillic", answer: BASE + " Меня зовут Анна Иванова.", leaks: ["Анна", "Иванова"] },
  { title: "code comment name", answer: "```python\n# author: Sanna Virtanen <sanna.v@example.com>\n# Copyright (c) 2024 Sanna Virtanen\nsplit = GroupShuffleSplit()\n```", leaks: ["Sanna", "Virtanen"] },
  { title: "code author lower", answer: "```\n// written by sannav (Sanna V.)\n```" + BASE, leaks: ["sannav", "Sanna V"] },
  { title: "employer lowercase", answer: BASE + " I worked at nokia for five years.", leaks: ["nokia"] },
  { title: "employer known no at", answer: BASE + " Nokia and Supercell taught me this. ex-Wolt.", leaks: ["Nokia", "Supercell", "Wolt"] },
  { title: "url without scheme", answer: BASE + " portfolio: sannavirtanen.fi", leaks: ["sannavirtanen.fi"] },
  { title: "hetu", answer: BASE + " My id 131052-308T.", leaks: ["131052-308T"] },
  { title: "iban", answer: BASE + " FI21 1234 5600 0007 85", leaks: ["5600"] },
  { title: "family", answer: BASE + " I have two kids and a husband.", leaks: ["kids", "husband"] },
  { title: "disability", answer: BASE + " I am deaf, so I use captions.", leaks: ["deaf"] },
  { title: "photo url", answer: BASE + " ![me](https://example.com/me.jpg)", leaks: ["example.com"] },
  { title: "name in explain", answer: BASE + "", explain: "Because I, Sanna Virtanen from Lohja, learned it at Hanken.", leaks: ["Sanna", "Virtanen", "Lohja", "Hanken"] },
];
