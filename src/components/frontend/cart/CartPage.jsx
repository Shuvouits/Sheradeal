"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

import {
  useCartItems,
  getCartTotals,
  updateCartQuantity,
  removeCartItem,
  prepareCartCheckout,
} from "@/lib/cartStore";

import { formatBDT } from "@/components/frontend/checkout/checkoutUtils";

export default function CartPage() {
  const router = useRouter();

  const items = useCartItems();
  const totals = getCartTotals(items);

  const savings = Math.max(
    0,
    totals.originalTotal - totals.subtotal
  );

  function checkout() {
    if (!prepareCartCheckout(items)) return;

    router.push("/checkout");
  }

  return (
    <main className="min-h-[70vh] bg-[#F8FAF9] px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-7 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-950">
              Shopping Cart
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {totals.quantity} items in your cart
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#05714B]"
          >
            <ArrowLeft size={17} />
            Continue Shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <ShoppingBag
              size={48}
              className="mx-auto text-gray-300"
            />

            <h2 className="mt-5 text-xl font-bold">
              Your cart is empty
            </h2>

            <Link
              href="/products"
              className="mt-5 inline-flex rounded-lg bg-[#05714B] px-6 py-3 text-sm font-semibold text-white"
            >
              Shop Products
            </Link>
          </div>
        ) : (
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4"
                >
                  <div className="flex h-28 w-24 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <ShoppingBag
                        size={30}
                        className="text-gray-300"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/products/${encodeURIComponent(item.slug)}`}
                        className="line-clamp-2 text-sm font-semibold text-gray-900 hover:text-[#05714B]"
                      >
                        {item.title}
                      </Link>

                      <button
                        type="button"
                        onClick={() => removeCartItem(item.id)}
                        aria-label="Remove item"
                        className="cursor-pointer text-red-500"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <p className="mt-3 text-base font-bold text-[#05714B]">
                      {formatBDT(item.selling_price)}
                    </p>

                    <div className="mt-3 inline-flex items-center rounded-lg border border-gray-200">
                      <button
                        type="button"
                        disabled={item.quantity <= 1}
                        onClick={() =>
                          updateCartQuantity(
                            item.id,
                            item.quantity - 1
                          )
                        }
                        className="cursor-pointer p-2 disabled:opacity-30"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={15} />
                      </button>

                      <span className="w-9 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        disabled={item.quantity >= 99}
                        onClick={() =>
                          updateCartQuantity(
                            item.id,
                            item.quantity + 1
                          )
                        }
                        className="cursor-pointer p-2 disabled:opacity-30"
                        aria-label="Increase quantity"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-gray-950">
                Order Summary
              </h2>

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Products ({totals.quantity})
                  </span>

                  <span>{formatBDT(totals.originalTotal)}</span>
                </div>

                {savings > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Discount
                    </span>

                    <span className="font-semibold text-[#05714B]">
                      − {formatBDT(savings)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Delivery Charge
                  </span>

                  <span className="text-xs text-gray-400">
                    At checkout
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <span className="font-bold">
                    Subtotal
                  </span>

                  <span className="text-xl font-extrabold text-[#05714B]">
                    {formatBDT(totals.subtotal)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={checkout}
                className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#05714B] px-4 py-3.5 text-sm font-bold text-white hover:bg-[#045C3D]"
              >
                Proceed to Checkout
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}