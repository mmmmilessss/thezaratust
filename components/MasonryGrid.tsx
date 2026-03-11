"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

type MasonryGridProps = {
  items: ReactNode[];
  className?: string;
  itemClassName?: string;
};

const BASE_ROW_HEIGHT = 8;

export default function MasonryGrid({
  items,
  className,
  itemClassName,
}: MasonryGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const resizeItem = (item: HTMLElement) => {
      const computedStyle = window.getComputedStyle(container);
      const rowGap = Number.parseFloat(computedStyle.rowGap) || 0;
      const height = item.getBoundingClientRect().height;
      const rowSpan = Math.ceil((height + rowGap) / (BASE_ROW_HEIGHT + rowGap));

      item.style.gridRowEnd = `span ${rowSpan}`;
    };

    const items = Array.from(container.querySelectorAll<HTMLElement>("[data-masonry-item]"));
    const resizeAll = () => {
      items.forEach((item) => resizeItem(item));
    };
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => resizeItem(entry.target as HTMLElement));
    });

    items.forEach((item) => resizeObserver.observe(item));

    resizeAll();
    window.addEventListener("resize", resizeAll);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", resizeAll);
    };
  }, [items]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ gridAutoRows: `${BASE_ROW_HEIGHT}px` }}
    >
      {items.map((item, index) => (
        <div
          key={index}
          data-masonry-item
          className={itemClassName}
        >
          {item}
        </div>
      ))}
    </div>
  );
}
