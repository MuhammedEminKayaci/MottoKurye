"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function IsletmeBulPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/ilanlar?type=isletme");
  }, [router]);

  return null;
}
