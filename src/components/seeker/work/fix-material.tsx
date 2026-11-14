"use client";

import { useMemo } from "react";
import type { Challenge } from "@/lib/domain/types";
import { fixUnits, unitRows, type FixUnit } from "@/lib/think-aloud/fix-units";
import { isFigure } from "@/lib/think-aloud/material";
import { cx } from "../../ui/cx";

/** A four-column budget fits a phone: slightly smaller type and padding there, the body size from 900px. */
const TABLE_TEXT = "text-[15px] leading-[20px] min-[900px]:text-body";

interface Props {
  material: NonNullable<Challenge["material"]>;
  marked: number | null;
  onMark: (unit: FixUnit, all: FixUnit[]) => void;
  locked?: boolean;
}

/**
 * The material of a Fix challenge, itself the control: each line, cell or sentence is a button. One
 * can be marked at a time; the marked one carries a clear outline and a tint, not colour alone.
 */
export function FixMaterial({ material, marked, onMark, locked }: Props) {
  const units = useMemo(() => fixUnits(material), [material]);
  const rows = unitRows(units);
  const shape = units[0]?.shape ?? "sentence";

  const unitButton = (unit: FixUnit, extra?: string) => (
    <button
      key={unit.index}
      type="button"
      role="radio"
      aria-checked={marked === unit.index}
      disabled={locked}
      data-demo-target={`mark-${unit.index}`}
      onClick={() => onMark(unit, units)}
      className={cx(
        "rounded-[10px] text-left transition-[background-color,box-shadow] duration-150 disabled:cursor-default",
        marked === unit.index ? "bg-tint text-label shadow-[inset_0_0_0_2px_var(--color-accent)]" : "hover:bg-fill",
        extra,
      )}
    >
      {unit.text}
    </button>
  );

  // Rows in order, with the rows of each table kept together and its width known.
  const groups: { table?: number; columns: number; rows: FixUnit[][] }[] = [];
  for (const row of rows) {
    const table = row[0]?.shape === "cell" ? row[0].table : undefined;
    const last = groups[groups.length - 1];
    const columns = Math.max(0, ...row.map((u) => (u.column ?? 0) + 1));
    if (table !== undefined && last?.table === table) {
      last.rows.push(row);
      last.columns = Math.max(last.columns, columns);
    } else groups.push({ table, columns, rows: [row] });
  }

  return (
    <figure className="min-w-0 rounded-card bg-surface p-4 min-[900px]:p-6">
      <figcaption className="text-body mb-3 font-medium text-label">{material.title}</figcaption>
      <div role="radiogroup" aria-label="Mark what is wrong" className="flex flex-col gap-3">
        {shape === "line" ? (
          <ol className="flex flex-col font-mono text-[15px] leading-[22px]">
            {units.map((unit) => (
              <li key={unit.index} className="flex items-stretch gap-3">
                <span aria-hidden className="tnum w-7 shrink-0 pt-2.5 text-right text-label-3">
                  {unit.row + 1}
                </span>
                {unitButton(unit, "min-h-11 flex-1 px-3 py-2.5 whitespace-pre-wrap [overflow-wrap:anywhere]")}
              </li>
            ))}
          </ol>
        ) : (
          groups.map((group, g) =>
            group.table !== undefined ? (
              <div key={g} className="overflow-x-auto">
                <table className="tnum w-full border-collapse">
                  <tbody>
                    {group.rows.map((row, r) => (
                      <tr key={r} className="border-separator not-first:border-t">
                        {Array.from({ length: group.columns }, (_, column) => {
                          const unit = row.find((u) => u.column === column);
                          if (!unit) return <td key={`blank-${column}`} />;
                          // The head names the columns; it is never the wrong part, so it is not a choice.
                          if (unit.head) {
                            return (
                              <th key={unit.index} scope="col" className={cx(TABLE_TEXT, "px-2 py-3 text-left font-medium text-label-2 min-[900px]:px-3.5", figureColumn(group.rows, column) && "text-right")}>
                                {unit.text}
                              </th>
                            );
                          }
                          return (
                            <td key={unit.index} className="p-0.5">
                              {unitButton(unit, cx(TABLE_TEXT, "block min-h-11 w-full px-2 py-2.5 min-[900px]:px-3", isFigure(unit.text) && "text-right whitespace-nowrap"))}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              group.rows.map((row, r) => (
                <p key={`${g}-${r}`} className="text-[18px] leading-[30px] text-pretty text-label">
                  {row.flatMap((unit) => [unitButton(unit, "inline px-1 py-0.5 [box-decoration-break:clone]"), " "])}
                </p>
              ))
            ),
          )
        )}
      </div>
    </figure>
  );
}

/** A column whose cells are figures lines its heading up on the right, over the numbers. */
function figureColumn(rows: readonly FixUnit[][], column: number): boolean {
  const cells = rows.flatMap((row) => row.filter((u) => !u.head && u.column === column));
  return cells.length > 0 && cells.every((u) => isFigure(u.text));
}
