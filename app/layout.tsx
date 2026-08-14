
// app/layout.tsx

import "@/styles/globals.css";
import Providers from "./providers";
import ConditionalLayout from "@/components/conditional-layout";
import FloatingWidgets from "@/components/FloatingWidgets";
import { poppins } from "@/config/fonts";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://infinitechphil.com"),

  title: {
    default:
      "Infinitech Advertising Corporation | Web & Mobile App Development Philippines",
    template: "%s | Infinitech Advertising Corporation",
  },

  description:
    "Infinitech Advertising Corporation is a digital and creative company in Makati, Philippines specializing in web development, mobile app development, digital marketing, advertising, photography, videography, and branding solutions.",

  authors: [
    {
      name: "Infinitech Advertising Corporation",
    },
  ],

  creator: "Infinitech Advertising Corporation",

  publisher: "Infinitech Advertising Corporation",

  applicationName: "Infinitech Advertising Corporation",

  category: "Web Development and Digital Services",

  classification: "Web Development, Mobile App Development and Digital Services",

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  alternates: {
    canonical: "https://infinitechphil.com",
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_PH",
    url: "https://infinitechphil.com",
    siteName: "Infinitech Advertising Corporation",

    title:
      "Infinitech Advertising Corporation | Web & Mobile App Development Philippines",

    description:
      "Web and mobile app development company in Makati, Philippines, also offering digital marketing, advertising, photography, videography, and branding solutions.",

    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt:
          "Infinitech Advertising Corporation - Web and Mobile App Development",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Infinitech Advertising Corporation | Web & Mobile App Development",

    description:
      "Infinitech specializes in web development and mobile app development, with additional digital marketing, advertising, photography, videography, and branding services.",

    images: ["/twitter-image.jpg"],

    creator: "@infinitechcorp",
  },

  icons: {
    icon: [
      {
        url: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],

    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },

  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#ff470a",
};

const RootLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Language */}
        <meta name="language" content="English" />

        {/* Company */}
        <meta
          name="company"
          content="Infinitech Advertising Corporation"
        />

        {/* Location */}
        <meta name="geo.region" content="PH-NCR" />
        <meta name="geo.placename" content="Makati City" />

        {/* Service Area */}
        <meta
          name="coverage"
          content="Philippines, Metro Manila, Makati"
        />

        {/* Mobile */}
        <meta
          name="apple-mobile-web-app-capable"
          content="yes"
        />

        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />

        <meta
          name="format-detection"
          content="telephone=no"
        />

        {/* Performance */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />

        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* =========================================================
            ORGANIZATION SCHEMA
            ========================================================= */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",

              name: "Infinitech Advertising Corporation",

              url: "https://infinitechphil.com",

              logo:
                "https://infinitechphil.com/android-chrome-512x512.png",

              description:
                "Digital and creative company in Makati, Philippines specializing in web development, mobile app development, digital marketing, advertising, photography, videography, and branding.",

              areaServed: {
                "@type": "Country",
                name: "Philippines",
              },

              knowsAbout: [
                "Web Development",
                "Website Development",
                "Custom Web Development",
                "Web Application Development",
                "Mobile App Development",
                "Custom Mobile App Development",
                "Software Development",
                "Business System Development",
                "API Development",
                "Database Development",
                "Digital Solutions",
                "Digital Marketing",
                "Search Engine Optimization",
                "Advertising",
                "Branding",
                "Photography",
                "Videography",
                "Video Production",
              ],
            }),
          }}
        />

        {/* =========================================================
            WEBSITE SCHEMA
            ========================================================= */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",

              name: "Infinitech Advertising Corporation",

              url: "https://infinitechphil.com",

              publisher: {
                "@type": "Organization",
                name: "Infinitech Advertising Corporation",
                url: "https://infinitechphil.com",
              },
            }),
          }}
        />

        {/* =========================================================
            WEB DEVELOPMENT SERVICE SCHEMA
            PRIMARY SERVICE
            ========================================================= */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",

              name: "Web Development Services",

              description:
                "Custom website and web application development services for businesses and organizations in the Philippines.",

              provider: {
                "@type": "Organization",
                name: "Infinitech Advertising Corporation",
                url: "https://infinitechphil.com",
              },

              areaServed: {
                "@type": "Country",
                name: "Philippines",
              },

              serviceType: [
                "Web Development",
                "Website Development",
                "Custom Web Development",
                "Web Application Development",
                "E-commerce Development",
                "Business Website Development",
              ],
            }),
          }}
        />

        {/* =========================================================
            MOBILE APP DEVELOPMENT SERVICE SCHEMA
            PRIMARY SERVICE
            ========================================================= */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",

              name: "Mobile App Development Services",

              description:
                "Custom mobile application development services for businesses and organizations in the Philippines.",

              provider: {
                "@type": "Organization",
                name: "Infinitech Advertising Corporation",
                url: "https://infinitechphil.com",
              },

              areaServed: {
                "@type": "Country",
                name: "Philippines",
              },

              serviceType: [
                "Mobile App Development",
                "Android App Development",
                "iOS App Development",
                "Cross-Platform App Development",
                "Custom Mobile Applications",
              ],
            }),
          }}
        />

        {/* =========================================================
            DIGITAL & CREATIVE SERVICES SCHEMA
            SECONDARY SERVICES
            ========================================================= */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",

              name: "Digital and Creative Services",

              description:
                "Digital marketing, advertising, branding, photography, and videography services for businesses in the Philippines.",

              provider: {
                "@type": "Organization",
                name: "Infinitech Advertising Corporation",
                url: "https://infinitechphil.com",
              },

              areaServed: {
                "@type": "Country",
                name: "Philippines",
              },

              serviceType: [
                "Digital Marketing",
                "SEO Services",
                "Advertising",
                "Branding",
                "Photography",
                "Videography",
                "Video Production",
              ],
            }),
          }}
        />
      </head>

      <body className={`${poppins.className} antialiased`}>
        <Providers>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>

          {/* Floating Components */}
          <FloatingWidgets />

          {/* Toast Notifications */}
          <Toaster
            position="top-center"
            reverseOrder={false}
          />

          {/* Vercel Analytics */}
          <Analytics />

          {/* Vercel Speed Insights */}
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;

