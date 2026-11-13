import { ACCENT_STORAGE_KEY, THEME_STORAGE_KEY } from "@/constants";

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

/** Applies a resolved theme to <html data-theme>; the dashboard tokens key off it (styles/studio.css). */
export function applyTheme(theme: ResolvedTheme) {
  document.documentElement.dataset.theme = theme;
}

/**
 * Runs before first paint on dashboard pages, so a light-theme user never sees a dark flash. Kept as a string:
 * it is inlined into a <script>. Mirrors readThemeChoice + resolveTheme, and applies the (temporary) accent pick.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var c=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(c!=="light"&&c!=="system")c="dark";var l=c==="light"||(c==="system"&&matchMedia("(prefers-color-scheme: light)").matches);document.documentElement.dataset.theme=l?"light":"dark";var a=localStorage.getItem(${JSON.stringify(
  ACCENT_STORAGE_KEY,
)});document.documentElement.dataset.accent=/^(green|brass|mono|cobalt|iris|teal)$/.test(a||"")?a:"green"}catch(e){document.documentElement.dataset.theme="dark";document.documentElement.dataset.accent="green"}})()`;
