"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  ReceiptText,
  Truck,
  CheckCircle2,
  ShoppingBag,
  ArrowLeft,
  Package,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import {
  CHECKOUT_STORAGE_KEY,
  formatBDT,
  getBuyNowItem,
  SHIPPING_RATES,
} from "./checkoutUtils";

import {
  CART_CHECKOUT_KEY,
  clearCart,
} from "@/lib/cartStore";

const INPUT_CLASS =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 outline-none focus:border-[#05714B] focus:ring-2 focus:ring-emerald-100 placeholder:text-gray-400";

function loadCheckoutItems() {
  try {
    const source = sessionStorage.getItem(
      "sheradeal_checkout_source"
    );

    if (source === "cart") {
      const parsed = JSON.parse(
        sessionStorage.getItem(CART_CHECKOUT_KEY) || "[]"
      );

      return Array.isArray(parsed)
        ? parsed.filter(
            (item) =>
              Number(item?.id) > 0 &&
              Number(item.quantity) > 0
          )
        : [];
    }

    const buyNow = getBuyNowItem();

    if (!buyNow) return [];

    return [
      {
        ...buyNow.product,
        quantity: buyNow.quantity,
      },
    ];
  } catch {
    return [];
  }
}

function CheckoutCard({ title, icon: Icon, children }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <Icon size={19} className="text-[#05714B]" />

        <h2 className="text-[17px] font-bold text-gray-950">
          {title}
        </h2>
      </div>

      {children}
    </section>
  );
}

export default function CheckoutPage() {
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });

  const [shippingLocation, setShippingLocation] = useState("dhaka");
  const [error, setError] = useState("");

  useEffect(() => {
    setItems(loadCheckoutItems());
    setLoading(false);

    const controller = new AbortController();

    async function loadCustomer() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
          credentials: "same-origin",
          signal: controller.signal,
        });

        if (!response.ok) return;

        const result = await response.json();

        const user =
          result.user ||
          result.data?.user ||
          result.data;

        if (!user?.id || controller.signal.aborted) return;

        setCustomer((previous) => ({
          ...previous,
          name: user.name || "",
          phone: user.phone || "",
          address: user.delivery_address || "",
        }));
      } catch {
        // Guest checkout is supported.
      }
    }

    loadCustomer();

    return () => controller.abort();
  }, []);

  const totalQuantity = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const originalTotal = items.reduce(
    (sum, item) =>
      sum +
      Number(item.original_price ?? item.price ?? 0) *
        Number(item.quantity || 0),
    0
  );

  const subtotal = items.reduce(
    (sum, item) =>
      sum +
      Number(item.selling_price ?? item.price ?? 0) *
        Number(item.quantity || 0),
    0
  );

  const discount = Math.max(0, originalTotal - subtotal);
  const shipping = SHIPPING_RATES[shippingLocation] ?? 80;
  const total = subtotal + shipping;

  function updateCustomer(field, value) {
    setCustomer((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) return;

    setError("");

    if (customer.name.trim().length < 2) {
      setError("সম্পূর্ণ নাম লিখুন।");
      return;
    }

    if (!/^01[3-9]\d{8}$/.test(customer.phone.trim())) {
      setError("সঠিক ১১ সংখ্যার মোবাইল নম্বর লিখুন।");
      return;
    }

    if (customer.address.trim().length < 8) {
      setError("সম্পূর্ণ Delivery Address লিখুন।");
      return;
    }

    if (items.length === 0) {
      setError("আপনার Checkout-এ কোনো Product নেই।");
      return;
    }

    const orderItems = items.map((item) => {
      const productId = Number(item.product_id ?? item.id);
      const quantity = Number(item.quantity);
      const variantId = item.variant_id ?? null;

      return {
        product_id: productId,
        quantity,
        ...(variantId
          ? { variant_id: Number(variantId) }
          : {}),
      };
    });

    const hasInvalidItem = orderItems.some(
      (item) =>
        !Number.isInteger(item.product_id) ||
        item.product_id < 1 ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 100 ||
        (item.variant_id !== undefined &&
          (!Number.isInteger(item.variant_id) ||
            item.variant_id < 1))
    );

    if (hasInvalidItem) {
      setError("Cart-এর Product বা Quantity সঠিক নয়।");
      return;
    }

    const payload = {
      customer_name: customer.name.trim(),
      customer_phone: customer.phone.trim(),
      delivery_address: customer.address.trim(),
      customer_note: customer.note.trim() || null,
      shipping_location:
        shippingLocation === "dhaka"
          ? "inside_dhaka"
          : "outside_dhaka",
      payment_method: "cod",
      items: orderItems,
    };

    setSubmitting(true);

    try {
      const response = await fetch("/api/storefront/checkout", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        const validationError = result?.errors
          ? Object.values(result.errors).flat()[0]
          : null;

        throw new Error(
          validationError ||
            result?.message ||
            "Order তৈরি করা যায়নি।"
        );
      }

      const order = result.data;

      if (!order?.id || !order?.order_number) {
        throw new Error(
          "Order response incomplete. Check your orders before retrying."
        );
      }

      const confirmation = {
        id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        delivery_address: order.delivery_address,
        shipping_location: order.shipping_location,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        status: order.status,
        subtotal: order.subtotal,
        discount_total: order.discount_total,
        delivery_charge: order.delivery_charge,
        grand_total: order.grand_total,
        created_at: order.created_at,
      };

      sessionStorage.setItem(
        "sheradeal_last_order",
        JSON.stringify(confirmation)
      );

      const source = sessionStorage.getItem(
        "sheradeal_checkout_source"
      );

      if (source === "cart") {
        clearCart();
      }

      sessionStorage.removeItem(CART_CHECKOUT_KEY);
      sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
      sessionStorage.removeItem("sheradeal_checkout_source");

      router.replace("/checkout/success");
    } catch (err) {
      setError(
        err.message ||
          "Order-এর অবস্থা নিশ্চিত করা যাচ্ছে না। পুনরায় চেষ্টা করার আগে Order যাচাই করুন।"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <LoaderCircle
          size={28}
          className="animate-spin text-[#05714B]"
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <main className="flex min-h-[55vh] flex-col items-center justify-center px-4 text-center">
        <ShoppingBag size={48} className="text-gray-300" />

        <h1 className="mt-5 text-2xl font-bold">
          No checkout items found
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Add products to your cart to continue.
        </p>

        <Link
          href="/products"
          className="mt-5 rounded-lg bg-[#05714B] px-5 py-3 text-sm font-semibold text-white"
        >
          Browse Products
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh] bg-[#FCFDFC] px-4 py-8 pb-24 lg:pb-10">
      <div className="mx-auto max-w-[1120px]">
        <div className="mb-5 flex items-center gap-3">
          <Link
            href="/cart"
            className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:text-[#05714B]"
          >
            <ArrowLeft size={19} />
          </Link>

          <h1 className="text-2xl font-bold text-gray-950">
            Checkout
          </h1>
        </div>

        <form
          id="sheradeal-checkout-form"
          onSubmit={handleSubmit}
          className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]"
        >
          <div className="space-y-4">
            <CheckoutCard title="Delivery Details" icon={MapPin}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium">
                    Name (নাম)
                  </label>

                  <input
                    required
                    value={customer.name}
                    onChange={(event) =>
                      updateCustomer("name", event.target.value)
                    }
                    placeholder="Your full name"
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium">
                    Phone Number (মোবাইল নম্বর)
                  </label>

                  <input
                    required
                    type="tel"
                    maxLength={11}
                    value={customer.phone}
                    onChange={(event) =>
                      updateCustomer(
                        "phone",
                        event.target.value.replace(/\D/g, "")
                      )
                    }
                    placeholder="01XXXXXXXXX"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-medium">
                  Delivery Address (ঠিকানা)
                </label>

                <textarea
                  required
                  rows={3}
                  value={customer.address}
                  onChange={(event) =>
                    updateCustomer("address", event.target.value)
                  }
                  placeholder="House, road, area, thana, district"
                  className={INPUT_CLASS}
                />
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-medium">
                  Note (optional)
                </label>

                <textarea
                  rows={2}
                  value={customer.note}
                  onChange={(event) =>
                    updateCustomer("note", event.target.value)
                  }
                  placeholder="Anything we should know?"
                  className={INPUT_CLASS}
                />
              </div>

              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold">
                  Shipping Location (ডেলিভারি এলাকা)
                </p>

                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    {
                      id: "dhaka",
                      title: "Inside Dhaka",
                      rate: SHIPPING_RATES.dhaka,
                    },
                    {
                      id: "outside",
                      title: "Outside Dhaka",
                      rate: SHIPPING_RATES.outside,
                    },
                  ].map((option) => {
                    const selected =
                      shippingLocation === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        disabled={submitting}
                        onClick={() =>
                          setShippingLocation(option.id)
                        }
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-left disabled:opacity-60 ${
                          selected
                            ? "border-[#05714B] bg-[#ECFDF5] ring-1 ring-[#05714B]"
                            : "border-gray-200"
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            selected
                              ? "bg-[#05714B] text-white"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          <Truck size={19} />
                        </div>

                        <div className="flex-1">
                          <p className="text-xs font-bold">
                            {option.title}
                          </p>

                          <p className="mt-1 text-sm font-bold text-[#05714B]">
                            {formatBDT(option.rate)}
                          </p>
                        </div>

                        {selected && (
                          <CheckCircle2
                            size={18}
                            className="text-[#05714B]"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mt-4 flex gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"
                >
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#05714B] py-3.5 text-sm font-bold text-white hover:bg-[#045C3D] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && (
                  <LoaderCircle size={18} className="animate-spin" />
                )}

                {submitting
                  ? "অর্ডার প্রক্রিয়াধীন..."
                  : `অর্ডার করুন (${formatBDT(total)})`}
              </button>
            </CheckoutCard>

            <CheckoutCard
              title={`Items (${totalQuantity})`}
              icon={ShoppingBag}
            >
              <div className="divide-y divide-gray-100">
                {items.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                      {item.image_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="h-full w-full object-contain p-2"
                        />
                      ) : (
                        <Package
                          size={26}
                          className="text-gray-300"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-semibold">
                        {item.title}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>

                      <p className="mt-1 text-sm font-bold text-[#05714B]">
                        {formatBDT(
                          Number(item.selling_price ?? item.price ?? 0) *
                            Number(item.quantity)
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CheckoutCard>
          </div>

          <CheckoutCard title="Order Summary" icon={ReceiptText}>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-gray-600">
                  Products ({totalQuantity})
                </span>

                <span>{formatBDT(originalTotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between gap-2">
                  <span className="text-gray-600">
                    Discount
                  </span>

                  <span className="font-semibold text-[#05714B]">
                    − {formatBDT(discount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between gap-2">
                <span className="text-gray-600">
                  Subtotal
                </span>

                <span>{formatBDT(subtotal)}</span>
              </div>

              <div className="flex justify-between gap-2">
                <span className="text-gray-600">
                  Delivery Charge
                </span>

                <span>{formatBDT(shipping)}</span>
              </div>

              <div className="flex items-center justify-between border-t border-dashed border-gray-200 pt-4">
                <span className="font-bold">
                  Total
                </span>

                <span className="text-[23px] font-extrabold text-[#05714B]">
                  {formatBDT(total)}
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#05714B] py-3.5 text-sm font-bold text-white hover:bg-[#045C3D] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && (
                  <LoaderCircle size={18} className="animate-spin" />
                )}

                {submitting
                  ? "অর্ডার প্রক্রিয়াধীন..."
                  : `অর্ডার করুন (${formatBDT(total)})`}
              </button>

              <p className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
                <CheckCircle2
                  size={15}
                  className="text-[#05714B]"
                />

                Cash on delivery · Pay when you receive it
              </p>
            </div>
          </CheckoutCard>
        </form>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white p-3 shadow-lg lg:hidden">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
            <div>
              <p className="text-[11px] text-gray-500">
                Total · {totalQuantity} items
              </p>

              <p className="text-lg font-bold text-[#05714B]">
                {formatBDT(total)}
              </p>
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={() =>
                document
                  .getElementById("sheradeal-checkout-form")
                  ?.requestSubmit()
              }
              className="flex items-center gap-2 rounded-lg bg-[#05714B] px-5 py-3 text-xs font-bold text-white disabled:opacity-60"
            >
              {submitting && (
                <LoaderCircle size={16} className="animate-spin" />
              )}

              {submitting
                ? "প্রক্রিয়াধীন..."
                : "অর্ডার করুন"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
