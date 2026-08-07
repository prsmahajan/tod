import { redirect } from "next/navigation";
import { PUBLIC_PUBLISHING_REDIRECT_PATH } from "@/lib/public-navigation";

export default function ArticleRedirect() {
  redirect(PUBLIC_PUBLISHING_REDIRECT_PATH);
}
