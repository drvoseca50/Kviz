"use client";

import { UserMenu } from "./user-menu";
import { getNavItemsForRole } from "./nav-items";

interface HeaderProps {
  username: string;
  roles: string[];
}

export function Header({ username, roles }: HeaderProps) {
  const { roleLabel } = getNavItemsForRole(roles);

  return (
    <header className="flex h-16 items-center justify-end border-b border-border bg-white px-6">
      <UserMenu username={username} roleLabel={roleLabel} />
    </header>
  );
}
