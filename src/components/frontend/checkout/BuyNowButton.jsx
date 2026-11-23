"use client";

import { useCallback, useState } from "react";
import { ShoppingBag } from "lucide-react";
import BuyNowModal from "./BuyNowModal";

export default function BuyNowButton({
  product,
  className = "",
  children,
}) {
  const [open, setOpen] = useState(false);

  const closeModal = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <>
      <button
        type="button"
        disabled={product?.in_stock === false}
        onClick={() => setOpen(true)}
        className={
          className ||
          "flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#05714B] px-4 py-3 text-sm font-semibold text-white hover:bg-[#045C3D] disabled:cursor-not-allowed disabled:bg-gray-300"
        }
      >
        <ShoppingBag size={16} />
        {children || "Buy Now"}
      </button>

      {open && (
        <BuyNowModal
          product={product}
          onClose={closeModal}
        />
      )}
    </>
  );
}