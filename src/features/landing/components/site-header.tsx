"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { PRODUCT_NAME } from "@/constants";
import { auth, nav } from "../content";
import { FillLink } from "./fill-link";
import { ThemeDock } from "./theme-dock";

const isHash = (href: string) => href.startsWith("#");

/** Top bar: wordmark, section links, Sign in / Get started. Phones get a full-screen menu (focus trapped, Escape closes). */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) button.current?.focus();
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle("lp-menu-open", open);
    if (!open) return;
    menu.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key !== "Tab" || !menu.current) return;
      const items = Array.from(menu.current.querySelectorAll<HTMLElement>("a, button"));
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      html.classList.remove("lp-menu-open");
    };
  }, [open, close]);

  return (
    <header className="lp-header" data-lp-header="" data-tone="paper">
      <div className="lp-header__bar">
        <a href="#top" className="lp-wordmark" aria-label={`${PRODUCT_NAME} home`}>
          <span className="lp-wordmark__mark">{PRODUCT_NAME}</span>
        </a>
        <nav className="lp-nav" aria-label="Main">
          <div className="lp-nav__links" data-marker-group="">
            <span className="lp-nav__marker" data-marker="" aria-hidden="true" />
            {nav.map((item) =>
              isHash(item.href) ? (
                <a key={item.href} href={item.href} className="lp-nav__link">
                  {item.label}
                </a>
              ) : (
                <Link key={item.href} href={item.href} className="lp-nav__link">
                  {item.label}
                </Link>
              ),
            )}
          </div>
        </nav>
        <div className="lp-header__actions">
          <Link href={auth.signIn.href} className="lp-header__signin">
            {auth.signIn.label}
          </Link>
          <FillLink href={auth.start.href} label={auth.start.label} className="lp-btn--small" />
          <button
            ref={button}
            type="button"
            className="lp-menu-button"
            aria-expanded={open}
            aria-controls="lp-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      <div ref={menu} id="lp-menu" className="lp-menu" hidden={!open}>
        <nav aria-label="Menu">
          <ul className="lp-menu__list">
            {nav.map((item) => (
              <li key={item.href}>
                {isHash(item.href) ? (
                  <a href={item.href} className="lp-menu__link" onClick={() => close(false)}>
                    {item.label}
                  </a>
                ) : (
                  <Link href={item.href} className="lp-menu__link">
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
            <li>
              <Link href={auth.signIn.href} className="lp-menu__link">
                {auth.signIn.label}
              </Link>
            </li>
          </ul>
          <FillLink href={auth.start.href} label={auth.start.label} className="lp-menu__cta" />
          <div className="lp-menu__theme">
            <ThemeDock variant="inline" />
          </div>
        </nav>
      </div>
    </header>
  );
}
