import type { Metadata } from "next";
import { Passport } from "./passport";

export const metadata: Metadata = { title: "Your proof passport" };

export default function PassportPage() {
  return <Passport />;
}
