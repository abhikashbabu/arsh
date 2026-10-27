"use client";

import Link from "next/link";
import { useState } from "react";
import { BlogPost, Facility, HomeUpdate, normalizeImageUrl, PatientStory } from "../../lib/api";
import { images } from "../../lib/content";
import { Carousel } from "../../components/Carousel";

const fallbackCards = {
  press: { title: "ARSH Hospital updates", text: "Latest hospital news and official announcements will appear here.", label: "ARSH Hospital" },
  coverage: { title: "Media coverage", text: "Media coverage featuring ARSH doctors and hospital initiatives will appear here.", label: "ARSH Hospital" },
  events: { title: "Health camps and CSR initiatives", text: "Community health camps, awareness drives and hospital events will appear here.", label: "ARSH Hospital" },
};

export function NewsMediaClient({ update, blog, facilities, patients }: { update: HomeUpdate | null; blog: BlogPost | null; facilities: Facility[]; patients: PatientStory[] }) {
  const [tab, setTab] = useState<keyof typeof fallbackCards>("press");
  const apiTitle = blog?.title ?? update?.title;
  const apiText = blog?.description ?? update?.description;
  const current = tab === "press" && apiTitle ? { title: apiTitle, text: apiText ?? "", label: "ARSH Hospital" } : fallbackCards[tab];
  const currentImage = tab === "press" ? normalizeImageUrl(blog?.image ?? update?.image) || images.hero : tab === "coverage" ? images.doctors[0] : images.hero;
  const gallery = facilities.length ? facilities.map(item => ({ title: item.name, image: item.image })) : patients.map(item => ({ title: item.title, image: item.image }));
  const date = blog?.published_at ?? update?.published_at;

  return <><section className="page-hero"><div className="container"><span className="eyebrow">● &nbsp; Newsroom</span><h1>News & Media</h1><p>Press releases, media coverage and updates on health camps and community initiatives from ARSH Super Speciality Hospital, Gaya.</p></div></section><section className="page-section" id="press"><div className="container"><div className="section-head"><div><div className="kicker">Latest updates</div><h2>Press Releases & Media Coverage</h2></div></div><div className="media-tabs">{(["press", "coverage", "events"] as const).map(key => <button className={`media-tab ${tab === key ? "active" : ""}`} key={key} onClick={() => setTab(key)}>{key === "press" ? "Press Releases" : key === "coverage" ? "Media Coverage" : "Events & CSR"}</button>)}</div><article className="media-card"><div className="media-card-content"><div><h3>{current.title}</h3><p>{current.text.length > 420 ? `${current.text.slice(0, 420)}…` : current.text}</p>{tab === "press" && (blog?.slug ?? update?.key) && <Link className="doctor-link" href={`/news-media/${blog?.slug ?? update?.key}`}>Read article →</Link>}</div><img src={currentImage} alt={current.title} /></div><div className="media-meta"><span><b>Date:</b> {date ? new Date(date).toLocaleDateString("en-IN") : "Latest update"}</span><span><b>Source:</b> {current.label}</span></div></article></div></section><section className="page-section gallery-section" id="gallery"><div className="container"><div className="section-head"><div><div className="kicker" style={{ color: "#77d8e6" }}>Hospital Gallery</div><h2>ARSH Hospital Facilities & Updates</h2><p>Explore the hospital facilities and patient-care updates shared by ARSH.</p></div></div><Carousel>{gallery.map(item => <article className="gallery-card" key={item.title}><img src={normalizeImageUrl(item.image) || images.hero} alt={item.title} /><div style={{ padding: 14 }}><strong>{item.title}</strong></div></article>)}</Carousel></div></section></>;
}
