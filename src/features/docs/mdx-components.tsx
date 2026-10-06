import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { ArchitectureDiagram } from "./components/architecture-diagram";
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

/** Everything an MDX page can use (FR-DOC-006, FR-DOC-007, FR-DOC-009). */
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
    ...overrides,
  };
}
