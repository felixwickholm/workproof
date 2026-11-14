import type { Metadata } from "next";
import { IntakeFlow } from "./intake-flow";

export const metadata: Metadata = { title: "New challenge" };

export default function CompanyPage() {
  return <IntakeFlow />;
}
