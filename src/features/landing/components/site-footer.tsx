import Link from "next/link";
import { PRODUCT_NAME } from "@/constants";
import { footer } from "../content";
import { FillLink } from "./fill-link";
import { ThemeDock } from "./theme-dock";

const isExternal = (href: string) => href.startsWith("http");

export function SiteFooter() {
  return (
    <footer className="lp-footer" data-tone="night">
      <div className="lp-grid lp-footer__finale">
        <p className="lp-display lp-footer__title">
          {footer.title.map((line, i) => (
            <span key={line} className="lp-footer__line" data-split="" data-delay={String(i * 0.12)}>
              {line}{" "}
            </span>
          ))}
        </p>
        <div className="lp-footer__actions" data-reveal="">
          <FillLink href={footer.primary.href} label={footer.primary.label} />
          <FillLink href={footer.secondary.href} label={footer.secondary.label} variant="secondary" />
        </div>
      </div>
      <div className="lp-grid lp-footer__small">
        <span className="lp-footer__mark" aria-hidden="true">
          {PRODUCT_NAME}
        </span>
        <nav className="lp-footer__links" aria-label="Footer">
          <ul>
            {footer.links.map((l) => (
              <li key={l.href}>
                {isExternal(l.href) ? (
                  <a href={l.href} rel="noopener" target="_blank">
                    {l.label}
                  </a>
                ) : (
                  <Link href={l.href}>{l.label}</Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="lp-footer__meta">
          <span>{footer.oss}</span>
          <span>{footer.colophon}</span>
          <ThemeDock variant="inline" />
        </div>
      </div>
    </footer>
  );
}
