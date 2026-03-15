"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera } from "lucide-react";

interface UserProfile {
  id: number;
  username: string;
  email: string | null;
  lastNameFirstName: string | null;
  sapId: number;
  phone: string | null;
  imagePath: string | null;
  position: { id: string; name: string } | null;
  organisationalUnit: { id: number; name: string } | null;
  manager: { id: number; username: string; lastNameFirstName: string | null } | null;
  roles: { role: { id: number; name: string } }[];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setLoading(false);
      });
  }, []);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordLoading(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }),
    });

    const data = await res.json();
    setPasswordLoading(false);

    if (!res.ok) {
      setPasswordError(data.error);
      return;
    }

    setPasswordSuccess("Password changed successfully");
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setUploadLoading(false);

    if (res.ok && profile) {
      setProfile({ ...profile, imagePath: data.imagePath });
    }
  }

  if (loading || !profile) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  const initials = profile.username
    .split(".")
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2) || profile.username.slice(0, 2).toUpperCase();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold text-foreground">My Profile</h1>

      {/* Profile Info */}
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <div className="flex items-start gap-6">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.imagePath ?? undefined} />
              <AvatarFallback className="bg-blue-500 text-white text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadLoading}
              className="absolute -bottom-1 -right-1 rounded-full bg-blue-500 p-1.5 text-white hover:bg-blue-600 transition-colors"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h2 className="text-lg font-semibold">
                {profile.lastNameFirstName || profile.username}
              </h2>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
            </div>
            <div className="flex gap-2">
              {profile.roles.map((r) => (
                <Badge key={r.role.id} variant="secondary">
                  {r.role.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Email</span>
            <p className="font-medium">{profile.email || "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">SAP ID</span>
            <p className="font-medium">{profile.sapId}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Phone</span>
            <p className="font-medium">{profile.phone || "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Position</span>
            <p className="font-medium">{profile.position?.name || "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Department</span>
            <p className="font-medium">{profile.organisationalUnit?.name || "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Manager</span>
            <p className="font-medium">
              {profile.manager?.lastNameFirstName || profile.manager?.username || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Change Password</h2>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {passwordError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600">
              {passwordSuccess}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
              required
              placeholder="Min 15 chars, uppercase, lowercase, special"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
              }
              required
              className="h-11"
            />
          </div>

          <Button type="submit" disabled={passwordLoading}>
            {passwordLoading ? "Changing..." : "Change Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
