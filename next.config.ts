
import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  // Removed deprecated swcMinify option.
  compress: true,
  productionBrowserSourceMaps: false,

  // Keep PDF packages external to prevent runtime font-path issues.
  serverExternalPackages: ["pdfkit", "pdfmake"],

  experimental: {
    optimizePackageImports: [
      "react-icons",
      "lucide-react",
      "@heroicons/react",
      "framer-motion",
    ],
    webpackBuildWorker: true,
  },

  // Keep your existing webpack, redirects, and headers
  // configurations here, unchanged.
};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,

  // Keep your existing workboxOptions and runtimeCaching here.
})(nextConfig);