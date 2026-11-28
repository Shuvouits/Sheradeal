"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Plus,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";
import {
  orderRequest,
  formatMoney,
  formatDate,
  StatusBadge,
} from "./orderUtils";
import WorkflowCreateForm from "./WorkflowCreateForm";
import ReturnCreateForm from "./ReturnCreateForm";

const settings = {
  preorders: {
    title: "Pre-orders",
    description: "Manage future orders and release stock-ready orders.",
    number: "preorder_number",
    statuses: ["pending", "released", "cancelled"],
  },
  returns: {
    title: "Returns & Refunds",
    description: "Review returns, restock items and record cash refunds.",
    number: "return_number",
    statuses: [
      "requested",
      "approved",
      "received",
      "refunded",
      "rejected",
    ],
  },
  quotes: {
    title: "Quotes",
    description: "Prepare quotations and convert accepted quotes to COD orders.",
    number: "quote_number",
    statuses: [
      "draft",
      "sent",
      "accepted",
      "converted",
      "rejected",
      "cancelled",
    ],
  },
  abandoned: {
    title: "Abandoned Checkouts",
    description: "Review consent-based incomplete checkout records.",
    number: "id",
    statuses: ["open", "archived"],
  },
};

const nextActions = {
  preorders: {
    pending: [
      { label: "Release as COD Order", action: "release" },
      { label: "Cancel", action: "cancel" },
    ],
  },
  returns: {
    requested: [
      { label: "Approve", action: "approved" },
      { label: "Reject", action: "rejected" },
    ],
    approved: [
      { label: "Record Items Received", action: "received" },
    ],
    received: [
      { label: "Record Cash Refunded", action: "refunded" },
    ],
  },
  quotes: {
    draft: [{ label: "Mark Sent", action: "sent" }],
    sent: [
      { label: "Accept", action: "accepted" },
      { label: "Reject", action: "rejected" },
      { label: "Cancel", action: "cancelled" },
    ],
    accepted: [{ label: "Convert to COD Order", action: "convert" }],
  },
  abandoned: {
    open: [{ label: "Archive", action: "archive" }],
  },
};

export default function OrderWorkspace({ type }) {
  const config = settings[type];
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [revision, setRevision] = useState(0);
  const [showCreate, setShowCreate] = useState(false);

  const refresh = useCallback(() => {
    setRevision((value) => value + 1);
  }, []);

  useEffect(() => {
    setPage(1);
    setStatus("");
    setSearch("");
    setShowCreate(false);
  }, [type]);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: String(page),
          per_page: "20",
        });

        if (search.trim()) params.set("search", search.trim());
        if (status) params.set("status", status);

        const result = await orderRequest(
          `/api/admin/orders/${type}?${params.toString()}`
        );

        if (!active) return;

        setRecords(Array.isArray(result?.data) ? result.data : []);
        setLastPage(Number(result?.last_page || 1));
        setTotal(Number(result?.total || 0));
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [type, page, search, status, revision]);

  async function performAction(record, action) {
    if (busyId !== null) return;

    const needsConfirmation = [
      "refunded",
      "received",
      "release",
      "convert",
      "cancel",
      "cancelled",
      "rejected",
    ].includes(action);

    if (
      needsConfirmation &&
      !window.confirm(`Confirm action: ${action}?`)
    ) {
      return;
    }

    setBusyId(record.id);
    setError("");
    setNotice("");

    try {
      let url = `/api/admin/orders/${type}/${record.id}`;
      let method = "PATCH";
      let body = { status: action };

      if (type === "preorders") {
        url += `/${action}`;
        method = "POST";
        body = {};
      }

      if (type === "quotes" && action === "convert") {
        url += "/convert";
        method = "POST";
        body = {};
      }

      if (type === "abandoned") {
        url += "/archive";
        method = "POST";
        body = {};
      }

      await orderRequest(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      setNotice("Record updated successfully.");
      refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  function recordNumber(record) {
    return type === "abandoned"
      ? `CHK-${String(record.id).padStart(6, "0")}`
      : record[config.number];
  }

  function amount(record) {
    if (type === "returns") return record.refund_amount;
    if (type === "abandoned") return null;
    return record.total;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {config.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {config.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          {type !== "abandoned" && (
            <button
              type="button"
              onClick={() => setShowCreate((value) => !value)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#05714B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#045B3D]"
            >
              <Plus size={17} />
              {showCreate ? "Close Form" : `Create ${type === "returns" ? "Return" : type === "quotes" ? "Quote" : "Pre-order"}`}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {notice && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {notice}
        </div>
      )}

      {showCreate && type !== "abandoned" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          {type === "returns" ? (
            <ReturnCreateForm
              onCreated={() => {
                setShowCreate(false);
                setNotice("Return request created.");
                refresh();
              }}
            />
          ) : (
            <WorkflowCreateForm
              type={type}
              onCreated={() => {
                setShowCreate(false);
                setNotice("Record created successfully.");
                refresh();
              }}
            />
          )}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ClipboardList size={18} className="text-[#05714B]" />
              <h2 className="font-bold text-gray-900">
                {config.title} List
              </h2>
            </div>
            <span className="text-xs text-gray-500">
              {total} records
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 focus-within:border-[#05714B]">
              <Search size={17} className="text-gray-400" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search records..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
            </div>

            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
            >
              <option value="">All Statuses</option>
              {config.statuses.map((value) => (
                <option key={value} value={value}>
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4">Reference</th>
                <th className="px-5 py-4">Customer / Order</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <LoaderCircle
                      size={22}
                      className="mx-auto animate-spin text-[#05714B]"
                    />
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-16 text-center text-gray-500"
                  >
                    No records found.
                  </td>
                </tr>
              ) : (
                records.map((record) => {
                  const actions =
                    nextActions[type][record.status] || [];

                  return (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 font-semibold text-[#05714B]">
                        {recordNumber(record)}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">
                          {type === "returns"
                            ? `Order #${record.order_id}`
                            : record.customer_name || "Customer"}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {record.customer_phone ||
                            (type === "returns"
                              ? record.reason
                              : "Not provided")}
                        </p>

                        {record.order_id && type !== "returns" && (
                          <Link
                            href={`/admin/orders/${record.order_id}`}
                            className="mt-1 inline-block text-xs text-[#05714B] hover:underline"
                          >
                            View linked order
                          </Link>
                        )}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {formatDate(record.created_at)}
                      </td>

                      <td className="px-5 py-4 font-semibold text-gray-900">
                        {amount(record) === null
                          ? "—"
                          : formatMoney(amount(record))}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge value={record.status} />
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          {actions.map((action) => (
                            <button
                              type="button"
                              key={action.action}
                              disabled={busyId !== null}
                              onClick={() =>
                                performAction(record, action.action)
                              }
                              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-[#05714B] hover:border-[#05714B] disabled:opacity-50"
                            >
                              {busyId === record.id
                                ? "Working..."
                                : action.label}
                            </button>
                          ))}

                          {actions.length === 0 && (
                            <span className="text-xs text-gray-400">
                              No actions
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
          <span className="text-xs text-gray-500">
            Page {page} of {lastPage}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 1 || loading}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-lg border border-gray-200 p-2 disabled:opacity-40"
            >
              <ChevronLeft size={17} />
            </button>

            <button
              type="button"
              disabled={page >= lastPage || loading}
              onClick={() =>
                setPage((value) => Math.min(lastPage, value + 1))
              }
              className="rounded-lg border border-gray-200 p-2 disabled:opacity-40"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
