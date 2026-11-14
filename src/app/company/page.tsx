import type { Metadata } from "next";
import { IntakeFlow } from "./intake-flow";

export const metadata: Metadata = { title: "Post a task · Tryout" };

export default function CompanyPage() {
  return <IntakeFlow />;
}
