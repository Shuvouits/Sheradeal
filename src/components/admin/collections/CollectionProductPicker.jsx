"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  X,
  ChevronUp,
  ChevronDown,
  LoaderCircle,
  Package,
} from "lucide-react";
import { collectionRequest } from "@/lib/collectionApi";

export default function CollectionProductPicker({
  selected,
  onChange,
}) {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          search: query,
          per_page: "30",
          page: "1",
        });

        const data = await collectionRequest(
          `/products/search?${params}`,
          { signal: controller.signal }
        );

        if (!controller.signal.aborted) {
          setResults(
            Array.isArray(data?.data) ? data.data : []
          );
        }
      } catch (err) {
        if (err.name !== "AbortError" && !controller.signal.aborted) {
          setError(err.message || "Unable to search products.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadProducts();

    return () => controller.abort();
  }, [query]);

  function addProduct(product) {
    if (selected.some((item) => item.id === product.id)) return;

    onChange([...selected, product]);
  }

  function removeProduct(id) {
    onChange(selected.filter((item) => item.id !== id));
  }

  function moveProduct(index, direction) {
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= selected.length) return;

    const reordered = [...selected];

    [reordered[index], reordered[nextIndex]] = [
      reordered[nextIndex],
      reordered[index],
    ];

    onChange(reordered);
  }

  function formatPrice(price) {
    return `৳${Number(price || 0).toLocaleString("en-BD")}`;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">
          Products in Collection
        </h3>

        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
          {selected.length}
        </span>
      </div>

      <div className="space-y-5 p-4">
        <div>
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products to add..."
              className="h-10 w-full rounded-lg border border-gray-200 pl-10 pr-4 text-sm outline-none focus:border-[#05714B]"
            />
          </div>

          <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-gray-100">
            {loading ? (
              <div className="flex justify-center py-6">
                <LoaderCircle
                  size={20}
                  className="animate-spin text-[#05714B]"
                />
              </div>
            ) : error ? (
              <p className="p-4 text-xs text-red-600">{error}</p>
            ) : results.length === 0 ? (
              <p className="p-4 text-center text-xs text-gray-400">
                No matching products.
              </p>
            ) : (
              results.map((product) => {
                const isSelected = selected.some(
                  (item) => Number(item.id) === Number(product.id)
                );

                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-3 border-b border-gray-100 px-3 py-2.5 last:border-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
                        <Package size={17} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-gray-800">
                          {product.title}
                        </p>

                        <p className="mt-0.5 text-[11px] text-gray-400">
                          {formatPrice(product.price)}
                          {product.sku ? ` · ${product.sku}` : ""}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isSelected || selected.length >= 500}
                      onClick={() => addProduct(product)}
                      className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-[#05714B] px-2.5 py-1.5 text-xs font-semibold text-[#05714B] disabled:cursor-default disabled:border-gray-200 disabled:text-gray-400"
                    >
                      <Plus size={14} />
                      {isSelected ? "Added" : "Add"}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <p className="mt-2 text-[11px] text-gray-400">
            Search by product name or SKU. Up to 30 matching results are shown.
          </p>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase text-gray-500">
              Selected Products
            </p>

            {selected.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="cursor-pointer text-xs text-red-500 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {selected.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 py-10 text-center">
              <Package size={25} className="mx-auto text-gray-300" />
              <p className="mt-2 text-xs text-gray-400">
                No products selected.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              {selected.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 border-b border-gray-100 px-3 py-2.5 last:border-0"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[11px] font-bold text-[#05714B]">
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-gray-800">
                      {product.title}
                    </p>

                    <p className="text-[11px] text-gray-400">
                      {formatPrice(product.price)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveProduct(index, -1)}
                      title="Move up"
                      className="cursor-pointer rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-25"
                    >
                      <ChevronUp size={16} />
                    </button>

                    <button
                      type="button"
                      disabled={index === selected.length - 1}
                      onClick={() => moveProduct(index, 1)}
                      title="Move down"
                      className="cursor-pointer rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-25"
                    >
                      <ChevronDown size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => removeProduct(product.id)}
                      title="Remove product"
                      className="cursor-pointer rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="mt-2 text-[11px] text-gray-400">
            Products will appear in this order when Manual sorting is selected.
          </p>
        </div>
      </div>
    </div>
  );
}
