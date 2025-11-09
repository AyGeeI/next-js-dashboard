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

  const serializedUsers = users.map((user) => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Administration</p>
        <h1 className="text-3xl font-bold tracking-tight">Zugriff auf Benutzerkonten steuern</h1>
        <p className="max-w-2xl text-muted-foreground">
          Behalte Rollen und Kontaktdaten im Blick, lege neue Konten an und halte Benutzerprofile zentral gepflegt.
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
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
