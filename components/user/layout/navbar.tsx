"use client";

import { useState, useEffect } from "react";
import {
  Navbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
  Button,
} from "@heroui/react";
import { LuArrowRight, LuDownload, LuChevronDown } from "react-icons/lu";
import { Logo } from "@/components/globals/icons";
import { usePathname, useRouter } from "next/navigation";
import { links } from "@/data/links";

const serviceItems = [
  { key: "website", label: "Website Solutions", href: "/solutions/website" },
  {
    key: "marketing-research",
    label: "Marketing Research",
    href: "/solutions/marketing-research",
  },
  { key: "branding", label: "Branding", href: "/solutions/branding" },
];

const NavBar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [servicesHover, setServicesHover] = useState(false);
  const isActive = (href: string) => pathname == href;
  const isServicesActive = pathname.startsWith("/solutions");

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };
    const handleAppInstalled = () => {
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShowInstallButton(false);
    setDeferredPrompt(null);
  };

  const goToService = (href: string) => {
    router.push(href);
  };

  return (
    <Navbar
      className="fixed shadow-lg"
      maxWidth="2xl"
      position="sticky"
      isMenuOpen={isOpen}
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand
          className="max-w-fit cursor-pointer"
          onClick={() => router.push("/")}
        >
          <Logo />
          <div className="mt-2 hidden xl:flex">
            <div className="flex flex-col justify-center items-center">
              <p className="font-bold leading-4 text-3xl text-primary">
                INFINITECH
              </p>
              <p className="text-tiny font-semibold text-primary">
                ADVERTISING CORPORATION
              </p>
            </div>
          </div>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent
        justify="center"
        className="hidden lg:flex justify-start ml-2"
      >
        {links.map((link) => {
          if (link.name === "Services") {
            return (
              <NavbarItem
                key={link.name}
                className="relative"
                onMouseEnter={() => setServicesHover(true)}
                onMouseLeave={() => setServicesHover(false)}
              >
                <Button
                  className={`cursor-pointer ${
                    isServicesActive
                      ? "text-gray-400 bg-primary font-semibold"
                      : "text-black"
                  }`}
                  variant={isServicesActive ? "solid" : "light"}
                  endContent={
                    <LuChevronDown
                      size={16}
                      className={`transition-transform ${servicesHover ? "rotate-180" : ""}`}
                    />
                  }
                >
                  {link.name}
                </Button>

                {/* Hover mega-panel, landscape layout */}
                <div
                  className={`absolute left-1/2 -translate-x-1/2 top-full pt-2 transition-all duration-150 z-50
    ${servicesHover ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-1"}`}
                >
                  <div className="flex gap-2 bg-white border border-slate-100 shadow-xl rounded-lg p-2 w-max">
                    {serviceItems.map((item) => (
                      <button
                        key={item.key}
                        onClick={() => goToService(item.href)}
                        className="whitespace-nowrap text-center px-4 py-2 rounded-md border border-slate-200 text-slate-700 text-sm font-medium
          hover:border-primary hover:text-primary hover:bg-slate-50 transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </NavbarItem>
            );
          }

          return (
            <NavbarItem key={link.name}>
              <Button
                onPress={() => router.push(link.href)}
                className={`cursor-pointer ${
                  isActive(link.href)
                    ? "text-gray-400 bg-primary font-semibold"
                    : "text-black"
                }`}
                variant={`${isActive(link.href) ? "solid" : "light"}`}
              >
                {link.name}
              </Button>
            </NavbarItem>
          );
        })}
      </NavbarContent>

      <NavbarContent
        className="hidden lg:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        {showInstallButton && (
          <NavbarItem>
            <Button
              onPress={handleInstallApp}
              className="bg-blue-600 text-white font-medium hover:bg-blue-700"
              variant="solid"
              startContent={<LuDownload />}
            >
              Install App
            </Button>
          </NavbarItem>
        )}
        <NavbarItem className="gap-2 cursor-pointer">
          <Button
            className="text-sm bg-primary text-white font-medium hover:bg-primary-light"
            endContent={<LuArrowRight />}
            variant="solid"
            onPress={() => router.push("/quote")}
          >
            Get a Quote
          </Button>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="lg:hidden basis-1 pl-4" justify="end">
        {showInstallButton && (
          <NavbarItem>
            <Button
              onPress={handleInstallApp}
              className="bg-blue-600 text-white font-medium hover:bg-blue-700 mr-2"
              variant="solid"
              size="sm"
              startContent={<LuDownload />}
            >
              Install App
            </Button>
          </NavbarItem>
        )}
        <NavbarMenuToggle onClick={() => setIsOpen(!isOpen)} />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {links.map((link) => {
            if (link.name === "Services") {
              return (
                <div key={link.name}>
                  <NavbarMenuItem
                    className="cursor-pointer text-black flex items-center justify-between"
                    onClick={() => setMobileServicesOpen((prev) => !prev)}
                  >
                    <span>{link.name}</span>
                    <LuChevronDown
                      size={16}
                      className={`transition-transform ${mobileServicesOpen ? "rotate-180" : ""}`}
                    />
                  </NavbarMenuItem>

                  {mobileServicesOpen && (
                    <div className="flex flex-col gap-2 pl-4 mt-1">
                      {serviceItems.map((item) => (
                        <NavbarMenuItem
                          key={item.key}
                          className="cursor-pointer text-slate-600"
                          onClick={() => {
                            setIsOpen(false);
                            goToService(item.href);
                          }}
                        >
                          {item.label}
                        </NavbarMenuItem>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavbarMenuItem
                className={`cursor-pointer ${isActive(link.href) ? "text-primary-light" : "text-black"}`}
                key={link.name}
                onClick={() => {
                  setIsOpen(false);
                  router.push(link.href);
                }}
              >
                {link.name}
              </NavbarMenuItem>
            );
          })}

          {showInstallButton && (
            <NavbarMenuItem
              className="cursor-pointer text-blue-600"
              onClick={() => {
                handleInstallApp();
                setIsOpen(false);
              }}
            >
              Install App
            </NavbarMenuItem>
          )}

          <NavbarMenuItem
            className={`cursor-pointer ${isActive("/quote") ? "text-primary-light" : "text-black"}`}
            onClick={() => {
              setIsOpen(false);
              router.push("/quote");
            }}
          >
            Get a Quote
          </NavbarMenuItem>
        </div>
      </NavbarMenu>
    </Navbar>
  );
};

export default NavBar;
