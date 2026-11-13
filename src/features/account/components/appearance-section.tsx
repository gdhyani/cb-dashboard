import { Section } from "@/shared/components/section";
import { Card, CardContent } from "@/shared/ui/card";
import { ThemePicker } from "./theme-picker";

export function AppearanceSection() {
  return (
    <Section
      layout="horizontal"
      title="Appearance"
      description="Theme for this dashboard in this browser. Also in the top bar and the account menu"
    >
      <Card>
        <CardContent>
          <ThemePicker />
        </CardContent>
      </Card>
    </Section>
  );
}
