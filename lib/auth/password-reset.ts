import { prisma } from "@/lib/prisma";
import { randomBytes, createHash } from "crypto";

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createPasswordResetToken(userId: string) {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await prisma.passwordResetToken.deleteMany({
    where: {
      userId,
      usedAt: null,
    },
  });

  await prisma.passwordResetToken.create({
    data: {
      userId,
      token: tokenHash,
      expires: expiresAt,
    },
  });

  return { token: rawToken, expiresAt };
}

export async function findValidPasswordResetToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);

  const record = await prisma.passwordResetToken.findUnique({
    where: { token: tokenHash },
  });

  if (!record) {
    return null;
  }

  if (record.usedAt) {
    return null;
  }

  if (record.expires < new Date()) {
    await prisma.passwordResetToken.delete({
      where: { token: tokenHash },
    });
    return null;
  }

  return record;
}
