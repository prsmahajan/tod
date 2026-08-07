import { redirect } from "next/navigation";
import { PUBLIC_PUBLISHING_REDIRECT_PATH } from "@/lib/public-navigation";

export async function GET() {
  redirect(PUBLIC_PUBLISHING_REDIRECT_PATH);
}
