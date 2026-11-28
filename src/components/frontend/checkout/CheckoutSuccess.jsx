"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ShoppingBag,
  Truck,
  Banknote,
  MapPin,
  ReceiptText,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";

import { formatBDT } from "./checkoutUtils";

export default function CheckoutSuccess() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(
        "sheradeal_last_order"
      );

      if (saved) {
        const parsed = JSON.parse(saved);

        if (parsed?.id && parsed?.order_number) {
          setOrder(parsed);
        }
      }
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle
          size={28}
          className="animate-spin text-[#05714B]"
        />
      </div>
    );
  }

  if (!order) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <ReceiptText size={42} className="text-gray-300" />

        <h1 className="mt-5 text-2xl font-bold text-gray-900">
          Order confirmation unavailable
        </h1>

        <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">
          No recent order confirmation was found in this browser
          session. If you submitted an order, verify its status
          before placing another one.
        </p>

        <Link
          href="/"
          className="mt-6 rounded-xl bg-[#05714B] px-6 py-3 text-sm font-semibold text-white"
        >
          Return to Home
        </Link>
      </main>
    );
  }

  const shippingLabel =
    order.shipping_location === "inside_dhaka"
      ? "Inside Dhaka"
      : "Outside Dhaka";

  return (
    <main className="min-h-[75vh] bg-[#F7FAF8] px-4 py-12">
      <div className="mx-auto max-w-[720px]">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-green-100 bg-[#ECF9F1] px-6 py-10 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#05714B] shadow-sm">
              <CheckCircle2 size={46} strokeWidth={1.7} />
            </div>

            <h1 className="mt-5 text-3xl font-extrabold text-gray-900">
              Order Placed Successfully!
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-600">
              Thank you for shopping with SheraDeal.
              Your Cash on Delivery order has been received.
            </p>

            <div className="mt-5 inline-flex rounded-full border border-green-200 bg-white px-5 py-2 text-sm font-bold text-[#05714B]">
              {order.order_number}
            </div>
          </div>

          <div className="space-y-6 p-6 md:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <ShoppingBag size={17} />
                  <span className="text-xs font-medium">
                    Order Status
                  </span>
                </div>

                <p className="mt-2 text-sm font-bold capitalize text-gray-900">
                  {order.status || "pending"}
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <Banknote size={17} />
                  <span className="text-xs font-medium">
                    Payment Method
                  </span>
                </div>

                <p className="mt-2 text-sm font-bold text-gray-900">
                  Cash on Delivery
                </p>

                <p className="mt-1 text-xs text-amber-700">
                  Payment Pending
                </p>
              </div>
            </div>

            <section>
              <div className="mb-4 flex items-center gap-2">
                <MapPin size={19} className="text-[#05714B]" />
                <h2 className="font-bold text-gray-900">
                  Delivery Details
                </h2>
              </div>

              <div className="rounded-xl border border-gray-100 p-4">
                <p className="font-semibold text-gray-900">
                  {order.customer_name}
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  {order.customer_phone}
                </p>

                <p className="mt-3 text-sm font-medium text-[#05714B]">
                  {shippingLabel}
                </p>

                <p className="mt-1 whitespace-pre-line text-sm leading-6 text-gray-600">
                  {order.delivery_address}
                </p>
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center gap-2">
                <ReceiptText size={19} className="text-[#05714B]" />
                <h2 className="font-bold text-gray-900">
                  Payment Summary
                </h2>
              </div>

              <div className="space-y-3 rounded-xl border border-gray-100 p-4 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatBDT(order.subtotal)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charge</span>
                  <span>{formatBDT(order.delivery_charge)}</span>
                </div>

                <div className="flex justify-between border-t border-gray-100 pt-4 text-base font-bold">
                  <span>Total Payable</span>

                  <span className="text-xl text-[#05714B]">
                    {formatBDT(order.grand_total)}
                  </span>
                </div>
              </div>
            </section>

            <div className="flex items-start gap-3 rounded-xl bg-[#F0F9F4] p-4">
              <Truck
                size={21}
                className="mt-0.5 shrink-0 text-[#05714B]"
              />

              <p className="text-sm leading-6 text-gray-700">
                Please keep your phone available for delivery
                confirmation. Pay the order amount in cash when
                your order arrives.
              </p>
            </div>

            <Link
              href="/"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#05714B] px-5 py-3.5 text-sm font-bold text-white hover:bg-[#045C3D]"
            >
              Continue Shopping
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
