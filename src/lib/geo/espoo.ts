import { ESPOO_PROJECTION } from "./espoo-outline";
import { projectWith } from "./projection";

/** The districts the demo companies sit in. Matches the domain's district names. */
export type EspooDistrictName =
  | "Otaniemi"
  | "Keilaniemi"
  | "Tapiola"
  | "Leppävaara"
  | "Kera"
  | "Matinkylä"
  | "Espoon keskus"
  | "Espoonlahti";

/** A point in the outline's view units: x grows east, y grows south. */
export interface MapPoint {
  x: number;
  y: number;
}

/** Where a label prefers to sit relative to its point, tried first before the other sides. */
export type LabelSide = "right" | "left" | "above" | "below";

export interface MapPlace {
  name: string;
  lat: number;
  lon: number;
  labelSide: LabelSide;
}

/** Places any coordinate on the Espoo outline. */
export function project(lat: number, lon: number): MapPoint {
  const [x, y] = projectWith(ESPOO_PROJECTION, lat, lon);
  return { x, y };
}

/** District centres, from public coordinates of each area's main square or station. */
export const ESPOO_DISTRICTS: Record<EspooDistrictName, MapPlace> = {
  Otaniemi: { name: "Otaniemi", lat: 60.186, lon: 24.828, labelSide: "above" },
  Keilaniemi: { name: "Keilaniemi", lat: 60.176, lon: 24.829, labelSide: "right" },
  Tapiola: { name: "Tapiola", lat: 60.176, lon: 24.805, labelSide: "below" },
  "Leppävaara": { name: "Leppävaara", lat: 60.219, lon: 24.813, labelSide: "above" },
  Kera: { name: "Kera", lat: 60.217, lon: 24.757, labelSide: "above" },
  "Matinkylä": { name: "Matinkylä", lat: 60.16, lon: 24.739, labelSide: "below" },
  "Espoon keskus": { name: "Espoon keskus", lat: 60.205, lon: 24.656, labelSide: "left" },
  Espoonlahti: { name: "Espoonlahti", lat: 60.148, lon: 24.654, labelSide: "left" },
};

/** Where every proof starts: the event at Dipoli, Otaniemi. */
export const EVENT_VENUE: MapPlace = { name: "Espoo Talent Day", lat: 60.185, lon: 24.832, labelSide: "right" };

/**
 * Quiet place names, centred on their point, that help a reader find their bearings.
 * Kauniainen is the separate town that forms the hole in the outline; Nuuksio is the forest
 * that fills the quiet north; Helsinki names the neighbour beyond the eastern border.
 */
export const ESPOO_LANDMARKS: readonly Pick<MapPlace, "name" | "lat" | "lon">[] = [
  { name: "Nuuksio", lat: 60.305, lon: 24.6 },
  { name: "Kauniainen", lat: 60.21, lon: 24.729 },
  { name: "Gulf of Finland", lat: 60.125, lon: 24.76 },
  { name: "Helsinki", lat: 60.245, lon: 24.9 },
];
