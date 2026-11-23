"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Layers,
  CheckCircle2,
  Hand,
  Globe2,
  Boxes,
  LoaderCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  X,
} from "lucide-react";
import { collectionRequest } from "@/lib/collectionApi";

const EMPTY_STATS = {
  total_collections: 0,
  active_collections: 0,
  manual_collections: 0,
  online_collections: 0,
  assigned_products: 0,
};

const STATUS_TABS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Draft", value: "draft" },
];

function StatisticCard({ label, value, hint, icon: Icon, color }) {
  return (
    <div className="flex min-w-0 items-start justify-between border-b border-gray-200 bg-white p-5 last:border-0 sm:border-b-0 sm:border-r">
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-gray-600">{label}</p>
        <p className="mt-2 text-[25px] font-bold text-gray-950">
          {Number(value).toLocaleString("en-US")}
        </p>
        <p className="mt-1 text-[11px] text-gray-400">{hint}</p>
      </div>

      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${color}13`, color }}
      >
        <Icon size={19} />
      </div>
    </div>
  );
}

function DeleteCollectionModal({ collection, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      await collectionRequest(`/${collection.id}`, {
        method: "DELETE",
      });

      onDeleted();
    } catch (err) {
      setError(err.message || "Unable to delete collection.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="h-1 bg-red-500" />

        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          aria-label="Close"
          className="absolute right-4 top-5 cursor-pointer rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
        >
          <X size={18} />
        </button>

        <div className="px-6 pb-6 pt-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
            <Trash2 size={27} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-gray-900">
            Delete Collection
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Are you sure you want to delete{" "}
            <strong className="text-gray-800">
              {collection.title}
            </strong>
            ? This action cannot be undone.
          </p>

          {error && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mt-7 grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleDelete}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {loading && <LoaderCircle size={16} className="animate-spin" />}
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CollectionsList() {
  const [collections, setCollections] = useState([]);
  const [statistics, setStatistics] = useState(EMPTY_STATS);
  const [pagination, setPagination] = useState({
    total: 0,
    current_page: 1,
    last_page: 1,
  });

  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setQuery(search.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  const loadCollections = useCallback(async (signal) => {
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
      status,
    });

    if (query) params.set("search", query);

    const data = await collectionRequest(`?${params}`, { signal });

    return {
      records: Array.isArray(data?.data) ? data.data : [],
      pagination: {
        total: Number(data?.total || 0),
        current_page: Number(data?.current_page || 1),
        last_page: Number(data?.last_page || 1),
      },
    };
  }, [page, perPage, status, query]);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError("");

      try {
        const [listResult, statsResult] = await Promise.all([
          loadCollections(controller.signal),
          collectionRequest("/statistics", {
            signal: controller.signal,
          }),
        ]);

        if (controller.signal.aborted) return;

        setCollections(listResult.records);
        setPagination(listResult.pagination);
        setStatistics(statsResult || EMPTY_STATS);
      } catch (err) {
        if (err.name !== "AbortError" && !controller.signal.aborted) {
          setError(err.message || "Unable to load collections.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    load();

    return () => controller.abort();
  }, [loadCollections, refreshKey]);

  function selectStatus(nextStatus) {
    setStatus(nextStatus);
    setPage(1);
  }

  function handleDeleted() {
    setDeleting(null);
    setSuccess("Collection deleted successfully.");

    if (collections.length === 1 && page > 1) {
      setPage((current) => current - 1);
    } else {
      setRefreshKey((current) => current + 1);
    }
  }

  const stats = [
    {
      label: "Total Collections",
      value: statistics.total_collections,
      hint: "All collection groups",
      icon: Layers,
      color: "#2563EB",
    },
    {
      label: "Active Collections",
      value: statistics.active_collections,
      hint: "Available to customers",
      icon: CheckCircle2,
      color: "#059669",
    },
    {
      label: "Manual Collections",
      value: statistics.manual_collections,
      hint: "Curated by admin",
      icon: Hand,
      color: "#6366F1",
    },
    {
      label: "Online Store",
      value: statistics.online_collections,
      hint: "Published collections",
      icon: Globe2,
      color: "#0891B2",
    },
    {
      label: "Assigned Products",
      value: statistics.assigned_products,
      hint: "Manual product assignments",
      icon: Boxes,
      color: "#7C3AED",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1550px] space-y-5">
      <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:grid-cols-3 xl:grid-cols-5">
        {stats.map((item) => (
          <StatisticCard key={item.label} {...item} />
        ))}
      </div>

      {success && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-[#05714B]">
          <CheckCircle2 size={18} />
          <span className="flex-1">{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss"
            className="cursor-pointer"
          >
            <X size={17} />
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-5">
          <div>
            <h1 className="text-[21px] font-bold text-gray-950">
              Collections
            </h1>
            <p className="mt-1 text-xs text-gray-500">
              Create and manage curated product groups.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRefreshKey((current) => current + 1)}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              <RefreshCw size={15} />
              Refresh
            </button>

            <Link
              href="/admin/collections/new"
              className="inline-flex items-center gap-2 rounded-lg bg-[#05714B] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#045C3D]"
            >
              <Plus size={17} />
              Add Collection
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-6 border-b border-gray-200 px-5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => selectStatus(tab.value)}
              className={`relative cursor-pointer py-4 text-sm font-medium ${
                status === tab.value
                  ? "text-[#05714B]"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab.label}

              {status === tab.value && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#05714B]" />
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
          <div className="relative w-full max-w-[460px]">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search collections..."
              className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-[#05714B]"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            Show
            <select
              value={perPage}
              onChange={(event) => {
                setPerPage(Number(event.target.value));
                setPage(1);
              }}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-gray-700 outline-none"
            >
              <option value={15}>15</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {error && (
          <div role="alert" className="m-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead className="bg-gray-50 text-[11px] font-semibold uppercase text-gray-500">
              <tr className="border-b border-gray-200">
                <th className="px-5 py-4">Collection</th>
                <th className="px-4 py-4">Type</th>
                <th className="px-4 py-4">Products</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Available In</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <LoaderCircle
                      size={28}
                      className="mx-auto animate-spin text-[#05714B]"
                    />
                  </td>
                </tr>
              ) : collections.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <Layers size={34} className="mx-auto text-gray-300" />
                    <p className="mt-3 text-sm text-gray-500">
                      No collections found.
                    </p>
                  </td>
                </tr>
              ) : (
                collections.map((collection) => (
                  <tr
                    key={collection.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                          {collection.cover_image_url ? (
                            <img
                              src={collection.cover_image_url}
                              alt={collection.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon size={20} className="text-gray-400" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-[310px] truncate text-[13px] font-semibold text-gray-900">
                            {collection.title}
                          </p>
                          <p className="mt-1 text-[11px] text-gray-400">
                            /{collection.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-full border border-gray-200 px-2.5 py-1 text-[11px] font-medium capitalize text-gray-600">
                        {collection.collection_type}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-[13px] font-medium text-gray-800">
                      {collection.products_count ?? 0}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          collection.status === "active"
                            ? "bg-emerald-50 text-[#05714B]"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {collection.status === "active" ? "Active" : "Draft"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {collection.publish_online && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] text-[#05714B]">
                            <Globe2 size={12} /> Online
                          </span>
                        )}

                        {collection.publish_pos && (
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] text-gray-600">
                            POS
                          </span>
                        )}

                        {!collection.publish_online && !collection.publish_pos && (
                          <span className="text-xs text-gray-400">None</span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/collections/${collection.id}/edit`}
                          title="Edit Collection"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-[#05714B] hover:text-[#05714B]"
                        >
                          <Pencil size={16} />
                        </Link>

                        <button
                          type="button"
                          title="Delete Collection"
                          onClick={() => setDeleting(collection)}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-4 text-xs text-gray-500">
          <span>
            {pagination.total.toLocaleString()} collections
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => current - 1)}
              className="cursor-pointer rounded-lg border border-gray-200 p-2 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={17} />
            </button>

            <span>
              Page {pagination.current_page} of {pagination.last_page}
            </span>

            <button
              type="button"
              disabled={page >= pagination.last_page || loading}
              onClick={() => setPage((current) => current + 1)}
              className="cursor-pointer rounded-lg border border-gray-200 p-2 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>

      {deleting && (
        <DeleteCollectionModal
          collection={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
