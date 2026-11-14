import { describe, expect, it } from "vitest";
import { cardWidth, inflate, placeCard, scrollFor, type Box } from "./placement";

const laptop = { width: 1440, height: 900, top: 0, bottom: 0 };
const phone = { width: 390, height: 844, top: 60, bottom: 0 };
const card = { width: 480, height: 260 };

const overlaps = (a: Box, b: Box) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
const cardBox = (p: { card: { x: number; y: number } }, size = card): Box => ({ ...p.card, ...size });

describe("cardWidth", () => {
  it("is 480 on a laptop and the screen minus 32 on a phone", () => {
    expect(cardWidth(1440)).toBe(480);
    expect(cardWidth(390)).toBe(358);
  });
});

describe("placeCard", () => {
  it("centres the card when nothing is lit", () => {
    expect(placeCard(laptop, null, card)).toEqual({ card: { x: 480, y: 320 }, side: "center", spot: null, arrow: null });
  });

  it("puts the card beside a narrow target", () => {
    const target = { x: 300, y: 200, width: 400, height: 300 };
    const placed = placeCard(laptop, target, card);
    expect(placed.side).toBe("right");
    expect(overlaps(cardBox(placed), placed.spot!)).toBe(false);
  });

  it("puts the card below a wide target when there is room", () => {
    const target = { x: 300, y: 100, width: 1100, height: 300 };
    const placed = placeCard(laptop, target, card);
    expect(placed.side).toBe("below");
    expect(overlaps(cardBox(placed), placed.spot!)).toBe(false);
  });

  it("puts the card above a wide target low on the screen", () => {
    const target = { x: 300, y: 560, width: 1100, height: 300 };
    expect(placeCard(laptop, target, card).side).toBe("above");
  });

  it("docks the card and trims the spotlight when a target fills the screen", () => {
    const target = { x: 300, y: 40, width: 1100, height: 820 };
    const placed = placeCard(laptop, target, card);
    expect(placed.side).toBe("docked");
    expect(overlaps(cardBox(placed), placed.spot!)).toBe(false);
  });

  it("docks the card at the bottom of a phone, inside the side margins", () => {
    const size = { width: 358, height: 300 };
    const placed = placeCard(phone, { x: 16, y: 80, width: 358, height: 600 }, size);
    expect(placed.side).toBe("docked");
    expect(placed.card).toEqual({ x: 16, y: 844 - 16 - 300 });
    expect(overlaps(cardBox(placed, size), placed.spot!)).toBe(false);
  });

  it("keeps the card clear of the home indicator", () => {
    const placed = placeCard({ ...phone, bottom: 34 }, { x: 16, y: 80, width: 358, height: 100 }, { width: 358, height: 300 });
    expect(placed.card.y + 300).toBe(844 - 34 - 16);
  });

  it("never lets the spotlight run past the screen", () => {
    const placed = placeCard(laptop, { x: 300, y: 24, width: 600, height: 1400 }, card);
    expect(placed.spot).toEqual({ x: 292, y: 16, width: 616, height: 900 - 16 });
    expect(overlaps(cardBox(placed), placed.spot!)).toBe(false);
  });

  it("lights nothing when the target is off screen", () => {
    expect(placeCard(laptop, { x: 300, y: 1200, width: 600, height: 200 }, card).spot).toBeNull();
  });

  it("drops the spotlight when the card would cover all of it", () => {
    const placed = placeCard(phone, { x: 16, y: 700, width: 358, height: 100 }, { width: 358, height: 300 });
    expect(placed.spot).toBeNull();
  });

  it("points the caret from the card's near edge at the middle of the target", () => {
    const beside = placeCard(laptop, { x: 300, y: 200, width: 400, height: 300 }, card);
    expect(beside.arrow).toEqual({ edge: "left", offset: 200 + 150 - beside.card.y });
    const below = placeCard(laptop, { x: 300, y: 100, width: 1100, height: 300 }, card);
    expect(below.arrow).toEqual({ edge: "top", offset: 300 + 550 - below.card.x });
  });

  it("keeps the caret off the card's rounded corners", () => {
    const placed = placeCard(laptop, { x: 40, y: 100, width: 1360, height: 300 }, card);
    expect(placed.side).toBe("below");
    const offset = placed.arrow!.offset;
    expect(offset).toBeGreaterThanOrEqual(28);
    expect(offset).toBeLessThanOrEqual(card.width - 28);
  });

  it("points a docked phone card up at its target", () => {
    const placed = placeCard(phone, { x: 16, y: 80, width: 200, height: 200 }, { width: 358, height: 300 });
    expect(placed.arrow).toEqual({ edge: "top", offset: 16 + 100 - 16 });
  });

  it("draws no caret when nothing is lit", () => {
    expect(placeCard(phone, { x: 16, y: 700, width: 358, height: 100 }, { width: 358, height: 300 }).arrow).toBeNull();
  });

  it("keeps the card and its buttons on the smallest phones", () => {
    for (const view of [
      { width: 390, height: 667, top: 60, bottom: 0 },
      { width: 320, height: 640, top: 60, bottom: 34 },
    ]) {
      const size = { width: cardWidth(view.width), height: 320 };
      const placed = placeCard(view, { x: 16, y: 90, width: view.width - 32, height: 400 }, size);
      expect(placed.card.x).toBeGreaterThanOrEqual(16);
      expect(placed.card.x + size.width).toBeLessThanOrEqual(view.width - 16);
      expect(placed.card.y + size.height).toBeLessThanOrEqual(view.height - view.bottom - 16);
      expect(overlaps(cardBox(placed, size), placed.spot!)).toBe(false);
    }
  });

  it("pads the spotlight 8px around the target", () => {
    expect(inflate({ x: 10, y: 10, width: 100, height: 50 })).toEqual({ x: 2, y: 2, width: 116, height: 66 });
  });
});

describe("scrollFor", () => {
  it("brings a phone target to the top, under the bar", () => {
    expect(scrollFor(phone, { x: 16, y: 1200, width: 358, height: 200 }, 300, 5000)).toBe(1200 - 8 - 76);
  });

  it("centres a laptop target together with the card below it", () => {
    const top = scrollFor(laptop, { x: 300, y: 1000, width: 1100, height: 300 }, 260, 5000);
    const onScreen = 1000 - 8 - top;
    expect(onScreen).toBe((900 - (316 + 16 + 260)) / 2);
  });

  it("puts the top of a target taller than the screen 24px under the top edge", () => {
    expect(scrollFor(laptop, { x: 300, y: 1000, width: 600, height: 1400 }, 260, 5000)).toBe(1000 - 24);
  });

  it("stays within the page", () => {
    expect(scrollFor(laptop, { x: 0, y: 20, width: 100, height: 100 }, 260, 5000)).toBe(0);
    expect(scrollFor(laptop, { x: 0, y: 4900, width: 100, height: 100 }, 260, 300)).toBe(300);
  });
});
