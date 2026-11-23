"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  LoaderCircle,
  Upload,
  ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
  Search,
  Globe2,
  Package,
} from "lucide-react";
import { collectionRequest } from "@/lib/collectionApi";
import CollectionProductPicker from "./CollectionProductPicker";

const EMPTY_FORM = {
  title: "",
  slug: "",
  description: "",
  status: "draft",
  publish_online: true,
  publish_pos: false,
  collection_type: "manual",
  sort_by: "manual",
  display_order: "0",
  rule_category_id: "",
  rule_brand_id: "",
  rule_min_price: "",
  rule_max_price: "",
  meta_title: "",
  meta_description: "",
};

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#05714B] focus:ring-2 focus:ring-emerald-100";

function FormCard({ title, description, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-[15px] font-bold text-gray-900">{title}</h2>

        {description && (
          <p className="mt-1 text-xs text-gray-500">
            {description}
          </p>
        )}
      </div>

      <div className="space-y-5 p-5">{children}</div>
    </div>
  );
}

function Field({ label, hint, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[13px] font-semibold text-gray-800">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {children}

      {hint && (
        <p className="text-[11px] text-gray-400">{hint}</p>
      )}
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-gray-200 px-4 py-3">
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold text-gray-800">
          {label}
        </span>

        {description && (
          <span className="mt-1 block text-[11px] text-gray-400">
            {description}
          </span>
        )}
      </span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 cursor-pointer accent-[#05714B]"
      />
    </label>
  );
}

function ChoiceCard({ selected, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-20 cursor-pointer flex-col items-center justify-center rounded-xl border px-3 py-3 text-center transition ${
        selected
          ? "border-[#05714B] bg-emerald-50"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <span className="text-[13px] font-semibold text-gray-900">
        {title}
      </span>

      <span className="mt-1 text-[11px] text-gray-500">
        {description}
      </span>
    </button>
  );
}

export default function CollectionForm({ collectionId = null }) {
  const router = useRouter();
  const isEdit = Boolean(collectionId);
  const savedIdRef = useRef(collectionId);

  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [existingCover, setExistingCover] = useState("");

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [removingCover, setRemovingCover] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!coverImage) {
      setCoverPreview("");
      return;
    }

    const url = URL.createObjectURL(coverImage);
    setCoverPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [coverImage]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadOptions() {
      try {
        const [categoryResponse, brandResult] = await Promise.all([
          fetch("/api/storefront/categories", {
            cache: "no-store",
            signal: controller.signal,
          }),
          fetch("/api/admin/brands?per_page=100", {
            cache: "no-store",
            signal: controller.signal,
          }),
        ]);

        if (categoryResponse.ok) {
          const result = await categoryResponse.json();

          if (!controller.signal.aborted) {
            setCategories(
              Array.isArray(result.data) ? result.data : []
            );
          }
        }

        if (brandResult.ok) {
          const result = await brandResult.json();

          const items = Array.isArray(result.data)
            ? result.data
            : Array.isArray(result.data?.data)
              ? result.data.data
              : [];

          if (!controller.signal.aborted) {
            setBrands(items);
          }
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Collection filter options:", err);
        }
      }
    }

    loadOptions();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!collectionId) return;

    const controller = new AbortController();

    async function loadCollection() {
      setLoading(true);
      setError("");

      try {
        const data = await collectionRequest(`/${collectionId}`, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        setForm({
          title: data.title || "",
          slug: data.slug || "",
          description: data.description || "",
          status: data.status || "draft",
          publish_online: Boolean(data.publish_online),
          publish_pos: Boolean(data.publish_pos),
          collection_type: data.collection_type || "manual",
          sort_by: data.sort_by || "manual",
          display_order: String(data.display_order ?? 0),
          rule_category_id: String(data.rule_category_id ?? ""),
          rule_brand_id: String(data.rule_brand_id ?? ""),
          rule_min_price: String(data.rule_min_price ?? ""),
          rule_max_price: String(data.rule_max_price ?? ""),
          meta_title: data.meta_title || "",
          meta_description: data.meta_description || "",
        });

        setExistingCover(data.cover_image_url || "");

        setSelectedProducts(
          Array.isArray(data.selected_products)
            ? data.selected_products.map((product) => ({
                id: Number(product.id),
                title: product.title,
                sku: product.sku,
                price: product.price,
              }))
            : []
        );
      } catch (err) {
        if (err.name !== "AbortError" && !controller.signal.aborted) {
          setError(err.message || "Unable to load collection.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadCollection();

    return () => controller.abort();
  }, [collectionId]);

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function generateSlug(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 220);
  }

  function changeCollectionType(type) {
    setForm((current) => ({
      ...current,
      collection_type: type,
      sort_by:
        type === "automated" && current.sort_by === "manual"
          ? "newest"
          : current.sort_by,
    }));
  }

  async function removeCover() {
    if (removingCover) return;

    setError("");

    if (coverImage) {
      setCoverImage(null);
      return;
    }

    if (!savedIdRef.current || !existingCover) return;

    setRemovingCover(true);

    try {
      await collectionRequest(`/${savedIdRef.current}/cover`, {
        method: "DELETE",
      });

      setExistingCover("");
      setSuccess("Collection image removed successfully.");
    } catch (err) {
      setError(err.message || "Unable to remove image.");
    } finally {
      setRemovingCover(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const minPrice =
        form.rule_min_price === ""
          ? null
          : Number(form.rule_min_price);

      const maxPrice =
        form.rule_max_price === ""
          ? null
          : Number(form.rule_max_price);

      if (
        minPrice !== null &&
        maxPrice !== null &&
        maxPrice < minPrice
      ) {
        throw new Error(
          "Maximum price must be greater than or equal to minimum price."
        );
      }

      if (
        form.collection_type === "automated" &&
        !form.rule_category_id &&
        !form.rule_brand_id &&
        minPrice === null &&
        maxPrice === null
      ) {
        throw new Error(
          "Set at least one condition for an automated collection."
        );
      }

      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || null,
        status: form.status,
        publish_online: Boolean(form.publish_online),
        publish_pos: Boolean(form.publish_pos),
        collection_type: form.collection_type,
        sort_by: form.sort_by,
        display_order: Number(form.display_order) || 0,
        rule_category_id: form.rule_category_id
          ? Number(form.rule_category_id)
          : null,
        rule_brand_id: form.rule_brand_id
          ? Number(form.rule_brand_id)
          : null,
        rule_min_price: minPrice,
        rule_max_price: maxPrice,
        meta_title: form.meta_title.trim() || null,
        meta_description: form.meta_description.trim() || null,
        product_ids:
          form.collection_type === "manual"
            ? selectedProducts.map((product) => Number(product.id))
            : [],
      };

      const targetId = savedIdRef.current;

      const result = await collectionRequest(
        targetId ? `/${targetId}` : "",
        {
          method: targetId ? "PUT" : "POST",
          body: payload,
        }
      );

      const id = Number(result.id);
      savedIdRef.current = id;

      if (coverImage) {
        const body = new FormData();
        body.append("cover_image", coverImage);

        await collectionRequest(`/${id}/cover`, {
          method: "POST",
          body,
        });

        setCoverImage(null);
      }

      setSuccess("Collection saved successfully.");
      router.push("/admin/collections");
      router.refresh();
    } catch (err) {
      setError(err.message || "Unable to save collection.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <LoaderCircle
          size={30}
          className="animate-spin text-[#05714B]"
        />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-[1500px] space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/collections"
            aria-label="Back to Collections"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft size={19} />
          </Link>

          <div>
            <h1 className="text-[23px] font-bold text-gray-950">
              {isEdit ? "Edit Collection" : "Create Collection"}
            </h1>

            <p className="mt-1 text-xs text-gray-500">
              {isEdit
                ? "Update collection details and visibility."
                : "Create a curated or automated collection."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/collections"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#05714B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#045C3D] disabled:opacity-60"
          >
            {saving ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <Save size={17} />
            )}

            {saving
              ? "Saving..."
              : isEdit
                ? "Update Collection"
                : "Create Collection"}
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={19} className="shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-[#05714B]">
          <CheckCircle2 size={19} />
          {success}
        </div>
      )}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <FormCard
            title="Collection Details"
            description="Basic information about this collection"
          >
            <Field label="Collection Title" required>
              <input
                required
                maxLength={255}
                value={form.title}
                onChange={(event) => {
                  const title = event.target.value;
                  const oldGenerated = generateSlug(form.title);

                  setForm((current) => ({
                    ...current,
                    title,
                    slug:
                      !isEdit &&
                      (!current.slug || current.slug === oldGenerated)
                        ? generateSlug(title)
                        : current.slug,
                  }));
                }}
                placeholder="Winter Skincare Essentials"
                className={inputClass}
              />
            </Field>

            <Field label="Description">
              <textarea
                rows={4}
                value={form.description}
                onChange={(event) =>
                  update("description", event.target.value)
                }
                placeholder="Describe this collection..."
                className={inputClass}
              />
            </Field>

            <Field
              label="Collection Image"
              hint="JPG, PNG or WEBP. Maximum 5 MB."
            >
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex h-44 w-44 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                  {coverPreview || existingCover ? (
                    <img
                      src={coverPreview || existingCover}
                      alt="Collection cover preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon size={39} className="text-gray-300" />
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:border-[#05714B]">
                    <Upload size={16} />
                    Upload Image

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];

                        if (!file) return;

                        if (file.size > 5 * 1024 * 1024) {
                          setError("Image size cannot exceed 5 MB.");
                          event.target.value = "";
                          return;
                        }

                        setError("");
                        setCoverImage(file);
                        event.target.value = "";
                      }}
                    />
                  </label>

                  {(coverPreview || existingCover) && (
                    <button
                      type="button"
                      disabled={removingCover}
                      onClick={removeCover}
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-100 px-4 py-2 text-xs font-semibold text-red-600 disabled:opacity-50"
                    >
                      <X size={15} />
                      {removingCover ? "Removing..." : "Remove Image"}
                    </button>
                  )}
                </div>
              </div>
            </Field>
          </FormCard>

          <FormCard
            title="Collection Type"
            description="Choose how products are added to this collection."
          >
            <div className="grid grid-cols-2 gap-3">
              <ChoiceCard
                title="Manual"
                description="Add products one by one"
                selected={form.collection_type === "manual"}
                onClick={() => changeCollectionType("manual")}
              />

              <ChoiceCard
                title="Automated"
                description="Products match conditions"
                selected={form.collection_type === "automated"}
                onClick={() => changeCollectionType("automated")}
              />
            </div>
          </FormCard>

          {form.collection_type === "manual" ? (
            <CollectionProductPicker
              selected={selectedProducts}
              onChange={setSelectedProducts}
            />
          ) : (
            <FormCard
              title="Automated Collection Rules"
              description="Products must match every configured condition."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Category">
                  <select
                    value={form.rule_category_id}
                    onChange={(event) =>
                      update("rule_category_id", event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">Any Category</option>

                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Brand">
                  <select
                    value={form.rule_brand_id}
                    onChange={(event) =>
                      update("rule_brand_id", event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">Any Brand</option>

                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Minimum Price">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.rule_min_price}
                    onChange={(event) =>
                      update("rule_min_price", event.target.value)
                    }
                    className={inputClass}
                    placeholder="0"
                  />
                </Field>

                <Field label="Maximum Price">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.rule_max_price}
                    onChange={(event) =>
                      update("rule_max_price", event.target.value)
                    }
                    className={inputClass}
                    placeholder="999"
                  />
                </Field>
              </div>

              <p className="rounded-lg bg-emerald-50 p-3 text-xs leading-5 text-[#05714B]">
                Set at least one condition. Products matching all
                selected rules will appear automatically.
              </p>
            </FormCard>
          )}

          <FormCard
            title="Search Engine Listing"
            description="Control how the collection appears in search results."
          >
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Globe2 size={15} />
                sheradeal.com / collections / {form.slug || "collection"}
              </div>

              <p className="mt-2 text-[17px] font-medium text-blue-700">
                {form.meta_title || form.title || "Collection Title"}
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                {form.meta_description ||
                  form.description ||
                  "Collection description preview."}
              </p>
            </div>

            <Field label="SEO Title">
              <input
                maxLength={70}
                value={form.meta_title}
                onChange={(event) =>
                  update("meta_title", event.target.value)
                }
                className={inputClass}
                placeholder="Collection Title | SheraDeal"
              />

              <p className="text-[11px] text-gray-400">
                {form.meta_title.length}/70 characters
              </p>
            </Field>

            <Field label="Meta Description">
              <textarea
                rows={3}
                maxLength={160}
                value={form.meta_description}
                onChange={(event) =>
                  update("meta_description", event.target.value)
                }
                className={inputClass}
                placeholder="Write a short search description..."
              />

              <p className="text-[11px] text-gray-400">
                {form.meta_description.length}/160 characters
              </p>
            </Field>

            <Field
              label="URL Handle"
              hint="Changing the slug of a published collection changes its URL."
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  /collections/
                </span>

                <input
                  value={form.slug}
                  onChange={(event) =>
                    update("slug", generateSlug(event.target.value))
                  }
                  className={inputClass}
                  placeholder="winter-skincare-essentials"
                />
              </div>
            </Field>
          </FormCard>
        </div>

        <div className="space-y-5">
          <FormCard title="Status">
            <Field label="Collection Status">
              <select
                value={form.status}
                onChange={(event) =>
                  update("status", event.target.value)
                }
                className={inputClass}
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </Field>
          </FormCard>

          <FormCard title="Publishing">
            <ToggleRow
              label="Online Store"
              description="Publish to the website."
              checked={form.publish_online}
              onChange={(value) => update("publish_online", value)}
            />

            <ToggleRow
              label="Point of Sale"
              description="Make available to POS."
              checked={form.publish_pos}
              onChange={(value) => update("publish_pos", value)}
            />
          </FormCard>

          <FormCard title="Sort Order">
            <Field label="Product Sorting">
              <select
                value={form.sort_by}
                onChange={(event) =>
                  update("sort_by", event.target.value)
                }
                className={inputClass}
              >
                {form.collection_type === "manual" && (
                  <option value="manual">Manual</option>
                )}

                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="title_asc">Name: A to Z</option>
              </select>
            </Field>
          </FormCard>

          <FormCard title="Display Position">
            <Field
              label="Collection Order"
              hint="Lower numbers appear first."
            >
              <input
                type="number"
                min="0"
                step="1"
                value={form.display_order}
                onChange={(event) =>
                  update("display_order", event.target.value)
                }
                className={inputClass}
              />
            </Field>
          </FormCard>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <div className="flex items-center gap-2 text-[#05714B]">
              <Package size={17} />
              <p className="text-sm font-bold">Collection Summary</p>
            </div>

            <p className="mt-3 text-xs leading-6 text-gray-600">
              Type:{" "}
              <strong className="capitalize">
                {form.collection_type}
              </strong>
            </p>

            <p className="text-xs leading-6 text-gray-600">
              Selected Products:{" "}
              <strong>
                {form.collection_type === "manual"
                  ? selectedProducts.length
                  : "Automatic"}
              </strong>
            </p>

            <p className="text-xs leading-6 text-gray-600">
              Status:{" "}
              <strong className="capitalize">
                {form.status}
              </strong>
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#05714B] px-5 py-3 text-sm font-semibold text-white hover:bg-[#045C3D] disabled:opacity-60"
          >
            {saving ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <Save size={17} />
            )}

            {saving ? "Saving..." : "Save Collection"}
          </button>
        </div>
      </div>
    </form>
  );
}
