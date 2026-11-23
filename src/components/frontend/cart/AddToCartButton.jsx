"use client";

import { ShoppingCart } from "lucide-react";

import {
  addCartItem,
  openCartDrawer,
} from "@/lib/cartStore";

export default function AddToCartButton({
  product,
  quantity = 1,
  className = "",
  children,
}) {
  function handleAddToCart() {
    const added = addCartItem(product, quantity);

    if (added) {
      openCartDrawer();
    }
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={!product?.id || product?.in_stock === false}
      className={
        className ||
        "flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#05714B] px-4 text-sm font-bold text-white hover:bg-[#045C3D] disabled:cursor-not-allowed disabled:bg-gray-300"
      }
    >
      <ShoppingCart size={17} />
      {children || "ADD TO CART"}
    </button>
  );
}