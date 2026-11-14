import qrcode from "qrcode-generator";

/** Modules of white border around the code. The QR standard asks for four; scanners rely on it. */
export const QUIET_ZONE = 4;

/**
 * The dark and light modules of a QR code for `text`, row by row. Error correction "M" keeps the
 * code small enough to scan from across a table while surviving a glare spot on a laptop screen.
 */
export function qrMatrix(text: string): boolean[][] {
  const code = qrcode(0, "M");
  code.addData(text);
  code.make();
  const size = code.getModuleCount();
  return Array.from({ length: size }, (_, row) => Array.from({ length: size }, (_, col) => code.isDark(row, col)));
}

/**
 * One SVG path for every dark module, in module units with the quiet zone already added, so the
 * code renders as a single crisp shape at any size. Runs of dark modules in a row become one rectangle.
 */
export function qrPath(matrix: readonly (readonly boolean[])[], quiet = QUIET_ZONE): string {
  const parts: string[] = [];
  matrix.forEach((cells, row) => {
    let col = 0;
    while (col < cells.length) {
      if (!cells[col]) {
        col++;
        continue;
      }
      const start = col;
      while (col < cells.length && cells[col]) col++;
      parts.push(`M${start + quiet} ${row + quiet}h${col - start}v1h${start - col}z`);
    }
  });
  return parts.join("");
}
