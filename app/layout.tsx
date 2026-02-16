// app/layout.tsx
import "@/styles/globals.css";
import Providers from "./providers";
import ConditionalLayout from "@/components/conditional-layout";
import FloatingWidgets from "@/components/FloatingWidgets";
import { poppins } from "@/config/fonts";
import { Toaster } from "react-hot-toast";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  metadataBase: new URL('https://infinitechphil.com'),
  title: {
    default: "Infinitech Advertising Corporation - Web Design, Mobile App Development & Digital Marketing Agency in Makati",
    template: `%s | Infinitech Advertising Corporation`,
  },
  description: "Leading full-service advertising agency in Makati offering web design, mobile app development, digital marketing, SEO, photography, videography, and branding services. 20+ projects completed. We also accept interns! Transform your business with innovative solutions from Infinitech Advertising Corporation.",
  keywords: [
    // Primary keywords (most important)
    "advertising agency Makati",
    "web design Philippines",
    "digital marketing Makati",
    "SEO services Philippines",
    "Infinitech Advertising",
    "mobile app development Philippines",
    "app development Makati",
    
    // Location-based keywords
    "Makati advertising agency",
    "Metro Manila digital marketing",
    "advertising agency Philippines",
    "Makati web development",
    "Quezon City digital marketing",
    "BGC advertising services",
    "Mandaluyong web design",
    "Pasig digital marketing agency",
    
    // Service-based keywords - Web & Development
    "website development Makati",
    "responsive web design Philippines",
    "e-commerce development Makati",
    "WordPress development Philippines",
    "custom website design Makati",
    "web application development",
    "landing page design Philippines",
    "website redesign services Makati",
    "progressive web app development",
    
    // Mobile App Development
    "iOS app development Philippines",
    "Android app development Makati",
    "cross-platform app development",
    "React Native development Philippines",
    "Flutter app development Makati",
    "mobile application design",
    "app UI UX design Philippines",
    "mobile app maintenance services",
    "custom mobile app development",
    "enterprise mobile solutions",
    
    // Digital Marketing & SEO
    "social media marketing Philippines",
    "SEO company Philippines",
    "Google Ads management Makati",
    "Facebook advertising Philippines",
    "Instagram marketing services",
    "TikTok advertising Philippines",
    "content marketing Makati",
    "email marketing services Philippines",
    "influencer marketing Makati",
    "search engine marketing Philippines",
    "local SEO Makati",
    "technical SEO services",
    "link building Philippines",
    "online reputation management",
    
    // Branding & Creative Services
    "brand development Makati",
    "creative agency Philippines",
    "corporate branding Makati",
    "logo design Philippines",
    "brand identity design Makati",
    "packaging design Philippines",
    "graphic design services Makati",
    "corporate identity design",
    "rebranding services Philippines",
    
    // Photography Services
    "commercial photography Philippines",
    "product photography Makati",
    "corporate photography services",
    "event photography Philippines",
    "food photography Makati",
    "lifestyle photography Philippines",
    "professional photography services",
    "advertising photography Makati",
    "headshot photography Philippines",
    "architectural photography Makati",
    "real estate photography Philippines",
    
    // Videography & Video Production
    "video production Philippines",
    "commercial videography Makati",
    "corporate video production",
    "promotional video services Philippines",
    "TVC production Makati",
    "video editing services Philippines",
    "motion graphics design",
    "2D animation Philippines",
    "3D animation services Makati",
    "explainer video production",
    "product video Philippines",
    "documentary production Makati",
    "event videography Philippines",
    "drone videography services",
    "YouTube video production Makati",
    
    // Internship & Career Keywords
    "advertising internship Philippines",
    "digital marketing internship Makati",
    "web development internship",
    "graphic design internship Philippines",
    "OJT opportunities Makati",
    "advertising agency accepting interns",
    "marketing internship Metro Manila",
    "creative internship Philippines",
    "photography internship Makati",
    "videography internship Philippines",
    "IT internship Makati",
    "student internship program",
    
    // Long-tail keywords
    "best advertising agency in Makati",
    "affordable web design Philippines",
    "professional digital marketing services",
    "top SEO company in Metro Manila",
    "small business web design Makati",
    "startup branding Philippines",
    "best mobile app developer Makati",
    "professional photography services Philippines",
    "corporate video production Makati",
    
    // Specific solutions & features
    "social media management Makati",
    "Google My Business optimization",
    "conversion rate optimization Philippines",
    "marketing automation Makati",
    "CRM integration services",
    "analytics and reporting Philippines",
    "A/B testing services Makati",
    "retargeting campaigns Philippines",
    
    // Industry-specific
    "real estate marketing Philippines",
    "restaurant marketing Makati",
    "hotel digital marketing Philippines",
    "healthcare marketing Makati",
    "retail advertising Philippines",
    "automotive marketing Makati",
    "beauty salon marketing Philippines",
    "fitness center marketing Makati",
    
    // Technology stack
    "Next.js development Philippines",
    "React development Makati",
    "Node.js development Philippines",
    "Laravel development Makati",
    "Shopify development Philippines",
    "WooCommerce development Makati",
    
    // Industry terms
    "full service advertising agency",
    "integrated marketing solutions",
    "digital transformation Philippines",
    "online marketing strategy",
    "360 marketing campaign",
    "omnichannel marketing Philippines",
    "performance marketing Makati",
    "growth hacking Philippines",
    "digital agency Metro Manila",
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
    title: "Infinitech Advertising Corporation - Premier Digital Marketing, Web & Mobile App Development Agency",
    description: "Transform your business with cutting-edge web design, mobile app development, digital marketing, photography, videography, and advertising solutions. Based in Makati, serving businesses across Metro Manila and the Philippines. We also accept interns!",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Infinitech Advertising Corporation - Full Service Digital Agency",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Infinitech Advertising Corporation - Digital Marketing, Web & App Development",
    description: "Leading full-service advertising agency in Makati. Expert web design, mobile app development, SEO, photography, videography, and digital marketing services for businesses in the Philippines.",
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
    // Add Bing verification if you have one
    // other: {
    //   "msvalidate.01": "your-bing-verification-code",
    // },
  },
  alternates: {
    canonical: "https://infinitechphil.com",
  },
  category: "Advertising and Marketing",
  // Additional metadata for better SEO
  classification: "Business",
  other: {
    "geo.region": "PH-00",
    "geo.placename": "Makati",
    "geo.position": "14.5547;121.0244", // Makati coordinates
  },
};

// Export viewport separately for better control
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Additional SEO meta tags */}
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        
        {/* Business information */}
        <meta name="company" content="Infinitech Advertising Corporation" />
        <meta name="geo.region" content="PH-NCR" />
        <meta name="geo.placename" content="Makati City" />
        <meta name="geo.position" content="14.5547;121.0244" />
        <meta name="ICBM" content="14.5547, 121.0244" />
        
        {/* Service areas */}
        <meta name="coverage" content="Philippines" />
        <meta name="area" content="Metro Manila, Makati, BGC, Quezon City, Mandaluyong, Pasig" />
        
        {/* Mobile-specific meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        
        {/* Structured Data - Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AdvertisingAgency",
              "name": "Infinitech Advertising Corporation",
              "image": "https://infinitechphil.com/og-image.jpg",
              "url": "https://infinitechphil.com",
              "telephone": "+63-XXX-XXX-XXXX", // Add your actual phone
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Your Street Address", // Add actual address
                "addressLocality": "Makati",
                "addressRegion": "Metro Manila",
                "postalCode": "XXXX", // Add actual postal code
                "addressCountry": "PH"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 14.5547,
                "longitude": 121.0244
              },
              "sameAs": [
                "https://facebook.com/yourpage",
                "https://instagram.com/yourpage",
                "https://linkedin.com/company/yourpage",
                "https://twitter.com/infinitechcorp"
              ],
              "priceRange": "$$",
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday"
                ],
                "opens": "09:00",
                "closes": "18:00"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "20"
              },
              "knowsAbout": [
                "Web Design",
                "Mobile App Development",
                "Digital Marketing",
                "SEO",
                "Photography",
                "Videography",
                "Branding",
                "Social Media Marketing"
              ]
            })
          }}
        />
        
        {/* Structured Data - Service Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              "serviceType": "Digital Marketing and Advertising Services",
              "provider": {
                "@type": "AdvertisingAgency",
                "name": "Infinitech Advertising Corporation"
              },
              "areaServed": {
                "@type": "Country",
                "name": "Philippines"
              },
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Digital Services",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Web Design and Development"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Mobile App Development"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Digital Marketing"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "SEO Services"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Photography and Videography"
                    }
                  }
                ]
              }
            })
          }}
        />
      </head>
      <body className={`${poppins.className} antialiased`}>
        <Providers>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
          
          {/* Floating Components - Hidden on Admin Pages */}
          <FloatingWidgets />
          
          {/* Toast notifications */}
          <Toaster 
            position="top-center"
            reverseOrder={false}
          />
          
          {/* Vercel Analytics - Tracks page views and user interactions */}
          <Analytics />
          
          {/* Vercel Speed Insights - Monitors Core Web Vitals */}
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
