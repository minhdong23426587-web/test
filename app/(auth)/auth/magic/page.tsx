import { redirect } from "next/navigation";
import { verifyMagicLink } from "./actions";

export default async function MagicLinkPage({ searchParams }: { searchParams: { t?: string } }) {
  const token = searchParams.t;
  if (!token) {
    redirect("/login?error=missing-token");
  }

  await verifyMagicLink(token);
}
