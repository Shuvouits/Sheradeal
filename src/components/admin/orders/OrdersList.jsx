"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Clock3,
  BadgeCheck,
  Banknote,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";
import {
  formatMoney,
  formatDate,
  StatusBadge,
  ORDER_STATUSES,
  orderRequest,
} from "./orderUtils";

const statsCards = [
  {
    key: "total_orders",
    label: "Total Orders",
    icon: ShoppingBag,
    note: "All customer orders",
  },
  {
    key: "open_orders",
    label: "Open Orders",
    icon: Clock3,
    note: "Waiting for completion",
  },
  {
    key: "paid_orders",
    label: "Paid Orders",
    icon: BadgeCheck,
    note: "COD payments collected",
  },
  {
    key: "total_revenue",
    label: "Collected Revenue",
    icon: Banknote,
    note: "Received COD payments",
    money: true,
  },
];

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  const refresh = useCallback(() => {
    setRevision((value) => value + 1);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(page),
        per_page: "20",
      });

      if (search) params.set("search", search);
      if (status) params.set("status", status);
      if (paymentStatus) {
        params.set("payment_status", paymentStatus);
      }

      try {
        const [listing, summary] = await Promise.all([
          orderRequest(`/api/admin/orders?${params}`),
          orderRequest("/api/admin/orders/statistics"),
        ]);

        if (!active) return;

        setOrders(Array.isArray(listing?.data) ? listing.data : []);
        setPage(Number(listing?.current_page || page));
        setLastPage(Number(listing?.last_page || 1));
        setTotal(Number(listing?.total || 0));
        setStats(summary);
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load orders.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOrders();

    return () => {
      active = false;
    };
  }, [search, status, paymentStatus, page, revision]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Orders
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage customer orders and Cash on Delivery payments.
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsCards.map(({ key, label, icon: Icon, note, money }) => (
          <div
            key={key}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                {label}
              </span>

              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF5EF] text-[#05714B]">
                <Icon size={19} />
              </span>
            </div>

            <p className="mt-4 text-2xl font-bold text-gray-900">
              {stats
                ? money
                  ? formatMoney(stats[key])
                  : Number(stats[key] || 0).toLocaleString("en-BD")
                : "—"}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {note}
            </p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <h2 className="text-base font-bold text-gray-900">
            All Orders
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 focus-within:border-[#05714B]">
              <Search size={17} className="text-gray-400" />

              <input
                type="search"
                placeholder="Search order, customer or phone"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
            </div>

            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#05714B]"
            >
              <option value="">All Statuses</option>
              {ORDER_STATUSES.map((value) => (
                <option value={value} key={value}>
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={paymentStatus}
              onChange={(event) => {
                setPaymentStatus(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#05714B]"
            >
              <option value="">All Payments</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mx-5 mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <AlertCircle size={17} />
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="bg-[#F8FAF9] text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-4">Order</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Total</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Payment</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="inline-flex items-center gap-2 text-gray-500">
                      <LoaderCircle
                        size={19}
                        className="animate-spin"
                      />
                      Loading orders...
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-16 text-center text-gray-500"
                  >
                    <ShoppingBag
                      size={32}
                      className="mx-auto mb-3 text-gray-300"
                    />
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-bold text-[#05714B] hover:underline"
                      >
                        {order.order_number}
                      </Link>
                      <p className="mt-1 text-xs capitalize text-gray-400">
                        {order.source || "website"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">
                        {order.customer_name}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {order.customer_phone}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {formatDate(order.created_at)}
                    </td>

                    <td className="px-5 py-4 font-semibold text-gray-900">
                      {formatMoney(order.grand_total)}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge value={order.status} />
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge value={order.payment_status} />
                      <p className="mt-1 text-xs text-gray-400">
                        Cash on Delivery
                      </p>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 font-semibold text-gray-600 hover:border-[#05714B] hover:text-[#05714B]"
                      >
                        <Eye size={15} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
          <p className="text-xs text-gray-500">
            {total.toLocaleString("en-BD")} total orders
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={loading || page <= 1}
              className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft size={17} />
            </button>

            <span className="text-xs font-medium text-gray-600">
              Page {page} of {lastPage}
            </span>

            <button
              type="button"
              onClick={() => setPage((value) => Math.min(lastPage, value + 1))}
              disabled={loading || page >= lastPage}
              className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
