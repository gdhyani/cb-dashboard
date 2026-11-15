import axe from "axe-core";

/**
 * NFR accessibility (PRD §14): axe-core violations under `root` (default: the whole document, so dialogs rendered in
 * portals are included), as "rule: selector" strings. Colour contrast needs real layout, which jsdom does not have:
 * it is checked in the browser pass instead. `region` is off because components render here without page landmarks.
 */
export async function axeViolations(root: Element = document.body): Promise<string[]> {
  const result = await axe.run(root, { rules: { "color-contrast": { enabled: false }, region: { enabled: false } } });
  return result.violations.flatMap((v) => v.nodes.map((n) => `${v.id}: ${n.target.join(" ")} — ${v.help}`));
}
