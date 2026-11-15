import type { Metadata } from "next";
import { pageMeta } from "@/app/page-meta";
import { EmployerHomeView } from "./employer-home";

export const metadata: Metadata = pageMeta({ title: "Company", description: "The Company view: Halla Supply's challenges, each with its top work by the reviewers' scores and the work waiting in arrival order.", path: "/employer" });

export default function EmployerPage() {
  return <EmployerHomeView />;
}
