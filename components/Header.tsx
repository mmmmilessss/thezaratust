"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import NavigationLinks from "@/components/NavigationLinks";
import { usePathname } from "next/navigation";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [showDesktopHomeLogo, setShowDesktopHomeLogo] = useState(false);
  const [showHomeMenuIcon, setShowHomeMenuIcon] = useState(true);
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isHomeHeroVisible = isHomePage && !showDesktopHomeLogo;
  const shouldShowMenuIcon = !isHomePage || showHomeMenuIcon;

  useEffect(() => {
    if (!isHomePage) {
      return;
    }

    const updateHeaderState = () => {
      const hero = document.getElementById("home-hero");

      if (!hero) {
        setShowDesktopHomeLogo(false);
        return;
      }

      const heroBottom = hero.getBoundingClientRect().bottom;
      setShowDesktopHomeLogo(heroBottom <= 96);
    };

    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });
    window.addEventListener("resize", updateHeaderState);

    return () => {
      window.removeEventListener("scroll", updateHeaderState);
      window.removeEventListener("resize", updateHeaderState);
    };
  }, [isHomePage]);

  useEffect(() => {
    if (!isHomePage) {
      return;
    }

    const updateMenuVisibility = () => {
      const navSection = document.getElementById("home-navigation");

      if (!navSection) {
        setShowHomeMenuIcon(true);
        return;
      }

      const rect = navSection.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      setShowHomeMenuIcon(!isVisible);
    };

    updateMenuVisibility();
    window.addEventListener("scroll", updateMenuVisibility, { passive: true });
    window.addEventListener("resize", updateMenuVisibility);

    return () => {
      window.removeEventListener("scroll", updateMenuVisibility);
      window.removeEventListener("resize", updateMenuVisibility);
    };
  }, [isHomePage]);

  return (
    <>
      <header
        className="sticky top-0 z-30 grid grid-cols-3 items-center px-6 py-6 sm:px-10 sm:py-8"
      >
        <div className="flex justify-start">
          {shouldShowMenuIcon ? (
            <button
              className={`text-3xl leading-none [filter:drop-shadow(0_1px_4px_rgba(0,0,0,0.35))] ${isHomeHeroVisible ? "text-white" : ""}`}
              onClick={() => setOpen((current) => !current)}
              aria-expanded={open}
              aria-label="Toggle navigation menu"
            >
              {open ? "✕" : "☰"}
            </button>
          ) : null}
        </div>

        <div
          className={`flex ${
            isHomePage
              ? showDesktopHomeLogo
                ? "justify-center"
                : "justify-center md:hidden"
              : "justify-center"
          }`}
        >
          <Link href="/">
            <Image
              src="/logo.png"
              alt="thezaratust"
              width={160}
              height={64}
              className={`h-16 object-contain [filter:drop-shadow(0_1px_4px_rgba(0,0,0,0.35))] ${isHomeHeroVisible ? "brightness-0 invert" : ""}`}
            />
          </Link>
        </div>

        <div
          className={`flex justify-end ${
            isHomePage ? "hidden" : "invisible"
          }`}
        >
          {isHomePage ? (
            <Link href="/">
              <Image
                src="/logo.png"
                alt="thezaratust"
                width={160}
                height={64}
                className="h-16 object-contain"
              />
            </Link>
          ) : (
            <div aria-hidden="true" />
          )}
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 transition duration-300 ease-out ${
          open
            ? "pointer-events-auto bg-black/30 backdrop-blur-sm"
            : "pointer-events-none bg-black/0 backdrop-blur-none"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      >
        <aside
          className={`h-full w-full bg-black px-6 py-8 transition-transform duration-300 ease-out sm:w-[40vw] sm:max-w-[20rem] lg:w-[18vw] lg:max-w-none lg:min-w-[16rem] ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex h-full flex-col">
            <div className="mb-12 flex justify-start">
              <button
                className="text-3xl leading-none text-white"
                onClick={() => setOpen(false)}
                aria-label="Close navigation menu"
              >
                ✕
              </button>
            </div>

            <NavigationLinks
              className="flex flex-col gap-8 text-[0.75rem] text-white sm:text-xl"
              linkClassName="pl-6 transition hover:opacity-60"
              onNavigate={() => setOpen(false)}
              showMobileArrow
              enableActiveState={false}
            />

            <div className="mt-auto flex justify-center pt-10">
              <Image
                src="/logo.png"
                alt="thezaratust"
                width={120}
                height={48}
                className="h-auto w-24 object-contain brightness-0 invert opacity-90"
              />
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
