import type { Metadata } from "next";
import { pageMeta } from "@/app/page-meta";
import { LogView } from "./log-view";

export const metadata: Metadata = pageMeta({ title: "Audit log", description: "The City of Espoo audit log: every decision with the name of the reviewer who made it and a written reason. It counts automated decisions, and the count is 0.", path: "/city/log" });

export default function CityLogPage() {
  return <LogView />;
}
