import type { Metadata } from "next";
import { SeekerHomeView } from "./seeker-home";

export const metadata: Metadata = { title: "Looking for work" };

export default function SeekerPage() {
  return <SeekerHomeView />;
}
