"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AuditEntry {
  id: number;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  actor: {
    id: number;
    username: string;
    lastNameFirstName: string | null;
  };
}

interface AuditResponse {
  logs: AuditEntry[];
  total: number;
  page: number;
  limit: number;
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-green-100 text-green-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  UNLOCK_HSE: "bg-amber-100 text-amber-700",
  RESET_PASSWORD: "bg-purple-100 text-purple-700",
  ADD_ROLE: "bg-indigo-100 text-indigo-700",
  REMOVE_ROLE: "bg-orange-100 text-orange-700",
};

export default function AuditLogPage() {
  const [data, setData] = useState<AuditResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterEntity, setFilterEntity] = useState("");
  const [filterAction, setFilterAction] = useState("");

  function loadData(p: number) {
    const params = new URLSearchParams({ page: String(p), limit: "50" });
    if (filterEntity) params.set("entityType", filterEntity);
    if (filterAction) params.set("action", filterAction);

    fetch(`/api/audit-log?${params}`)
      .then((r) => r.json())
      .then((d: AuditResponse) => {
        setData(d);
        setLoading(false);
      });
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadData(page); }, [page, filterEntity, filterAction]);

  if (loading || !data) return <div className="text-muted-foreground">Loading...</div>;

  const totalPages = Math.ceil(data.total / data.limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
        <p className="text-sm text-muted-foreground">
          {data.total} entries total
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filterEntity}
          onChange={(e) => { setFilterEntity(e.target.value); setPage(1); }}
          className="flex h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Entity Types</option>
          <option value="USER_PROFILE">User</option>
          <option value="POSITION">Position</option>
          <option value="ORGANISATIONAL_UNIT">Org Unit</option>
          <option value="HSE_GROUP">HSE Group</option>
          <option value="USER_ROLE">User Role</option>
        </select>
        <select
          value={filterAction}
          onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
          className="flex h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="RESET_PASSWORD">Reset Password</option>
          <option value="UNLOCK_HSE">Unlock HSE</option>
          <option value="ADD_ROLE">Add Role</option>
          <option value="REMOVE_ROLE">Remove Role</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date/Time</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity Type</TableHead>
              <TableHead>Entity ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No audit log entries found
                </TableCell>
              </TableRow>
            ) : (
              data.logs.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(entry.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {entry.actor.lastNameFirstName ?? entry.actor.username}
                  </TableCell>
                  <TableCell>
                    <Badge className={ACTION_COLORS[entry.action] ?? "bg-gray-100 text-gray-700"}>
                      {entry.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{entry.entityType}</TableCell>
                  <TableCell className="text-sm font-mono">{entry.entityId}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
