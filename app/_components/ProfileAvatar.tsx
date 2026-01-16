"use client";
import Image from "next/image";
import { useState } from "react";

interface ProfileAvatarProps {
  src?: string | null;
  alt: string;
  size?: number;
  borderColor?: string;
}

const DEFAULT_AVATAR = '/images/icon-profile.png';

export function ProfileAvatar({ src, alt, size = 160, borderColor = "orange-100" }: ProfileAvatarProps) {
  // Use default avatar if src is empty, null, or undefined
  const initialSrc = src && src.trim() !== '' ? src : DEFAULT_AVATAR;
  const [imgSrc, setImgSrc] = useState(initialSrc);

  // Handle case where src prop changes
  const currentSrc = src && src.trim() !== '' ? imgSrc : DEFAULT_AVATAR;

  return (
    <Image
      src={currentSrc}
      alt={alt}
      width={size}
      height={size}
      className={`w-full h-full rounded-full object-cover border-4 border-${borderColor} shadow-lg`}
      onError={() => setImgSrc(DEFAULT_AVATAR)}
    />
  );
}
