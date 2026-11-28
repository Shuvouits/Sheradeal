"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  Package,
  UserRound,
  MapPin,
  Banknote,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";
import { orderRequest, formatMoney } from "./orderUtils";

const initialCustomer = {
  customer_name: "",
  customer_phone: "",
  customer_email: "",
  delivery_address: "",
  shipping_location: "inside_dhaka",
  customer_note: "",
  payment_method: "cod",
};

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[#05714B]";

const cardClass =
  "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm";

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function CreateOrder() {
  const router = useRouter();

  const [customer, setCustomer] = useState(initialCustomer);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateCustomer(name, value) {
    setCustomer((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  useEffect(() => {
    const query = search.trim();

    if (query.length < 2) {
      setProducts([]);
      return;
    }

    let active = true;

    const timer = setTimeout(async () => {
      setSearching(true);

      try {
        const result = await orderRequest(
          `/api/admin/orders/products/search?search=${encodeURIComponent(query)}`
        );

        if (active) {
          setProducts(Array.isArray(result) ? result : []);
        }
      } catch (err) {
        if (active) {
          setProducts([]);
          setError(err.message);
        }
      } finally {
        if (active) setSearching(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search]);

  function addProduct(product) {
    const exists = items.some(
      (item) => item.product_id === product.id && !item.variant_id
    );

    if (exists) {
      setError("This product is already in the order.");
      return;
    }

    const basePrice = Number(product.price ?? 0);
    const specialPrice = Number(product.special_price ?? 0);

    const price =
      specialPrice > 0 && specialPrice < basePrice
        ? specialPrice
        : basePrice;

    setItems((previous) => [
      ...previous,
      {
        product_id: product.id,
        product_name: product.name,
        sku: product.sku || "",
        variant_id: "",
        quantity: 1,
        unit_price: price,
        stock: product.quantity,
      },
    ]);

    setProducts([]);
    setSearch("");
    setError("");
  }

  function updateItem(index, field, value) {
    setItems((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: value }
          : item
      )
    );
  }

  function removeItem(index) {
    setItems((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  const subtotal = items.reduce(
    (total, item) =>
      total +
      Number(item.unit_price || 0) * Number(item.quantity || 0),
    0
  );

  const deliveryCharge =
    customer.shipping_location === "inside_dhaka" ? 80 : 150;

  const estimatedTotal = subtotal + deliveryCharge;

  const totalQuantity = items.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    setError("");
    setSuccess("");

    if (items.length === 0) {
      setError("Please add at least one product.");
      return;
    }

    const orderItems = items.map((item) => ({
      product_id: Number(item.product_id),
      quantity: Number(item.quantity),
      ...(item.variant_id
        ? { variant_id: Number(item.variant_id) }
        : {}),
    }));

    const invalidItem = orderItems.some(
      (item) =>
        !Number.isInteger(item.product_id) ||
        item.product_id < 1 ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 100 ||
        (item.variant_id !== undefined &&
          (!Number.isInteger(item.variant_id) || item.variant_id < 1))
    );

    if (invalidItem) {
      setError("Please enter valid product variants and quantities.");
      return;
    }

    if (!/^01[3-9]\d{8}$/.test(customer.customer_phone)) {
      setError("Please enter a valid 11-digit Bangladeshi mobile number.");
      return;
    }

    if (!window.confirm("Create this Cash on Delivery order?")) {
      return;
    }

    setSaving(true);

    try {
      const result = await orderRequest("/api/admin/orders", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: customer.customer_name.trim(),
          customer_phone: customer.customer_phone.trim(),
          customer_email: customer.customer_email.trim() || null,
          delivery_address: customer.delivery_address.trim(),
          shipping_location: customer.shipping_location,
          customer_note: customer.customer_note.trim() || null,
          payment_method: "cod",
          items: orderItems,
        }),
      });

      if (!result?.id) {
        throw new Error("Order was created, but no order ID was returned.");
      }

      setSuccess(`Order ${result.order_number} created successfully.`);

      router.push(`/admin/orders/${result.id}`);
      router.refresh();
    } catch (err) {
      setError(err.message || "Unable to create order.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/orders"
            className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[#05714B] hover:underline"
          >
            <ArrowLeft size={16} />
            Back to Orders
          </Link>

          <h1 className="text-2xl font-bold text-gray-900">
            Create Order
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create a manual order with Cash on Delivery.
          </p>
        </div>

        <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-[#05714B]">
          New COD Order
        </span>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_350px]">
          <div className="space-y-5">
            <section className={cardClass}>
              <div className="mb-5 flex items-center gap-2">
                <Package size={19} className="text-[#05714B]" />
                <h2 className="text-base font-bold text-gray-900">
                  Products
                </h2>
              </div>

              <div className="relative mb-5">
                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 focus-within:border-[#05714B]">
                  <Search size={18} className="shrink-0 text-gray-400" />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setError("");
                    }}
                    placeholder="Search products by name or SKU..."
                    className="h-12 w-full bg-transparent text-sm text-gray-800 outline-none"
                  />

                  {searching && (
                    <LoaderCircle
                      size={18}
                      className="animate-spin text-[#05714B]"
                    />
                  )}
                </div>

                {search.trim().length >= 2 && !searching && (
                  <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">
                    {products.length === 0 ? (
                      <div className="p-5 text-center text-sm text-gray-500">
                        No matching products.
                      </div>
                    ) : (
                      products.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => addProduct(product)}
                          className="flex w-full items-center justify-between gap-4 border-b border-gray-100 px-4 py-3 text-left last:border-0 hover:bg-green-50"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-800">
                              {product.name}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              SKU: {product.sku || "N/A"}
                            </p>
                          </div>

                          <span className="flex shrink-0 items-center gap-2 text-sm font-semibold text-[#05714B]">
                            {formatMoney(
                              Number(product.special_price) > 0 &&
                              Number(product.special_price) <
                                Number(product.price)
                                ? product.special_price
                                : product.price
                            )}
                            <Plus size={18} />
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-12 text-center">
                  <ShoppingBag size={34} className="text-gray-300" />

                  <p className="mt-3 text-sm font-semibold text-gray-700">
                    No products added yet
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Search above to add products to this order.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div
                      key={`${item.product_id}-${index}`}
                      className="rounded-xl border border-gray-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[#05714B]">
                            <Package size={23} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900">
                              {item.product_name}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              SKU: {item.sku || "N/A"}
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[#05714B]">
                              {formatMoney(item.unit_price)}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                          aria-label="Remove product"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <Field label="Quantity">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            required
                            value={item.quantity}
                            onChange={(event) =>
                              updateItem(
                                index,
                                "quantity",
                                event.target.value
                              )
                            }
                            className={inputClass}
                          />
                        </Field>

                        <Field label="Variant ID (optional)">
                          <input
                            type="number"
                            min="1"
                            value={item.variant_id}
                            onChange={(event) =>
                              updateItem(
                                index,
                                "variant_id",
                                event.target.value
                              )
                            }
                            placeholder="Variant ID"
                            className={inputClass}
                          />
                        </Field>

                        <Field label="Estimated Line Total">
                          <div className="flex min-h-10 items-center rounded-xl bg-gray-50 px-3 text-sm font-bold text-gray-900">
                            {formatMoney(
                              Number(item.unit_price) *
                                Number(item.quantity || 0)
                            )}
                          </div>
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className={cardClass}>
              <div className="mb-5 flex items-center gap-2">
                <UserRound size={19} className="text-[#05714B]" />
                <h2 className="text-base font-bold text-gray-900">
                  Customer Information
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Customer Name *">
                  <input
                    required
                    maxLength={150}
                    value={customer.customer_name}
                    onChange={(event) =>
                      updateCustomer(
                        "customer_name",
                        event.target.value
                      )
                    }
                    className={inputClass}
                    placeholder="Enter customer name"
                  />
                </Field>

                <Field label="Phone Number *">
                  <input
                    required
                    type="tel"
                    pattern="01[3-9][0-9]{8}"
                    value={customer.customer_phone}
                    onChange={(event) =>
                      updateCustomer(
                        "customer_phone",
                        event.target.value
                      )
                    }
                    className={inputClass}
                    placeholder="01XXXXXXXXX"
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Email Address (optional)">
                    <input
                      type="email"
                      value={customer.customer_email}
                      onChange={(event) =>
                        updateCustomer(
                          "customer_email",
                          event.target.value
                        )
                      }
                      className={inputClass}
                      placeholder="customer@example.com"
                    />
                  </Field>
                </div>
              </div>
            </section>

            <section className={cardClass}>
              <div className="mb-5 flex items-center gap-2">
                <MapPin size={19} className="text-[#05714B]" />
                <h2 className="text-base font-bold text-gray-900">
                  Delivery Information
                </h2>
              </div>

              <Field label="Delivery Address *">
                <textarea
                  required
                  rows={3}
                  maxLength={1000}
                  value={customer.delivery_address}
                  onChange={(event) =>
                    updateCustomer(
                      "delivery_address",
                      event.target.value
                    )
                  }
                  className={`${inputClass} resize-y`}
                  placeholder="House, road, area, thana, district"
                />
              </Field>

              <div className="mt-5">
                <p className="mb-3 text-xs font-semibold text-gray-700">
                  Shipping Location *
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      value: "inside_dhaka",
                      label: "Inside Dhaka",
                      price: 80,
                    },
                    {
                      value: "outside_dhaka",
                      label: "Outside Dhaka",
                      price: 150,
                    },
                  ].map((location) => (
                    <label
                      key={location.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
                        customer.shipping_location === location.value
                          ? "border-[#05714B] bg-[#E9F7EF]"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="shipping_location"
                        value={location.value}
                        checked={
                          customer.shipping_location === location.value
                        }
                        onChange={() =>
                          updateCustomer(
                            "shipping_location",
                            location.value
                          )
                        }
                        className="accent-[#05714B]"
                      />

                      <span className="flex-1">
                        <span className="block text-sm font-semibold text-gray-900">
                          {location.label}
                        </span>

                        <span className="mt-1 block text-xs text-[#05714B]">
                          ৳{location.price} Delivery
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <Field label="Order Note (optional)">
                  <textarea
                    rows={3}
                    maxLength={2000}
                    value={customer.customer_note}
                    onChange={(event) =>
                      updateCustomer(
                        "customer_note",
                        event.target.value
                      )
                    }
                    className={`${inputClass} resize-y`}
                    placeholder="Additional delivery instructions..."
                  />
                </Field>
              </div>
            </section>
          </div>

          <div className="space-y-5">
            <section className={`${cardClass} xl:sticky xl:top-6`}>
              <div className="mb-5 flex items-center gap-2">
                <Banknote size={19} className="text-[#05714B]" />
                <h2 className="text-base font-bold text-gray-900">
                  Payment & Summary
                </h2>
              </div>

              <div className="rounded-xl border border-green-200 bg-[#EAF8F0] p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    size={18}
                    className="text-[#05714B]"
                  />

                  <p className="text-sm font-bold text-[#05714B]">
                    Cash on Delivery
                  </p>
                </div>

                <p className="mt-2 text-xs leading-5 text-gray-600">
                  Customer pays cash upon delivery. No card or online
                  payment is required.
                </p>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Products ({totalQuantity})</span>
                  <span className="font-semibold text-gray-900">
                    {formatMoney(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery Charge</span>
                  <span className="font-semibold text-gray-900">
                    {formatMoney(deliveryCharge)}
                  </span>
                </div>

                <div className="flex justify-between border-t border-gray-100 pt-4 text-base font-bold">
                  <span>Total (Estimated)</span>
                  <span className="text-xl text-[#05714B]">
                    {formatMoney(estimatedTotal)}
                  </span>
                </div>
              </div>

              <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                Final price and stock are verified by Laravel when
                creating the order. Check the confirmed amount on the
                Order Details page.
              </p>

              <div className="mt-5 space-y-3">
                <button
                  type="submit"
                  disabled={saving || items.length === 0}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#05714B] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#045B3D] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <LoaderCircle
                        size={18}
                        className="animate-spin"
                      />
                      Creating Order...
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={18} />
                      Create COD Order
                    </>
                  )}
                </button>

                <Link
                  href="/admin/orders"
                  className="flex w-full items-center justify-center rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Link>
              </div>
            </section>
          </div>
        </div>
      </form>
    </div>
  );
}
