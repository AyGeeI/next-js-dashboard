import { prisma } from "@/lib/prisma";

export async function findUserByIdentifier(identifier: string) {
  const trimmed = identifier.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.includes("@")) {
    return prisma.user.findUnique({
      where: { email: trimmed.toLowerCase() },
    });
  }

  return prisma.user.findFirst({
    where: {
      username: {
        equals: trimmed,
        mode: "insensitive",
      },
    },
  });
}
