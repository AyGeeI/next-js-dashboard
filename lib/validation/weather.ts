import { z } from "zod";

export const weatherSettingsSchema = z.object({
  zip: z
    .string()
    .trim()
    .min(3, "Postleitzahl muss mindestens 3 Zeichen haben.")
    .max(10, "Postleitzahl darf maximal 10 Zeichen haben.")
    .regex(/^[a-zA-Z0-9\- ]+$/, "Nur Buchstaben, Zahlen und Bindestriche sind erlaubt."),
  countryCode: z
    .string()
    .trim()
    .min(2, "Ländercode muss mindestens 2 Zeichen haben.")
    .max(3, "Ländercode darf höchstens 3 Zeichen haben.")
    .regex(/^[a-zA-Z]+$/, "Nur Buchstaben sind erlaubt."),
  apiKey: z
    .string()
    .trim()
    .min(8, "API-Schlüssel ist zu kurz."),
});

export type WeatherSettingsInput = z.infer<typeof weatherSettingsSchema>;
