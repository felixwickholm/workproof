import type { MetadataRoute } from "next";
import { THEME_GROUND } from "@/components/theme/theme";

/** Add to the home screen: the name, the tile icons and the light theme's ground. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Workprint",
    short_name: "Workprint",
    description: "Hiring that sees the work, not the name.",
    start_url: "/",
    display: "standalone",
    theme_color: THEME_GROUND.light,
    background_color: THEME_GROUND.light,
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
