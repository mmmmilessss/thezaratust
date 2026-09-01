"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function NavigationMemory() {
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    if (!(pathname === "/archive" || pathname === "/work" || pathname.startsWith("/work/") || pathname === "/projects")) return;
    const key = `zaratust:scroll:${pathname}?${search}`;
    history.scrollRestoration = "manual";
    const saved = Number(sessionStorage.getItem(key) ?? 0);
    requestAnimationFrame(() => requestAnimationFrame(() => scrollTo({ top: saved, behavior: "instant" })));
    let ticking = false;
    const save = () => {
      if (!ticking) requestAnimationFrame(() => { sessionStorage.setItem(key, String(scrollY)); ticking = false; });
      ticking = true;
    };
    addEventListener("scroll", save, { passive: true });
    addEventListener("pagehide", save);
    return () => { save(); removeEventListener("scroll", save); removeEventListener("pagehide", save); };
  }, [pathname, search]);
  return null;
}
