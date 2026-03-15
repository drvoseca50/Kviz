import { AppShell } from "@/components/navigation/app-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
