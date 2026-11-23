"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import ProductDeleteButton from "./ProductDeleteButton";
import NewArrivalSwitch from "./NewArrivalSwitch";
import {
  Package,
  PackageCheck,
  FilePenLine,
  Archive,
  PackageX,
  Plus,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Eye,
  AlertCircle,
  LoaderCircle,
  ImageIcon,
} from "lucide-react";
import ProductImportExport from "./ProductImportExport";
function money(value) {
  const number = Number(value ?? 0);
  return `৳${number.toLocaleString("en-BD", {
    maximumFractionDigits: 2,
  })}`;
}
function getImageUrl(media) {
  if (!media) return null;
  const backendUrl = (
    process.env.NEXT_PUBLIC_LARAVEL_URL ||
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");
  const value =
    media.url ||
    media.external_url ||
    media.file_path ||
    "";
  if (!value) return null;
  if (/^(data:image\/|blob:)/i.test(value)) {
    return value;
  }
  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      if (
        url.hostname === "localhost" ||
        url.hostname === "127.0.0.1"
      ) {
        return `${backendUrl}${url.pathname}${url.search}`;
      }
      return value;
    } catch {
      return null;
    }
  }
  const cleanPath = value
    .replace(/^\/+/, "")
    .replace(/^public\//, "")
    .replace(/^storage\//, "");
  return `${backendUrl}/storage/${cleanPath}`;
}
function getStatusStyle(status) {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "draft":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "archived":
      return "bg-slate-100 text-slate-600 ring-slate-200";
    default:
      return "bg-gray-100 text-gray-600 ring-gray-200";
  }
}
async function fetchJSON(url, signal) {
  const response = await fetch(url, {
    cache: "no-store",
    signal,
    headers: {
      Accept: "application/json",
    },
  });
  const contentType =
    response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      "Invalid response from product API."
    );
  }
  const result = await response.json();
  if (!response.ok || result.success === false) {
    throw new Error(
      result.message || "Unable to load products."
    );
  }
  return result.data;
}
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  background,
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            {Number(value || 0).toLocaleString()}
          </h3>
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${background}`}
        >
          <Icon size={21} className={color} />
        </div>
      </div>
    </div>
  );
}
function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${getStatusStyle(status)}`}
    >
      {status || "Unknown"}
    </span>
  );
}
function ProductThumbnail({ product }) {
  const media = Array.isArray(product.media)
    ? product.media
    : [];
  const cover =
    media.find((item) => Boolean(item.is_cover)) ||
    media[0] ||
    product.cover_image ||
    null;
  const imageUrl = getImageUrl(cover);
  const [failedUrl, setFailedUrl] = useState(null);
  const failed = failedUrl === imageUrl;
  if (!imageUrl || failed) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
        <ImageIcon
          size={20}
          className="text-gray-400"
        />
      </div>
    );
  }
  return (
    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={cover?.alt_text || product.title}
        className="h-full w-full object-contain"
        onError={() => setFailedUrl(imageUrl)}
      />
    </div>
  );
}
export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  });
  const refreshProducts = useCallback(() => {
    setRefreshKey((previous) => previous + 1);
  }, []);
  const handleProductDeleted = useCallback(() => {
  if (products.length === 1 && page > 1) {
    setPage((current) => Math.max(1, current - 1));
  } else {
    refreshProducts();
  }
}, [products.length, page, refreshProducts]);
  const handleNewArrivalUpdated = useCallback((productId, value) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId
          ? { ...product, is_new_arrival: value }
          : product
      )
    );
  }, []);
  const handleImportCompleted = useCallback(() => {
    setPage(1);
    refreshProducts();
  }, [refreshProducts]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          page: String(page),
          per_page: String(perPage),
          sort_by: "created_at",
          sort_direction: "desc",
        });
        if (search) {
          params.set("search", search);
        }
        if (status !== "all") {
          params.set("status", status);
        }
        const [productData, statisticData] =
          await Promise.all([
            fetchJSON(
              `/api/admin/products?${params.toString()}`,
              controller.signal
            ),
            fetchJSON(
              "/api/admin/products/statistics",
              controller.signal
            ),
          ]);
        if (controller.signal.aborted) return;
        setProducts(
          Array.isArray(productData?.data)
            ? productData.data
            : []
        );
        setPagination({
          current_page: productData?.current_page ?? page,
          last_page: productData?.last_page ?? 1,
          total: productData?.total ?? 0,
          from: productData?.from ?? 0,
          to: productData?.to ?? 0,
        });
        setStatistics(statisticData);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(
          err.message || "Something went wrong."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }
    load();
    return () => controller.abort();
  }, [
    page,
    perPage,
    search,
    status,
    refreshKey,
  ]);
  const stats = [
    {
      title: "Total Products",
      value: statistics?.total_products,
      icon: Package,
      color: "text-slate-700",
      background: "bg-slate-100",
    },
    {
      title: "Active Products",
      value: statistics?.active_products,
      icon: PackageCheck,
      color: "text-emerald-700",
      background: "bg-emerald-50",
    },
    {
      title: "Draft Products",
      value: statistics?.draft_products,
      icon: FilePenLine,
      color: "text-amber-700",
      background: "bg-amber-50",
    },
    {
      title: "Archived",
      value: statistics?.archived_products,
      icon: Archive,
      color: "text-purple-700",
      background: "bg-purple-50",
    },
    {
      title: "Out of Stock",
      value: statistics?.out_of_stock,
      icon: PackageX,
      color: "text-red-700",
      background: "bg-red-50",
    },
  ];
  const filters = [
    { value: "all", label: "All Products" },
    { value: "active", label: "Active" },
    { value: "draft", label: "Draft" },
    { value: "archived", label: "Archived" },
  ];
  return (
    <div
      className="min-h-screen bg-[#F7F8FA] p-4 text-gray-900 sm:p-6"
      style={{ fontFamily: "'Segoe UI', sans-serif" }}
    >
      <div className="mx-auto max-w-[1600px] space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-950">
              Products
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your products, pricing and inventory.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={refreshProducts}
              disabled={loading}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  loading ? "animate-spin" : ""
                }
              />
              Refresh
            </button>
            <Link
              href="/admin/products/new"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#05714B] px-4 text-sm font-semibold text-white transition hover:bg-[#045C3D]"
            >
              <Plus size={17} />
              Add Product
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {stats.map((item) => (
            <StatCard
              key={item.title}
              {...item}
            />
          ))}
        </div>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap gap-1 border-b border-gray-200 px-4 pt-4 sm:px-5">
            {filters.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  setStatus(item.value);
                  setPage(1);
                }}
                className={`border-b-2 px-4 pb-3 text-sm font-semibold transition ${
                  status === item.value
                    ? "border-[#05714B] text-[#05714B]"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
            <div className="relative w-full max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                placeholder="Search products, SKU or barcode..."
                className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#05714B] focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ProductImportExport
                status={status}
                search={search}
                onImported={handleImportCompleted}
              />
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  Show
                </span>
                <select
                  value={perPage}
                  onChange={(event) => {
                    setPerPage(Number(event.target.value));
                    setPage(1);
                  }}
                  className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#05714B]"
                >
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>
          {error && (
            <div
              role="alert"
              className="mx-4 mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:mx-5"
            >
              <AlertCircle size={18} />
              {error}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="border-y border-gray-200 bg-gray-50">
                <tr className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3">
                    Product
                  </th>
                  <th className="px-4 py-3">
                    SKU
                  </th>
                  <th className="px-4 py-3">
                    Category
                  </th>
                  <th className="px-4 py-3">
                    Price
                  </th>
                  <th className="px-4 py-3">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-center">
                    New Arrival
                  </th>
                  <th className="px-4 py-3">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-20">
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                        <LoaderCircle
                          size={20}
                          className="animate-spin text-[#05714B]"
                        />
                        Loading products...
                      </div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-20">
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                          <Package
                            size={30}
                            className="text-[#05714B]"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            No products found
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {search || status !== "all"
                              ? "Try changing your search or filters."
                              : "Your products will appear here."}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr
                      key={product.id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <ProductThumbnail
                            product={product}
                          />
                          <div className="min-w-0">
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="block max-w-[280px] truncate text-sm font-semibold text-gray-900 hover:text-[#05714B]"
                            >
                              {product.title}
                            </Link>
                            <p className="mt-1 text-xs text-gray-400">
                              #{product.id}
                              {product.brand?.name
                                ? ` · ${product.brand.name}`
                                : ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {product.sku || "—"}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {product.category?.name ||
                          "Uncategorized"}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {money(product.price)}
                        </div>
                        {Number(product.compare_at_price) >
                          Number(product.price) && (
                          <div className="text-xs text-gray-400 line-through">
                            {money(
                              product.compare_at_price
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {product.has_variants ? (
                          <span className="text-gray-500">
                            Variant stock
                          </span>
                        ) : product.track_quantity ? (
                          <span
                            className={
                              Number(product.quantity) === 0
                                ? "font-semibold text-red-600"
                                : "font-medium text-gray-800"
                            }
                          >
                            {Number(
                              product.quantity || 0
                            )}
                          </span>
                        ) : (
                          <span className="text-gray-500">
                            Not tracked
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <NewArrivalSwitch
                          product={product}
                          onUpdated={handleNewArrivalUpdated}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge
                          status={product.status}
                        />
                      </td>
<td className="px-4 py-4">
  <div className="flex justify-end gap-2">
    <Link
      href={`/admin/products/${product.id}/edit`}
      title="Edit product"
      aria-label={`Edit ${product.title}`}
      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-[#05714B]"
    >
      <Pencil size={16} />
    </Link>
    <button
      type="button"
      title="View product details"
      aria-label={`View ${product.title}`}
      onClick={() =>
        window.alert(
          `${product.title}\nSKU: ${
            product.sku || "N/A"
          }\nStatus: ${product.status}`
        )
      }
      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-100"
    >
      <Eye size={16} />
    </button>
    <ProductDeleteButton
      product={product}
      onDeleted={handleProductDeleted}
    />
  </div>
</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-4 py-4 sm:px-5">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <strong className="text-gray-800">
                {pagination.from || 0}
              </strong>
              {" - "}
              <strong className="text-gray-800">
                {pagination.to || 0}
              </strong>
              {" of "}
              <strong className="text-gray-800">
                {pagination.total || 0}
              </strong>
              {" products"}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={loading || page <= 1}
                onClick={() =>
                  setPage((current) =>
                    Math.max(1, current - 1)
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="px-2 text-sm text-gray-600">
                Page{" "}
                <strong>
                  {pagination.current_page}
                </strong>
                {" of "}
                <strong>
                  {pagination.last_page}
                </strong>
              </span>
              <button
                type="button"
                disabled={
                  loading ||
                  page >= pagination.last_page
                }
                onClick={() =>
                  setPage((current) => current + 1)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
