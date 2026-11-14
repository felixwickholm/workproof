import type { SkillId } from "@/lib/skills/vocabulary";

/**
 * Phrases that name a skill when a need is written as a plain sentence
 * ("someone to check how our model is tested") instead of a list of keywords.
 * Each pattern describes the work, never the person.
 */
const PHRASES: { skill: SkillId; pattern: RegExp }[] = [
  { skill: "ml-evaluation", pattern: /\bmodels?\b[^.;]*\b(?:test(?:ed|s)?|evaluat\w*|accura\w*|validat\w*|trust\w*)\b|\b(?:test(?:ed|ing)?|evaluat\w*|validat\w*)\b[^.;]*\bmodels?\b/ },
  { skill: "code-review", pattern: /\breview\w*\s+(?:the\s+|our\s+|their\s+)?(?:code|changes?|pull requests?|prs?)\b|\bcode\b[^.;]*\bbefore\b[^.;]*\b(?:ships?|merges?|goes live|release\w*)\b/ },
  { skill: "testing", pattern: /\b(?:tested|test (?:it|them|this|that|the|our)|write tests|automated tests?)\b/ },
  { skill: "security-thinking", pattern: /\b(?:leak\w*|breach\w*|hack\w*|attack\w*|vulnerab\w*|secure|passwords?|secrets?|personal data)\b/ },
  { skill: "accessibility", pattern: /\b(?:screen ?readers?|keyboard[- ]only|colou?r[- ]?blind\w*|low vision|blind users?)\b/ },
  { skill: "mobile-constraints", pattern: /\b(?:on|for) (?:phones?|mobiles?|tablets?)\b|\bmobile app\b/ },
  { skill: "performance", pattern: /\b(?:slow\w*|speed up|faster|under load|load times?|lag\w*|bottlenecks?)\b/ },
  { skill: "error-handling", pattern: /\b(?:time ?outs?|timing out|fail\w* silently|silent failures?|crash\w*|retr(?:y|ies))\b/ },
  { skill: "pipeline-reliability", pattern: /\b(?:data loads?|nightly (?:jobs?|runs?|loads?)|batch jobs?|ingest\w*|pipelines?)\b/ },
  { skill: "data-quality", pattern: /\b(?:numbers?|data|figures?|labels?)\b[^.;]*\b(?:looks?|is|are|seems?)\s+(?:wrong|off|odd|strange|dirty)\b|\b(?:duplicates?|missing values|bad data|dirty data)\b/ },
  { skill: "observability", pattern: /\b(?:alerts?|alerting|tell us when|notice when|know when)\b/ },
  { skill: "incident-response", pattern: /\b(?:outages?|goes down|went down|incidents?)\b/ },
  { skill: "technical-explanation", pattern: /\bexplain\w*\b|\b(?:walk|talk) \w+ through\b|\bin plain (?:words|language)\b/ },
  { skill: "stakeholder-communication", pattern: /\b(?:keep \w+ (?:\w+ )?informed|present\w* (?:\w+ )?to|report\w* to)\b/ },
  { skill: "user-research", pattern: /\b(?:talk\w* to (?:our )?(?:users|customers)|find out what (?:users|customers|people) need)\b/ },
  { skill: "interaction-design", pattern: /\b(?:sign[- ]?up|checkout|onboarding|booking) (?:flow|page|form)s?\b|\beasier to use\b/ },
  { skill: "data-visualisation", pattern: /\b(?:charts?|graphs?|dashboards?)\b/ },
  { skill: "safety-thinking", pattern: /\b(?:hurt|injur\w*|unsafe|safely)\b/ },
  { skill: "prioritisation", pattern: /\b(?:what to (?:build|do|fix) first|what matters most)\b/ },
  { skill: "planning", pattern: /\b(?:deadlines?|on time|make a plan|plan (?:the|our))\b/ },
];

/** Skill ids a plain sentence describes, in order of first mention. */
export function skillsInSentence(lower: string): SkillId[] {
  return PHRASES.flatMap(({ skill, pattern }) => {
    const at = pattern.exec(lower)?.index;
    return at === undefined ? [] : [{ skill, at }];
  })
    .sort((a, b) => a.at - b.at)
    .map(({ skill }) => skill);
}
