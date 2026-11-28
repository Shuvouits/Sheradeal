"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  FolderTree,
  BadgeCheck,
  Ban,
  Layers,
  Boxes,
  Plus,
  Search,
  ArrowUpDown,
  Pencil,
  Star,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  LoaderCircle,
  ImageIcon,
} from "lucide-react";

import CategoryStyles from "./CategoryStyles";
import { apiImage, categoryRequest } from "./categoryUtils";

const filters = ["all", "active", "featured", "inactive"];

const statDefinitions = [
  {
    key: "total",
    label: "Total Categories",
    note: "All category records",
    icon: FolderTree,
  },
  {
    key: "active",
    label: "Active Categories",
    note: "Visible on storefront",
    icon: BadgeCheck,
  },
  {
    key: "inactive",
    label: "Inactive Categories",
    note: "Hidden from customers",
    icon: Ban,
  },
  {
    key: "parent_categories",
    label: "Parent Categories",
    note: "Top-level taxonomy",
    icon: Layers,
  },
  {
    key: "assigned_products",
    label: "Assigned Products",
    note: "Products mapped to categories",
    icon: Boxes,
  },
];

function getProductCount(category) {
  const value =
    category.products_count ??
    category.product_count ??
    category.assigned_products_count;

  if (value === null || value === undefined) {
    return null;
  }

  const count = Number(value);

  return Number.isFinite(count) ? count : null;
}

function getStatValue(stats, key) {
  if (!stats) return null;

  if (key === "assigned_products") {
    return (
      stats.assigned_products ??
      stats.assigned_products_count ??
      null
    );
  }

  return stats[key] ?? null;
}

function CategoryCover({ category }) {
  const [failedUrl, setFailedUrl] = useState(null);

  const src = apiImage(category.cover_image);
  const broken = src === failedUrl;

  return (
    <span className="cat-thumb">
      {src && !broken ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt={category.name}
          onError={() => setFailedUrl(src)}
        />
      ) : (
        <ImageIcon size={21} />
      )}
    </span>
  );
}

export default function CategoriesList() {
  const [filter, setFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name_asc");
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState(null);

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const refresh = useCallback(() => {
    setRevision((current) => current + 1);
  }, []);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const params = new URLSearchParams({
      filter,
      sort,
      page: String(page),
      per_page: "15",
    });

    if (search) {
      params.set("search", search);
    }

    setLoading(true);
    setError("");

    Promise.all([
      categoryRequest(`/api/admin/categories?${params}`, {
        signal: controller.signal,
      }),
      categoryRequest("/api/admin/categories/statistics", {
        signal: controller.signal,
      }),
    ])
      .then(([listing, summary]) => {
        if (!active) return;

        const result = listing?.data || [];

        setRows(Array.isArray(result) ? result : []);

        setPagination({
          current_page: listing?.current_page || 1,
          last_page: listing?.last_page || 1,
          total: listing?.total ?? 0,
        });

        setStats(summary);
      })
      .catch((err) => {
        if (active && err.name !== "AbortError") {
          setError(err.message || "Unable to load categories.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [filter, search, sort, page, revision]);

  async function runAction(category, method, suffix, message) {
    setBusyId(category.id);
    setError("");
    setNotice("");

    try {
      await categoryRequest(
        `/api/admin/categories/${category.id}${suffix}`,
        { method }
      );

      setNotice(message);

      if (method === "DELETE" && rows.length === 1 && page > 1) {
        setPage((current) => Math.max(1, current - 1));
      } else {
        refresh();
      }
    } catch (err) {
      setError(err.message || "Unable to complete this action.");
    } finally {
      setBusyId(null);
      setDeleteTarget(null);
    }
  }



  async function toggleMegaMenu(category) {
    if (busyId !== null) return;

    const nextValue = !category.show_in_megamenu;

    setBusyId(category.id);
    setError("");
    setNotice("");

    try {
      const updated = await categoryRequest(
        `/api/admin/categories/${category.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            show_in_megamenu: nextValue,
          }),
        }
      );

      setRows((current) =>
        current.map((item) =>
          item.id === category.id
            ? {
                ...item,
                show_in_megamenu:
                  updated?.show_in_megamenu ?? nextValue,
              }
            : item
        )
      );

      setNotice(
        `${category.name} ${nextValue ? "added to" : "removed from"} Mega Menu.`
      );
    } catch (err) {
      setError(err.message || "Unable to update Mega Menu status.");
    } finally {
      setBusyId(null);
    }
  }


  return (
    <div className="cat-root">
      <CategoryStyles />

      <div className="cat-stats">
        {statDefinitions.map(({ key, label, note, icon: Icon }) => {
          const value = getStatValue(stats, key);

          return (
            <div className="cat-stat" key={key}>
              <div className="cat-stat-top">
                <span>{label}</span>

                <span className="cat-stat-icon">
                  <Icon size={18} />
                </span>
              </div>

              <strong>
                {value == null
                  ? "—"
                  : Number(value).toLocaleString("en-BD")}
              </strong>

              <small>{note}</small>
            </div>
          );
        })}
      </div>

      <section className="cat-panel">
        <header className="cat-panel-title">
          <h1>Categories</h1>

          <Link
            href="/admin/categories/create"
            className="cat-button cat-primary"
          >
            <Plus size={17} />
            Add Category
          </Link>
        </header>

        {error && (
          <div
            className="cat-notice cat-notice-error"
            role="alert"
          >
            <AlertTriangle size={17} />
            {error}
          </div>
        )}

        {notice && (
          <div
            className="cat-notice cat-notice-success"
            role="status"
          >
            {notice}
          </div>
        )}

        <div className="cat-table-border">
          <div className="cat-tabs">
            {filters.map((value) => (
              <button
                type="button"
                key={value}
                className={value === filter ? "active" : ""}
                onClick={() => {
                  setFilter(value);
                  setPage(1);
                }}
              >
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </button>
            ))}
          </div>

          <div className="cat-tools">
            <label className="cat-search">
              <Search size={17} />

              <input
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                placeholder="Search categories..."
              />

              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </label>

            <label className="cat-sort">
              <ArrowUpDown size={16} />

              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value);
                  setPage(1);
                }}
              >
                <option value="name_asc">Name A–Z</option>
                <option value="name_desc">Name Z–A</option>
                <option value="latest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="display_order">Display order</option>
              </select>
            </label>
          </div>

          <div className="cat-table-wrap">
            <table className="cat-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Parent</th>
                  <th>Products</th>
                  <th>Featured</th>
                  <th>Mega Menu</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="cat-empty">
                      <LoaderCircle
                        size={19}
                        className="cat-spinner"
                      />
                      Loading categories...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="cat-empty">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  rows.map((category) => {
                    const productCount = getProductCount(category);

                    return (
                      <tr key={category.id}>
                        <td>
                          <div className="cat-name">
                            <CategoryCover category={category} />

                            <div>
                              <strong>{category.name}</strong>
                              <small>/{category.slug}</small>
                            </div>
                          </div>
                        </td>

                        <td>{category.parent?.name || "Root"}</td>

                        <td>
                          <span
                            className="font-medium text-gray-800"
                            title={
                              productCount == null
                                ? "Product count unavailable"
                                : `${productCount} assigned products`
                            }
                          >
                            {productCount == null
                              ? "—"
                              : productCount.toLocaleString("en-BD")}
                          </span>
                        </td>

                        <td>
                          {category.is_featured ? (
                            <span className="cat-featured">
                              <Star
                                size={12}
                                fill="currentColor"
                              />
                              Featured
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>


<td>
  <button
    type="button"
    role="switch"
    aria-checked={Boolean(category.show_in_megamenu)}
    aria-label={`${category.show_in_megamenu ? "Hide" : "Show"} ${category.name} in Mega Menu`}
    title={category.show_in_megamenu ? "Visible in Mega Menu" : "Hidden from Mega Menu"}
    disabled={busyId !== null}
    onClick={() => toggleMegaMenu(category)}
    className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full border-0 p-0.5 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#05714B] disabled:cursor-not-allowed disabled:opacity-50 ${
      category.show_in_megamenu
        ? "bg-[#05714B]"
        : "bg-gray-300"
    }`}
  >
    <span
      className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
        category.show_in_megamenu
          ? "translate-x-5"
          : "translate-x-0"
      }`}
    />
  </button>
</td>


                        <td>
                          <span
                            className={`cat-pill ${category.status}`}
                          >
                            {category.status}
                          </span>
                        </td>

                        <td>
                          <div className="cat-actions">
                            <Link
                              href={`/admin/categories/${category.id}/edit`}
                              title="Edit category"
                              aria-label={`Edit ${category.name}`}
                            >
                              <Pencil size={16} />
                            </Link>

                            <button
                              type="button"
                              title="Toggle featured"
                              aria-label={`Toggle featured for ${category.name}`}
                              disabled={busyId === category.id}
                              onClick={() =>
                                runAction(
                                  category,
                                  "PATCH",
                                  "/featured",
                                  "Featured status updated."
                                )
                              }
                            >
                              <Star
                                size={16}
                                fill={
                                  category.is_featured
                                    ? "currentColor"
                                    : "none"
                                }
                                className={
                                  category.is_featured
                                    ? "cat-star"
                                    : ""
                                }
                              />
                            </button>

                            <button
                              type="button"
                              title="Delete category"
                              aria-label={`Delete ${category.name}`}
                              disabled={busyId === category.id}
                              onClick={() => {
                                setError("");
                                setNotice("");
                                setDeleteTarget(category);
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <footer className="cat-pagination">
            <span>{pagination.total} categories</span>

            <div>
              <button
                type="button"
                disabled={loading || page <= 1}
                onClick={() =>
                  setPage((current) => current - 1)
                }
                aria-label="Previous page"
              >
                <ChevronLeft size={17} />
              </button>

              <span>
                Page {pagination.current_page} of{" "}
                {pagination.last_page}
              </span>

              <button
                type="button"
                disabled={loading || page >= pagination.last_page}
                onClick={() =>
                  setPage((current) => current + 1)
                }
                aria-label="Next page"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </footer>
        </div>
      </section>

      {deleteTarget && (
        <div
          className="cat-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              busyId == null
            ) {
              setDeleteTarget(null);
            }
          }}
        >
          <div
            className="cat-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cat-delete-title"
          >
            <button
              type="button"
              className="cat-modal-x"
              onClick={() => setDeleteTarget(null)}
              disabled={busyId != null}
              aria-label="Close"
            >
              <X size={19} />
            </button>

            <div className="cat-modal-icon">
              <Trash2 size={27} />
            </div>

            <h2 id="cat-delete-title">
              Delete Category
            </h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.name}</strong>?
              This action cannot be undone from this screen.
            </p>

            {getProductCount(deleteTarget) > 0 && (
              <div
                className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
              >
                <AlertTriangle
                  size={17}
                  className="mt-0.5 shrink-0"
                />
                <span>
                  This category contains{" "}
                  <strong>
                    {getProductCount(deleteTarget)}
                  </strong>{" "}
                  active product(s). Delete or move those
                  products before deleting this category.
                </span>
              </div>
            )}

            <div className="cat-modal-buttons">
              <button
                type="button"
                className="cat-button cat-outline"
                disabled={busyId != null}
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="cat-button cat-danger"
                disabled={
                  busyId != null ||
                  getProductCount(deleteTarget) > 0
                }
                onClick={() =>
                  runAction(
                    deleteTarget,
                    "DELETE",
                    "",
                    "Category deleted successfully."
                  )
                }
              >
                {busyId != null
                  ? "Deleting..."
                  : "Delete Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
