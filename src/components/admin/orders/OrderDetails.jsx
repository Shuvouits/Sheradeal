"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  AlertCircle,
  LoaderCircle,
  Package,
  MapPin,
  UserRound,
  Banknote,
  Clock3,
  CheckCircle2,
  MessageSquareText,
} from "lucide-react";
import {
  formatMoney,
  formatDate,
  StatusBadge,
  NEXT_STATUS,
  orderRequest,
} from "./orderUtils";

function DetailCard({ title, icon: Icon, children }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
        <Icon size={18} className="text-[#05714B]" />
        <h2 className="font-bold text-gray-900">{title}</h2>
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

export default function OrderDetails({ orderId }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [note, setNote] = useState("");
  const [revision, setRevision] = useState(0);

  const refresh = useCallback(() => {
    setRevision((value) => value + 1);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      setLoading(true);
      setError("");

      try {
        const result = await orderRequest(
          `/api/admin/orders/${orderId}`
        );

        if (active) setOrder(result);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOrder();

    return () => {
      active = false;
    };
  }, [orderId, revision]);

  async function updateOrder(endpoint, method, body, successMessage) {
    if (busy) return;

    setBusy(true);
    setError("");
    setNotice("");

    try {
      const updated = await orderRequest(
        `/api/admin/orders/${orderId}/${endpoint}`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      setOrder(updated);
      setNotice(successMessage);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function addNote(event) {
    event.preventDefault();

    if (!note.trim()) return;

    const success = await updateOrder(
      "notes",
      "POST",
      { message: note.trim() },
      "Internal note added successfully."
    );

    if (success) setNote("");
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center gap-2 text-gray-500">
        <LoaderCircle size={20} className="animate-spin" />
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <Link
          href="/admin/orders"
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#05714B]"
        >
          <ArrowLeft size={16} />
          Back to Orders
        </Link>

        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error || "Order not found."}
        </p>

        <button
          type="button"
          onClick={refresh}
          className="mt-4 rounded-lg border px-4 py-2 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  const nextStatuses = NEXT_STATUS[order.status] || [];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#05714B] hover:underline"
      >
        <ArrowLeft size={16} />
        All Orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Order {order.order_number}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Placed on {formatDate(order.created_at)}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge value={order.status} />
            <StatusBadge value={order.payment_status} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {nextStatuses.map((status) => (
            <button
              key={status}
              type="button"
              disabled={busy}
              onClick={() =>
                updateOrder(
                  "status",
                  "PATCH",
                  { status },
                  `Order marked as ${status}.`
                )
              }
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50 ${
                status === "cancelled"
                  ? "border border-red-200 bg-white text-red-600 hover:bg-red-50"
                  : "bg-[#05714B] text-white hover:bg-[#045C3D]"
              }`}
            >
              {status === "cancelled"
                ? "Cancel Order"
                : `Mark as ${status.charAt(0).toUpperCase() + status.slice(1)}`}
            </button>
          ))}
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
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          <CheckCircle2 size={18} />
          {notice}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <DetailCard title="Order Items" icon={Package}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="border-b border-gray-100 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="pb-3">Product</th>
                    <th className="pb-3 text-center">Qty</th>
                    <th className="pb-3 text-right">Price</th>
                    <th className="pb-3 text-right">Total</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {(order.items || []).map((item) => (
                    <tr key={item.id}>
                      <td className="py-4 pr-4">
                        <p className="font-semibold text-gray-900">
                          {item.product_name}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          SKU: {item.product_sku || "N/A"}
                        </p>

                        {item.product_variant_id && (
                          <p className="mt-1 text-xs text-gray-500">
                            Variant #{item.product_variant_id}
                          </p>
                        )}
                      </td>

                      <td className="py-4 text-center text-gray-700">
                        {item.quantity}
                      </td>

                      <td className="py-4 text-right text-gray-700">
                        {formatMoney(item.unit_price)}
                      </td>

                      <td className="py-4 text-right font-semibold text-gray-900">
                        {formatMoney(item.line_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DetailCard>

          <DetailCard title="Order Summary" icon={Banknote}>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatMoney(order.subtotal)}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Discount</span>
                <span>-{formatMoney(order.discount_total)}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge</span>
                <span>{formatMoney(order.delivery_charge)}</span>
              </div>

              <div className="flex justify-between border-t border-gray-100 pt-4 text-base font-bold text-gray-900">
                <span>Total Payable</span>
                <span className="text-[#05714B]">
                  {formatMoney(order.grand_total)}
                </span>
              </div>
            </div>
          </DetailCard>

          <DetailCard title="Order Timeline" icon={Clock3}>
            <div className="space-y-5">
              {(order.timeline || []).map((entry) => (
                <div key={entry.id} className="flex gap-3">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF5EF] text-[#05714B]">
                    <Clock3 size={15} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {entry.message}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {formatDate(entry.created_at)}
                    </p>
                  </div>
                </div>
              ))}

              {!order.timeline?.length && (
                <p className="text-sm text-gray-500">
                  No timeline entries yet.
                </p>
              )}
            </div>

            <form onSubmit={addNote} className="mt-6 border-t border-gray-100 pt-5">
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <MessageSquareText size={16} />
                Add Internal Note
              </label>

              <textarea
                rows={3}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Write an internal order note..."
                className="w-full resize-y rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-[#05714B]"
              />

              <button
                type="submit"
                disabled={busy || !note.trim()}
                className="mt-3 rounded-xl bg-[#05714B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#045C3D] disabled:opacity-50"
              >
                {busy ? "Saving..." : "Add Note"}
              </button>
            </form>
          </DetailCard>
        </div>

        <div className="space-y-5">
          <DetailCard title="Customer" icon={UserRound}>
            <p className="font-semibold text-gray-900">
              {order.customer_name}
            </p>

            <p className="mt-2 text-sm text-gray-600">
              {order.customer_phone}
            </p>

            <p className="mt-1 break-all text-sm text-gray-600">
              {order.customer_email || "No email provided"}
            </p>
          </DetailCard>

          <DetailCard title="Delivery Details" icon={MapPin}>
            <p className="text-sm font-medium capitalize text-gray-800">
              {(order.shipping_location || "").replaceAll("_", " ")}
            </p>

            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-600">
              {order.delivery_address}
            </p>

            {order.customer_note && (
              <div className="mt-4 rounded-xl bg-gray-50 p-3">
                <p className="text-xs font-semibold text-gray-500">
                  Customer Note
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  {order.customer_note}
                </p>
              </div>
            )}
          </DetailCard>

          <DetailCard title="COD Payment" icon={Banknote}>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-900">
                Cash on Delivery
              </p>

              <StatusBadge value={order.payment_status} />

              <p className="text-2xl font-bold text-[#05714B]">
                {formatMoney(order.grand_total)}
              </p>

              {order.paid_at && (
                <p className="text-xs text-gray-500">
                  Received: {formatDate(order.paid_at)}
                </p>
              )}

              {order.status === "delivered" &&
                order.payment_status === "unpaid" && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      updateOrder(
                        "payment",
                        "PATCH",
                        {},
                        "COD payment confirmed successfully."
                      )
                    }
                    className="w-full rounded-xl bg-[#05714B] px-4 py-3 text-sm font-semibold text-white hover:bg-[#045C3D] disabled:opacity-50"
                  >
                    {busy ? "Processing..." : "Confirm Cash Received"}
                  </button>
                )}

              {order.status !== "delivered" &&
                order.payment_status === "unpaid" && (
                  <p className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-700">
                    COD payment can be confirmed after the order is delivered.
                  </p>
                )}

              {order.payment_status === "paid" && (
                <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                  <CheckCircle2 size={17} />
                  Payment collected
                </p>
              )}
            </div>
          </DetailCard>
        </div>
      </div>
    </div>
  );
}
