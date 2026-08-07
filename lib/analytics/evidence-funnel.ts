export type EvidenceStatus = "loading" | "ready" | "error";

interface EvidenceViewState {
  status: EvidenceStatus;
  recordCount: number;
  isIntersecting: boolean;
  hasTracked: boolean;
}

export function shouldTrackEvidenceView({
  status,
  recordCount,
  isIntersecting,
  hasTracked,
}: EvidenceViewState): boolean {
  return status === "ready" && recordCount > 0 && isIntersecting && !hasTracked;
}
