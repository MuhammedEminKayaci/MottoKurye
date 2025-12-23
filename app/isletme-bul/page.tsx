"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function IsletmeBulPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/ilanlar?view=kurye");
  }, [router]);

  return null;
}
