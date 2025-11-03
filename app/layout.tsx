import "@/styles/globals.css";
import Providers from "./providers";
import ConditionalLayout from "@/components/conditional-layout";
import { poppins } from "@/config/fonts";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: {
    default: "Infinitech Advertising Corporation",
    template: `%s - Infinitech Advertising Corporation`,
  },
  description:
    "Craft stunning and high-performing websites effortlessly, no matter your design expertise.",
  keywords: [
    "Infinitech Advertising",
    "Advertising agency Makati",
    "Web design Philippines",
    "Digital marketing Makati",
    "Creative agency Makati",
    "Marketing agency Philippines",
    "Branding services Makati",
    "SEO services Philippines",
    "Social media management Makati",
    "Content creation Philippines",
    "Corporate advertising Makati",
    "Graphic design Philippines",
    "Billboard advertising Makati",
    "Online marketing Philippines",
    "Website development Makati",
    "PPC advertising Philippines",
    "Media buying Makati",
    "Creative design Philippines",
    "Marketing consultancy Makati",
    "Event marketing Philippines",
    "Advertising solutions Makati",
    "Outdoor advertising Philippines",
    "Digital strategy Makati",
    "Brand activation Philippines",
    "Video production Makati",
    "Marketing campaigns Philippines",
    "Corporate branding Makati",
    "Social media ads Philippines",
    "Creative studio Makati",
    "Search engine optimization Makati",
    "Advertising in Makati City",
    "Digital media Philippines",
    "Online promotions Makati",
    "Marketing services Philippines",
    "Website design Makati",
    "Ad agency Philippines",
    "Print advertising Makati",
    "Creative marketing Philippines",
    "Makati business advertising",
    "Philippines digital agency",
    "Innovative advertising Makati",
    "Full service advertising agency Makati",
  ],
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
  themeColor: "#ff470a",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <head />
      <body className={`antialiased ${poppins.className}`}>
        <Providers>
          <Toaster position="top-right" />
          <ConditionalLayout>{children}</ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
