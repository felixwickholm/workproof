import type { Metadata } from "next";
import { TryFlow } from "./try-flow";

export const metadata: Metadata = { title: "Try a 2-minute task · Tryout" };

export default function TryPage() {
  return <TryFlow />;
}
