import { useMemo } from "react";
import { QUIET_ZONE, qrMatrix, qrPath } from "@/lib/qr/qr";
import { cx } from "../ui/cx";

/**
 * A QR code as one inline SVG, quiet zone included: always dark modules on a light plate, since many
 * phone cameras cannot read an inverted code. In the dark theme the two tokens swap places.
 * Crisp edges keep every module sharp on a projector.
 */
export function QrCode({ value, label, className }: { value: string; label: string; className?: string }) {
  const { path, size } = useMemo(() => {
    const matrix = qrMatrix(value);
    return { path: qrPath(matrix), size: matrix.length + QUIET_ZONE * 2 };
  }, [value]);
  return (
    <svg role="img" aria-label={label} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges" className={cx("block", className)}>
      <rect width={size} height={size} className="fill-ground [[data-theme=dark]_&]:fill-label" />
      <path d={path} className="fill-label [[data-theme=dark]_&]:fill-ground" />
    </svg>
  );
}
