"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  Search,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  AlertCircle,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";

import PopularProductCard from "./PopularProductCard";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A to Z" },
];

function ProductSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 10 }, (_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-xl border border-gray-200 bg-white p-3"
        >
          <div className="aspect-square rounded-lg bg-gray-100" />

          <div className="mt-4 h-3 rounded bg-gray-100" />
          <div className="mt-2 h-3 w-3/4 rounded bg-gray-100" />

          <div className="mt-6 h-5 w-1/2 rounded bg-gray-100" />
          <div className="mt-3 h-10 rounded-lg bg-emerald-100" />
        </div>
      ))}
    </div>
  );
}

function ProductPagination({ currentPage, lastPage, onChange }) {
  if (lastPage <= 1) return null;

  const start = Math.max(
    1,
    Math.min(currentPage - 2, lastPage - 4)
  );

  const end = Math.min(lastPage, start + 4);

  const pages = [];

  for (let number = start; number <= end; number++) {
    pages.push(number);
  }

  return (
    <nav
      aria-label="Product pagination"
      className="mt-9 flex flex-wrap items-center justify-center gap-2"
    >
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onChange(currentPage - 1)}
        aria-label="Previous page"
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={18} />
      </button>

      {start > 1 && (
        <>
          <button
            type="button"
            onClick={() => onChange(1)}
            className="h-10 min-w-10 cursor-pointer rounded-lg border border-gray-200 bg-white px-3 text-sm"
          >
            1
          </button>

          {start > 2 && (
            <span className="px-1 text-gray-400">...</span>
          )}
        </>
      )}

      {pages.map((number) => (
        <button
          key={number}
          type="button"
          onClick={() => onChange(number)}
          aria-current={currentPage === number ? "page" : undefined}
          className={`h-10 min-w-10 cursor-pointer rounded-lg border px-3 text-sm font-semibold ${
            currentPage === number
              ? "border-[#05714B] bg-[#05714B] text-white"
              : "border-gray-200 bg-white text-gray-700 hover:border-[#05714B]"
          }`}
        >
          {number}
        </button>
      ))}

      {end < lastPage && (
        <>
          {end < lastPage - 1 && (
            <span className="px-1 text-gray-400">...</span>
          )}

          <button
            type="button"
            onClick={() => onChange(lastPage)}
            className="h-10 min-w-10 cursor-pointer rounded-lg border border-gray-200 bg-white px-3 text-sm"
          >
            {lastPage}
          </button>
        </>
      )}

      <button
        type="button"
        disabled={currentPage >= lastPage}
        onClick={() => onChange(currentPage + 1)}
        aria-label="Next page"
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}

export default function ProductSearchPage({
  search = "",
  sort = "relevance",
  page = 1,
}) {
  const router = useRouter();

  const [searchText, setSearchText] = useState(search);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  const activeSort = SORT_OPTIONS.some(
    (option) => option.value === sort
  )
    ? sort
    : "relevance";

  useEffect(() => {
    setSearchText(search);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setLoading(true);
      setError("");
      setData(null);

      try {
        const query = new URLSearchParams({
          search,
          sort: activeSort,
          page: String(page),
        });

        const response = await fetch(
          `/api/storefront/search/products?${query.toString()}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const result = await response.json().catch(() => ({}));

        if (!response.ok || result.success !== true) {
          throw new Error(
            result.message || "Unable to load products."
          );
        }

        if (!controller.signal.aborted) {
          setData(result.data);
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(err.message || "Product search failed.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => controller.abort();
  }, [search, activeSort, page, retryKey]);

  function navigate(nextSearch, nextSort, nextPage) {
    const params = new URLSearchParams();

    if (nextSearch.trim()) {
      params.set("search", nextSearch.trim());
    }

    if (nextSort !== "relevance") {
      params.set("sort", nextSort);
    }

    if (nextPage > 1) {
      params.set("page", String(nextPage));
    }

    const query = params.toString();

    router.push(`/products${query ? `?${query}` : ""}`);
  }

  function handleSearch(event) {
    event.preventDefault();
    navigate(searchText, "relevance", 1);
  }

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

  return (
    <main className="min-h-[70vh] bg-[#FAFCFB] px-4 pb-16 pt-8">
      <div className="mx-auto w-full max-w-[1440px]">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 text-xs text-gray-500"
        >
          <Link href="/" className="hover:text-[#05714B]">
            Home
          </Link>

          <span>/</span>

          <span className="font-semibold text-[#05714B]">
            {search ? "Search Results" : "All Products"}
          </span>
        </nav>

        <div className="mb-7">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-[#05714B]">
            SheraDeal Bangladesh
          </p>

          <h1 className="text-2xl font-bold text-gray-950 sm:text-3xl">
            {search ? "Search Results" : "All Products"}
          </h1>

          {search && (
            <p className="mt-2 text-sm text-gray-500">
              Showing products matching{" "}
              <span className="font-semibold text-[#05714B]">
                &quot;{search}&quot;
              </span>
            </p>
          )}
        </div>

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative min-w-0 flex-1">
              <Search
                size={19}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="search"
                value={searchText}
                onChange={(event) =>
                  setSearchText(event.target.value)
                }
                placeholder="Search products by name..."
                aria-label="Search products"
                className="h-12 w-full rounded-lg border border-gray-200 bg-[#FAFCFB] pl-11 pr-4 text-sm outline-none focus:border-[#05714B] focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <button
              type="submit"
              className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#05714B] px-7 text-sm font-bold text-white hover:bg-[#045C3D]"
            >
              <Search size={17} />
              Search
            </button>
          </form>
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-950">
              Products
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {loading
                ? "Loading products..."
                : pagination.total > 0
                  ? `Showing ${pagination.from}–${pagination.to} of ${pagination.total} products`
                  : "No products found"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal
              size={16}
              className="text-[#05714B]"
            />

            <label
              htmlFor="products-sort"
              className="text-xs text-gray-500"
            >
              Sort
            </label>

            <select
              id="products-sort"
              value={activeSort}
              onChange={(event) =>
                navigate(search, event.target.value, 1)
              }
              className="h-10 cursor-pointer rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 outline-none focus:border-[#05714B]"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <ProductSkeleton />
        ) : error ? (
          <div className="flex min-h-[330px] flex-col items-center justify-center rounded-xl border border-red-100 bg-white p-8 text-center">
            <AlertCircle size={36} className="text-red-400" />

            <h2 className="mt-4 text-lg font-bold text-gray-900">
              Unable to load products
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                setRetryKey((value) => value + 1)
              }
              className="mt-5 flex cursor-pointer items-center gap-2 rounded-lg bg-[#05714B] px-5 py-3 text-sm font-semibold text-white"
            >
              <RotateCcw size={16} />
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="flex min-h-[330px] flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-8 text-center">
            <ShoppingBag
              size={44}
              className="text-gray-300"
            />

            <h2 className="mt-5 text-lg font-bold text-gray-900">
              No products found
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
              তোমার Search Keyword-এর সঙ্গে কোনো Product মেলেনি।
              অন্য Keyword দিয়ে চেষ্টা করো।
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchText("");
                navigate("", "relevance", 1);
              }}
              className="mt-5 cursor-pointer rounded-lg bg-[#05714B] px-5 py-3 text-sm font-semibold text-white"
            >
              View All Products
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 items-stretch gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((product) => (
                <PopularProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>

            <ProductPagination
              currentPage={pagination.current_page}
              lastPage={pagination.last_page}
              onChange={(nextPage) =>
                navigate(search, activeSort, nextPage)
              }
            />
          </>
        )}
      </div>
    </main>
  );
}
