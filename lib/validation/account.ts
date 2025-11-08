import { z } from "zod";

import { passwordSchema, usernameSchema } from "./auth";

export const profileUpdateSchema = z.object({
  name: z
    .string()
    .max(64, "Name darf maximal 64 Zeichen lang sein.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  username: usernameSchema,
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Bitte gib dein aktuelles Passwort ein."),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwörter stimmen nicht überein.",
  });

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
