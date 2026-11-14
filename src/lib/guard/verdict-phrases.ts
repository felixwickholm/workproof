import type { JudgementKind } from "./no-judgement";

const ANSWER = "(?:diagnosis|review|answer|argument|analysis|reasoning|coverage|response|submission|explanation|grasp|understanding|work)";
const QUALITY =
  "(?:accurate|inaccurate|correct|incorrect|thorough|convincing|unconvincing|comprehensive|complete|incomplete|partial|confused|muddled|flawed|sound|rigorous|exceptional|competent)";
const FIND = "(?:catch|catches|caught|find|finds|found|spot|spots|spotted|miss|misses|missed|hit|hits|nail|nails|nailed|identif\\w{0,8}|overlook\\w{0,4})";

/**
 * Verdicts about a person or their work in everyday words, and scoring scales in review guides.
 * Added after an independent review of the guard: English, Finnish and Swedish.
 */
export const VERDICT_PHRASES: { kind: JudgementKind; pattern: RegExp }[] = [
  // Verdicts on correctness and completeness: "Correctly identifies", "An accurate diagnosis", "Partially correct".
  { kind: "verdict", pattern: /\b(?:correctly|incorrectly|rightly|wrongly|accurately)\s{1,3}(?:identif|diagnos|spot|find|found|explain|point|name|flag|catch|caught|see|note|recogni|read|understand)\w{0,8}/gi },
  { kind: "verdict", pattern: new RegExp(`\\b${QUALITY}\\s{1,3}${ANSWER}\\b`, "gi") },
  { kind: "verdict", pattern: /\b(?:partially|partly|mostly|largely|entirely|fully|completely|half)\s{1,3}(?:correct|right|wrong|incorrect|accurate)\b/gi },
  { kind: "verdict", pattern: /\b(?:answer|response|submission|reasoning|analysis|diagnosis|proof)\s{1,3}(?:is|was|seems|looks)\s{1,3}(?:wrong|right|correct|incorrect|mistaken|confused|unclear|weak|strong|off)\b/gi },
  { kind: "verdict", pattern: /(?:^|[.!?;]\s{0,3})the\s(?:right|wrong|correct)\s(?:fix|answer|call|approach|solution|diagnosis)\b|\b(?:is|was|gives|proposes|picks|chooses|has|finds)\sthe\s(?:right|wrong|correct)\s(?:fix|answer|call|approach|solution|diagnosis)\b/gim },
  { kind: "verdict", pattern: /(?:^|[.!?;]\s{0,3})(?:clear\sand\s)?well[- ](?:structured|reasoned|argued|written|organi[sz]ed)\b|\b(?:clear|concise|thorough|careful)\sand\swell[- ]\w{1,12}/gim },
  { kind: "verdict", pattern: /\bspot[- ]on\b|\bnails?\s(?:it|the)\b|\bnothing\s(?:missed|missing|overlooked)\b|\bmissed\snothing\b|\bno[- ]brainer\b/gi },
  { kind: "verdict", pattern: /(?:^|[.!?;]\s{0,3})misunderst\w{0,8}|\b(?:they|she|he|the\s(?:person|author|applicant|candidate))\smisunderst\w{0,8}/gim },
  // What an answer found, measured against the planted flaws.
  { kind: "score", pattern: /\bplanted\s(?:flaws?|bugs?|issues?|problems?|mistakes?|errors?)\b/gi },
  { kind: "score", pattern: new RegExp(`\\b${FIND}\\b[^.\\n]{0,30}\\bflaws?\\b|\\b${FIND}\\s(?:all|both|the\\s(?:two|three|four))\\s(?:\\w{1,12}\\s)?bugs\\b`, "gi") },
  { kind: "score", pattern: /\b(?:hits|gets|covers|catches|finds|names)\severy\b/gi },
  // Scales and counting in review guides: "Give 1 to 5 points", "score out of 10", "rate each answer".
  { kind: "score", pattern: /\b(?:give|award|assign|add|deduct)\s(?:\d{1,3}|one|two|three|four|five|ten)(?:\s?(?:to|-|–)\s?(?:\d{1,3}|five|ten))?\s(?:points?|stars?|marks?)\b/gi },
  { kind: "score", pattern: /\b\d{1,3}\s?(?:-|–|to)\s?\d{1,3}\s(?:points?|scale|stars?|marks?)\b|\bon\sa\sscale\b/gi },
  { kind: "score", pattern: /\bscore\s(?:out\sof|from|on|between|each|the|this|their|them|it|every|how)\b|\bscor(?:e|ing)\s(?:sheet|card|rubric)\b|\bscorecard\b|\brubric\b/gi },
  {
    kind: "score",
    pattern:
      /(?<!(?:error|heart|interest|conversion|bounce|success|failure|hit|miss|frame|bit|sample|learning|tax|exchange|drop|churn|click|retention|growth|data|refresh|baud|flow|dose|infusion|pass|win|response|request|arrival|sampling|burn)\s)\brate\s(?:the|this|their|each|them|it|how|every|answers?|people|applicants?|candidates?)\b/gi,
  },
  { kind: "score", pattern: /\bcount\s(?:how\smany|the\snumber\sof)\b|\bhow\smany\b[^.;\n]{0,40}\b(?:they|the\sperson|the\scandidate|he|she)\s(?:find|found|spot|catch|get|name|identify)\b/gi },
  { kind: "verdict", pattern: /\b(?:invite|meet|pass|reject|hire|advance)\sonly\sif\b|\bonly\sif\s(?:they|he|she)\s(?:find|spot|catch|get|name)/gi },
  { kind: "verdict", pattern: /\bhow\swell\s(?:they|the\sperson|the\scandidate|he|she|this\sperson)\s(?:fit|fits|match|matches|did|does|perform\w{0,4})\b/gi },
  // Hiring verdicts in everyday words.
  { kind: "verdict", pattern: /\b(?:great|good|valuable|strong|welcome|nice|perfect|fine)\saddition\b|\baddition\sto\s(?:the|our|your)\steam\b/gi },
  { kind: "verdict", pattern: /\bready\sfor\s(?:a\s|the\s)?(?:senior|junior|lead|bigger|next|more)\b|(?:^|[.!?]\s{1,3})not\s(?:yet\s)?ready(?:\syet)?\s?(?:[.!]|$)/gim },
  { kind: "verdict", pattern: /\bneeds?\smore\s(?:experience|practice|seniority|training)\b|\b(?:lacks|has\slittle|has\sno|not\senough)\sexperience\b/gi },
  { kind: "verdict", pattern: /\bworth\s(?:bringing|inviting|calling|talking|meeting|considering|keeping|a\ssecond\slook)\b/gi },
  { kind: "verdict", pattern: /\b(?:talk|speak|chat)\s(?:to|with)\s(?:this|that)\s(?:one|person|candidate|applicant)\b/gi },
  { kind: "verdict", pattern: /\b(?:move|go|proceed)\s(?:forward|ahead)\swith\s(?:this|the|her|him|them)\b|(?:^|[.!?]\s{1,3})go\sfor\s(?:it|them|her|him)\b/gim },
  { kind: "verdict", pattern: /\bexactly\s(?:what|who)\s(?:we|you|they)\s(?:need|want|are\slooking\sfor)\b|\bjust\swhat\swe\sneed\b/gi },
  { kind: "rank", pattern: /\b(?:clear|obvious|my|our|early)\sfavou?rite\b|\bahead\sof\s(?:the\s)?(?:pack|rest|others|field|competition)\b/gi },
  { kind: "rank", pattern: /\b(?:beats|beat|outshines|outclasses|tops)\s(?:the\s)?(?:other|others|rest|everyone|competition)\b|\bthan\sthe\sother\s(?:submissions|applicants|candidates|answers|proofs)\b/gi },
  // Finnish and Swedish.
  {
    kind: "verdict",
    pattern:
      /(?<![\p{L}])(?:kannattaa\s(?:kutsua|haastatella|palkata|tavata)|kutsu\p{L}{0,6}\s(?:juttelemaan|haastatteluun|tapaamiseen)|ei\svakuut\p{L}{0,6}|vakuuttav\p{L}{0,6}|puutteelli\p{L}{0,6}|vajavai\p{L}{0,6}|osaava\p{L}{0,4}|pätevä\p{L}{0,4}|lahjakas\p{L}{0,4}|(?:oikea|väärä|täydellinen|hyvä|huono)\s(?:vastaus|ratkaisu|analyysi|perustelu))(?![\p{L}])/giu,
  },
  {
    kind: "verdict",
    pattern:
      /(?<![\p{L}])(?:(?:mycket\s|riktigt\s)?(?:bra|dåligt?|svagt?|starkt?|utmärkt)\s(?:svar|arbete|lösning|analys|kandidat)|kallas\still\s(?:intervju|möte)|(?:bör|borde|ska)\s(?:anställas|kallas|intervjuas)|till\sintervju)(?![\p{L}])/giu,
  },
];
