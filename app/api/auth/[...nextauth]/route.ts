import { handlers } from "@/lib/auth/config";

// Force Node.js runtime for Prisma compatibility
export const runtime = "nodejs";

export const { GET, POST } = handlers;
