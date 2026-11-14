import type { Metadata } from "next";
import { CityView } from "./city-view";

export const metadata: Metadata = { title: "City of Espoo" };

export default function CityPage() {
  return <CityView />;
}
