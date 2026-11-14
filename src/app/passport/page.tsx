import type { Metadata } from "next";
import { Passport } from "./passport";

export const metadata: Metadata = { title: "My proofs · Tryout" };

export default function PassportPage() {
  return <Passport />;
}
