"use client";

import { useEffect, useState } from "react";
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

import SiteFooter from "@/components/frontend/footer/SiteFooter";

import {
  formatBDT,
  getBuyNowItem,
  SHIPPING_RATES,
} from "./checkoutUtils";

import { CART_CHECKOUT_KEY } from "@/lib/cartStore";

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
        ? parsed.filter((item) => item?.id && item.quantity > 0)
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
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });

  const [shippingLocation, setShippingLocation] = useState("dhaka");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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
        // Guest checkout remains available.
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
  const shipping = SHIPPING_RATES[shippingLocation];
  const total = subtotal + shipping;

  function updateCustomer(field, value) {
    setCustomer((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
    setMessage("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (customer.name.trim().length < 2) {
      setError("সম্পূর্ণ নাম লিখুন।");
      return;
    }

    if (!/^01[3-9]\d{8}$/.test(customer.phone.trim())) {
      setError("সঠিক মোবাইল নম্বর লিখুন।");
      return;
    }

    if (customer.address.trim().length < 8) {
      setError("সম্পূর্ণ Delivery Address লিখুন।");
      return;
    }

    setMessage(
      "Checkout তথ্য প্রস্তুত। Laravel Order API এখনো সংযুক্ত হয়নি, তাই কোনো Order তৈরি হয়নি।"
    );
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
                        onClick={() =>
                          setShippingLocation(option.id)
                        }
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-left ${
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
                <p
                  role="alert"
                  className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600"
                >
                  {error}
                </p>
              )}

              {message && (
                <div
                  role="status"
                  className="mt-4 flex gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800"
                >
                  <AlertCircle size={18} className="shrink-0" />
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="mt-5 w-full cursor-pointer rounded-lg bg-[#05714B] py-3.5 text-sm font-bold text-white hover:bg-[#045C3D]"
              >
                অর্ডার করুন ({formatBDT(total)})
              </button>
            </CheckoutCard>

            <CheckoutCard
              title={`Items (${totalQuantity})`}
              icon={ShoppingBag}
            >
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                      {item.image_url ? (
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
                          Number(item.selling_price) *
                            Number(item.quantity)
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CheckoutCard>
          </div>

          <CheckoutCard
            title="Order Summary"
            icon={ReceiptText}
          >
            <div className="space-y-4 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-gray-600">
                  Products ({totalQuantity})
                </span>

                <span>{formatBDT(originalTotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between gap-2">
                  <span className="text-gray-600">Discount</span>

                  <span className="font-semibold text-[#05714B]">
                    − {formatBDT(discount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between gap-2">
                <span className="text-gray-600">Subtotal</span>

                <span>{formatBDT(subtotal)}</span>
              </div>

              <div className="flex justify-between gap-2">
                <span className="text-gray-600">
                  Delivery Charge
                </span>

                <span>{formatBDT(shipping)}</span>
              </div>

              <div className="flex items-center justify-between border-t border-dashed border-gray-200 pt-4">
                <span className="font-bold">Total</span>

                <span className="text-[23px] font-extrabold text-[#05714B]">
                  {formatBDT(total)}
                </span>
              </div>

              <button
                type="submit"
                className="w-full cursor-pointer rounded-lg bg-[#05714B] py-3.5 text-sm font-bold text-white hover:bg-[#045C3D]"
              >
                অর্ডার করুন ({formatBDT(total)})
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
              onClick={() =>
                document
                  .getElementById("sheradeal-checkout-form")
                  ?.requestSubmit()
              }
              className="rounded-lg bg-[#05714B] px-5 py-3 text-xs font-bold text-white"
            >
              অর্ডার করুন
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}