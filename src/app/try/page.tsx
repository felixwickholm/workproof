import type { Metadata } from "next";
import { pageMeta } from "@/app/page-meta";
import { TryFlow } from "./try-flow";

export const metadata: Metadata = pageMeta({ title: "Try a 2-minute task", description: "Do a 2-minute task on your phone and see the blind proof a company would read, with known personal details removed.", path: "/try" });

export default function TryPage() {
  return <TryFlow />;
}
