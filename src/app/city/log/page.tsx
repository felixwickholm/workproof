import type { Metadata } from "next";
import { LogView } from "./log-view";

export const metadata: Metadata = { title: "The log" };

export default function CityLogPage() {
  return <LogView />;
}
