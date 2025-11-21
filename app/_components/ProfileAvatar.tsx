"use client";
import Image from "next/image";
import { useState } from "react";

interface ProfileAvatarProps {
  src: string;
  alt: string;
  size?: number;
  borderColor?: string;
}

export function ProfileAvatar({ src, alt, size = 160, borderColor = "orange-100" }: ProfileAvatarProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={size}
      height={size}
      className={`w-full h-full rounded-full object-cover border-4 border-${borderColor} shadow-lg`}
      onError={() => setImgSrc('/images/icon-profile.png')}
    />
  );
}
