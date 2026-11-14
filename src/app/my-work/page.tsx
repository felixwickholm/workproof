import type { Metadata } from "next";
import { MyWorkList } from "./my-work-list";

export const metadata: Metadata = { title: "My work" };

export default function MyWorkPage() {
  return <MyWorkList />;
}
