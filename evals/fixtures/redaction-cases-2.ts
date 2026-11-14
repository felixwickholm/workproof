import type { ExplainAnswer } from "@/lib/domain/types";

/**
 * 72 identity forms from a second independent review. The author is "Sanna Virtanen",
 * sanna.virtanen@example.org, unless a case says otherwise. Cases marked `knownLimit` are written
 * down in the README "Limits" paragraph: rules cannot find them, and the eval reports them as such.
 */
interface RedactionCase2 {
  title: string;
  answer: string;
  name?: string;
  contact?: string;
  explain?: ExplainAnswer[];
  leaks: string[];
  knownLimit?: string;
}

const BASE = "The split leaks frames from the same session into test, so accuracy is inflated. Group by session. ";

export const REDACTION_CASES_2: RedactionCase2[] = [
  { title: "name split across lines", answer: BASE + "\n\nSanna\nVirtanen", leaks: ["Sanna", "Virtanen"] },
  { title: "markdown bold name", answer: BASE + "Written by **Sanna Virtanen**.", leaks: ["Sanna", "Virtanen"] },
  { title: "markdown link to profile", answer: BASE + "See [my profile](https://sannav.dev/about).", leaks: ["sannav"] },
  { title: "name in variable", answer: "```python\nsanna_virtanen_split = GroupShuffleSplit()\n```\n" + BASE, leaks: ["sanna", "virtanen"] },
  { title: "name in code string", answer: "```python\nlogger = get_logger('svirtanen-eval')\n```\n" + BASE, leaks: ["virtanen"] },
  { title: "name in comment camel", answer: "```python\n# TODO(SannaV): check groups\n```\n" + BASE, leaks: ["SannaV"] },
  { title: "file path with username", answer: BASE + "I ran it from /Users/svirtanen/work/grasp/eval.py", leaks: ["svirtanen"] },
  { title: "file path windows", answer: BASE + "C:\\Users\\sanna.virtanen\\Documents\\eval.ipynb", leaks: ["sanna", "virtanen"] },
  { title: "github url", answer: BASE + "My fix: github.com/svirtanen/grasp-eval", leaks: ["svirtanen"] },
  { title: "spaced letters", answer: BASE + "S a n n a  V i r t a n e n", leaks: ["S a n n a", "V i r t a n e n"] },
  { title: "leetspeak", answer: BASE + "- S4nn4 V1rt4n3n", leaks: ["S4nn4", "V1rt4n3n"] },
  { title: "initials+surname", answer: BASE + "Regards, S. Virtanen", leaks: ["Virtanen"] },
  { title: "surname comma first", answer: BASE + "Virtanen, Sanna", leaks: ["Virtanen", "Sanna"] },
  { title: "lowercase full name inline", answer: BASE + "ping sanna virtanen if unclear", leaks: ["sanna virtanen"] },
  { title: "finnish intro olen", answer: BASE + "Olen Sanna Virtanen ja teen tätä työkseni.", leaks: ["Sanna", "Virtanen"] },
  { title: "finnish intro third person", answer: BASE + "Kirjoittaja: Matti Meikäläinen", name: "Matti Meikäläinen", contact: "matti@example.org", leaks: ["Matti", "Meikäläinen"] },
  { title: "swedish intro", answer: BASE + "Hej, jag heter Lars-Erik Sjöberg och bor i Borgå.", name: "Lars-Erik Sjöberg", contact: "les@example.org", leaks: ["Lars", "Sjöberg", "Borgå"] },
  { title: "estonian intro", answer: BASE + "Minu nimi on Kadri Tamm, elan Tartus.", name: "Kadri Tamm", contact: "kadri@example.ee", leaks: ["Kadri", "Tamm", "Tartu"] },
  { title: "arabic name only line", answer: BASE + "\nمع تحياتي، يوسف العلي", name: "Youssef Al-Ali", contact: "youssef@example.org", leaks: ["يوسف", "العلي"] },
  { title: "arabic transliterated other spelling", answer: BASE + "Yusuf Alali wrote this.", name: "Youssef Al-Ali", contact: "youssef@example.org", leaks: ["Yusuf", "Alali"], knownLimit: "another spelling of the author's name" },
  { title: "chinese name w/o intro", answer: BASE + "作者：王伟", name: "Wang Wei", contact: "wang@example.org", leaks: ["王伟"] },
  { title: "chinese pinyin reversed", answer: BASE + "Wei Wang, data person", name: "Wang Wei", contact: "wang@example.org", leaks: ["Wei Wang"] },
  { title: "russian intro", answer: BASE + "Привет, я Дмитрий Смирнов.", name: "Dmitri Smirnov", contact: "d@example.org", leaks: ["Дмитрий", "Смирнов"] },
  { title: "russian translit", answer: BASE + "Dmitriy Smirnoff here, happy to discuss", name: "Dmitri Smirnov", contact: "d@example.org", leaks: ["Dmitriy", "Smirnoff"] },
  { title: "only woman on team", answer: BASE + "I'm the only woman on my team, so I notice who gets ignored in reviews.", leaks: ["only woman"] },
  { title: "as a mum", answer: BASE + "Being a mum of twins taught me to plan.", leaks: ["mum of twins"] },
  { title: "visa", answer: BASE + "I'm on a residence permit tied to my current job, so timing matters.", leaks: ["residence permit"] },
  { title: "visa 2", answer: BASE + "I need visa sponsorship; my work permit expires in May.", leaks: ["visa sponsorship", "work permit"] },
  { title: "refugee status", answer: BASE + "I came to Finland as an asylum seeker in 2015.", leaks: ["asylum seeker", "Finland"] },
  { title: "graduation year", answer: BASE + "I finished my MSc in 1998 and have done this since.", leaks: ["1998"] },
  { title: "graduation year 2", answer: BASE + "MSc 2003, BSc 2001.", leaks: ["2003", "2001"] },
  { title: "year of birth implicit", answer: BASE + "I wrote my first program on a Commodore 64 in 1985 as a ten-year-old.", leaks: ["1985", "ten-year-old"] },
  { title: "third-person pronouns", answer: BASE + "About the author: she has worked on vision systems; her focus is evaluation.", leaks: ["she has", "her focus"] },
  { title: "third person he", answer: BASE + "The author is a robotics engineer; he enjoys evaluation work.", leaks: ["he enjoys"] },
  { title: "past employer lowercase", answer: BASE + "back at nokia we grouped by device.", leaks: ["nokia"] },
  { title: "past employer possessive", answer: BASE + "Supercell's data team taught me this.", leaks: ["Supercell"] },
  { title: "past employer unknown lowercase", answer: BASE + "at my last job (kone) we did this", leaks: ["kone"], knownLimit: "a lowercase employer on no list" },
  { title: "past employer Oy lowercase", answer: BASE + "I did this at reaktor before.", leaks: ["reaktor"] },
  { title: "reviewer company mention", answer: BASE + "I applied to Tuulos last year and visited your Espoo site.", leaks: ["applied to Tuulos last year"] },
  { title: "reviewer company 2", answer: BASE + "I interviewed with Tuulos Robotics in 2024.", leaks: ["interviewed with Tuulos"] },
  { title: "phone in words fi", answer: BASE + "Soita: nolla neljä nolla yksi kaksi kolme neljä viisi kuusi seitsemän", leaks: ["neljä nolla yksi"] },
  { title: "phone in words en mixed", answer: BASE + "call oh-four-oh, one two three, four five six seven", leaks: ["four-oh"] },
  { title: "phone dotted", answer: BASE + "Tel 040.123.45.67", leaks: ["040.123"] },
  { title: "phone intl no plus", answer: BASE + "358401234567", leaks: ["358401234567"] },
  { title: "telegram handle", answer: BASE + "tg: sanna_ml", leaks: ["sanna_ml"] },
  { title: "bluesky handle", answer: BASE + "find me at sannav.bsky.social", leaks: ["sannav"] },
  { title: "mastodon", answer: BASE + "mastodon @sannav@mstdn.social", leaks: ["sannav"] },
  { title: "discord tag", answer: BASE + "Discord sannav#1234", leaks: ["sannav"] },
  { title: "personal domain .ai", answer: BASE + "More at virtanen.ai", leaks: ["virtanen"] },
  { title: "personal domain other tld", answer: BASE + "More at sannavirtanen.net/blog", leaks: ["sannavirtanen"] },
  { title: "domain .co.uk", answer: BASE + "portfolio: sanna-dev.co.uk", leaks: ["sanna-dev"] },
  { title: "photo link imgur", answer: BASE + "![me](https://i.imgur.com/abc123.jpg)", leaks: ["imgur"] },
  { title: "photo bare", answer: BASE + "photo: i.imgur.com/abc123.jpg", leaks: ["imgur"] },
  { title: "email unicode", answer: BASE + "sanna(at)example(dot)org", leaks: ["sanna"] },
  { title: "email spaced", answer: BASE + "s a n n a @ e x a m p l e . o r g", leaks: ["e x a m p l e"] },
  { title: "contact other email", answer: BASE + "backup mail: sv1990 at gmail", leaks: ["sv1990"] },
  { title: "age decade", answer: BASE + "I'm in my late 40s and have seen this before.", leaks: ["late 40s"] },
  { title: "age 'half a century'", answer: BASE + "After half a century on this planet I trust grouped splits.", leaks: ["half a century"] },
  { title: "religion lowercase", answer: BASE + "I keep ramadan so I prefer morning meetings.", leaks: ["ramadan"] },
  { title: "disability", answer: BASE + "I use a screen reader because I am blind.", leaks: ["I am blind"] },
  { title: "hometown lowercase phrase", answer: BASE + "here in kuopio we call this leakage.", leaks: ["kuopio"] },
  { title: "hometown possessive", answer: BASE + "Lohja's robotics meetup group taught me this.", leaks: ["Lohja"] },
  { title: "school abbrev", answer: BASE + "At TUNI we learned grouped CV.", leaks: ["TUNI"] },
  { title: "school lowercase w/o study word", answer: BASE + "my aalto thesis was on this", leaks: ["aalto"] },
  { title: "henkilotunnus lower", answer: BASE + "hetu 010190-123a", leaks: ["010190-123a"] },
  { title: "national id spaced IBAN", answer: BASE + "fi21 1234 5600 0007 85", leaks: ["fi21"] },
  { title: "first name only", answer: BASE + "Thanks! -Sanna", leaks: ["Sanna"] },
  { title: "nickname", answer: BASE + "Friends call me Sanni.", leaks: ["Sanni"] },
  { title: "nationality phrase", answer: BASE + "As a Nigerian-Finnish engineer I care about this.", leaks: ["Nigerian"] },
  { title: "third party name", answer: BASE + "My mentor Onni Rautavaara showed me grouped splits.", leaks: ["Onni Rautavaara"], knownLimit: "a third person's name in running text" },
  { title: "explain-only leak", answer: BASE, explain: [{"question": "Why?", "answer": "Sanna here: I learned it at Nokia."}], leaks: ["Sanna", "Virtanen"] },
  { title: "question field leak", answer: BASE, explain: [{"question": "Asked of Sanna Virtanen (sanna.virtanen@example.org)", "answer": "Because of leakage."}], leaks: ["Virtanen"] },
];
