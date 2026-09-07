"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type Props = Omit<ImageProps, "fill" | "quality" | "placeholder"> & {
  wrapperClassName?: string;
};

export default function ProgressiveImage({
  className = "",
  wrapperClassName = "",
  loading,
  priority,
  onLoad,
  ...props
}: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <span className={`relative inline-block overflow-hidden ${wrapperClassName}`}>
      <Image
        {...props}
        alt=""
        aria-hidden
        quality={25}
        loading={loading}
        priority={priority}
        className={`${className} block brightness-75 [image-rendering:pixelated]`}
      />
      <Image
        {...props}
        alt={props.alt}
        quality={75}
        loading={loading}
        priority={priority}
        onLoad={(event) => {
          setLoaded(true);
          onLoad?.(event);
        }}
        className={`${className} absolute inset-0 transition-opacity duration-150 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </span>
  );
}
