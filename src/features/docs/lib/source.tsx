import { docs } from "@source/server";
import { loader } from "fumadocs-core/source";
import { statusBadgesPlugin } from "fumadocs-core/source/plugins/status-badges";
import { DOCS_PATH } from "@/constants";
import { type DocStatus, StatusBadge } from "../components/status-badge";

export const source = loader({
  baseUrl: DOCS_PATH,
  source: docs.toFumadocsSource(),
  plugins: [statusBadgesPlugin({ renderBadge: (status) => <StatusBadge status={status as DocStatus} /> })],
});
