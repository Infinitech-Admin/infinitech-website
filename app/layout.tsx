// app/layout.tsx
import "@/styles/globals.css";
import Providers from "./providers";
import ConditionalLayout from "@/components/conditional-layout";
import FloatingWidgets from "@/components/FloatingWidgets";
import { poppins } from "@/config/fonts";
import { Toaster } from "react-hot-toast";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  metadataBase: new URL('https://infinitechphil.com'),
  
  title: {
    default: "Infinitech Advertising Corporation - Web Design & Digital Marketing Agency in Makati",
    template: `%s | Infinitech Advertising Corporation`,
  },
  
  description:
    "Leading advertising agency in Makati offering web design, digital marketing, SEO, and branding services. 20+ projects completed. Transform your business with innovative solutions from Infinitech Advertising Corporation.",
  
  keywords: [
    // Primary keywords (most important)
    "advertising agency Makati",
    "web design Philippines",
    "digital marketing Makati",
    "SEO services Philippines",
    "Infinitech Advertising",
    
    // Location-based keywords
    "Makati advertising agency",
    "Metro Manila digital marketing",
    "advertising agency Philippines",
    "Makati web development",
    "Quezon City digital marketing",
    
    // Service-based keywords
    "website development Makati",
    "social media marketing Philippines",
    "brand development Makati",
    "creative agency Philippines",
    "corporate branding Makati",
    "SEO company Philippines",
    "web design agency Makati",
    "digital advertising Philippines",
    
    // Long-tail keywords
    "best advertising agency in Makati",
    "affordable web design Philippines",
    "professional digital marketing services",
    "top SEO company in Metro Manila",
    "small business web design Makati",
    
    // Specific services
    "social media management Makati",
    "content marketing Philippines",
    "Google Ads management",
    "Facebook advertising Philippines",
    "e-commerce website development",
    "responsive web design",
    "logo design Philippines",
    "video production Makati",
    "email marketing services",
    
    // Industry terms
    "full service advertising agency",
    "integrated marketing solutions",
    "digital transformation Philippines",
    "online marketing strategy",
    "brand identity design",
  ],
  
  authors: [{ name: "Infinitech Advertising Corporation" }],
  
  creator: "Infinitech Advertising Corporation",
  
  publisher: "Infinitech Advertising Corporation",
  
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: "https://infinitechphil.com",
    siteName: "Infinitech Advertising Corporation",
    title: "Infinitech Advertising Corporation - Premier Digital Marketing & Web Design Agency",
    description: "Transform your business with cutting-edge web design, digital marketing, and advertising solutions. Based in Makati, serving businesses across Metro Manila and the Philippines.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Infinitech Advertising Corporation - Web Design & Digital Marketing",
      },
    ],
  },
  
  twitter: {
    card: "summary_large_image",
    title: "Infinitech Advertising Corporation - Digital Marketing & Web Design",
    description: "Leading advertising agency in Makati. Expert web design, SEO, and digital marketing services for businesses in the Philippines.",
    images: ["/twitter-image.jpg"],
    creator: "@infinitechcorp",
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  
  manifest: "/manifest.json",
  
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ff470a" },
    { media: "(prefers-color-scheme: dark)", color: "#ff470a" },
  ],
  
  verification: {
    google: "your-google-verification-code",
  },
  
  alternates: {
    canonical: "https://infinitechphil.com",
  },
  
  category: "Advertising and Marketing",
};

// Export viewport separately for better control
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true, // Allow user scaling
  viewportFit: "cover", // Important for PWA fullscreen
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en-PH">
      <head>
        {/* Additional SEO meta tags */}
        <meta name="geo.region" content="PH-NCR" />
        <meta name="geo.placename" content="Makati City" />
        <meta name="geo.position" content="14.5547;121.0244" />
        <meta name="ICBM" content="14.5547, 121.0244" />
        
        {/* Business information */}
        <meta property="business:contact_data:street_address" content="Campos Rueda Building, 311 Urban Ave" />
        <meta property="business:contact_data:locality" content="Makati" />
        <meta property="business:contact_data:region" content="Metro Manila" />
        <meta property="business:contact_data:postal_code" content="1206" />
        <meta property="business:contact_data:country_name" content="Philippines" />
        <meta property="business:contact_data:email" content="infinitechcorp.ph@gmail.com" />
        
        {/* Mobile-specific meta tags for orientation */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`antialiased ${poppins.className}`}>
        <Providers>
          <Toaster position="top-right" />
          <ConditionalLayout>{children}</ConditionalLayout>
          
          {/* Floating Components - Hidden on Admin Pages */}
          <FloatingWidgets />
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
