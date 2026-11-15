import { SPLASH_SESSION_KEY, THEME_STORAGE_KEY } from "@/constants";

export type ThemeChoice = "dark" | "light" | "system";
export type ResolvedTheme = "dark" | "light";

export const THEME_CHOICES: { value: ThemeChoice; label: string }[] = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "system", label: "System" },
];

export function isThemeChoice(value: unknown): value is ThemeChoice {
  return value === "dark" || value === "light" || value === "system";
}

/** Stored choice; dark when nothing (or something invalid) is stored, or storage is blocked. */
export function readThemeChoice(): ThemeChoice {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeChoice(stored) ? stored : "dark";
  } catch {
    return "dark";
  }
}

export function resolveTheme(choice: ThemeChoice, prefersLight: boolean): ResolvedTheme {
  if (choice === "system") return prefersLight ? "light" : "dark";
  return choice;
}

/**
 * Applies a resolved theme to <html>: `data-theme` (landing, dashboard and docs tokens) and the `dark` class (Fumadocs,
 * docs and blog), so every page agrees.
 */
export function applyTheme(theme: ResolvedTheme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle("dark", theme === "dark");
}

/**
 * Runs before first paint on every page, so a light-theme user never sees a dark flash. Kept as a string:
 * it is inlined into a <script>. Mirrors readThemeChoice + resolveTheme. It also lets the first-landing splash play once
 * per browser tab: later page loads get <html data-splash="skip"> (styles/studio.css hides the splash).
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var c=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(c!=="light"&&c!=="system")c="dark";var l=c==="light"||(c==="system"&&matchMedia("(prefers-color-scheme: light)").matches);var d=document.documentElement;d.dataset.theme=l?"light":"dark";d.classList.toggle("dark",!l)}catch(e){document.documentElement.dataset.theme="dark";document.documentElement.classList.add("dark")}try{var p=location.pathname;if(p.indexOf("/docs")!==0&&p.indexOf("/blog")!==0){if(sessionStorage.getItem(${JSON.stringify(
  SPLASH_SESSION_KEY,
)}))document.documentElement.dataset.splash="skip";else sessionStorage.setItem(${JSON.stringify(SPLASH_SESSION_KEY)},"1")}}catch(e){}})()`;
