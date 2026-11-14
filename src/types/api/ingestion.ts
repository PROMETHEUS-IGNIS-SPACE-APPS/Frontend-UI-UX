import type { Observation } from './observations';

export interface IngestionMetadata {
  source?: string;
  fetchedAtUtc?: string;
  from?: string;
  to?: string;
  region?: string;
  rawCount?: number;
  deduplicatedCount?: number;
  ideamRawCount?: number;
  firmsRawCount?: number;
  filesLoaded?: string[];
  feedsLoaded?: string[];
  attribution?: string;
  [key: string]: unknown;
}

export interface IngestionResponse {
  ok: boolean;
  cached?: boolean;
  degradedMode?: boolean;
  warning?: string | null;
  metadata?: IngestionMetadata;
  source?: string;
  count?: number;
  observations: Observation[];
}
