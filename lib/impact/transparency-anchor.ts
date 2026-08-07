import type { RecordsStatus } from "@/components/impact/FeedingRecordsDisplay";

export function shouldRestoreTransparencyAnchor(
  hash: string,
  status: RecordsStatus,
): boolean {
  return hash === "#transparency" && status !== "loading";
}
