"use client";

import { useCallback, useState } from "react";
import {
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Package,
  Tag,
  Layers,
  Globe2,
  BadgeCheck,
  Ruler,
} from "lucide-react";

import BuyNowModal from "@/components/frontend/checkout/BuyNowModal";
import { formatBDT } from "@/components/frontend/checkout/checkoutUtils";

import AddToCartButton from "@/components/frontend/cart/AddToCartButton";

function InfoItem({ icon: Icon, label, value }) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return (
    <div className="flex min-w-0 items-start gap-2 rounded-lg bg-white p-3">
      <Icon size={16} className="mt-0.5 shrink-0 text-[#05714B]" />

      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-gray-400">
          {label}
        </p>

        <p className="mt-1 break-words text-xs font-semibold text-gray-900">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function ProductPurchasePanel({
  product,
  reviewSummary,
}) {
  const [quantity, setQuantity] = useState(1);
  const [buyNowOpen, setBuyNowOpen] = useState(false);

  const closeBuyNow = useCallback(() => {
    setBuyNowOpen(false);
  }, []);

  const availableLimit =
    product.available_quantity !== null &&
    product.available_quantity !== undefined
      ? Math.max(1, Math.min(99, Number(product.available_quantity)))
      : 99;

  const sellingPrice = Number(product.selling_price) || 0;
  const regularPrice = Number(product.price) || 0;

  const discounted = regularPrice > sellingPrice;

  return (
    <div className="min-w-0">
      <h1 className="text-xl font-bold leading-7 text-[#05714B] sm:text-2xl">
        {product.title}
      </h1>

      {reviewSummary?.count > 0 && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="font-semibold text-amber-500">
            ★ {Number(reviewSummary.average || 0).toFixed(1)}
          </span>

          <span className="text-gray-500">
            ({reviewSummary.count} reviews)
          </span>
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl border border-gray-100 bg-[#F7FAF8] p-2 sm:grid-cols-3">
        <InfoItem
          icon={Tag}
          label="Product Code"
          value={product.sku}
        />

        <InfoItem
          icon={BadgeCheck}
          label="Brand"
          value={product.brand?.name}
        />

        <InfoItem
          icon={Globe2}
          label="Origin"
          value={product.origin}
        />

        <InfoItem
          icon={Ruler}
          label="Size"
          value={product.size}
        />

        <InfoItem
          icon={Layers}
          label="Category"
          value={product.category?.name}
        />

        <InfoItem
          icon={Package}
          label="Status"
          value={product.in_stock ? "In Stock" : "Out of Stock"}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-[26px] font-extrabold text-[#05714B]">
            {formatBDT(sellingPrice)}
          </span>

          {discounted && (
            <span className="text-sm text-gray-400 line-through">
              {formatBDT(regularPrice)}
            </span>
          )}
        </div>

        <div className="ml-auto inline-flex items-center overflow-hidden rounded-lg border border-[#05714B]">
          <button
            type="button"
            disabled={quantity <= 1}
            onClick={() => setQuantity((value) => value - 1)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center bg-[#EAF7F0] text-[#05714B] disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            <Minus size={16} />
          </button>

          <span className="w-11 text-center text-sm font-bold">
            {quantity}
          </span>

          <button
            type="button"
            disabled={
              !product.in_stock ||
              quantity >= availableLimit
            }
            onClick={() => setQuantity((value) => value + 1)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center bg-[#EAF7F0] text-[#05714B] disabled:opacity-40"
            aria-label="Increase quantity"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={!product.in_stock}
          onClick={() => setBuyNowOpen(true)}
          className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#05714B] px-3 text-xs font-bold text-white hover:bg-[#045C3D] disabled:cursor-not-allowed disabled:bg-gray-300 sm:text-sm"
        >
          <ShoppingBag size={17} />
          BUY NOW
        </button>

       
       <AddToCartButton
  product={product}
  quantity={quantity}
  className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#05714B] bg-[#ECFDF5] px-3 text-xs font-bold text-[#05714B] transition hover:bg-[#D1FAE5] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
>
  ADD TO CART
</AddToCartButton>


      </div>

      {product.description && (
        <p className="mt-4 line-clamp-4 whitespace-pre-line text-[13px] leading-6 text-gray-700">
          {product.description.replace(/<[^>]*>/g, " ").slice(0, 450)}
        </p>
      )}

      {!product.in_stock && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-700">
          এই Product বর্তমানে Stock-এ নেই।
        </p>
      )}

      {buyNowOpen && (
        <BuyNowModal
          product={product}
          initialQuantity={quantity}
          onClose={closeBuyNow}
        />
      )}
    </div>
  );
}