import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  organization: z.string().trim().max(160).optional().default(""),
  projectType: z.string().trim().max(160).optional().default(""),
  message: z.string().trim().min(1).max(5000),
  companyWebsite: z.string().max(200).optional().default(""),
});

export type ContactResult =
  | { ok: true }
  | { ok: false; reason: "not_configured" | "delivery_failed" | "spam" };

/**
 * Delivers a contact message only when CONTACT_WEBHOOK_URL is set.
 * The endpoint should accept a JSON POST. Nothing is stored locally.
 */
export const submitContact = createServerFn({ method: "POST" })
  .validator((input: unknown) => contactSchema.parse(input))
  .handler(async ({ data }): Promise<ContactResult> => {
    if (data.companyWebsite) return { ok: false, reason: "spam" };
    const webhook = process.env.CONTACT_WEBHOOK_URL;
    if (!webhook) return { ok: false, reason: "not_configured" };
    try {
      const response = await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          organization: data.organization,
          projectType: data.projectType,
          message: data.message,
        }),
      });
      if (!response.ok) return { ok: false, reason: "delivery_failed" };
      return { ok: true };
    } catch {
      return { ok: false, reason: "delivery_failed" };
    }
  });
