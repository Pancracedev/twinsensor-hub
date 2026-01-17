import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Twin Sensor Hub - Real-time Sensor Monitoring",
    short_name: "Twin Sensor Hub",
    description:
      "A Progressive Web App for monitoring and managing twin sensors with real-time data synchronization",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#121212",
    prefer_related_applications: false,
    categories: ["productivity", "utilities"],
    screenshots: [
      {
        src: "/screenshots/screenshot-540x720.png",
        sizes: "540x720",
        type: "image/png",
        form_factor: "narrow",
      },
      {
        src: "/screenshots/screenshot-1280x720.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
      },
    ],
    icons: [
      {
        src: "/icons/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/favicon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/favicon-192x192-maskable.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/favicon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/favicon-512x512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "View real-time sensor data dashboard",
        url: "/dashboard",
        icons: [
          {
            src: "/icons/dashboard-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "Settings",
        short_name: "Settings",
        description: "Configure sensor and application settings",
        url: "/settings",
        icons: [
          {
            src: "/icons/settings-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    ],
  };
}