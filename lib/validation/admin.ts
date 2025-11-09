import { z } from "zod";

import { emailSchema, passwordSchema, usernameSchema } from "./auth";

const roleSchema = z.enum(["ADMIN", "STANDARD"]);

const nameField = z
  .string()
  .max(64, "Name darf maximal 64 Zeichen lang sein.")
  .optional()
  .or(z.literal("").transform(() => undefined));

export const adminUserUpdateSchema = z.object({
  name: nameField,
  username: usernameSchema,
  email: emailSchema,
  role: roleSchema,
});

export const adminUserCreateSchema = adminUserUpdateSchema
  .extend({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwörter stimmen nicht überein.",
  });

export type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>;
export type AdminUserCreateInput = z.infer<typeof adminUserCreateSchema>;
