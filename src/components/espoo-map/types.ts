import type { FlowState } from "@/lib/domain/types";
import type { EspooDistrictName } from "@/lib/geo/espoo";

export type { EspooDistrictName, FlowState };

export interface FlowMapCompany {
  id: string;
  name: string;
  sector: string;
  district: EspooDistrictName;
}

/** One piece of work on its way to a company. Carries a label, never a person. */
export interface FlowMapFlow {
  proofLabel: string;
  companyId: string;
  state: FlowState;
}

/** The event's headline figures, set on the map beside the words "Demo data". */
export interface FlowMapHeadline {
  took: number;
  scored: number;
  talks: number;
  hires: number;
}

export type FlowMapVariant = "hero" | "panel" | "compact";

export interface EspooFlowMapProps {
  companies: FlowMapCompany[];
  flows: FlowMapFlow[];
  /** hero: illustration beside a headline. panel: dashboard panel with legend. compact: small thumbnail. */
  variant?: FlowMapVariant;
  /** The proof to trace: its path draws in the accent colour and the rest dim. */
  highlightProof?: string;
  className?: string;
  /** Dots keep travelling in a gentle loop. Without it each dot makes one trip. */
  live?: boolean;
  /** Figures drawn in a corner of the map. Without it no figures are drawn; never on `compact`. */
  headline?: FlowMapHeadline;
  /** Called when a company's pin is clicked or tapped, so a page can filter by that company. */
  onSelectCompany?: (id: string) => void;
}
