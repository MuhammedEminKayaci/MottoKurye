"use client";
import Image from "next/image";
import Link from "next/link";

export function AuthHeader() {
  return (
    <header className="w-full py-4 px-6">
      <Link href="/" className="flex items-center justify-center">
        <Image
          src="/images/paketservisci.png"
          alt="PaketServisi Logo"
          width={200}
          height={60}
          priority
          className="drop-shadow-lg"
        />
      </Link>
    </header>
  );
}
