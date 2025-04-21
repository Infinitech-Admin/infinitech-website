import "@/styles/globals.css";
import Providers from "./providers";
import NavBar from "@/components/user/layout/navbar";
import Footer from "@/components/user/layout/footer/footer";
import { poppins } from "@/config/fonts";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: {
    default: "Infinitech Advertising Corporation",
    template: `%s - "Infinitech Advertising Corporation"`,
  },
  description:
    "Craft stunning and high-performing websites effortlessly, no matter your design expertise.",
  icons: {
    icon: "/images/favicon.ico",
  },
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <head />
      <body className={`antialiased ${poppins.className}`}>
        <Providers>
          <Toaster position="top-right" />

          <div className="flex flex-col">
            <NavBar />
            <main>{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
