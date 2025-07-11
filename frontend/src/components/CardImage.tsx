// src/components/CardImage.tsx
import React from "react";

type ImageProps = {
  src: string;
  alt: string;
  fallbackSrc: string;
  className?: string;
  height?: number;
  width?: number;
};

export function CardImage({ src, alt, fallbackSrc, className = "", height, width }: ImageProps) {
  const [imageSrc, setImageSrc] = React.useState<string>(src || fallbackSrc);

  const handleError = () => {
    setImageSrc(fallbackSrc);
  };

  return (
    <img
      src={imageSrc}
      alt={alt}
      onError={handleError}
      crossOrigin="anonymous"
      className={`${className}`}
      style={{ objectFit: "cover", width: width ? `${width}px` : "100%", height: height ? `${height}px` : "100%", display: "block" }}
    />
  );
}
