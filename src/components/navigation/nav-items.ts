import {
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  BookOpen,
  HelpCircle,
  FileText,
  GraduationCap,
  Bell,
  ClipboardList,
  UserCircle,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const adminNavItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Positions", href: "/admin/positions", icon: Briefcase },
  { label: "Departments", href: "/admin/organisational-units", icon: Building2 },
  { label: "HSE Lockout", href: "/admin/lockout-management", icon: ShieldAlert },
  { label: "Competencies", href: "/admin/competencies", icon: BookOpen },
  { label: "Questions", href: "/admin/questions", icon: HelpCircle },
  { label: "Tests", href: "/admin/tests", icon: FileText },
  { label: "Courses", href: "/admin/courses", icon: GraduationCap },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Audit Log", href: "/admin/audit-log", icon: ClipboardList },
];

export const managerNavItems: NavItem[] = [
  { label: "Dashboard", href: "/manager/dashboard", icon: LayoutDashboard },
  { label: "Employees", href: "/manager/employees", icon: Users },
  { label: "HSE Lockout", href: "/manager/lockout-management", icon: ShieldAlert },
  { label: "Competencies", href: "/manager/competencies", icon: BookOpen },
  { label: "Questions", href: "/manager/questions", icon: HelpCircle },
  { label: "Tests", href: "/manager/tests", icon: FileText },
  { label: "Courses", href: "/manager/courses", icon: GraduationCap },
  { label: "Notifications", href: "/manager/notifications", icon: Bell },
];

export const userNavItems: NavItem[] = [
  { label: "Dashboard", href: "/user/dashboard", icon: LayoutDashboard },
  { label: "My Tests", href: "/user/tests", icon: FileText },
  { label: "My Courses", href: "/user/courses", icon: GraduationCap },
  { label: "Profile", href: "/user/profile", icon: UserCircle },
];

export function getNavItemsForRole(roles: string[]): { items: NavItem[]; roleLabel: string } {
  if (roles.includes("ADMIN")) {
    return { items: adminNavItems, roleLabel: "Admin" };
  }
  if (roles.includes("MANAGER")) {
    return { items: managerNavItems, roleLabel: "Manager" };
  }
  return { items: userNavItems, roleLabel: "User" };
}

export function getDefaultRedirect(roles: string[]): string {
  if (roles.includes("ADMIN")) return "/admin/dashboard";
  if (roles.includes("MANAGER")) return "/manager/dashboard";
  return "/user/dashboard";
}
