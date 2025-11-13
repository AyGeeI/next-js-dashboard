"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AutoLogout() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Wenn der Benutzer nicht authentifiziert ist, zur Login-Seite umleiten
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  return null;
}
