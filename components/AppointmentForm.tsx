"use client";

import { FormEvent, useState } from "react";

export function AppointmentForm({ title = "Request an appointment", orthopaedic = false }: { title?: string; orthopaedic?: boolean }) {
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSent(true); };
  return <form className="appointment-form" onSubmit={submit}><h3>{title}</h3><div className="form-fields"><label>Full name<input required placeholder="Your name" /></label><label>Phone number<input required type="tel" placeholder="Your phone number" /></label>{orthopaedic && <label className="full">Concern<select><option>Joint pain / arthritis</option><option>Fracture / injury</option><option>Sports injury</option><option>Back or neck pain</option><option>Other</option></select></label>}<label className="full">Message<textarea placeholder="How can we help?" /></label></div><button className="submit-button" type="submit">Submit appointment request →</button>{sent && <p className="success-message">Thank you. Your request has been received — our patient care team will call you shortly to confirm.</p>}</form>;
}
