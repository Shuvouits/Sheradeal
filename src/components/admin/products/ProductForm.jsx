
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import RichTextEditor from "./editor/RichTextEditor";
import ProductMediaUploader from "./ProductMediaUploader";

import {
  ArrowLeft,
  Save,
  LoaderCircle,
  Package,
  DollarSign,
  Boxes,
  Truck,
  Search,
  Settings2,
  ImagePlus,
  Layers3,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const EMPTY_PRODUCT = {
  title: "",
  slug: "",
  overview: "",
  description: "",
  specifications: "",
  product_type: "physical",
  category_id: "",
  brand_id: "",
  vendor_name: "",
  manufacturer: "",
  distributed_by: "",
  tags: "",
  status: "draft",
  is_featured: false,
  is_popular: false,
  publish_online: true,
  publish_pos: false,
  price: "0",
  compare_at_price: "",
  cost_per_item: "",
  charge_tax: true,
  special_price: "",
  unit_price: "",
  unit_price_measurement: "",
  sku: "",
  barcode: "",
  barcode_standard: "",
  identifier_source: "",
  track_quantity: true,
  continue_selling_out_of_stock: false,
  min_order_quantity: "1",
  quantity_multiple: "1",
  max_order_quantity: "",
  requires_shipping: true,
  weight: "0",
  weight_unit: "kg",
  length: "0",
  width: "0",
  height: "0",
  dimension_unit: "cm",
  country_of_origin: "",
  hs_code: "",
  customs_description: "",
  is_final_sale: false,
  return_window_days: "",
  cod_advance_required: false,
  cod_advance_amount: "",
  meta_title: "",
  meta_description: "",
};

const NULLABLE_NUMBERS = [
  "compare_at_price",
  "cost_per_item",
  "special_price",
  "unit_price",
  "max_order_quantity",
  "return_window_days",
  "cod_advance_amount",
];

const NUMBER_FIELDS = [
  "price",
  "compare_at_price",
  "cost_per_item",
  "special_price",
  "unit_price",
  "min_order_quantity",
  "quantity_multiple",
  "max_order_quantity",
  "weight",
  "length",
  "width",
  "height",
  "return_window_days",
  "cod_advance_amount",
];

const inputStyle =
  "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-[#05714B] focus:ring-2 focus:ring-emerald-100 disabled:bg-gray-50";

const textareaStyle =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#05714B] focus:ring-2 focus:ring-emerald-100";

function Panel({ title, description, icon: Icon, children }) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-[#05714B]">
          <Icon size={18} />
        </div>

        <div>
          <h2 className="font-semibold text-gray-900">
            {title}
          </h2>

          {description && (
            <p className="mt-0.5 text-xs text-gray-500">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4 p-5">
        {children}
      </div>
    </section>
  );
}

function Field({ label, hint, children, required }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      {children}

      {hint && (
        <p className="text-xs text-gray-400">
          {hint}
        </p>
      )}
    </div>
  );
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-1">
      <span>
        <span className="block text-sm font-medium text-gray-800">
          {label}
        </span>

        {description && (
          <span className="mt-0.5 block text-xs text-gray-500">
            {description}
          </span>
        )}
      </span>

      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 shrink-0 accent-[#05714B]"
      />
    </label>
  );
}

function unpackList(result) {
  const value = result?.data;

  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;

  return [];
}

function normalizeProduct(product) {
  const next = { ...EMPTY_PRODUCT };

  Object.keys(next).forEach((key) => {
    if (key === "tags") {
      next.tags = Array.isArray(product.tags)
        ? product.tags.join(", ")
        : "";

      return;
    }

    const value = product[key];

    if (value === null || value === undefined) return;

    next[key] = typeof next[key] === "boolean"
      ? Boolean(value)
      : String(value);
  });

  return next;
}

function buildPayload(form) {
  const payload = { ...form };

  payload.tags = form.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  payload.category_id = form.category_id
    ? Number(form.category_id)
    : null;

  payload.brand_id = form.brand_id
    ? Number(form.brand_id)
    : null;

  for (const key of NUMBER_FIELDS) {
    const value = form[key];

    if (value === "" && NULLABLE_NUMBERS.includes(key)) {
      payload[key] = null;
    } else {
      payload[key] = Number(value || 0);
    }
  }

  for (const key of [
    "slug",
    "overview",
    "description",
    "specifications",
    "vendor_name",
    "manufacturer",
    "distributed_by",
    "sku",
    "barcode",
    "barcode_standard",
    "identifier_source",
    "unit_price_measurement",
    "country_of_origin",
    "hs_code",
    "customs_description",
    "meta_title",
    "meta_description",
  ]) {
    payload[key] = form[key].trim() || null;
  }

  if (!payload.slug) {
    delete payload.slug;
  }

  delete payload.quantity;
  delete payload.has_variants;

  return payload;
}

async function requestJSON(url, options = {}) {
  const response = await fetch(url, options);

  const raw = await response.text();

  let result;

  try {
    result = JSON.parse(raw);
  } catch {
    throw new Error(
      `Invalid API response (HTTP ${response.status}).`
    );
  }

  if (!response.ok || result.success === false) {
    const firstError = result.errors
      ? Object.values(result.errors).flat()[0]
      : null;

    const error = new Error(
      firstError ||
      result.message ||
      `Request failed (HTTP ${response.status}).`
    );

    error.validationErrors = result.errors || {};

    throw error;
  }

  return result;
}

export default function ProductForm({
  mode = "create",
  productId = null,
}) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [form, setForm] = useState({ ...EMPTY_PRODUCT });
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [existingMedia, setExistingMedia] = useState([]);
  const [existingVariants, setExistingVariants] = useState([]);
  const [pendingMedia, setPendingMedia] = useState([]);
  const [coverChoice, setCoverChoice] = useState(null);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const savedProductIdRef = useRef(null);
  const uploadedMediaMapRef = useRef(new Map());
  const saveLockRef = useRef(false);

  function update(key, value) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [key]: undefined,
    }));
  }

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const requests = [
          fetch("/api/admin/categories?per_page=100", {
            cache: "no-store",
            signal: controller.signal,
          }),
          fetch("/api/admin/brands?per_page=100", {
            cache: "no-store",
            signal: controller.signal,
          }),
        ];

        if (isEdit) {
          requests.push(
            fetch(`/api/admin/products/${productId}`, {
              cache: "no-store",
              signal: controller.signal,
            })
          );
        }

        const responses = await Promise.allSettled(requests);

        async function readResult(index) {
          const entry = responses[index];

          if (entry.status !== "fulfilled") {
            return null;
          }

          if (!entry.value.ok) {
            return null;
          }

          return entry.value.json().catch(() => null);
        }

        const categoryResult = await readResult(0);
        const brandResult = await readResult(1);

        if (controller.signal.aborted) return;

        setCategories(unpackList(categoryResult));
        setBrands(unpackList(brandResult));

        if (isEdit) {
          const productResult = await readResult(2);

          if (!productResult?.success || !productResult?.data) {
            throw new Error(
              productResult?.message ||
              "Product details could not be loaded."
            );
          }

          const product = productResult.data;

          setForm(normalizeProduct(product));

          setExistingMedia(
            Array.isArray(product.media) ? product.media : []
          );

          setExistingVariants(
            Array.isArray(product.variants)
              ? product.variants
              : []
          );

          savedProductIdRef.current = product.id;
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      controller.abort();
    };
  }, [isEdit, productId]);

  async function sendProductImage(id, item) {
    const body = new FormData();
    body.append("image", item.file);

    const result = await requestJSON(
      `/api/admin/products/${id}/media`,
      {
        method: "POST",
        body,
      }
    );

    if (!result.data?.id) {
      throw new Error(
        `Media ID missing after uploading ${item.file.name}.`
      );
    }

    return result.data;
  }

  async function saveProductImages(id) {
    const uploadedMap = uploadedMediaMapRef.current;

    for (const item of pendingMedia) {
      if (uploadedMap.has(item.key)) continue;

      const media = await sendProductImage(id, item);

      uploadedMap.set(item.key, media.id);
    }

    let selectedCoverId = null;

    if (coverChoice?.type === "existing") {
      selectedCoverId = coverChoice.id;
    }

    if (coverChoice?.type === "pending") {
      selectedCoverId = uploadedMap.get(coverChoice.id);
    }

    if (selectedCoverId) {
      await requestJSON(
        `/api/admin/products/${id}/media/${selectedCoverId}/cover`,
        {
          method: "PATCH",
        }
      );
    }

    for (const item of pendingMedia) {
      URL.revokeObjectURL(item.preview);
    }

    uploadedMap.clear();
    setPendingMedia([]);

    const mediaResult = await requestJSON(
      `/api/admin/products/${id}/media`,
      {
        cache: "no-store",
      }
    );

    const images = Array.isArray(mediaResult.data)
      ? mediaResult.data
      : [];

    setExistingMedia(images);

    const cover = images.find((item) => item.is_cover);

    setCoverChoice(
      cover
        ? { type: "existing", id: cover.id }
        : null
    );
  }

  async function saveProduct(event) {
    event.preventDefault();

    if (saveLockRef.current) return;

    setError("");
    setErrors({});
    setSuccess("");

    if (!form.title.trim()) {
      setError("Product title is required.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    saveLockRef.current = true;
    setSaving(true);

    try {
      const payload = buildPayload(form);

      delete payload.is_popular;
delete payload.popular_sort_order;

      const currentId = isEdit
        ? productId
        : savedProductIdRef.current;

      const url = currentId
        ? `/api/admin/products/${currentId}`
        : "/api/admin/products";

      const result = await requestJSON(url, {
        method: currentId ? "PUT" : "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const savedId = result.data?.id || currentId;

      if (!savedId) {
        throw new Error(
          "Product saved but product ID was not returned."
        );
      }

      // Preserve ID for retries after image upload failures.
      
// Preserve ID for retries after image upload failures.
savedProductIdRef.current = savedId;

await requestJSON(
  `/api/admin/products/${savedId}/popular`,
  {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      is_popular: Boolean(form.is_popular),
      popular_sort_order: Math.max(
        0,
        Number(form.popular_sort_order) || 0
      ),
    }),
  }
);

await saveProductImages(savedId);

setSuccess("Product and popularity settings saved successfully.");


      if (!isEdit) {
        router.push(`/admin/products/${savedId}/edit`);
      } else {
        router.refresh();
      }
    } catch (err) {
      setErrors(err.validationErrors || {});
      setError(err.message || "Unable to save product.");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      saveLockRef.current = false;
      setSaving(false);
    }
  }

  function textInput(key, label, options = {}) {
    return (
      <Field
        label={label}
        required={options.required}
        hint={options.hint}
      >
        <input
          type={options.type || "text"}
          value={form[key]}
          onChange={(event) => update(key, event.target.value)}
          placeholder={options.placeholder || ""}
          min={options.min}
          max={options.max}
          step={options.step}
          maxLength={options.maxLength}
          required={options.required}
          className={inputStyle}
        />

        {errors[key]?.[0] && (
          <p className="text-xs text-red-600">
            {errors[key][0]}
          </p>
        )}
      </Field>
    );
  }

  function areaInput(key, label, rows = 4) {
    return (
      <Field label={label}>
        <textarea
          rows={rows}
          value={form[key]}
          onChange={(event) => update(key, event.target.value)}
          className={textareaStyle}
        />

        {errors[key]?.[0] && (
          <p className="text-xs text-red-600">
            {errors[key][0]}
          </p>
        )}
      </Field>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-gray-500">
        <LoaderCircle
          className="animate-spin text-[#05714B]"
        />
        Loading product editor...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#F7F8FA] p-4 text-gray-900 sm:p-6"
      style={{ fontFamily: "'Segoe UI', sans-serif" }}
    >
      <form
        onSubmit={saveProduct}
        className="mx-auto max-w-[1500px] space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/products"
              className="rounded-lg border border-gray-200 bg-white p-2.5 hover:bg-gray-50"
              aria-label="Back to products"
            >
              <ArrowLeft size={19} />
            </Link>

            <div>
              <h1 className="text-2xl font-bold text-gray-950">
                {isEdit ? "Edit Product" : "Add Product"}
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                {isEdit
                  ? `Product #${productId}`
                  : "Create a product for your store."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/products"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#05714B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#045C3D] disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Save size={17} />
              )}

              {saving ? "Saving..." : "Save Product"}
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2 size={18} />
            {success}
          </div>
        )}

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_350px]">
          <div className="space-y-5">
            <Panel
              title="Product Details"
              description="Basic product information"
              icon={Package}
            >
              {textInput("title", "Product Title", {
                required: true,
                placeholder: "Enter product title",
              })}

              {textInput("slug", "URL Handle", {
                placeholder: "Leave empty to generate automatically",
              })}

              {areaInput("overview", "Product Overview", 3)}

              <Field label="Description" required>
                <RichTextEditor
                  value={form.description}
                  onChange={(html) => update("description", html)}
                  placeholder="Write a detailed product description..."
                  disabled={saving}
                />

                {errors.description?.[0] && (
                  <p className="text-xs text-red-600">
                    {errors.description[0]}
                  </p>
                )}
              </Field>

              {areaInput("specifications", "Specifications", 5)}
            </Panel>

            <Panel
              title="Media"
              description="Upload and manage product images"
              icon={ImagePlus}
            >
              <ProductMediaUploader
                productId={isEdit ? productId : null}
                pendingMedia={pendingMedia}
                setPendingMedia={setPendingMedia}
                existingMedia={existingMedia}
                setExistingMedia={setExistingMedia}
                coverChoice={coverChoice}
                setCoverChoice={setCoverChoice}
                disabled={saving}
              />
            </Panel>

            <Panel
              title="Pricing"
              description="Selling price and product cost"
              icon={DollarSign}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {textInput("price", "Price (BDT)", {
                  type: "number",
                  min: "0",
                  step: "0.01",
                  required: true,
                })}

                {textInput("compare_at_price", "Compare-at Price", {
                  type: "number",
                  min: "0",
                  step: "0.01",
                })}

                {textInput("cost_per_item", "Cost per Item", {
                  type: "number",
                  min: "0",
                  step: "0.01",
                })}

                {textInput("special_price", "Special Price", {
                  type: "number",
                  min: "0",
                  step: "0.01",
                })}

                {textInput("unit_price", "Unit Price", {
                  type: "number",
                  min: "0",
                  step: "0.0001",
                })}

                {textInput(
                  "unit_price_measurement",
                  "Unit Measurement",
                  {
                    placeholder: "kg, litre, piece...",
                  }
                )}
              </div>

              <Toggle
                label="Charge tax on this product"
                checked={form.charge_tax}
                onChange={(value) => update("charge_tax", value)}
              />
            </Panel>

            <Panel
              title="Inventory"
              description="SKU and stock configuration"
              icon={Boxes}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {textInput("sku", "SKU", {
                  placeholder: "SHD-1001",
                })}

                {textInput("barcode", "Barcode", {
                  placeholder: "Barcode / GTIN",
                })}

                {textInput("barcode_standard", "Barcode Standard", {
                  placeholder: "EAN, UPC, ISBN...",
                })}

                {textInput("identifier_source", "Identifier Source", {
                  placeholder: "Manufacturer",
                })}
              </div>

              <Toggle
                label="Track Quantity"
                checked={form.track_quantity}
                onChange={(value) =>
                  update("track_quantity", value)
                }
              />

              <Toggle
                label="Continue selling when out of stock"
                checked={form.continue_selling_out_of_stock}
                onChange={(value) =>
                  update("continue_selling_out_of_stock", value)
                }
              />

              <div className="grid gap-4 sm:grid-cols-3">
                {textInput(
                  "min_order_quantity",
                  "Minimum Quantity",
                  {
                    type: "number",
                    min: "1",
                    step: "1",
                  }
                )}

                {textInput(
                  "max_order_quantity",
                  "Maximum Quantity",
                  {
                    type: "number",
                    min: "1",
                    step: "1",
                  }
                )}

                {textInput(
                  "quantity_multiple",
                  "Quantity Multiple",
                  {
                    type: "number",
                    min: "1",
                    step: "1",
                  }
                )}
              </div>

              <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                Stock quantity changes will be managed through the
                Inventory API. This editor does not directly
                modify stock.
              </p>
            </Panel>

            <Panel
              title="Product Variants"
              description="Color, size, storage and other combinations"
              icon={Layers3}
            >
              {existingVariants.length > 0 ? (
                <div className="space-y-2">
                  {existingVariants.map((variant) => (
                    <div
                      key={variant.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3"
                    >
                      <div>
                        <p className="text-sm font-semibold">
                          {variant.title}
                        </p>

                        <p className="text-xs text-gray-500">
                          {variant.sku || "No SKU"}
                        </p>
                      </div>

                      <span className="text-sm font-medium">
                        ৳{Number(
                          variant.price ?? form.price
                        ).toLocaleString("en-BD")}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  This product has no variant combinations yet.
                </p>
              )}

              <p className="text-xs text-gray-500">
                Variant combination editing will be connected to
                the existing Global Variants module.
              </p>
            </Panel>

            <Panel
              title="Shipping"
              description="Physical measurements and customs"
              icon={Truck}
            >
              <Toggle
                label="This product requires shipping"
                checked={form.requires_shipping}
                onChange={(value) =>
                  update("requires_shipping", value)
                }
              />

              <div className="grid gap-4 sm:grid-cols-2">
                {textInput("weight", "Weight", {
                  type: "number",
                  min: "0",
                  step: "0.001",
                })}

                <Field label="Weight Unit">
                  <select
                    value={form.weight_unit}
                    onChange={(event) =>
                      update("weight_unit", event.target.value)
                    }
                    className={inputStyle}
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="g">Grams (g)</option>
                    <option value="lb">Pounds (lb)</option>
                    <option value="oz">Ounces (oz)</option>
                  </select>
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {textInput("length", "Length", {
                  type: "number",
                  min: "0",
                  step: "0.01",
                })}

                {textInput("width", "Width", {
                  type: "number",
                  min: "0",
                  step: "0.01",
                })}

                {textInput("height", "Height", {
                  type: "number",
                  min: "0",
                  step: "0.01",
                })}
              </div>

              <Field label="Dimension Unit">
                <select
                  value={form.dimension_unit}
                  onChange={(event) =>
                    update("dimension_unit", event.target.value)
                  }
                  className={inputStyle}
                >
                  <option value="cm">Centimeters (cm)</option>
                  <option value="mm">Millimeters (mm)</option>
                  <option value="in">Inches (in)</option>
                </select>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                {textInput(
                  "country_of_origin",
                  "Country of Origin"
                )}

                {textInput("hs_code", "HS Code")}
              </div>

              {areaInput(
                "customs_description",
                "Customs Description",
                3
              )}
            </Panel>

            <Panel
              title="Search Engine Listing"
              description="SEO title, description and URL"
              icon={Search}
            >
              {textInput("meta_title", "SEO Title", {
                maxLength: 70,
                hint: `${form.meta_title.length}/70 characters`,
              })}

              <Field label="Meta Description">
                <textarea
                  rows={4}
                  maxLength={160}
                  value={form.meta_description}
                  onChange={(event) =>
                    update(
                      "meta_description",
                      event.target.value
                    )
                  }
                  className={textareaStyle}
                />

                <p className="text-xs text-gray-400">
                  {form.meta_description.length}/160 characters
                </p>
              </Field>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs text-[#05714B]">
                  sheradeal.com/products/
                  {form.slug || "product-handle"}
                </p>

                <p className="mt-1 text-base font-semibold text-blue-700">
                  {form.meta_title ||
                    form.title ||
                    "Product Title"}
                </p>

                <p className="mt-1 text-xs text-gray-600">
                  {form.meta_description ||
                    "Product meta description preview."}
                </p>
              </div>
            </Panel>
          </div>

          <div className="space-y-5">
            <Panel
              title="Product Status"
              icon={Settings2}
            >
              <Field label="Status">
                <select
                  value={form.status}
                  onChange={(event) =>
                    update("status", event.target.value)
                  }
                  className={inputStyle}
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </Field>



<Toggle
  label="Featured Product"
  checked={form.is_featured}
  onChange={(value) =>
    update("is_featured", value)
  }
/>

<Toggle
  label="Popular Product"
  description="Display this product in the homepage Popular Products section."
  checked={form.is_popular}
  onChange={(value) =>
    update("is_popular", value)
  }
/>

{form.is_popular && (
  <Field
    label="Popular Display Order"
    hint="Lower numbers appear first on the homepage."
  >
    <input
      type="number"
      min="0"
      step="1"
      value={form.popular_sort_order}
      onChange={(event) =>
        update("popular_sort_order", event.target.value)
      }
      className={inputStyle}
    />
  </Field>
)}


            

              <Toggle
                label="Publish on Online Store"
                checked={form.publish_online}
                onChange={(value) =>
                  update("publish_online", value)
                }
              />

              <Toggle
                label="Publish on POS"
                checked={form.publish_pos}
                onChange={(value) =>
                  update("publish_pos", value)
                }
              />
            </Panel>

            <Panel
              title="Organization"
              icon={Package}
            >
              <Field label="Product Type">
                <select
                  value={form.product_type}
                  onChange={(event) =>
                    update("product_type", event.target.value)
                  }
                  className={inputStyle}
                >
                  <option value="physical">Physical</option>
                  <option value="digital">Digital</option>
                  <option value="service">Service</option>
                </select>
              </Field>

              <Field label="Category">
                <select
                  value={form.category_id}
                  onChange={(event) =>
                    update("category_id", event.target.value)
                  }
                  className={inputStyle}
                >
                  <option value="">Select Category</option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Brand">
                <select
                  value={form.brand_id}
                  onChange={(event) =>
                    update("brand_id", event.target.value)
                  }
                  className={inputStyle}
                >
                  <option value="">Select Brand</option>

                  {brands.map((brand) => (
                    <option
                      key={brand.id}
                      value={brand.id}
                    >
                      {brand.name}
                    </option>
                  ))}
                </select>
              </Field>

              {textInput("vendor_name", "Vendor")}

              {textInput("manufacturer", "Manufacturer")}

              {textInput(
                "distributed_by",
                "Distributed By"
              )}

              {textInput("tags", "Tags", {
                placeholder: "Electronics, Mobile, Android",
                hint: "Separate tags using commas.",
              })}
            </Panel>

            <Panel
              title="Returns & COD"
              icon={Settings2}
            >
              <Toggle
                label="Final Sale"
                checked={form.is_final_sale}
                onChange={(value) =>
                  update("is_final_sale", value)
                }
              />

              {textInput(
                "return_window_days",
                "Return Window (Days)",
                {
                  type: "number",
                  min: "0",
                  step: "1",
                }
              )}

              <Toggle
                label="COD Advance Required"
                checked={form.cod_advance_required}
                onChange={(value) =>
                  update("cod_advance_required", value)
                }
              />

              {form.cod_advance_required &&
                textInput(
                  "cod_advance_amount",
                  "Advance Amount (BDT)",
                  {
                    type: "number",
                    min: "0",
                    step: "0.01",
                  }
                )}
            </Panel>

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#05714B] px-5 py-3 text-sm font-semibold text-white hover:bg-[#045C3D] disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Save size={17} />
              )}

              {saving ? "Saving..." : "Save Product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
