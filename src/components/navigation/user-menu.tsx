"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogOut, UserCircle } from "lucide-react";

interface UserMenuProps {
  username: string;
  roleLabel: string;
}

export function UserMenu({ username, roleLabel }: UserMenuProps) {
  const router = useRouter();

  const initials = username
    .split(".")
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2) || username.slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors outline-none">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-blue-500 text-white text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="text-left">
          <p className="text-sm font-medium text-foreground">{username}</p>
        </div>
        <Badge variant="secondary" className="ml-auto text-xs">
          {roleLabel}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => router.push("/user/profile")}
          className="flex items-center gap-2"
        >
          <UserCircle className="h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
