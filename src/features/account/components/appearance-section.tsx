import { Section } from "@/shared/components/section";
import { ThemePicker } from "./theme-picker";

export function AppearanceSection() {
  return (
    <Section title="Appearance" description="Theme for this dashboard, kept in this browser">
      <ThemePicker />
    </Section>
  );
}
