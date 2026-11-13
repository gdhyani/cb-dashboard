import { PRODUCT_NAME } from "@/constants";

/**
 * First-landing splash (once per browser tab): the wordmark with a teal strike through its middle, then the page.
 * Pure CSS (styles/studio.css), so it never waits for JavaScript; skipped for later loads (`data-splash="skip"`, set by
 * the theme boot script) and for reduced motion. Decorative: hidden from screen readers.
 */
export function Splash() {
  return (
    <div className="cb-splash" aria-hidden="true">
      <span className="cb-splash-word">
        {PRODUCT_NAME}
        <span className="cb-splash-strike" />
      </span>
    </div>
  );
}
