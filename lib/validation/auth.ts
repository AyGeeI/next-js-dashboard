import { z } from "zod";

/**
 * Password validation schema following OWASP guidelines
 * - Minimum 12 characters for security
 * - Maximum 72 characters (bcrypt limitation)
 */
export const passwordSchema = z
  .string()
  .min(12, "Passwort muss mindestens 12 Zeichen lang sein.")
  .max(72, "Passwort darf maximal 72 Zeichen lang sein.");

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .email("Bitte eine gültige E-Mail-Adresse eingeben.");

/**
 * Combined schema for registration
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().optional(),
});

/**
 * Combined schema for login
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string(), // No length validation on login - validate hash instead
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
