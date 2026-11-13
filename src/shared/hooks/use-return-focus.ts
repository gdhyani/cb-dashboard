import { useCallback, useRef } from "react";

/**
 * NFR accessibility (PRD §14): dialogs that are mounted only while open are removed before Radix can hand focus back,
 * so keyboard users land on <body>. `remember()` when opening, `restore()` when closing puts focus back on what had it
 * (the button that opened the dialog), if that element is still on the page.
 */
export function useReturnFocus() {
  const from = useRef<HTMLElement | null>(null);
  const remember = useCallback(() => {
    from.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  }, []);
  const restore = useCallback(() => {
    const el = from.current;
    from.current = null;
    // After the dialog has unmounted and removed its focus trap.
    setTimeout(() => {
      if (el?.isConnected) el.focus();
    }, 0);
  }, []);
  return { remember, restore };
}
