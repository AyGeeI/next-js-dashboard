import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "./user-management";

export const revalidate = 0;

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  if (session.user.role !== "ADMIN") {
    notFound();
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });

  const serializedUsers = users.map((user: typeof users[number]) => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">Administration</p>
        <h1 className="text-2xl font-semibold">Zugriff auf Benutzerkonten steuern</h1>
        <p className="text-sm text-muted-foreground">
          Behalte Rollen und Kontaktdaten im Blick, lege neue Konten an und halte Benutzerprofile zentral gepflegt.
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-8">
        <TabsList aria-label="Admin-Bereiche">
          <TabsTrigger value="users">Benutzer</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UserManagement initialUsers={serializedUsers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
