/**
 * Equirectangular projection with longitude scaled by cos(reference latitude). At city scale
 * this keeps shapes and distances true to within a fraction of a percent, with no library.
 */
export interface Projection {
  /** Longitude at x = 0. */
  lonOrigin: number;
  /** Latitude at y = 0 (the top edge). */
  latOrigin: number;
  /** Latitude where east-west distances are true. */
  referenceLat: number;
  /** View units per degree of latitude. */
  unitsPerDegree: number;
}

/** Projects a coordinate to view units: x grows east, y grows south. */
export function projectWith(projection: Projection, lat: number, lon: number): [number, number] {
  const lonFactor = Math.cos((projection.referenceLat * Math.PI) / 180);
  return [
    (lon - projection.lonOrigin) * lonFactor * projection.unitsPerDegree,
    (projection.latOrigin - lat) * projection.unitsPerDegree,
  ];
}
