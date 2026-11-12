import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { ArchitectureDiagram } from "./components/architecture-diagram";
import { CoverageChart } from "./components/blog/coverage-chart";
import { EnvCompositionChart } from "./components/blog/env-composition-chart";
import { EnvPrecedenceDiagram } from "./components/blog/env-precedence-diagram";
import { EnvVisibilityDiagram } from "./components/blog/env-visibility-diagram";
import { HttpsPathSequence, PostgresLoginSequence } from "./components/blog/gateway-sequences";
import { LeakMapDiagram } from "./components/blog/leak-map-diagram";
import { LeakScanChart } from "./components/blog/leak-scan-chart";
import { SecurePassageDiagram } from "./components/blog/secure-passage-diagram";
import { StandInDiagram } from "./components/blog/stand-in-diagram";
import { ValueTypesMatrix } from "./components/blog/value-types-matrix";
import { Callout } from "./components/callout";
import { ConnectorCards } from "./components/connector-cards";
import { EnvTable } from "./components/env-table";
import { Field } from "./components/field";
import { Fields } from "./components/fields";
import { Frame } from "./components/frame";
import { PlatformCards } from "./components/platform-cards";
import { RequestFlowDiagram } from "./components/request-flow-diagram";
import { RoutingLayersDiagram } from "./components/routing-layers-diagram";
import { StatusBadge } from "./components/status-badge";
import { WebhookFlowDiagram } from "./components/webhook-flow-diagram";

/** Everything an MDX page or blog post can use (FR-DOC-006, FR-DOC-007, FR-DOC-009, FR-DOC-010). */
export function getMDXComponents(overrides?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Steps,
    Step,
    Tabs,
    Tab,
    Callout,
    Frame,
    Fields,
    Field,
    EnvTable,
    ConnectorCards,
    PlatformCards,
    StatusBadge,
    ArchitectureDiagram,
    RequestFlowDiagram,
    RoutingLayersDiagram,
    WebhookFlowDiagram,
    CoverageChart,
    EnvCompositionChart,
    EnvPrecedenceDiagram,
    EnvVisibilityDiagram,
    HttpsPathSequence,
    LeakScanChart,
    PostgresLoginSequence,
    LeakMapDiagram,
    SecurePassageDiagram,
    StandInDiagram,
    ValueTypesMatrix,
    ...overrides,
  };
}
