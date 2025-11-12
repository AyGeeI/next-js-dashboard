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

// Schema für Passwort-Änderung (optional im Edit-Form)
export const adminUserUpdateWithPasswordSchema = adminUserUpdateSchema.extend({
  changePassword: z.boolean().optional(),
  password: passwordSchema.optional(),
  confirmPassword: z.string().optional(),
}).refine(
  (data) => {
    // Wenn changePassword aktiviert ist, müssen beide Passwortfelder ausgefüllt sein
    if (data.changePassword && (!data.password || !data.confirmPassword)) {
      return false;
    }
    return true;
  },
  {
    path: ["password"],
    message: "Passwort ist erforderlich.",
  }
).refine(
  (data) => {
    // Wenn changePassword aktiviert ist, müssen die Passwörter übereinstimmen
    if (data.changePassword && data.password !== data.confirmPassword) {
      return false;
    }
    return true;
  },
  {
    path: ["confirmPassword"],
    message: "Passwörter stimmen nicht überein.",
  }
);

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
export type AdminUserUpdateWithPasswordInput = z.infer<typeof adminUserUpdateWithPasswordSchema>;
export type AdminUserCreateInput = z.infer<typeof adminUserCreateSchema>;
