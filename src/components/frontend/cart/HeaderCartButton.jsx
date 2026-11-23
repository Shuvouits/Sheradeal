"use client";

import { useCallback, useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";

import CartDrawer from "./CartDrawer";

import {
  useCartItems,
  getCartTotals,
  subscribeCartOpen,
} from "@/lib/cartStore";

export default function HeaderCartButton() {
  const items = useCartItems();
  const [open, setOpen] = useState(false);

  const count = getCartTotals(items).quantity;

  const closeCart = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    return subscribeCartOpen(() => {
      setOpen(true);
    });
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Open cart, ${count} items`}
        className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#EFF7F3] text-[#05714B] transition hover:bg-[#DDF3E7]"
      >
        <ShoppingBag size={20} strokeWidth={1.8} />

        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#05714B] px-1 text-[10px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      </button>

      <CartDrawer
        open={open}
        onClose={closeCart}
      />
    </>
  );
}