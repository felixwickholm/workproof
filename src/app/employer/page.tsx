import type { Metadata } from "next";
import { EmployerHomeView } from "./employer-home";

export const metadata: Metadata = { title: "Company" };

export default function EmployerPage() {
  return <EmployerHomeView />;
}
