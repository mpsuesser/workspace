export interface PiCompactorsCompactionDetails {
  compactor: "pi-compactors";
  mode: "compact-vcc" | "compact-meat";
  version: number;
  sections: string[];
  sourceMessageCount: number;
  previousSummaryUsed: boolean;
}
