import type { Metadata } from "next";
import { pageMeta } from "@/app/page-meta";
import { publicOriginOf } from "@/components/table/table-copy";
import { TableScreen } from "@/components/table/table-screen";

export const metadata: Metadata = pageMeta({ title: "Table mode", description: "Table mode for the event stand: a big screen with a QR code. A visitor does a 2-minute task on a phone, and the name shows only after the visitor accepts.", path: "/table" });

/** Only the origin of the public `SITE_URL` setting reaches the browser, for the QR code. */
export default function TablePage() {
  return <TableScreen publicOrigin={publicOriginOf(process.env.SITE_URL)} />;
}
