"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Tag, BadgeCheck, Ban, Clock3, Star, Plus,
  Search, Pencil, Archive, Trash2, RotateCcw,
  ChevronLeft, ChevronRight, X, LoaderCircle,
  AlertCircle, CheckCircle2, ArrowUpDown,
} from "lucide-react";
import BrandStyles from "./BrandStyles";

const tabs = [
  ["all", "All"],
  ["pending", "Pending"],
  ["active", "Active"],
  ["featured", "Featured"],
  ["inactive", "Inactive"],
  ["rejected", "Rejected"],
  ["archived", "Archived"],
];

const statItems = [
  { key: "total", label: "Total brands", desc: "All brands in your catalog", icon: Tag },
  { key: "active", label: "Active brands", desc: "Visible on the storefront", icon: BadgeCheck },
  { key: "inactive", label: "Inactive brands", desc: "Hidden from the storefront", icon: Ban },
  { key: "pending", label: "Pending approval", desc: "Brands awaiting review", icon: Clock3 },
  { key: "featured", label: "Featured brands", desc: "Highlighted on the storefront", icon: Star },
];

function BrandLogo({ brand }) {
  const base = process.env.NEXT_PUBLIC_LARAVEL_URL || "http://127.0.0.1:8000";
  const url = brand.logo
    ? `${base.replace(/\/$/, "")}/storage/${brand.logo.replace(/^\/+/, "")}`
    : null;

  return (
    <div className="br-logo">
      {url ? (
        <img
          src={url}
          alt={brand.name}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      ) : (
        <span>{brand.name?.charAt(0)?.toUpperCase() || "B"}</span>
      )}
    </div>
  );
}

export default function BrandsList() {
  const [brands, setBrands] = useState([]);
  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleteBrand, setDeleteBrand] = useState(null);

  const fetchBrands = useCallback(async (signal) => {
    setLoading(true);
    setError("");

    const params = new URLSearchParams({
      filter,
      sort,
      page: String(page),
      per_page: "15",
    });

    if (search.trim()) params.set("search", search.trim());

    try {
      const response = await fetch(`/api/admin/brands?${params}`, {
        cache: "no-store",
        signal,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load brands.");
      }

      const data = result.data;

      setBrands(data?.data || []);
      setPagination({
        current_page: data?.current_page || 1,
        last_page: data?.last_page || 1,
        total: data?.total || 0,
      });
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [filter, search, sort, page]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/brands/statistics", {
        cache: "no-store",
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setStats(result.data || {});
      }
    } catch {
      // Listing errors are displayed separately.
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchBrands(controller.signal);
    return () => controller.abort();
  }, [fetchBrands]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const action = async (brand, endpoint, method, successMessage) => {
    setBusy(brand.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `/api/admin/brands/${brand.id}${endpoint}`,
        { method }
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Action failed.");
      }

      setNotice(successMessage);
      await Promise.all([fetchBrands(), fetchStats()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
      setDeleteBrand(null);
    }
  };

  return (
    <div className="br-page">
      <BrandStyles />

      <div className="br-stats">
        {statItems.map(({ key, label, desc, icon: Icon }) => (
          <div className="br-stat" key={key}>
            <div className="br-stat-head">
              <span>{label}</span>
              <span className="br-stat-icon"><Icon size={18} /></span>
            </div>
            <strong>{stats[key] ?? "—"}</strong>
            <small>{desc}</small>
          </div>
        ))}
      </div>

      <section className="br-panel">
        <div className="br-panel-title">
          <h1>Brands</h1>
          <Link className="br-btn br-btn-primary" href="/admin/brands/create">
            <Plus size={17} /> Add Brand
          </Link>
        </div>

        {error && (
          <div className="br-alert br-alert-error">
            <AlertCircle size={17} /> {error}
          </div>
        )}

        {notice && (
          <div className="br-alert br-alert-success">
            <CheckCircle2 size={17} /> {notice}
          </div>
        )}

        <div className="br-table-frame">
          <div className="br-tabs">
            {tabs.map(([value, label]) => (
              <button
                key={value}
                className={filter === value ? "active" : ""}
                onClick={() => { setFilter(value); setPage(1); }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="br-tools">
            <div className="br-search">
              <Search size={18} />
              <input
                value={search}
                placeholder="Search brands..."
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
              {search && (
                <button onClick={() => setSearch("")} aria-label="Clear search">
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="br-sort">
              <ArrowUpDown size={16} />
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
              >
                <option value="latest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="name_asc">Name A–Z</option>
                <option value="name_desc">Name Z–A</option>
                <option value="display_order">Display order</option>
              </select>
            </div>
          </div>

          <div className="br-table-scroll">
            <table className="br-table">
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Products</th>
                  <th>Source</th>
                  <th>Approval</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="br-empty">
                    <LoaderCircle size={21} className="br-spin" />
                    Loading brands...
                  </td></tr>
                ) : brands.length === 0 ? (
                  <tr><td colSpan={6} className="br-empty">
                    No brands found.
                  </td></tr>
                ) : brands.map((brand) => (
                  <tr key={brand.id}>
                    <td>
                      <div className="br-brand-cell">
                        <BrandLogo brand={brand} />
                        <div>
                          <strong>{brand.name}</strong>
                          <small>/{brand.slug}</small>
                        </div>
                      </div>
                    </td>
                    <td>{brand.products_count ?? "—"}</td>
                    <td className="br-capitalize">{brand.source}</td>
                    <td>
                      <span className={`br-pill ${brand.approval_status}`}>
                        {brand.approval_status}
                      </span>
                    </td>
                    <td>
                      <span className={`br-pill ${brand.status}`}>
                        {brand.status}
                      </span>
                    </td>
                    <td>
                      <div className="br-row-actions">
                        <Link
                          href={`/admin/brands/${brand.id}/edit`}
                          title="Edit brand"
                          aria-label={`Edit ${brand.name}`}
                        >
                          <Pencil size={16} />
                        </Link>

                        <button
                          title={brand.is_featured ? "Remove featured" : "Mark featured"}
                          disabled={busy === brand.id}
                          onClick={() => action(brand, "/featured", "PATCH", "Featured status updated.")}
                          aria-label={`Toggle featured for ${brand.name}`}
                        >
                          <Star
                            size={16}
                            fill={brand.is_featured ? "currentColor" : "none"}
                            className={brand.is_featured ? "br-star-active" : ""}
                          />
                        </button>

                        <button
                          title={brand.status === "archived" ? "Unarchive brand" : "Archive brand"}
                          disabled={busy === brand.id}
                          onClick={() => action(
                            brand,
                            brand.status === "archived" ? "/unarchive" : "/archive",
                            "PATCH",
                            "Brand status updated."
                          )}
                        >
                          {brand.status === "archived" ? <RotateCcw size={16} /> : <Archive size={16} />}
                        </button>

                        <button
                          title="Delete brand"
                          className="br-delete-icon"
                          disabled={busy === brand.id}
                          onClick={() => setDeleteBrand(brand)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="br-pagination">
            <span>{pagination.total} brands</span>
            <div>
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft size={17} />
              </button>
              <span>Page {pagination.current_page} of {pagination.last_page}</span>
              <button
                disabled={page >= pagination.last_page || loading}
                onClick={() => setPage(p => p + 1)}
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {deleteBrand && (
        <div className="br-modal-overlay" onClick={() => setDeleteBrand(null)}>
          <div
            className="br-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="br-delete-title"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="br-modal-close"
              onClick={() => setDeleteBrand(null)}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="br-modal-icon"><Trash2 size={25} /></div>

            <h2 id="br-delete-title">Delete Brand</h2>
            <p>
              Are you sure you want to delete <strong>{deleteBrand.name}</strong>?
              This action cannot be undone from this screen.
            </p>

            <div className="br-modal-actions">
              <button className="br-btn br-btn-outline" onClick={() => setDeleteBrand(null)}>
                Cancel
              </button>
              <button
                className="br-btn br-btn-danger"
                disabled={busy !== null}
                onClick={() => action(deleteBrand, "", "DELETE", "Brand deleted successfully.")}
              >
                {busy !== null ? "Deleting..." : "Delete Brand"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
