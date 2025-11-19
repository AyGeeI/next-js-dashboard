/**
 * Enhanced Header Component
 *
 * Server Component wrapper für Enhanced Header
 */

import { auth, signOut } from "@/lib/auth/config";
import { HeaderClient } from "@/components/layout/header-client";

export async function Header() {
  const session = await auth();

  async function handleSignOut(_formData: FormData) {
    "use server";
    await signOut({ redirectTo: "/sign-in" });
  }

  return (
    <HeaderClient
      user={session?.user}
      logoutAction={handleSignOut}
    />
  );
}
