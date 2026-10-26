"use client";

import { FormEvent, useState } from "react";
import { API_CONFIG, submitAppointment } from "../lib/api";

export function AppointmentForm({ title = "Request an appointment", orthopaedic = false }: { title?: string; orthopaedic?: boolean }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      concern: String(form.get("concern") ?? ""),
      message: String(form.get("message") ?? ""),
      source: typeof window === "undefined" ? "website" : window.location.pathname,
    };
    if (!API_CONFIG.isConfigured) { setSent(true); return; }
    try { await submitAppointment(payload); setSent(true); } catch { setError("We could not send your request right now. Please call the hospital directly."); }
  };
  return <form className="appointment-form" onSubmit={submit}><h3>{title}</h3><div className="form-fields"><label>Full name<input name="name" required placeholder="Your name" /></label><label>Phone number<input name="phone" required type="tel" placeholder="Your phone number" /></label>{orthopaedic && <label className="full">Concern<select name="concern"><option>Joint pain / arthritis</option><option>Fracture / injury</option><option>Sports injury</option><option>Back or neck pain</option><option>Other</option></select></label>}<label className="full">Message<textarea name="message" placeholder="How can we help?" /></label></div><button className="submit-button" type="submit">Submit appointment request →</button>{sent && <p className="success-message">Thank you. Your request has been received — our patient care team will call you shortly to confirm.</p>}{error && <p className="error-message">{error}</p>}</form>;
}
