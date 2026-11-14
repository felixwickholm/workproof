import { BriefcaseBusiness, House, Inbox, Landmark, Layers, SquarePen, UserRound, WalletCards, type LucideIcon } from "lucide-react";
import { CITY_PERSON, companyName } from "@/lib/seed/companies";
import { STORY_COMPANY_ID, STORY_REVIEWER } from "@/lib/seed/story";

/** A demo identity: who the visitor acts as, and where. */
export interface Account {
  name: string;
  role: string;
  /** Illustrated picture under /public. Only the visitor's own account or a company person: never a job seeker shown to a company. */
  avatar?: string;
}

export type ModeId = "seeker" | "employer" | "city";

export interface NavItem {
  href: string;
  label: string;
  Icon: LucideIcon;
}

export interface Mode {
  id: ModeId;
  /** The switcher's label, in the visitor's words. */
  label: string;
  /** One line under the label in the switcher menu. */
  description: string;
  /** Whose eyes the demo shows this mode through: the account card's two lines. */
  account: Account;
  Icon: LucideIcon;
  home: string;
  nav: NavItem[];
  /** Path prefixes that belong to this mode, besides its nav items. */
  routes: string[];
}

export const MODES: readonly Mode[] = [
  {
    id: "seeker",
    label: "Job seeker",
    description: "Do a real challenge, get a score",
    account: { name: "Mikko Lahtinen", role: "Job seeker" },
    Icon: UserRound,
    home: "/",
    nav: [
      { href: "/", label: "Home", Icon: House },
      { href: "/challenges", label: "Challenges", Icon: Layers },
      { href: "/my-work", label: "My work", Icon: WalletCards },
    ],
    // "/seeker" is the same page as "/", kept so older links and the tour still land.
    routes: ["/", "/seeker", "/challenges", "/my-work", "/passport"],
  },
  {
    id: "employer",
    label: "Company",
    description: "Post a challenge, score the work",
    // The story company and its reviewer: the default Company identity before a visitor picks another company.
    account: { name: STORY_REVIEWER, role: companyName(STORY_COMPANY_ID) },
    Icon: BriefcaseBusiness,
    home: "/employer",
    nav: [
      { href: "/employer", label: "My challenges", Icon: House },
      { href: "/company/review", label: "Score work", Icon: Inbox },
      { href: "/company", label: "New challenge", Icon: SquarePen },
    ],
    routes: ["/employer", "/company"],
  },
  {
    id: "city",
    label: "City of Espoo",
    description: "See what came of the event",
    account: { name: CITY_PERSON.name, role: "City of Espoo", avatar: CITY_PERSON.avatar },
    Icon: Landmark,
    home: "/city",
    nav: [{ href: "/city", label: "Overview", Icon: House }],
    routes: ["/city"],
  },
];

/** True when `path` is `prefix` itself or a page under it ("/city/audit" is under "/city", "/cityscape" is not). */
function isUnder(path: string, prefix: string) {
  return path === prefix || path.startsWith(`${prefix}/`);
}

/** Pages that are another address for a nav page: "/seeker" is the job seeker home at "/". */
const ALIASES: Readonly<Record<string, string>> = { "/seeker": "/" };

function canonical(path: string) {
  return ALIASES[path] ?? path;
}

/** Which mode a page belongs to, or null for pages outside the app frame (/for-judges, /how-it-works, /try, the table view). */
export function modeForPath(path: string): Mode | null {
  return MODES.find((mode) => mode.routes.some((route) => isUnder(path, route))) ?? null;
}

/** The nav item a page sits under: the longest matching prefix, so a scoring page lights "Score work", not "New challenge". */
export function activeNavItem(path: string, nav: readonly NavItem[]): NavItem | null {
  path = canonical(path);
  let best: NavItem | null = null;
  for (const item of nav) {
    if (isUnder(path, item.href) && (!best || item.href.length > best.href.length)) best = item;
  }
  return best;
}

/** A top-level page of the mode: the phone tab bar shows here and steps aside on pages pushed deeper. */
export function isNavRoot(path: string, nav: readonly NavItem[]): boolean {
  path = canonical(path);
  return nav.some((item) => item.href === path);
}
