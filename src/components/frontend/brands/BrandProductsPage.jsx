"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ShoppingBag,
  LoaderCircle,
  AlertCircle,
  RefreshCw,
  ImageIcon,
} from "lucide-react";

import PopularProductCard from "@/components/frontend/products/PopularProductCard";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A to Z" },
  { value: "name_desc", label: "Name: Z to A" },
];

function LoadingGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 10 }, (_, index) => (
        <div
          key={index}
          className="animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white p-3"
        >
          <div className="aspect-square rounded-lg bg-gray-100" />

          <div className="mt-4 h-3 w-full rounded bg-gray-100" />
          <div className="mt-2 h-3 w-2/3 rounded bg-gray-100" />

          <div className="mt-6 h-5 w-1/2 rounded bg-gray-100" />
          <div className="mt-3 h-10 rounded-lg bg-emerald-100" />
        </div>
      ))}
    </div>
  );
}

function BrandHeading({ brand, total }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
      {brand.banner_url && (
        <div className="relative max-h-[260px] overflow-hidden bg-[#F8FAF9]">
          <img
            src={brand.banner_url}
            alt={`${brand.name} banner`}
            className="max-h-[260px] w-full object-cover"
          />
        </div>
      )}

      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:p-8">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-emerald-100 bg-[#ECFDF5] sm:h-24 sm:w-24">
          {brand.logo_url ? (
            <img
              src={brand.logo_url}
              alt={`${brand.name} logo`}
              className="h-full w-full object-contain p-2"
            />
          ) : (
            <BadgeCheck
              size={36}
              className="text-[#05714B]"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#05714B]">
            Shop by Brand
          </p>

          <h1 className="mt-2 text-2xl font-bold leading-tight text-gray-950 sm:text-3xl">
            {brand.name}
          </h1>

          {brand.description && (
            <p className="mt-3 max-w-4xl whitespace-pre-line text-sm leading-7 text-gray-600">
              {String(brand.description)
                .replace(/<br\s*\/?>/gi, "\n")
                .replace(/<\/p>/gi, "\n\n")
                .replace(/<[^>]*>/g, " ")
                .replace(/&nbsp;/g, " ")
                .trim()}
            </p>
          )}

          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#ECFDF5] px-3 py-2 text-xs font-semibold text-[#05714B]">
            <ShoppingBag size={15} />
            {total} {total === 1 ? "Product" : "Products"}
          </div>
        </div>
      </div>
    </section>
  );
}

function Pagination({
  currentPage,
  lastPage,
  onPageChange,
}) {
  if (lastPage <= 1) return null;

  const start = Math.max(
    1,
    Math.min(currentPage - 2, lastPage - 4)
  );

  const end = Math.min(lastPage, start + 4);

  const pages = [];

  for (let page = start; page <= end; page++) {
    pages.push(page);
  }

  return (
    <nav
      aria-label="Product pagination"
      className="mt-9 flex flex-wrap items-center justify-center gap-2"
    >
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:border-[#05714B] disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft size={18} />
      </button>

      {start > 1 && (
        <>
          <button
            type="button"
            onClick={() => onPageChange(1)}
            className="h-10 min-w-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold"
          >
            1
          </button>

          {start > 2 && (
            <span className="px-1 text-gray-400">...</span>
          )}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          aria-current={
            currentPage === page ? "page" : undefined
          }
          className={`h-10 min-w-10 cursor-pointer rounded-lg border px-3 text-sm font-semibold transition ${
            currentPage === page
              ? "border-[#05714B] bg-[#05714B] text-white"
              : "border-gray-200 bg-white text-gray-700 hover:border-[#05714B] hover:text-[#05714B]"
          }`}
        >
          {page}
        </button>
      ))}

      {end < lastPage && (
        <>
          {end < lastPage - 1 && (
            <span className="px-1 text-gray-400">...</span>
          )}

          <button
            type="button"
            onClick={() => onPageChange(lastPage)}
            className="h-10 min-w-10 cursor-pointer rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold"
          >
            {lastPage}
          </button>
        </>
      )}

      <button
        type="button"
        disabled={currentPage >= lastPage}
        onClick={() => onPageChange(currentPage + 1)}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:border-[#05714B] disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}

export default function BrandProductsPage({ slug }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pageValue = Number(searchParams.get("page") || 1);
  const page = Number.isInteger(pageValue) && pageValue > 0
    ? pageValue
    : 1;

  const requestedSort = searchParams.get("sort") || "newest";

  const sort = SORT_OPTIONS.some(
    (option) => option.value === requestedSort
  )
    ? requestedSort
    : "newest";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadBrand() {
      setLoading(true);
      setError("");

      try {
        const query = new URLSearchParams({
          page: String(page),
          sort,
        });

        const response = await fetch(
          `/api/storefront/brand/${encodeURIComponent(slug)}?${query.toString()}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const result = await response.json().catch(() => ({}));

        if (!response.ok || result.success !== true) {
          throw new Error(
            response.status === 404
              ? "Brand not found."
              : result.message || "Unable to load brand products."
          );
        }

        if (!controller.signal.aborted) {
          setData(result.data);
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(err.message || "Unable to load products.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadBrand();

    return () => controller.abort();
  }, [slug, page, sort, refreshKey]);

  function updateQuery(nextPage, nextSort) {
    const params = new URLSearchParams();

    if (nextPage > 1) {
      params.set("page", String(nextPage));
    }

    if (nextSort !== "newest") {
      params.set("sort", nextSort);
    }

    const query = params.toString();

    router.push(
      `/brand/${encodeURIComponent(slug)}${query ? `?${query}` : ""}`,
      { scroll: false }
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const brand = data?.brand;
  const products = Array.isArray(data?.products)
    ? data.products
    : [];

  const pagination = data?.pagination || {
    current_page: page,
    last_page: 1,
    total: 0,
    from: null,
    to: null,
  };

  const temporaryBrandName = decodeURIComponent(slug)
    .split("-")
    .map((word) =>
      word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");

  return (
    <main className="min-h-[70vh] bg-[#FAFCFB] pb-16 pt-7">
      <div className="mx-auto w-[calc(100%-28px)] max-w-[1440px] sm:w-[calc(100%-40px)]">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-2 text-xs text-gray-500"
        >
          <Link
            href="/"
            className="hover:text-[#05714B]"
          >
            Home
          </Link>

          <span>/</span>

          <Link
            href="/brands"
            className="hover:text-[#05714B]"
          >
            Brands
          </Link>

          <span>/</span>

          <span className="font-semibold text-[#05714B]">
            {brand?.name || temporaryBrandName}
          </span>
        </nav>

        {error && !data && !loading ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <AlertCircle
              size={40}
              className="text-red-400"
            />

            <h1 className="mt-4 text-xl font-bold text-gray-900">
              {error}
            </h1>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setRefreshKey((value) => value + 1)
                }
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#05714B] px-5 py-3 text-sm font-semibold text-white"
              >
                <RefreshCw size={16} />
                Try Again
              </button>

              <Link
                href="/brands"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700"
              >
                <ArrowLeft size={16} />
                All Brands
              </Link>
            </div>
          </div>
        ) : (
          <>
            {brand ? (
              <BrandHeading
                brand={brand}
                total={pagination.total}
              />
            ) : (
              <div className="mb-7 h-[170px] animate-pulse rounded-2xl bg-emerald-50" />
            )}

            <section className="mt-8">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-950 sm:text-2xl">
                    All Products
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    {loading
                      ? "Loading products..."
                      : pagination.total > 0
                        ? `Showing ${pagination.from}–${pagination.to} of ${pagination.total} products`
                        : "No products available"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label
                    htmlFor="brand-product-sort"
                    className="text-xs font-medium text-gray-500"
                  >
                    Sort by
                  </label>

                  <select
                    id="brand-product-sort"
                    value={sort}
                    onChange={(event) =>
                      updateQuery(1, event.target.value)
                    }
                    className="h-11 min-w-[175px] cursor-pointer rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 outline-none focus:border-[#05714B]"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error && data && (
                <div
                  role="alert"
                  className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              {loading ? (
                <LoadingGrid />
              ) : products.length === 0 ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-8 text-center">
                  <ShoppingBag
                    size={42}
                    className="text-gray-300"
                  />

                  <h3 className="mt-4 text-lg font-bold text-gray-900">
                    No products found
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    এই Brand-এর কোনো Published Product পাওয়া যায়নি।
                  </p>

                  <Link
                    href="/products"
                    className="mt-5 rounded-lg bg-[#05714B] px-5 py-3 text-sm font-semibold text-white"
                  >
                    Browse All Products
                  </Link>
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

              {!loading && !error && (
                <Pagination
                  currentPage={pagination.current_page}
                  lastPage={pagination.last_page}
                  onPageChange={(nextPage) =>
                    updateQuery(nextPage, sort)
                  }
                />
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
