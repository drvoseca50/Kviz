import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface AppShellProps {
  children: React.ReactNode;
}

export async function AppShell({ children }: AppShellProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const roles = session.user.roles;
  const username = session.user.username;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar roles={roles} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header username={username} roles={roles} />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
