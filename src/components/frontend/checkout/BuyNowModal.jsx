"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Minus,
  Plus,
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";
import {
  formatBDT,
  normalizeCheckoutProduct,
  saveBuyNowItem,
} from "./checkoutUtils";

export default function BuyNowModal({
   product: rawProduct,
  initialQuantity = 1,
  onClose,
}) {
  const router = useRouter();
  const product = normalizeCheckoutProduct(rawProduct);


  const [quantity, setQuantity] = useState(
  Math.max(1, Math.min(99, Number(initialQuantity) || 1))
);

  const discount = Math.max(
    0,
    product.original_price - product.selling_price
  );

  const total = product.selling_price * quantity;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  function proceedToCheckout() {
    if (!product.in_stock || !product.id) return;

    saveBuyNowItem(product, quantity);
    onClose();

    router.push("/checkout");
  }

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center bg-[#101820]/65 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="buy-now-modal-title"
        className="relative w-full max-w-[510px] overflow-hidden rounded-[22px] bg-white shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close popup"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
        >
          <X size={19} />
        </button>

        <div className="grid grid-cols-[145px_minmax(0,1fr)] border-b border-gray-100 sm:grid-cols-[200px_minmax(0,1fr)]">
          <div className="flex min-h-[230px] items-center justify-center bg-[#F7FAF8] p-4">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                className="max-h-[205px] w-full object-contain"
              />
            ) : (
              <ShoppingBag size={55} className="text-gray-300" />
            )}
          </div>

          <div className="min-w-0 px-4 pb-5 pt-6 sm:px-5">
            <h2
              id="buy-now-modal-title"
              className="pr-5 text-[16px] font-bold leading-6 text-gray-950"
            >
              {product.title}
            </h2>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {product.in_stock ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#05714B]">
                  <CheckCircle2 size={14} />
                  In Stock
                </span>
              ) : (
                <span className="text-xs font-semibold text-red-600">
                  Out of Stock
                </span>
              )}

              {product.brand && (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-[#05714B]">
                  {product.brand}
                </span>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-baseline gap-2">
              <span className="text-[23px] font-extrabold text-[#05714B]">
                {formatBDT(product.selling_price)}
              </span>

              {discount > 0 && (
                <span className="text-[13px] text-gray-400 line-through">
                  {formatBDT(product.original_price)}
                </span>
              )}
            </div>

            {discount > 0 && (
              <p className="mt-1 text-xs font-semibold text-emerald-600">
                Save {formatBDT(discount)}
              </p>
            )}

            <div className="mt-5 flex items-center gap-3">
              <span className="text-xs font-medium text-gray-500">
                Qty
              </span>

              <div className="inline-flex items-center rounded-full bg-gray-100 p-1">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((value) => value - 1)}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-gray-700 disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <Minus size={15} />
                </button>

                <span className="w-9 text-center text-sm font-semibold">
                  {quantity}
                </span>

                <button
                  type="button"
                  disabled={quantity >= 99 || !product.in_stock}
                  onClick={() => setQuantity((value) => value + 1)}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-gray-700 disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="mb-5 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Total
            </span>

            <span className="text-[22px] font-bold text-gray-950">
              {formatBDT(total)}
            </span>
          </div>

          <button
            type="button"
            onClick={proceedToCheckout}
            disabled={!product.in_stock || !product.id}
            className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#05714B] text-sm font-bold text-white transition hover:bg-[#045C3D] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <ShoppingBag size={17} />
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}