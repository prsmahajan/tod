import { archivedAcquisitionResponse } from "@/lib/public-acquisition";

export async function GET() {
  return archivedAcquisitionResponse();
}
