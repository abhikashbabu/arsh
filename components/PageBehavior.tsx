"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

type PageRuntimeWindow = Window & {
  __arshPageEventCleanup?: () => void;
  __arshPageScriptCleanup?: () => void;
  __arshRegisterEvent?: (...args: any[]) => void;
  ArshApi?: {
    get: (path: string, params?: Record<string, string | number | undefined>) => Promise<any>;
    post: (path: string, body: Record<string, unknown>) => Promise<any>;
  };
};

function cleanPath(pathname: string) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

export function PageBehavior({ slug }: { slug: string }) {
  const router = useRouter();

  useEffect(() => {
    const runtimeWindow = window as PageRuntimeWindow;
    runtimeWindow.__arshPageEventCleanup?.();

    const registeredEvents: Array<{
      target: EventTarget;
      type: string;
      listener: EventListenerOrEventListenerObject;
      options?: boolean | AddEventListenerOptions;
    }> = [];

    runtimeWindow.__arshRegisterEvent = (target, type, listener, options) => {
      target.addEventListener(type, listener, options);
      registeredEvents.push({ target, type, listener, options });
    };

    runtimeWindow.ArshApi = {
      async get(path, params = {}) {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== "") query.set(key, String(value));
        });
        const queryString = query.toString();
        const response = await fetch(`/api/ci4/${path.replace(/^\/+/, "")}${queryString ? `?${queryString}` : ""}`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        return parseApiResponse(response);
      },
      async post(path, body) {
        const response = await fetch(`/api/ci4/${path.replace(/^\/+/, "")}`, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        return parseApiResponse(response);
      },
    };
    runtimeWindow.__arshPageEventCleanup = () => {
      registeredEvents.forEach(({ target, type, listener, options }) => {
        target.removeEventListener(type, listener, options);
      });
      registeredEvents.length = 0;
    };

    const toInternalUrl = (anchor: HTMLAnchorElement) => {
      if (!anchor.href || anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) {
        return null;
      }
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || !["http:", "https:"].includes(url.protocol)) return null;
      return url;
    };

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;
      if (anchor.closest(".site-header, .drawer")) return;
      const url = toInternalUrl(anchor);
      if (!url) return;

      const current = new URL(window.location.href);
      const samePath = cleanPath(url.pathname) === cleanPath(current.pathname);
      if (samePath && url.pathname === current.pathname && url.search === current.search) return;

      event.preventDefault();
      router.push(`${url.pathname}${url.search}${url.hash}`);
    };

    const handleSubmit = (event: SubmitEvent) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      const action = new URL(form.action || window.location.href, window.location.href);
      if (action.origin !== window.location.origin || cleanPath(action.pathname) !== "/search") return;
      event.preventDefault();
      const value = String(new FormData(form).get("q") || "").trim();
      router.push(value ? `/search?q=${encodeURIComponent(value)}` : "/search");
    };

    const closeMegaMenus = () => {
      document.querySelectorAll<HTMLElement>("[data-mega-panel]").forEach((panel) => {
        panel.classList.remove("open");
        panel.setAttribute("aria-hidden", "true");
      });
      document.querySelectorAll<HTMLButtonElement>("[data-mega-trigger]").forEach((button) => {
        button.setAttribute("aria-expanded", "false");
        button.classList.remove("on");
      });
    };

    const handleNavigationClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const trigger = event.target.closest<HTMLButtonElement>("[data-mega-trigger]");
      if (trigger) {
        const name = trigger.dataset.megaTrigger;
        const panel = name ? document.querySelector<HTMLElement>(`[data-mega-panel="${name}"]`) : null;
        const shouldOpen = trigger.getAttribute("aria-expanded") !== "true";
        closeMegaMenus();
        if (shouldOpen && panel) {
          trigger.setAttribute("aria-expanded", "true");
          trigger.classList.add("on");
          panel.classList.add("open");
          panel.setAttribute("aria-hidden", "false");
        }
        return;
      }
      const accordion = event.target.closest<HTMLButtonElement>("[data-drawer-accordion]");
      if (accordion) {
        const panelId = accordion.getAttribute("aria-controls");
        const panel = panelId ? document.getElementById(panelId) : null;
        const expanded = accordion.getAttribute("aria-expanded") === "true";
        accordion.setAttribute("aria-expanded", String(!expanded));
        panel?.classList.toggle("open", !expanded);
        return;
      }
      if (!event.target.closest(".site-header")) closeMegaMenus();
    };

    const handleNavigationKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMegaMenus();
    };

    const header = document.querySelector<HTMLElement>(".site-header");
    const handleHeaderLeave = () => {
      if (window.matchMedia("(min-width: 992px)").matches) closeMegaMenus();
    };
    const handleHeaderHover = (event: PointerEvent) => {
      if (!window.matchMedia("(min-width: 992px)").matches || !(event.target instanceof Element)) return;
      const trigger = event.target.closest<HTMLButtonElement>("[data-mega-trigger]");
      if (!trigger || trigger.getAttribute("aria-expanded") === "true") return;
      const name = trigger.dataset.megaTrigger;
      const panel = name ? document.querySelector<HTMLElement>(`[data-mega-panel="${name}"]`) : null;
      closeMegaMenus();
      trigger.setAttribute("aria-expanded", "true");
      trigger.classList.add("on");
      panel?.classList.add("open");
      panel?.setAttribute("aria-hidden", "false");
    };

    const prefetched = new Set<string>();
    const handlePointerOver = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;
      const url = toInternalUrl(anchor);
      if (!url) return;
      const destination = `${url.pathname}${url.search}`;
      if (prefetched.has(destination) || cleanPath(url.pathname) === cleanPath(window.location.pathname)) return;
      prefetched.add(destination);
      router.prefetch(destination);
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("click", handleNavigationClick);
    document.addEventListener("keydown", handleNavigationKey);
    document.addEventListener("submit", handleSubmit);
    document.addEventListener("pointerover", handlePointerOver, { passive: true });
    document.addEventListener("pointerover", handleHeaderHover, { passive: true });
    header?.addEventListener("pointerleave", handleHeaderLeave);

    const pageScript = document.createElement("script");
    pageScript.src = `/page-scripts/${slug}.js`;
    pageScript.async = false;
    pageScript.dataset.arshPageScript = slug;
    document.body.appendChild(pageScript);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("click", handleNavigationClick);
      document.removeEventListener("keydown", handleNavigationKey);
      document.removeEventListener("submit", handleSubmit);
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("pointerover", handleHeaderHover);
      header?.removeEventListener("pointerleave", handleHeaderLeave);
      runtimeWindow.__arshPageScriptCleanup?.();
      delete runtimeWindow.__arshPageScriptCleanup;
      pageScript.remove();
      runtimeWindow.__arshPageEventCleanup?.();
      delete runtimeWindow.ArshApi;
    };
  }, [router, slug]);

  return null;
}

async function parseApiResponse(response: Response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.ok === false) {
    const errors = Array.isArray(payload?.errors) ? payload.errors.join(" ") : payload?.message;
    throw new Error(errors || `Request failed (${response.status})`);
  }
  return payload;
}
