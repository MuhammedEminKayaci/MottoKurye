"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function KuryeBulPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/ilanlar?type=kurye");
  }, [router]);

  return null;
}
