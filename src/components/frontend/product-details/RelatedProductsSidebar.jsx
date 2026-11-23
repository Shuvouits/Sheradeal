"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  ImageIcon,
} from "lucide-react";

import BuyNowModal from "@/components/frontend/checkout/BuyNowModal";
import { formatBDT } from "@/components/frontend/checkout/checkoutUtils";

export default function RelatedProductsSidebar({ products = [] }) {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const closeModal = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  if (products.length === 0) {
    return null;
  }

  return (
    <aside className="min-w-0">
      <h2 className="mb-3 border-b-2 border-[#05714B] pb-2 text-xl font-bold text-gray-950">
        Related <span className="text-[#05714B]">Products</span>
      </h2>

      <div className="max-h-[490px] space-y-2 overflow-y-auto pr-1">
        {products.map((product) => (
          <div
            key={product.id}
            className="grid grid-cols-[95px_minmax(0,1fr)] gap-2 rounded-lg border border-gray-200 bg-[#FAFAFA] p-2"
          >
            <Link
              href={`/products/${encodeURIComponent(product.slug)}`}
              className="flex h-[125px] items-center justify-center overflow-hidden rounded-md bg-white"
            >
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.title}
                  loading="lazy"
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <ImageIcon size={28} className="text-gray-300" />
              )}
            </Link>

            <div className="flex min-w-0 flex-col">
              <Link
                href={`/products/${encodeURIComponent(product.slug)}`}
                className="line-clamp-2 text-[12px] font-semibold leading-5 text-gray-950 hover:text-[#05714B]"
              >
                {product.title}
              </Link>

              <div className="mt-auto">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-sm font-bold text-[#05714B]">
                    {formatBDT(product.selling_price)}
                  </span>

                  {Number(product.price) > Number(product.selling_price) && (
                    <span className="text-[11px] text-gray-400 line-through">
                      {formatBDT(product.price)}
                    </span>
                  )}
                </div>

                {product.in_stock ? (
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(product)}
                    className="mt-2 flex min-h-8 w-full cursor-pointer items-center justify-center gap-1 rounded-md bg-[#05714B] px-2 text-xs font-semibold text-white hover:bg-[#045C3D]"
                  >
                    <ShoppingBag size={13} />
                    Buy Now
                  </button>
                ) : (
                  <Link
                    href={`/products/${encodeURIComponent(product.slug)}`}
                    className="mt-2 flex min-h-8 w-full items-center justify-center rounded-md bg-gray-200 px-2 text-xs font-medium text-gray-600"
                  >
                    View Product
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <BuyNowModal
          product={selectedProduct}
          onClose={closeModal}
        />
      )}
    </aside>
  );
}