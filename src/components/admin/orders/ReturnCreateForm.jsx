"use client";

import { useState } from "react";
import { LoaderCircle, Search } from "lucide-react";
import { orderRequest, formatMoney } from "./orderUtils";

const inputStyle =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#05714B]";

export default function ReturnCreateForm({ onCreated }) {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("Damaged product");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function findOrder() {
    if (!orderId || Number(orderId) < 1) return;

    setLoading(true);
    setError("");
    setOrder(null);
    setItemId("");

    try {
      const result = await orderRequest(
        `/api/admin/orders/${orderId}`
      );

      if (
        result.status !== "delivered" ||
        result.payment_status !== "paid"
      ) {
        throw new Error(
          "Only delivered and paid COD orders are eligible for a cash refund."
        );
      }

      setOrder(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    setError("");

    if (!order || !itemId) {
      setError("Select an order item.");
      return;
    }

    setSaving(true);

    try {
      await orderRequest("/api/admin/orders/returns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: order.id,
          order_item_id: Number(itemId),
          quantity: Number(quantity),
          reason,
          note: note || null,
        }),
      });

      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const selectedItem = order?.items?.find(
    (item) => item.id === Number(itemId)
  );

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">
          Create Return Request
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Select an item from a delivered and paid COD order.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <input
          type="number"
          min="1"
          value={orderId}
          onChange={(event) => setOrderId(event.target.value)}
          placeholder="Order ID, e.g. 15"
          className={`${inputStyle} max-w-sm`}
        />

        <button
          type="button"
          onClick={findOrder}
          disabled={loading || !orderId}
          className="inline-flex items-center gap-2 rounded-xl bg-[#05714B] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <Search size={17} />
          )}
          Find Order
        </button>
      </div>

      {order && (
        <>
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="font-semibold text-gray-900">
              {order.order_number}
            </p>

            <p className="mt-1 text-sm text-gray-600">
              {order.customer_name} | {order.customer_phone}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-semibold">
                Return Product *
              </label>

              <select
                required
                value={itemId}
                onChange={(event) => {
                  setItemId(event.target.value);
                  setQuantity(1);
                }}
                className={inputStyle}
              >
                <option value="">Choose an order item</option>

                {order.items?.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.product_name} (Qty: {item.quantity})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold">
                Return Quantity *
              </label>

              <input
                required
                type="number"
                min="1"
                max={selectedItem?.quantity || 1}
                value={quantity}
                onChange={(event) =>
                  setQuantity(event.target.value)
                }
                className={inputStyle}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold">
                Reason *
              </label>

              <select
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className={inputStyle}
              >
                <option>Damaged product</option>
                <option>Wrong product</option>
                <option>Defective product</option>
                <option>Missing parts</option>
                <option>Not as described</option>
                <option>Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-semibold">
                Internal Notes
              </label>

              <textarea
                rows={3}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className={inputStyle}
              />
            </div>
          </div>

          {selectedItem && (
            <div className="rounded-xl bg-[#F0F8F4] p-4">
              <p className="text-sm text-gray-600">
                Estimated Cash Refund
              </p>

              <p className="mt-1 text-xl font-bold text-[#05714B]">
                {formatMoney(
                  Number(selectedItem.unit_price) * Number(quantity || 0)
                )}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                The final amount is calculated and recorded by Laravel.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={saving || !itemId}
            className="rounded-xl bg-[#05714B] px-6 py-3 text-sm font-semibold text-white hover:bg-[#045B3D] disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Return Request"}
          </button>
        </>
      )}
    </form>
  );
}
