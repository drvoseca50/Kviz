import { AppShell } from "@/components/navigation/app-shell";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
