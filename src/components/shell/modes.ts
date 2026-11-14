import { BriefcaseBusiness, House, Inbox, Landmark, Layers, SquarePen, UserRound, WalletCards, type LucideIcon } from "lucide-react";
import { companyName } from "@/lib/seed/companies";
import { STORY_COMPANY_ID, STORY_REVIEWER } from "@/lib/seed/story";

/** A demo identity: who the visitor acts as, and where. */
export interface Account {
  name: string;
  role: string;
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
    label: "Looking for work",
    description: "Do a task, get an answer",
    account: { name: "Olena Kovalenko", role: "Demo person" },
    Icon: UserRound,
    home: "/seeker",
    nav: [
      { href: "/seeker", label: "Home", Icon: House },
      { href: "/challenges", label: "Challenges", Icon: Layers },
      { href: "/my-work", label: "My work", Icon: WalletCards },
    ],
    routes: ["/seeker", "/challenges", "/my-work", "/passport"],
  },
  {
    id: "employer",
    label: "Hiring",
    description: "Read work, not CVs",
    // The story company and its reviewer: the default Hiring identity before a visitor picks another company.
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
    description: "See what happened",
    account: { name: "Event organiser", role: "City of Espoo" },
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

/** Which mode a page belongs to, or null for pages outside the app frame (the landing page, the table view). */
export function modeForPath(path: string): Mode | null {
  return MODES.find((mode) => mode.routes.some((route) => isUnder(path, route))) ?? null;
}

/** The nav item a page sits under: the longest matching prefix, so a scoring page lights "Score work", not "New challenge". */
export function activeNavItem(path: string, nav: readonly NavItem[]): NavItem | null {
  let best: NavItem | null = null;
  for (const item of nav) {
    if (isUnder(path, item.href) && (!best || item.href.length > best.href.length)) best = item;
  }
  return best;
}

/** A top-level page of the mode: the phone tab bar shows here and steps aside on pages pushed deeper. */
export function isNavRoot(path: string, nav: readonly NavItem[]): boolean {
  return nav.some((item) => item.href === path);
}
