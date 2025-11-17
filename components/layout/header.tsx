import { auth, signOut } from "@/lib/auth/config";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { SidebarToggleButton } from "@/components/layout/sidebar-toggle-button";

export async function Header() {
  const session = await auth();

  async function handleSignOut(_formData: FormData) {
    "use server";
    await signOut({ redirectTo: "/sign-in" });
  }

  return (
    <header className="relative z-20 flex flex-col gap-4 border-b border-border/70 bg-card/80 px-4 py-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/60 sm:px-8 sm:py-5 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <SidebarToggleButton />
        <div>
          <h1 className="text-2xl font-semibold">
            Willkommen zurück{session?.user?.name ? `, ${session.user.name}` : ""}
          </h1>
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString("de-DE", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <ThemeToggle />
        <UserMenu user={session?.user} logoutAction={handleSignOut} />
      </div>
    </header>
  );
}
