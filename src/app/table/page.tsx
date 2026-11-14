import type { Metadata } from "next";
import { publicOriginOf } from "@/components/table/table-copy";
import { TableScreen } from "@/components/table/table-screen";

export const metadata: Metadata = { title: "Table" };

/** Only the origin of the public `SITE_URL` setting reaches the browser, for the QR code. */
export default function TablePage() {
  return <TableScreen publicOrigin={publicOriginOf(process.env.SITE_URL)} />;
}
