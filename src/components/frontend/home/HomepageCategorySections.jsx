"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Search,
  LoaderCircle,
  Settings2,
  Package,
  FolderOpen,
  AlertCircle,
} from "lucide-react";
import PopularProductCard from "@/components/frontend/products/PopularProductCard";

const PUBLIC_API = "/api/storefront/category-sections";
const ADMIN_API = "/api/admin/homepage-category-sections";
const COLLECTION_API = "/api/admin/collections";

const EMPTY_FORM = {
  title: "",
  collection_id: "",
  product_limit: 10,
  display_order: 0,
  is_active: true,
};

const fieldClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#05714B] focus:ring-2 focus:ring-emerald-100";

function isAdmin(user) {
  const role = String(user?.role || "").toLowerCase();

  return ["admin", "super_admin", "administrator"].includes(role);
}

function getErrorMessage(result, fallback) {
  if (result?.errors) {
    const first = Object.values(result.errors).flat()[0];

    if (first) return String(first);
  }

  return result?.message || fallback;
}

function SectionEditor({
  section,
  collections,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    title: section?.title || "",
    collection_id: section?.collection_id
      ? String(section.collection_id)
      : "",
    product_limit: Number(section?.product_limit ?? 10),
    display_order: Number(section?.display_order ?? 0),
    is_active: section?.is_active ?? true,
  }));

  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedCollection = collections.find(
    (collection) =>
      String(collection.id) === String(form.collection_id)
  );

  const filteredCollections = collections.filter((collection) =>
    collection.title.toLowerCase().includes(search.toLowerCase()) ||
    collection.slug.toLowerCase().includes(search.toLowerCase())
  );

  function update(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function selectCollection(value) {
    const collection = collections.find(
      (item) => String(item.id) === value
    );

    setForm((previous) => ({
      ...previous,
      collection_id: value,
      title:
        previous.title.trim() === "" && collection
          ? `Shop From ${collection.title}`
          : previous.title,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");

    try {
      const payload = {
        title: form.title.trim(),
        collection_id: Number(form.collection_id),
        product_limit: Number(form.product_limit),
        display_order: Number(form.display_order),
        is_active: Boolean(form.is_active),
      };

      const response = await fetch(
        section ? `${ADMIN_API}/${section.id}` : ADMIN_API,
        {
          method: section ? "PUT" : "POST",
          credentials: "same-origin",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success !== true) {
        throw new Error(
          getErrorMessage(result, "Unable to save section.")
        );
      }

      onSaved();
    } catch (err) {
      setError(err.message || "Unable to save section.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 p-3 sm:p-5">
      <div className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {section
                ? "Edit Collection Section"
                : "Add Collection Section"}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Manage this section directly from the homepage.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close editor"
            className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="space-y-5 overflow-y-auto p-5">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                Section Title
              </label>

              <input
                required
                maxLength={160}
                value={form.title}
                onChange={(event) =>
                  update("title", event.target.value)
                }
                className={fieldClass}
                placeholder="Shop From Skincare"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                Select Collection <span className="text-red-500">*</span>
              </label>

              <div className="relative mb-2">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search collections..."
                  className={`${fieldClass} pl-9`}
                />
              </div>

              <select
                required
                value={form.collection_id}
                onChange={(event) =>
                  selectCollection(event.target.value)
                }
                className={fieldClass}
              >
                <option value="">Choose a collection</option>

                {filteredCollections.map((collection) => (
                  <option
                    key={collection.id}
                    value={collection.id}
                  >
                    {collection.title}
                  </option>
                ))}

                {selectedCollection &&
                  !filteredCollections.some(
                    (collection) =>
                      collection.id === selectedCollection.id
                  ) && (
                    <option value={selectedCollection.id}>
                      {selectedCollection.title}
                    </option>
                  )}
              </select>

              {collections.length === 0 && (
                <p className="mt-2 text-xs text-amber-600">
                  No collections available. Create a collection
                  from Admin → Products → Collections first.
                </p>
              )}
            </div>

            {selectedCollection && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white text-[#05714B]">
                    {selectedCollection.cover_image_url ? (
                      <img
                        src={selectedCollection.cover_image_url}
                        alt={selectedCollection.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FolderOpen size={20} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedCollection.title}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {selectedCollection.products_count ?? 0} products
                      {" · "}
                      <span className="capitalize">
                        {selectedCollection.collection_type}
                      </span>
                      {" collection"}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Status: {selectedCollection.status}
                      {" · "}
                      Online:{" "}
                      {selectedCollection.publish_online ? "Yes" : "No"}
                    </p>
                  </div>
                </div>

                {(selectedCollection.status !== "active" ||
                  !selectedCollection.publish_online) && (
                  <p className="mt-3 text-xs text-amber-700">
                    This collection is not published online.
                    Its products will remain hidden from customers.
                  </p>
                )}
              </div>
            )}

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-2">
                <Package size={18} className="text-[#05714B]" />

                <h3 className="text-sm font-semibold text-gray-800">
                  Product Selection
                </h3>
              </div>

              <p className="mt-2 text-xs leading-5 text-gray-500">
                Products are managed inside the selected collection.
                Manual collections follow your selected product order.
                Automated collections follow their configured rules.
              </p>

              <a
                href="/admin/collections"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex text-xs font-semibold text-[#05714B] hover:underline"
              >
                Manage Collections
              </a>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                  Product Limit
                </label>

                <input
                  type="number"
                  min="1"
                  max="30"
                  required
                  value={form.product_limit}
                  onChange={(event) =>
                    update("product_limit", event.target.value)
                  }
                  className={fieldClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                  Section Display Order
                </label>

                <input
                  type="number"
                  min="0"
                  required
                  value={form.display_order}
                  onChange={(event) =>
                    update("display_order", event.target.value)
                  }
                  className={fieldClass}
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 p-4">
              <span>
                <span className="block text-sm font-semibold text-gray-800">
                  Active Section
                </span>

                <span className="mt-1 block text-xs text-gray-500">
                  Show this section to customers.
                </span>
              </span>

              <input
                type="checkbox"
                checked={Boolean(form.is_active)}
                onChange={(event) =>
                  update("is_active", event.target.checked)
                }
                className="h-4 w-4 accent-[#05714B]"
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 bg-white p-4">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-gray-200 px-5 py-2.5 text-sm text-gray-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#05714B] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}

              {saving ? "Saving..." : "Save Section"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteSectionModal({ section, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (deleting) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(
        `${ADMIN_API}/${section.id}`,
        {
          method: "DELETE",
          credentials: "same-origin",
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success !== true) {
        throw new Error(
          getErrorMessage(result, "Unable to delete section.")
        );
      }

      onDeleted();
    } catch (err) {
      setError(err.message || "Unable to delete section.");
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[260] flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="h-1 bg-red-500" />

        <button
          type="button"
          onClick={onClose}
          disabled={deleting}
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
            Delete Collection Section
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Are you sure you want to delete{" "}
            <strong className="text-gray-800">
              {section.title}
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
              disabled={deleting}
              onClick={onClose}
              className="cursor-pointer rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {deleting && (
                <LoaderCircle size={16} className="animate-spin" />
              )}

              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomepageCategorySections() {
  const [sections, setSections] = useState([]);
  const [collections, setCollections] = useState([]);
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(undefined);
  const [deleting, setDeleting] = useState(null);
  const [refresh, setRefresh] = useState(0);

  const loadSections = useCallback(async (isAdministrator, signal) => {
    const response = await fetch(
      isAdministrator ? ADMIN_API : PUBLIC_API,
      {
        cache: "no-store",
        signal,
      }
    );

    const result = await response.json();

    if (!response.ok || result.success !== true) {
      throw new Error(
        getErrorMessage(result, "Unable to load sections.")
      );
    }

    return Array.isArray(result.data) ? result.data : [];
  }, []);

  const loadCollections = useCallback(async (signal) => {
    const all = [];
    let currentPage = 1;
    let lastPage = 1;

    do {
      const params = new URLSearchParams({
        per_page: "100",
        page: String(currentPage),
      });

      const response = await fetch(
        `${COLLECTION_API}?${params.toString()}`,
        {
          cache: "no-store",
          signal,
        }
      );

      const result = await response.json();

      if (!response.ok || result.success !== true) {
        throw new Error(
          getErrorMessage(result, "Unable to load collections.")
        );
      }

      const pagination = result.data || {};

      all.push(
        ...(Array.isArray(pagination.data) ? pagination.data : [])
      );

      lastPage = Math.max(
        1,
        Number(pagination.last_page) || 1
      );

      currentPage++;
    } while (currentPage <= lastPage && !signal.aborted);

    return all;
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError("");

      try {
        const authResponse = await fetch("/api/auth/me", {
          cache: "no-store",
          signal: controller.signal,
        });

        let isAdministrator = false;

        if (authResponse.ok) {
          const authResult = await authResponse.json();

          const user =
            authResult.user ||
            authResult.data?.user ||
            authResult.data;

          isAdministrator =
            authResult.authenticated === true &&
            isAdmin(user);
        }

        if (controller.signal.aborted) return;

        setAdmin(isAdministrator);

        const requests = [
          loadSections(isAdministrator, controller.signal),
        ];

        if (isAdministrator) {
          requests.push(loadCollections(controller.signal));
        }

        const [sectionData, collectionData] = await Promise.all(requests);

        if (controller.signal.aborted) return;

        setSections(sectionData);

        if (isAdministrator) {
          setCollections(collectionData);
        }
      } catch (err) {
        if (err.name !== "AbortError" && !controller.signal.aborted) {
          setError(err.message || "Unable to load collection sections.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => controller.abort();
  }, [loadSections, loadCollections, refresh]);

  function handleSaved() {
    setEditing(undefined);
    setRefresh((previous) => previous + 1);
  }

  function handleDeleted() {
    setDeleting(null);
    setRefresh((previous) => previous + 1);
  }

  if (!loading && !error && !admin && sections.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-white">
      <div className="mx-auto w-[calc(100%-28px)] max-w-[1440px] space-y-10 py-8 sm:w-[calc(100%-40px)] sm:space-y-12 sm:py-12">
        {error && (
          <div
            role="alert"
            className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-12">
            <LoaderCircle
              size={25}
              className="animate-spin text-[#05714B]"
            />
          </div>
        )}

        {!loading &&
          sections.map((section) => (
            <section
              key={section.id}
              className={
                !section.is_active && admin ? "opacity-60" : ""
              }
              aria-labelledby={`sd-collection-section-${section.id}`}
            >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="h-7 w-1 rounded-full bg-[#05714B]" />

                  <div>
                    <h2
                      id={`sd-collection-section-${section.id}`}
                      className="text-xl font-bold tracking-tight text-gray-950 sm:text-2xl"
                    >
                      {section.title}
                    </h2>

                    {admin && (
                      <p className="mt-1 text-xs text-gray-400">
                        {section.collection_name ||
                          "No collection selected"}
                      </p>
                    )}
                  </div>
                </div>

                {admin && (
                  <div className="flex items-center gap-2">
                    {!section.is_active && (
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500">
                        Hidden
                      </span>
                    )}

                    <button
                      type="button"
                      title="Edit Section"
                      aria-label={`Edit ${section.title}`}
                      onClick={() => setEditing(section)}
                      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-[#05714B] hover:bg-emerald-100"
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      type="button"
                      title="Delete Section"
                      aria-label={`Delete ${section.title}`}
                      onClick={() => setDeleting(section)}
                      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              {section.products?.length > 0 ? (
                <div className="grid grid-cols-2 items-stretch gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {section.products.map((product) => (
                    <PopularProductCard
                      key={product.id}
                      product={product}
                    />
                  ))}
                </div>
              ) : admin ? (
                <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
                  <Package
                    size={26}
                    className="mx-auto mb-2 text-gray-300"
                  />

                  No visible products. Select a published collection
                  using the pencil icon.
                </div>
              ) : null}
            </section>
          ))}

        {!loading && admin && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[#05714B] bg-emerald-50 px-6 py-3 text-sm font-semibold text-[#05714B] hover:bg-emerald-100"
            >
              <Plus size={19} />
              Add Collection Section
              <Settings2 size={16} />
            </button>
          </div>
        )}
      </div>

      {admin && editing !== undefined && (
        <SectionEditor
          key={editing?.id ?? "new"}
          section={editing}
          collections={collections}
          onClose={() => setEditing(undefined)}
          onSaved={handleSaved}
        />
      )}

      {admin && deleting && (
        <DeleteSectionModal
          section={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
