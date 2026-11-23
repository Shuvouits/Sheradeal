"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  ShoppingBag,
  ImageIcon,
} from "lucide-react";

import BuyNowButton from "@/components/frontend/checkout/BuyNowButton";

function formatPrice(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "৳0";
  }

  return `৳${amount.toLocaleString("en-BD", {
    maximumFractionDigits: 2,
  })}`;
}

function getProductImage(product) {
  const url = product.image_url;

  if (typeof url !== "string") return "";

  if (/^https?:\/\//i.test(url)) return url;

  if (url.startsWith("/")) return url;

  return "";
}

export default function PopularProductCard({ product }) {
  const [imageError, setImageError] = useState(false);
  const [saved, setSaved] = useState(false);

  const productUrl = `/products/${encodeURIComponent(product.slug)}`;

  const regularPrice = Number(product.price) || 0;

  const sellingPrice =
    Number(product.selling_price ?? product.price) || 0;

  const discounted =
    sellingPrice < regularPrice && regularPrice > 0;

  const calculatedDiscount = discounted
    ? Math.round(
        ((regularPrice - sellingPrice) / regularPrice) * 100
      )
    : 0;

  const discountPercent = discounted
    ? calculatedDiscount
    : 0;

  const imageUrl = getProductImage(product);

  const inStock = product.in_stock !== false;

  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-white transition-all duration-200 hover:border-[#05714B] hover:shadow-[0_10px_30px_rgba(5,113,75,0.10)]">
      <div className="relative m-2 mb-0 overflow-hidden rounded-lg bg-[#FAFAFA]">
        <Link
          href={productUrl}
          className="relative flex aspect-square items-center justify-center overflow-hidden"
          aria-label={`View ${product.title}`}
        >
          {imageUrl && !imageError ? (
            <Image
              src={imageUrl}
              alt={product.title}
              fill
              unoptimized
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.045]"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300">
              <ImageIcon
                size={42}
                strokeWidth={1.3}
              />
            </div>
          )}
        </Link>

        {discountPercent > 0 && (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-md bg-[#05714B] px-2 py-1 text-[10px] font-bold text-white sm:text-[11px]">
            SAVE {discountPercent}%
          </span>
        )}

        <button
          type="button"
          onClick={() => setSaved((current) => !current)}
          aria-pressed={saved}
          aria-label={
            saved
              ? `Remove ${product.title} from temporary wishlist`
              : `Temporarily save ${product.title}`
          }
          title={
            saved
              ? "Temporarily saved"
              : "Save for this session"
          }
          className={`absolute right-2.5 top-2.5 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white shadow-sm transition-colors ${
            saved
              ? "text-[#05714B]"
              : "text-gray-700 hover:text-[#05714B]"
          }`}
        >
          <Heart
            size={19}
            strokeWidth={1.8}
            fill={saved ? "currentColor" : "none"}
          />
        </button>

        {!inStock && (
          <span className="absolute bottom-3 left-3 rounded-md bg-gray-900/85 px-2.5 py-1 text-xs font-medium text-white">
            Out of Stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-3 sm:px-3.5 sm:pb-3.5">
        <Link
          href={productUrl}
          className="line-clamp-2 min-h-[40px] text-[12px] font-semibold leading-5 text-gray-900 transition-colors hover:text-[#05714B] sm:min-h-[44px] sm:text-[13px]"
          title={product.title}
        >
          {product.title}
        </Link>

        <div className="mt-auto pt-3">
          <div className="flex min-h-7 flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-[16px] font-bold text-[#05714B] sm:text-[19px]">
              {formatPrice(sellingPrice)}
            </span>

            {discounted && (
              <span className="text-[12px] text-gray-400 line-through sm:text-[13px]">
                {formatPrice(regularPrice)}
              </span>
            )}
          </div>

          {inStock ? (
            <div className="mt-3">
              <BuyNowButton
                product={product}
                className="flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#05714B] px-2 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#045C3D] sm:text-sm"
              >
                Buy Now
              </BuyNowButton>
            </div>
          ) : (
            <Link
              href={productUrl}
              className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#05714B] px-2 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#045C3D] sm:text-sm"
            >
              <ShoppingBag size={16} />
              View Product
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}