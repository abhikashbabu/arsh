"use client";

import { useRef } from "react";

export function Carousel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (amount: number) => ref.current?.scrollBy({ left: amount, behavior: "smooth" });
  return <div className={`carousel ${className}`}><button className="carousel-arrow prev" aria-label="Previous" onClick={() => move(-320)}>‹</button><div ref={ref} className="carousel-track">{children}</div><button className="carousel-arrow next" aria-label="Next" onClick={() => move(320)}>›</button></div>;
}
