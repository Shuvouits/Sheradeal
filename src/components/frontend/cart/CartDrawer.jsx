"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  LockKeyhole,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

import {
  useCartItems,
  getCartTotals,
  updateCartQuantity,
  removeCartItem,
  prepareCartCheckout,
} from "@/lib/cartStore";

import { formatBDT } from "@/components/frontend/checkout/checkoutUtils";

function CartItem({ item }) {
  return (
    <div className="flex gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex h-[96px] w-[88px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F8FAF9]">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="h-full w-full object-contain p-2"
          />
        ) : (
          <ShoppingBag size={28} className="text-gray-300" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start gap-2">
          <p className="line-clamp-2 flex-1 text-[13px] font-semibold leading-5 text-gray-950">
            {item.title}
          </p>

          <button
            type="button"
            onClick={() => removeCartItem(item.id)}
            aria-label={`Remove ${item.title}`}
            className="cursor-pointer p-1 text-gray-400 hover:text-red-500"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-3">
          <div>
            <p className="text-[15px] font-bold text-[#05714B]">
              {formatBDT(item.selling_price)}
            </p>

            {item.original_price > item.selling_price && (
              <p className="mt-0.5 text-[11px] text-gray-400 line-through">
                {formatBDT(item.original_price)}
              </p>
            )}
          </div>

          <div className="inline-flex items-center overflow-hidden rounded-full border border-gray-200">
            <button
              type="button"
              disabled={item.quantity <= 1}
              onClick={() =>
                updateCartQuantity(item.id, item.quantity - 1)
              }
              aria-label="Decrease quantity"
              className="flex h-8 w-8 cursor-pointer items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30"
            >
              <Minus size={14} />
            </button>

            <span className="w-8 text-center text-xs font-semibold">
              {item.quantity}
            </span>

            <button
              type="button"
              disabled={item.quantity >= 99}
              onClick={() =>
                updateCartQuantity(item.id, item.quantity + 1)
              }
              aria-label="Increase quantity"
              className="flex h-8 w-8 cursor-pointer items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartDrawer({ open, onClose }) {
  const router = useRouter();
  const items = useCartItems();

  const totals = getCartTotals(items);
  const savings = Math.max(
    0,
    totals.originalTotal - totals.subtotal
  );

  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function onEscape(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onEscape);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onEscape);
    };
  }, [open, onClose]);

  function checkout() {
    if (!prepareCartCheckout(items)) return;

    onClose();
    router.push("/checkout");
  }

  function viewCart() {
    onClose();
    router.push("/cart");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[700]">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close cart"
        className="absolute inset-0 cursor-pointer bg-[#111827]/50 backdrop-blur-[3px]"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
        className="absolute inset-y-0 right-0 flex h-full w-full max-w-[435px] flex-col bg-white shadow-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#05714B]">
              <ShoppingBag size={22} />
            </div>

            <div>
              <h2 className="text-[16px] font-bold text-gray-950">
                Your cart
              </h2>

              <p className="mt-0.5 text-xs text-gray-500">
                {totals.quantity}{" "}
                {totals.quantity === 1 ? "item" : "items"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#F8FAF9] p-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#05714B] shadow-sm">
                <ShoppingBag size={36} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-900">
                Your cart is empty
              </h3>

              <p className="mt-2 max-w-[260px] text-sm leading-6 text-gray-500">
                তোমার পছন্দের Product Cart-এ যোগ করে Shopping শুরু করো।
              </p>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push("/products");
                }}
                className="mt-5 cursor-pointer rounded-lg bg-[#05714B] px-5 py-3 text-sm font-semibold text-white"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="shrink-0 border-t border-gray-200 bg-white px-4 pb-5 pt-4">
            {savings > 0 && (
              <div className="mb-4 flex items-center justify-between text-[13px]">
                <span className="text-gray-500">You save</span>

                <span className="font-semibold text-[#05714B]">
                  {formatBDT(savings)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Subtotal{" "}
                  <span className="font-normal text-gray-400">
                    ({totals.quantity} items)
                  </span>
                </p>

                <p className="mt-1 text-[11px] text-gray-400">
                  Delivery charge added at checkout
                </p>
              </div>

              <p className="text-[22px] font-extrabold text-[#05714B]">
                {formatBDT(totals.subtotal)}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-[1fr_1.5fr] gap-2">
              <button
                type="button"
                onClick={viewCart}
                className="cursor-pointer rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
              >
                View cart
              </button>

              <button
                type="button"
                onClick={checkout}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#05714B] px-4 py-3 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(5,113,75,0.2)] hover:bg-[#045C3D]"
              >
                <LockKeyhole size={16} />
                Checkout
                <ArrowRight size={15} />
              </button>
            </div>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
              <ShieldCheck size={14} className="text-[#05714B]" />
              Secure shopping with SheraDeal
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}