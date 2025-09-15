import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**", // allow all paths
      },
    ],
    domains: [
      "https://events-app-backend-stage.up.railway.app",
      "https://events-app-dashboard-qdurobb6o-mehtab-ismails-projects.vercel.app",
      "https://events-app-dashboard-production.up.railway.app",
    ],
  },
};

export default nextConfig;
