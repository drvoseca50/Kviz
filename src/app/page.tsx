import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDefaultRedirect } from "@/components/navigation/nav-items";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  redirect(getDefaultRedirect(session.user.roles));
}
