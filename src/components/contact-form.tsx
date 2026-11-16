import { useState, type FormEvent } from "react";
import { formCopy } from "@/content/site";
import { t, type Lang } from "@/content/types";
import { submitContact } from "@/lib/contact";

type Errors = Partial<Record<"name" | "email" | "message", string>>;

export function ContactForm({ lang }: { lang: Lang }) {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "not_configured" | "failed" | "spam">("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const next: Errors = {};
    if (!name) next.name = t(formCopy.required, lang);
    if (!email) next.email = t(formCopy.required, lang);
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = t(formCopy.emailInvalid, lang);
    if (!message) next.message = t(formCopy.required, lang);
    setErrors(next);
    if (Object.keys(next).length) {
      setStatus("idle");
      return;
    }
    setStatus("sending");
    try {
      const result = await submitContact({
        data: {
          name,
          email,
          organization: String(data.get("organization") ?? ""),
          projectType: String(data.get("projectType") ?? ""),
          message,
          companyWebsite: String(data.get("companyWebsite") ?? ""),
        },
      });
      if (result.ok) {
        setStatus("success");
        form.reset();
        return;
      }
      setStatus(result.reason === "not_configured" ? "not_configured" : result.reason === "spam" ? "spam" : "failed");
    } catch {
      setStatus("failed");
    }
  }

  const statusText =
    status === "success"
      ? t(formCopy.success, lang)
      : status === "not_configured"
        ? t(formCopy.notConfigured, lang)
        : status === "failed" || status === "spam"
          ? t(formCopy.failed, lang)
          : "";

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      <div className="field">
        <label htmlFor="name">{t(formCopy.name, lang)}</label>
        <input id="name" name="name" autoComplete="name" aria-invalid={Boolean(errors.name)} />
        {errors.name ? <p className="field-error">{errors.name}</p> : null}
      </div>
      <div className="field">
        <label htmlFor="email">{t(formCopy.email, lang)}</label>
        <input id="email" name="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} />
        {errors.email ? <p className="field-error">{errors.email}</p> : null}
      </div>
      <div className="field">
        <label htmlFor="organization">{t(formCopy.organization, lang)}</label>
        <input id="organization" name="organization" autoComplete="organization" />
      </div>
      <div className="field">
        <label htmlFor="projectType">{t(formCopy.projectType, lang)}</label>
        <input id="projectType" name="projectType" />
      </div>
      <div className="field">
        <label htmlFor="message">{t(formCopy.message, lang)}</label>
        <textarea id="message" name="message" aria-invalid={Boolean(errors.message)} />
        {errors.message ? <p className="field-error">{errors.message}</p> : null}
      </div>
      <div className="hp" aria-hidden="true">
        <label htmlFor="companyWebsite">Website</label>
        <input id="companyWebsite" name="companyWebsite" tabIndex={-1} autoComplete="off" />
      </div>
      <button type="submit" disabled={status === "sending"}>
        {status === "sending" ? t(formCopy.sending, lang) : t(formCopy.send, lang)}
      </button>
      {statusText ? (
        <p className="form-status" role="status">
          {statusText}
        </p>
      ) : null}
    </form>
  );
}
