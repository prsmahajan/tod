"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  User,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  LogIn,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userEmail: string;
  userRole: string;
  details: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const ACTION_ICONS: Record<string, any> = {
  CREATE: { icon: FileText, color: "text-green-600", bg: "bg-green-100" },
  UPDATE: { icon: Edit, color: "text-blue-600", bg: "bg-blue-100" },
  DELETE: { icon: Trash2, color: "text-red-600", bg: "bg-red-100" },
  PUBLISH: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-100" },
  UNPUBLISH: { icon: XCircle, color: "text-orange-600", bg: "bg-orange-100" },
  APPROVE: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
  REJECT: { icon: XCircle, color: "text-red-600", bg: "bg-red-100" },
  LOGIN: { icon: LogIn, color: "text-indigo-600", bg: "bg-indigo-100" },
  LOGOUT: { icon: LogOut, color: "text-gray-600", bg: "bg-gray-100" },
};

const ENTITY_TYPES = ["Post", "User", "Category", "Animal", "Media"];
const ACTIONS = ["CREATE", "UPDATE", "DELETE", "PUBLISH", "UNPUBLISH", "APPROVE", "REJECT", "LOGIN", "LOGOUT"];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    entityType: "",
    action: "",
  });
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  async function fetchLogs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "25");
      if (filters.entityType) params.set("entityType", filters.entityType);
      if (filters.action) params.set("action", filters.action);

      const res = await fetch(`/api/admin/audit-logs?${params}`);
      const data = await res.json();
      setLogs(data.logs || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  function getActionDetails(log: AuditLog) {
    const details = log.details || {};
    switch (log.action) {
      case "CREATE":
        return `Created ${log.entityType.toLowerCase()}: "${details.title || log.entityId}"`;
      case "UPDATE":
        if (details.action === "version_restore") {
          return `Restored ${log.entityType.toLowerCase()} to version ${details.restoredVersionNumber}`;
        }
        return `Updated ${log.entityType.toLowerCase()}: "${details.title || log.entityId}"`;
      case "DELETE":
        return `Deleted ${log.entityType.toLowerCase()}: "${details.deletedTitle || log.entityId}"`;
      case "PUBLISH":
        return `Published ${log.entityType.toLowerCase()}: "${details.title || log.entityId}"`;
      case "UNPUBLISH":
        return `Unpublished ${log.entityType.toLowerCase()}: "${details.title || log.entityId}"`;
      case "APPROVE":
        return `Approved ${log.entityType.toLowerCase()}: "${details.title || log.entityId}"`;
      case "REJECT":
        return `Rejected ${log.entityType.toLowerCase()}: "${details.title || log.entityId}"`;
      case "LOGIN":
        return `User logged in`;
      case "LOGOUT":
        return `User logged out`;
      default:
        return `${log.action} on ${log.entityType}`;
    }
  }

  const ActionIcon = ({ action }: { action: string }) => {
    const config = ACTION_ICONS[action] || ACTION_ICONS.UPDATE;
    const Icon = config.icon;
    return (
      <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${config.color}`} />
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-gray-600 mt-1">Track all administrative actions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          <select
            value={filters.entityType}
            onChange={(e) => {
              setFilters((f) => ({ ...f, entityType: e.target.value }));
              setPage(1);
            }}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Entity Types</option>
            {ENTITY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <select
            value={filters.action}
            onChange={(e) => {
              setFilters((f) => ({ ...f, action: e.target.value }));
              setPage(1);
            }}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Actions</option>
            {ACTIONS.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
          {(filters.entityType || filters.action) && (
            <button
              onClick={() => {
                setFilters({ entityType: "", action: "" });
                setPage(1);
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No audit logs found</div>
        ) : (
          <div className="divide-y">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <ActionIcon action={log.action} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{getActionDetails(log)}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User size={14} />
                        {log.user?.name || log.userEmail}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">
                        {log.userRole}
                      </span>
                      <span>{formatDate(log.createdAt)}</span>
                    </div>
                    {log.ipAddress && (
                      <p className="text-xs text-gray-400 mt-1">
                        IP: {log.ipAddress}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-xs text-gray-400">
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      {log.entityType}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="border-t p-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} entries
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="px-3 py-1 text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
