"use client";

import { useEffect, useState } from "react";
import { RefreshCw, ShoppingBag } from "lucide-react";
import PopularProductCard from "@/components/frontend/products/PopularProductCard";

const API_URL = "/api/storefront/products/popular?limit=15";

function ProductSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white p-2">
      <div className="aspect-square rounded-lg bg-gray-100" />
      <div className="space-y-3 px-2 py-4">
        <div className="h-3 w-full rounded bg-gray-100" />
        <div className="h-3 w-4/5 rounded bg-gray-100" />
        <div className="mt-5 h-5 w-1/2 rounded bg-gray-100" />
        <div className="h-10 w-full rounded-lg bg-gray-100" />
      </div>
    </div>
  );
}

export default function PopularProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPopularProducts() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(API_URL, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        const result = await response.json();

        if (!response.ok || result.success !== true) {
          throw new Error(
            result.message || "Unable to load popular products."
          );
        }

        const items = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result.data?.data)
            ? result.data.data
            : [];

        if (!controller.signal.aborted) {
          setProducts(
            items.filter(
              (product) =>
                product &&
                product.id != null &&
                product.title &&
                product.slug &&
                product.is_popular === true
            )
          );
        }
      } catch (err) {
        if (err.name === "AbortError") return;

        if (!controller.signal.aborted) {
          setError(
            err.message || "Unable to load popular products."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadPopularProducts();

    return () => controller.abort();
  }, [retry]);

  if (!loading && !error && products.length === 0) {
    return null;
  }

  return (
    <section
      className="w-full bg-white py-10 sm:py-14"
      aria-labelledby="sd-popular-products-title"
    >
      <div className="mx-auto w-[calc(100%-28px)] max-w-[1440px] sm:w-[calc(100%-40px)]">
        <div className="mb-7 text-center sm:mb-10">
          <p className="mb-1 text-sm font-semibold tracking-[0.13em] text-[#05714B]">
            SheraDeal Bangladesh
          </p>

          <h2
            id="sd-popular-products-title"
            className="text-[28px] font-bold tracking-tight text-gray-950 sm:text-[37px]"
          >
            Popular Products
          </h2>

          <div className="mx-auto mt-3 h-1 w-14 rounded-full bg-[#05714B]" />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-red-100 bg-red-50 px-5 py-10 text-center">
            <ShoppingBag size={30} className="text-red-400" />

            <p className="text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() => setRetry((current) => current + 1)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700"
            >
              <RefreshCw size={15} />
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 items-stretch gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => (
              <PopularProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
