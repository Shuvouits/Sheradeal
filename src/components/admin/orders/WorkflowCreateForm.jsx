"use client";

import { useState } from "react";
import { LoaderCircle, Plus, Trash2, Search } from "lucide-react";
import { orderRequest, formatMoney } from "./orderUtils";

const inputStyle =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#05714B]";

export default function WorkflowCreateForm({ type, onCreated }) {
  const isPreorder = type === "preorders";

  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    delivery_address: "",
    shipping_location: "inside_dhaka",
    note: "",
    expected_date: "",
    expires_at: "",
  });

  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(name, value) {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function searchProducts(event) {
    event.preventDefault();

    if (query.trim().length < 2) return;

    setSearching(true);
    setError("");

    try {
      const list = await orderRequest(
        `/api/admin/orders/products/search?search=${encodeURIComponent(query.trim())}`
      );

      setResults(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  }

  function addProduct(product) {
    if (items.some((item) => item.product_id === product.id)) {
      setError("This product is already selected.");
      return;
    }

    setItems((previous) => [
      ...previous,
      {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        variant_id: "",
        display_price: Number(
          product.special_price || product.price || 0
        ),
      },
    ]);

    setResults([]);
    setQuery("");
    setError("");
  }

  function updateItem(index, name, value) {
    setItems((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [name]: value }
          : item
      )
    );
  }

  function removeItem(index) {
    setItems((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  async function submit(event) {
    event.preventDefault();
    setError("");

    if (items.length === 0) {
      setError("Add at least one product.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        customer_email: form.customer_email || null,
        delivery_address: form.delivery_address,
        shipping_location: form.shipping_location,
        note: form.note || null,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: Number(item.quantity),
          ...(item.variant_id
            ? { variant_id: Number(item.variant_id) }
            : {}),
        })),
        ...(isPreorder
          ? { expected_date: form.expected_date }
          : { expires_at: form.expires_at || null }),
      };

      await orderRequest(`/api/admin/orders/${type}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const previewSubtotal = items.reduce(
    (total, item) =>
      total + item.display_price * Number(item.quantity || 0),
    0
  );

  const delivery = form.shipping_location === "inside_dhaka"
    ? 80
    : 150;

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">
          {isPreorder ? "Create Pre-order" : "Create Quotation"}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Select products and enter customer information.
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

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Search Products
        </label>

        <div className="flex gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Product name or SKU"
            className={inputStyle}
          />

          <button
            type="button"
            disabled={searching || query.trim().length < 2}
            onClick={searchProducts}
            className="inline-flex items-center gap-2 rounded-xl bg-[#05714B] px-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Search size={17} />
            Search
          </button>
        </div>

        {results.length > 0 && (
          <div className="mt-2 divide-y divide-gray-100 rounded-xl border border-gray-200">
            {results.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => addProduct(product)}
                className="flex w-full items-center justify-between gap-3 p-3 text-left hover:bg-green-50"
              >
                <span>
                  <span className="block text-sm font-semibold">
                    {product.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    SKU: {product.sku || "N/A"}
                  </span>
                </span>

                <span className="flex shrink-0 items-center gap-2 text-sm font-semibold text-[#05714B]">
                  {formatMoney(product.special_price || product.price)}
                  <Plus size={17} />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">
          Selected Products
        </h3>

        {items.length === 0 && (
          <p className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
            No products selected.
          </p>
        )}

        {items.map((item, index) => (
          <div
            key={`${item.product_id}-${index}`}
            className="grid gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 sm:grid-cols-[minmax(0,1fr)_90px_125px_36px]"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {item.product_name}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Product #{item.product_id}
              </p>
            </div>

            <input
              type="number"
              min="1"
              max="100"
              required
              value={item.quantity}
              onChange={(event) =>
                updateItem(index, "quantity", event.target.value)
              }
              className={inputStyle}
              aria-label="Quantity"
            />

            <input
              type="number"
              min="1"
              value={item.variant_id}
              onChange={(event) =>
                updateItem(index, "variant_id", event.target.value)
              }
              placeholder="Variant ID"
              className={inputStyle}
              aria-label="Variant ID"
            />

            <button
              type="button"
              onClick={() => removeItem(index)}
              className="text-red-500"
              aria-label="Remove product"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold">
            Customer Name *
          </label>
          <input
            required
            value={form.customer_name}
            onChange={(event) => update("customer_name", event.target.value)}
            className={inputStyle}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold">
            Phone Number *
          </label>
          <input
            required
            type="tel"
            pattern="01[3-9][0-9]{8}"
            value={form.customer_phone}
            onChange={(event) => update("customer_phone", event.target.value)}
            className={inputStyle}
            placeholder="01XXXXXXXXX"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold">
            Email
          </label>
          <input
            type="email"
            value={form.customer_email}
            onChange={(event) => update("customer_email", event.target.value)}
            className={inputStyle}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold">
            Shipping Location
          </label>
          <select
            value={form.shipping_location}
            onChange={(event) =>
              update("shipping_location", event.target.value)
            }
            className={inputStyle}
          >
            <option value="inside_dhaka">Inside Dhaka (৳80)</option>
            <option value="outside_dhaka">Outside Dhaka (৳150)</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-semibold">
            Delivery Address *
          </label>
          <textarea
            required
            rows={2}
            value={form.delivery_address}
            onChange={(event) =>
              update("delivery_address", event.target.value)
            }
            className={inputStyle}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold">
            {isPreorder ? "Expected Date *" : "Quote Expiry"}
          </label>
          <input
            required={isPreorder}
            type={isPreorder ? "date" : "datetime-local"}
            min={isPreorder ? new Date().toLocaleDateString("en-CA") : undefined}
            value={
              isPreorder
                ? form.expected_date
                : form.expires_at
            }
            onChange={(event) =>
              update(
                isPreorder ? "expected_date" : "expires_at",
                event.target.value
              )
            }
            className={inputStyle}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold">
            Notes
          </label>
          <textarea
            rows={2}
            value={form.note}
            onChange={(event) => update("note", event.target.value)}
            className={inputStyle}
          />
        </div>
      </div>

      <div className="rounded-xl bg-[#F0F8F4] p-4">
        <div className="flex justify-between text-sm">
          <span>Estimated Product Total</span>
          <strong>{formatMoney(previewSubtotal)}</strong>
        </div>

        <div className="mt-2 flex justify-between text-sm">
          <span>Delivery Charge</span>
          <strong>{formatMoney(delivery)}</strong>
        </div>

        <div className="mt-3 flex justify-between border-t border-green-200 pt-3 font-bold text-[#05714B]">
          <span>Estimated Total</span>
          <span>{formatMoney(previewSubtotal + delivery)}</span>
        </div>

        <p className="mt-2 text-xs text-gray-500">
          Final price is recalculated by Laravel. No card payment.
        </p>
      </div>

      <button
        type="submit"
        disabled={saving || items.length === 0}
        className="inline-flex items-center gap-2 rounded-xl bg-[#05714B] px-6 py-3 text-sm font-semibold text-white hover:bg-[#045B3D] disabled:opacity-50"
      >
        {saving && <LoaderCircle size={17} className="animate-spin" />}
        {saving ? "Saving..." : isPreorder ? "Create Pre-order" : "Save Quotation"}
      </button>
    </form>
  );
}
