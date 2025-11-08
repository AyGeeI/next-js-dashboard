import { auth, signOut } from "@/lib/auth/config";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export async function Header() {
  const session = await auth();

  return (
    <header className="flex flex-col gap-4 border-b bg-card px-4 py-4 sm:px-6 sm:py-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-xl font-semibold">
          Willkommen zurück{session?.user?.name ? `, ${session.user.name}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("de-DE", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <ThemeToggle />
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <User className="h-5 w-5" />
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/sign-in" });
            }}
          >
            <Button variant="ghost" size="icon" type="submit">
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Abmelden</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
