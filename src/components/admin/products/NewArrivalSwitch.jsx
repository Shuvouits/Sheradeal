"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

function isEnabled(value) {
  return value === true || value === 1 || value === "1";
}

export default function NewArrivalSwitch({
  product,
  onUpdated,
}) {
  const [enabled, setEnabled] = useState(
    isEnabled(product.is_new_arrival)
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setEnabled(isEnabled(product.is_new_arrival));
  }, [product.id, product.is_new_arrival]);

  async function handleToggle() {
    if (loading) return;

    const nextValue = !enabled;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/products/${product.id}/new-arrival`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({
            is_new_arrival: nextValue,
          }),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success !== true) {
        throw new Error(
          result.message || "Unable to update New Arrival."
        );
      }

      const savedValue = isEnabled(result.data?.is_new_arrival);

      setEnabled(savedValue);

      if (typeof onUpdated === "function") {
        onUpdated(product.id, savedValue);
      }
    } catch (err) {
      setError(err.message || "Update failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={`New Arrival: ${product.title}`}
        title={enabled ? "Remove from New Arrival" : "Mark as New Arrival"}
        onClick={handleToggle}
        disabled={loading}
        className={`relative h-6 w-11 cursor-pointer rounded-full transition-colors disabled:cursor-wait ${
          enabled ? "bg-[#05714B]" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-[3px] flex h-[18px] w-[18px] items-center justify-center rounded-full bg-white shadow-sm transition-transform ${
            enabled ? "translate-x-[23px]" : "translate-x-[3px]"
          }`}
        >
          {loading && (
            <LoaderCircle
              size={12}
              className="animate-spin text-[#05714B]"
            />
          )}
        </span>
      </button>

      {error && (
        <span
          role="alert"
          title={error}
          className="max-w-24 text-center text-[10px] text-red-600"
        >
          {error}
        </span>
      )}
    </div>
  );
}
