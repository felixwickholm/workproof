/** Geometry for the walkthrough: where the card goes and where the page scrolls. Pure, in viewport pixels. */

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Viewport {
  width: number;
  height: number;
  /** Space at the top taken by a sticky bar. */
  top: number;
  /** Space at the bottom taken by the device (home indicator). */
  bottom: number;
}

type Side = "right" | "left" | "below" | "above" | "docked" | "center";

/** The caret on the card's edge that points at the spotlight: which edge, and how far along it. */
export interface Arrow {
  edge: "left" | "right" | "top" | "bottom";
  /** Pixels from the card's top (left and right edges) or left (top and bottom edges) to the caret's middle. */
  offset: number;
}

interface Placement {
  card: { x: number; y: number };
  side: Side;
  /** The spotlight, trimmed so the card never sits on top of it. Null when nothing is lit. */
  spot: Box | null;
  /** Null when nothing is lit. */
  arrow: Arrow | null;
}

/** Room around the target inside the spotlight. */
const SPOT_PADDING = 8;
/** Gap between the spotlight and the card. */
const GAP = 16;
/** Distance from the screen edge. */
const MARGIN = 16;
/** Below this width the card docks to the bottom of the screen, edge to edge. */
export const PHONE_MAX = 640;
/** The card's width on a laptop. */
const CARD_WIDTH = 600;
/** How close the caret may come to a corner of the card, so it never sits on the rounded part. */
const ARROW_INSET = 28;
/** The card's height before it is measured: about a title, three lines and the buttons. */
export const CARD_HEIGHT_GUESS = 260;

export function cardWidth(viewportWidth: number) {
  return viewportWidth < PHONE_MAX ? viewportWidth : Math.min(CARD_WIDTH, viewportWidth - 2 * MARGIN);
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max));

/** The target with the spotlight's padding around it. */
export function inflate(target: Box, by = SPOT_PADDING): Box {
  return { x: target.x - by, y: target.y - by, width: target.width + 2 * by, height: target.height + 2 * by };
}

/** Cuts the spotlight to the visible screen, so the cut-out never runs past an edge. Null when none of it shows. */
function onScreen(spot: Box, view: Viewport): Box | null {
  const x = Math.max(spot.x, 0);
  const y = Math.max(spot.y, view.top);
  const right = Math.min(spot.x + spot.width, view.width);
  const bottom = Math.min(spot.y + spot.height, view.height - view.bottom);
  return right <= x || bottom <= y ? null : { x, y, width: right - x, height: bottom - y };
}

/** Cuts the spotlight to the part above `limit`, the card's top edge. Null when nothing is left. */
function above(spot: Box, limit: number): Box | null {
  const bottom = Math.min(spot.y + spot.height, limit - GAP / 2);
  return bottom - spot.y < 24 ? null : { ...spot, height: bottom - spot.y };
}

/** Cuts the spotlight to the part below `limit`, the card's bottom edge. Null when nothing is left. */
function below(spot: Box, limit: number): Box | null {
  const top = Math.max(spot.y, limit + GAP / 2);
  const bottom = spot.y + spot.height;
  return bottom - top < 24 ? null : { ...spot, y: top, height: bottom - top };
}

/**
 * On a laptop the card sits above the target when there is room, so the story reads top to bottom:
 * the card first, then what it shows. Else below it, else beside it. When none fits (a tall target),
 * the card docks at the top of the screen and the spotlight starts under it. On a phone the card
 * always docks at the bottom edge, full width, with no caret: the accent ring alone marks the target.
 */
export function placeCard(view: Viewport, target: Box | null, card: { width: number; height: number }): Placement {
  const phone = view.width < PHONE_MAX;
  const centred = { x: (view.width - card.width) / 2, y: (view.height - card.height) / 2 };
  if (phone) {
    // The card holds the device's bottom inset in its own padding, so it sits on the very edge.
    const edge = { x: 0, y: view.height - card.height };
    const spot = target ? onScreen(inflate(target), { ...view, bottom: 0 }) : null;
    return { card: edge, side: "docked", spot: spot && above(spot, edge.y), arrow: null };
  }
  const none: Placement = { card: centred, side: "center", spot: null, arrow: null };
  if (!target) return none;
  const spot = onScreen(inflate(target), view);
  if (!spot) return none;
  const right = view.width - MARGIN;
  const bottom = view.height - view.bottom - MARGIN;
  const midY = clamp(spot.y + spot.height / 2 - card.height / 2, view.top + MARGIN, bottom - card.height);
  const midX = clamp(spot.x + spot.width / 2 - card.width / 2, MARGIN, right - card.width);
  const fitsTall = card.height <= bottom - view.top - MARGIN;

  if (spot.y - GAP - card.height >= view.top + MARGIN) {
    return withArrow({ x: midX, y: spot.y - GAP - card.height }, "above", spot, card);
  }
  if (spot.y + spot.height + GAP + card.height <= bottom) {
    return withArrow({ x: midX, y: spot.y + spot.height + GAP }, "below", spot, card);
  }
  if (fitsTall && spot.x + spot.width + GAP + card.width <= right) {
    return withArrow({ x: spot.x + spot.width + GAP, y: midY }, "right", spot, card);
  }
  if (fitsTall && spot.x - GAP - card.width >= MARGIN) {
    return withArrow({ x: spot.x - GAP - card.width, y: midY }, "left", spot, card);
  }
  const high = { x: midX, y: view.top + MARGIN };
  return withArrow(high, "docked", below(spot, high.y + card.height), card);
}

/** The card's edge that faces the spotlight, for each side the card can take. */
const EDGE: Record<Exclude<Side, "center">, Arrow["edge"]> = { right: "left", left: "right", below: "top", above: "bottom", docked: "bottom" };

/** Completes a placement with the caret, aimed at the middle of the spotlight along the facing edge. */
function withArrow(at: { x: number; y: number }, side: Exclude<Side, "center">, spot: Box | null, card: { width: number; height: number }): Placement {
  if (!spot) return { card: at, side, spot: null, arrow: null };
  const edge = EDGE[side];
  const across = edge === "left" || edge === "right";
  const aim = across ? spot.y + spot.height / 2 - at.y : spot.x + spot.width / 2 - at.x;
  const length = across ? card.height : card.width;
  // A card shorter than two insets has no straight edge to spare; the caret then sits in the middle.
  const offset = length > 2 * ARROW_INSET ? clamp(aim, ARROW_INSET, length - ARROW_INSET) : length / 2;
  return { card: at, side, spot, arrow: { edge, offset } };
}

/**
 * Where the page should scroll so the target and the card both fit. On a phone the target goes
 * to the top third, above the docked card. On a laptop a card and the target below it are centred
 * together; a target too tall for that starts under the card docked at the top.
 * `target.y` is in page coordinates; returns a page scroll offset within [0, maxScroll].
 */
export function scrollFor(view: Viewport, target: Box, cardHeight: number, maxScroll: number): number {
  const spot = inflate(target);
  const phone = view.width < PHONE_MAX;
  const free = view.height - view.top - view.bottom;
  let topOnScreen: number;
  if (phone) {
    topOnScreen = view.top + MARGIN;
  } else if (spot.height + GAP + cardHeight <= free - 2 * MARGIN) {
    // The card above, the target under it, the pair centred.
    topOnScreen = view.top + (free - (spot.height + GAP + cardHeight)) / 2 + cardHeight + GAP;
  } else if (spot.height <= free - 2 * MARGIN) {
    topOnScreen = view.top + (free - spot.height) / 2;
  } else {
    topOnScreen = view.top + MARGIN + cardHeight + GAP;
  }
  return clamp(Math.round(spot.y - topOnScreen), 0, maxScroll);
}
