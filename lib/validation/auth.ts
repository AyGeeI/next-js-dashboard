import { z } from "zod";

/**
 * Password validation schema following OWASP guidelines
 * - Minimum 12 characters for security
 * - Maximum 72 characters (bcrypt limitation)
 */
export const passwordSchema = z
  .string()
  .min(12, "Passwort muss mindestens 12 Zeichen lang sein.")
  .max(72, "Passwort darf maximal 72 Zeichen lang sein.")
  .regex(/[a-z]/, "Mindestens ein Kleinbuchstabe erforderlich.")
  .regex(/[A-Z]/, "Mindestens ein Großbuchstabe erforderlich.")
  .regex(/\d/, "Mindestens eine Zahl erforderlich.")
  .regex(/[^A-Za-z0-9]/, "Mindestens ein Sonderzeichen erforderlich.");

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .email("Bitte eine gültige E-Mail-Adresse eingeben.");

/**
 * Username validation schema
 */
export const usernameSchema = z
  .string()
  .min(3, "Benutzername muss mindestens 3 Zeichen lang sein.")
  .max(32, "Benutzername darf maximal 32 Zeichen lang sein.")
  .regex(/^[a-zA-Z0-9._-]+$/, "Nur Buchstaben, Zahlen sowie . _ - sind erlaubt.");

/**
 * Combined schema for registration
 */
export const registerSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    name: z
      .string()
      .max(64, "Name darf maximal 64 Zeichen lang sein.")
      .optional()
      .or(z.literal("").transform(() => undefined)),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      path: ["confirmPassword"],
      message: "Passwörter stimmen nicht überein.",
    }
  );

export const loginIdentifierSchema = z
  .string()
  .min(3, "Bitte gib deine E-Mail-Adresse oder deinen Benutzernamen ein.")
  .max(254, "Bitte gib einen kürzeren Wert ein.")
  .refine(
    (value) => emailSchema.safeParse(value).success || usernameSchema.safeParse(value).success,
    {
      message: "Nutze eine gültige E-Mail-Adresse oder deinen Benutzernamen.",
    },
  );

/**
 * Combined schema for login
 */
export const loginSchema = z.object({
  identifier: loginIdentifierSchema,
  password: z.string(), // No length validation on login - validate hash instead
  rememberMe: z.boolean().optional().default(false),
});

export const resendVerificationSchema = z.object({
  email: emailSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
