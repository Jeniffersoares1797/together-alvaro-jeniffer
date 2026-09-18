import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Together - Alvaro e Jeniffer",
    short_name: "Together",
    description: "Mesmo longe, nos temos um lugar.",
    start_url: "/",
    display: "standalone",
    background_color: "#090807",
    theme_color: "#090807",
    orientation: "any",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

