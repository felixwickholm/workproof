import type { Metadata } from "next";
import { IntakeFlow } from "./intake-flow";

export const metadata: Metadata = { title: "Post a task" };

export default function CompanyPage() {
  return <IntakeFlow />;
}
