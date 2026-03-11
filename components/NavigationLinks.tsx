"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteNavigation } from "@/lib/site";

type NavigationLinksProps = {
  className?: string;
  linkClassName?: string;
  onNavigate?: () => void;
  showMobileArrow?: boolean;
  enableActiveState?: boolean;
};

export default function NavigationLinks({
  className,
  linkClassName,
  onNavigate,
  showMobileArrow = false,
  enableActiveState = true,
}: NavigationLinksProps) {
  const pathname = usePathname();

  return (
    <nav className={className}>
      {siteNavigation.map((item) => {
        const isActive =
          item.href === "/work"
            ? pathname === "/work" || pathname.startsWith("/work/")
            : pathname === item.href;

        return (
          <Link
            href={item.href}
            key={item.href}
            className={`${linkClassName ?? ""} font-gotham-bold ${
              enableActiveState && isActive ? "text-[0.9em] opacity-70" : ""
            }`.trim()}
            onClick={onNavigate}
          >
            {showMobileArrow ? (
              <span className="flex items-center justify-between gap-4">
                <span>{item.label}</span>
                <span className="opacity-60 sm:hidden">›</span>
              </span>
            ) : (
              item.label
            )}
          </Link>
        );
      })}
    </nav>
  );
}
