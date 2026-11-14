import { materialBlocks } from "./material";

/** One part of a Fix challenge's material that a person can mark as wrong. */
export interface FixUnit {
  /** Position among all units, from 0. */
  index: number;
  text: string;
  /** A line of code, a cell of a table, or a sentence of prose. */
  shape: "line" | "cell" | "sentence";
  /** Line, table row or paragraph the unit sits in, from 0, counted over the whole material. */
  row: number;
  /** For a cell: whether its row is the table's head. */
  head?: boolean;
  /** For a cell: which table it belongs to, from 0. */
  table?: number;
  /** For a cell: its column, from 0, so a row with blank cells still lines up under its headings. */
  column?: number;
}

const sentences = (text: string) => (text.match(/[^.!?]+(?:[.!?]+|$)/g) ?? []).map((s) => s.trim()).filter(Boolean);

/**
 * Code splits by line, a table by cell, prose by sentence, so one tap marks one number, one line or
 * one sentence. Blank parts are never markable.
 */
export function fixUnits(material: { kind: "code" | "text"; body: string }): FixUnit[] {
  const units: Omit<FixUnit, "index">[] = [];
  if (material.kind === "code") {
    material.body.split("\n").forEach((text, row) => {
      if (text.trim()) units.push({ text, shape: "line", row });
    });
  } else {
    let row = 0;
    materialBlocks(material.body).forEach((block, table) => {
      if (block.kind === "table") {
        [block.head, ...block.rows].forEach((cells, r) => {
          cells.forEach((cell, column) => {
            if (cell) units.push({ text: cell, shape: "cell", row, head: r === 0, table, column });
          });
          row++;
        });
      } else {
        for (const paragraph of block.text.split("\n")) {
          for (const sentence of sentences(paragraph)) units.push({ text: sentence, shape: "sentence", row });
          row++;
        }
      }
    });
  }
  return units.map((unit, index) => ({ ...unit, index }));
}

/**
 * The marked part in words that stand alone: a cell carries its row's first cell ("Travel: 42 000"),
 * so the reviewer knows which number was marked; a line or sentence is itself.
 */
export function markedText(units: readonly FixUnit[], unit: FixUnit): string {
  if (unit.shape !== "cell") return unit.text.trim();
  const first = units.find((u) => u.row === unit.row);
  return first && first.index !== unit.index ? `${first.text}: ${unit.text}` : unit.text;
}

/** The units grouped by their line, row or paragraph, in order. */
export function unitRows(units: readonly FixUnit[]): FixUnit[][] {
  const rows = new Map<number, FixUnit[]>();
  for (const unit of units) rows.set(unit.row, [...(rows.get(unit.row) ?? []), unit]);
  return [...rows.values()];
}
