import { AppShell } from "@/components/navigation/app-shell";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
