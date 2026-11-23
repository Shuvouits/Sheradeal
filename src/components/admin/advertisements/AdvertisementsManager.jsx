"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ImageIcon,
  Megaphone,
  Eye,
  EyeOff,
  RefreshCw,
  LoaderCircle,
  X,
  Upload,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const EMPTY_FORM = {
  name: "",
  badge_text: "SPECIAL OFFER",
  heading: "",
  description: "",
  desktop_image: null,
  mobile_image: null,
  background_color: "#05714B",
  text_color: "#FFFFFF",
  primary_button_text: "Shop Now",
  primary_button_link: "",
  secondary_button_text: "View Details",
  secondary_button_link: "",
  display_order: "0",
  is_active: true,
  starts_at: "",
  ends_at: "",
};

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#05714B] focus:ring-2 focus:ring-emerald-100";

function Field({ label, hint, children, required }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {children}

      {hint && (
        <p className="text-xs text-gray-400">{hint}</p>
      )}
    </div>
  );
}

function ImageField({ label, file, existingUrl, onChange }) {
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const imageUrl = preview || existingUrl;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">
        {label}
      </p>

      <label className="block cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 transition hover:border-[#05714B]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={label}
            className="h-40 w-full object-contain"
          />
        ) : (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-gray-400">
            <ImageIcon size={30} />
            <span className="text-xs">No image selected</span>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 border-t border-gray-200 bg-white py-2.5 text-xs font-semibold text-[#05714B]">
          <Upload size={15} />
          {imageUrl ? "Change Image" : "Upload Image"}
        </div>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => {
            onChange(event.target.files?.[0] || null);
            event.target.value = "";
          }}
        />
      </label>
    </div>
  );
}

function AdvertisementModal({ advertisement, onClose, onSaved }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    ...(advertisement || {}),
    desktop_image: null,
    mobile_image: null,
    display_order: String(advertisement?.display_order ?? 0),
    starts_at: advertisement?.starts_at
      ? advertisement.starts_at.slice(0, 16)
      : "",
    ends_at: advertisement?.ends_at
      ? advertisement.ends_at.slice(0, 16)
      : "",
  }));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");

    try {
      const body = new FormData();

      const fields = [
        "name",
        "badge_text",
        "heading",
        "description",
        "background_color",
        "text_color",
        "primary_button_text",
        "primary_button_link",
        "secondary_button_text",
        "secondary_button_link",
        "display_order",
        "starts_at",
        "ends_at",
      ];

      fields.forEach((field) => {
        body.append(field, String(form[field] ?? ""));
      });

      body.append("is_active", form.is_active ? "1" : "0");

      if (form.desktop_image) {
        body.append("desktop_image", form.desktop_image);
      }

      if (form.mobile_image) {
        body.append("mobile_image", form.mobile_image);
      }

      const url = advertisement
        ? `/api/admin/advertisements/${advertisement.id}`
        : "/api/admin/advertisements";

      const response = await fetch(url, {
        method: advertisement ? "PUT" : "POST",
        body,
        credentials: "same-origin",
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success !== true) {
        const validationError = result.errors
          ? Object.values(result.errors).flat()[0]
          : null;

        throw new Error(
          validationError ||
          result.message ||
          "Unable to save advertisement."
        );
      }

      onSaved(
        advertisement
          ? "Advertisement updated successfully."
          : "Advertisement created successfully."
      );
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {advertisement
                ? "Edit Advertisement"
                : "Add Advertisement"}
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Manage homepage promotional banners.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto">
          <div className="space-y-5 p-6">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Internal Name" required>
                <input
                  required
                  className={inputClass}
                  value={form.name}
                  onChange={(event) =>
                    update("name", event.target.value)
                  }
                  placeholder="Homepage Offer 1"
                />
              </Field>

              <Field label="Badge Text">
                <input
                  className={inputClass}
                  value={form.badge_text}
                  onChange={(event) =>
                    update("badge_text", event.target.value)
                  }
                  placeholder="SPECIAL OFFER"
                />
              </Field>
            </div>

            <Field label="Advertisement Heading" required>
              <input
                required
                className={inputClass}
                value={form.heading}
                onChange={(event) =>
                  update("heading", event.target.value)
                }
                placeholder="Premium Skincare Collection"
              />
            </Field>

            <Field label="Description">
              <textarea
                rows={3}
                className={inputClass}
                value={form.description}
                onChange={(event) =>
                  update("description", event.target.value)
                }
                placeholder="Optional promotional description"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <ImageField
                label="Desktop Image"
                file={form.desktop_image}
                existingUrl={advertisement?.desktop_image_url}
                onChange={(file) =>
                  update("desktop_image", file)
                }
              />

              <ImageField
                label="Mobile Image"
                file={form.mobile_image}
                existingUrl={advertisement?.mobile_image_url}
                onChange={(file) =>
                  update("mobile_image", file)
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Background Color">
                <input
                  type="color"
                  className="h-11 w-full cursor-pointer rounded-lg border border-gray-200 bg-white p-1"
                  value={form.background_color}
                  onChange={(event) =>
                    update("background_color", event.target.value)
                  }
                />
              </Field>

              <Field label="Text Color">
                <input
                  type="color"
                  className="h-11 w-full cursor-pointer rounded-lg border border-gray-200 bg-white p-1"
                  value={form.text_color}
                  onChange={(event) =>
                    update("text_color", event.target.value)
                  }
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Primary Button Text">
                <input
                  className={inputClass}
                  value={form.primary_button_text}
                  onChange={(event) =>
                    update("primary_button_text", event.target.value)
                  }
                  placeholder="Shop Now"
                />
              </Field>

              <Field label="Primary Button Link">
                <input
                  className={inputClass}
                  value={form.primary_button_link}
                  onChange={(event) =>
                    update("primary_button_link", event.target.value)
                  }
                  placeholder="/products"
                />
              </Field>

              <Field label="Secondary Button Text">
                <input
                  className={inputClass}
                  value={form.secondary_button_text}
                  onChange={(event) =>
                    update("secondary_button_text", event.target.value)
                  }
                  placeholder="View Details"
                />
              </Field>

              <Field label="Secondary Button Link">
                <input
                  className={inputClass}
                  value={form.secondary_button_link}
                  onChange={(event) =>
                    update("secondary_button_link", event.target.value)
                  }
                  placeholder="/products"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Display Order">
                <input
                  type="number"
                  min="0"
                  step="1"
                  className={inputClass}
                  value={form.display_order}
                  onChange={(event) =>
                    update("display_order", event.target.value)
                  }
                />
              </Field>

              <Field label="Start Date (Optional)">
                <input
                  type="datetime-local"
                  className={inputClass}
                  value={form.starts_at}
                  onChange={(event) =>
                    update("starts_at", event.target.value)
                  }
                />
              </Field>

              <Field label="End Date (Optional)">
                <input
                  type="datetime-local"
                  className={inputClass}
                  value={form.ends_at}
                  onChange={(event) =>
                    update("ends_at", event.target.value)
                  }
                />
              </Field>
            </div>

            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-gray-200 p-4">
              <span>
                <span className="block text-sm font-semibold text-gray-800">
                  Active Advertisement
                </span>
                <span className="mt-1 block text-xs text-gray-500">
                  Display this banner on the homepage.
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

            <div
              className="overflow-hidden rounded-xl border border-gray-100 p-5"
              style={{
                backgroundColor: form.background_color,
                color: form.text_color,
              }}
            >
              <p className="mb-2 text-xs font-semibold opacity-80">
                LIVE COLOR PREVIEW
              </p>

              {form.badge_text && (
                <span className="inline-block rounded bg-white/90 px-2 py-1 text-[10px] font-bold text-gray-900">
                  {form.badge_text}
                </span>
              )}

              <h3 className="mt-3 text-xl font-bold">
                {form.heading || "Advertisement Heading"}
              </h3>

              {form.description && (
                <p className="mt-2 text-sm opacity-90">
                  {form.description}
                </p>
              )}

              {form.primary_button_text && (
                <span className="mt-4 inline-flex rounded-lg bg-white px-4 py-2 text-xs font-semibold text-gray-900">
                  {form.primary_button_text}
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#05714B] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving && (
                <LoaderCircle size={17} className="animate-spin" />
              )}

              {saving
                ? "Saving..."
                : advertisement
                  ? "Update Advertisement"
                  : "Create Advertisement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ advertisement, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (deleting) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/advertisements/${advertisement.id}`,
        { method: "DELETE" }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success !== true) {
        throw new Error(
          result.message || "Unable to delete advertisement."
        );
      }

      onDeleted();
    } catch (err) {
      setError(err.message || "Delete failed.");
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="h-1 bg-red-500" />

        <div className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <Trash2 size={25} />
          </div>

          <h3 className="text-xl font-bold text-gray-900">
            Delete Advertisement?
          </h3>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Are you sure you want to delete{" "}
            <strong>{advertisement.name}</strong>?
            This action cannot be undone.
          </p>

          {error && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="flex-1 cursor-pointer rounded-xl border border-gray-200 py-3 text-sm font-semibold disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white disabled:opacity-60"
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

export default function AdvertisementsManager() {
  const [advertisements, setAdvertisements] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(undefined);
  const [deleting, setDeleting] = useState(null);

  const loadAdvertisements = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/advertisements?per_page=15&page=${page}`,
        { cache: "no-store" }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success !== true) {
        throw new Error(
          result.message || "Unable to load advertisements."
        );
      }

      const pagination = result.data || {};

      setAdvertisements(
        Array.isArray(pagination.data) ? pagination.data : []
      );
      setTotal(Number(pagination.total) || 0);
      setLastPage(Math.max(1, Number(pagination.last_page) || 1));
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadAdvertisements();
  }, [loadAdvertisements]);

  function handleSaved(message) {
    setEditing(undefined);
    setSuccess(message);
    loadAdvertisements();
  }

  function handleDeleted() {
    setDeleting(null);
    setSuccess("Advertisement deleted successfully.");

    if (advertisements.length === 1 && page > 1) {
      setPage((current) => current - 1);
    } else {
      loadAdvertisements();
    }
  }

  const activeCount = advertisements.filter(
    (item) => item.is_active
  ).length;

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Homepage Advertisements
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage promotional banners, offers and homepage placements.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setEditing(null)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#05714B] px-5 py-3 text-sm font-semibold text-white hover:bg-[#045C3D]"
        >
          <Plus size={18} />
          Add Advertisement
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 size={18} />
          {success}
          <button
            type="button"
            onClick={() => setSuccess("")}
            className="ml-auto cursor-pointer"
            aria-label="Dismiss message"
          >
            <X size={17} />
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Advertisements", value: total, icon: Megaphone },
          { label: "Active on This Page", value: activeCount, icon: Eye },
          {
            label: "Inactive on This Page",
            value: advertisements.length - activeCount,
            icon: EyeOff,
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <span className="rounded-lg bg-emerald-50 p-2 text-[#05714B]">
                  <Icon size={19} />
                </span>
              </div>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {loading ? "..." : stat.value.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-bold text-gray-900">
            Advertisement List
          </h2>

          <button
            type="button"
            onClick={loadAdvertisements}
            className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-500 hover:text-[#05714B]"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {error && (
          <div role="alert" className="m-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <LoaderCircle
              size={30}
              className="animate-spin text-[#05714B]"
            />
          </div>
        ) : advertisements.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-gray-400">
            <Megaphone size={42} />
            <p className="text-sm">No advertisements found.</p>

            <button
              type="button"
              onClick={() => setEditing(null)}
              className="cursor-pointer text-sm font-semibold text-[#05714B]"
            >
              Create your first advertisement
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th className="px-5 py-4">Banner</th>
                  <th className="px-5 py-4">Advertisement</th>
                  <th className="px-5 py-4">Order</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Schedule</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {advertisements.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="px-5 py-4">
                      {item.desktop_image_url ? (
                        <img
                          src={item.desktop_image_url}
                          alt={item.heading}
                          className="h-20 w-36 rounded-lg border border-gray-100 object-cover"
                        />
                      ) : (
                        <div
                          className="flex h-20 w-36 items-center justify-center rounded-lg"
                          style={{ backgroundColor: item.background_color }}
                        >
                          <ImageIcon size={25} className="text-white/80" />
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <p className="max-w-xs truncate font-semibold text-gray-900">
                        {item.name}
                      </p>

                      <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                        {item.heading}
                      </p>

                      {item.badge_text && (
                        <span className="mt-2 inline-block rounded-md bg-emerald-50 px-2 py-1 text-[10px] text-[#05714B]">
                          {item.badge_text}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {item.display_order}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.is_active
                            ? "bg-emerald-50 text-[#05714B]"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {item.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs text-gray-500">
                      {item.starts_at || item.ends_at
                        ? "Scheduled"
                        : "Always"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditing(item)}
                          className="cursor-pointer rounded-lg border border-gray-200 p-2 text-gray-600 hover:text-[#05714B]"
                          title="Edit Advertisement"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleting(item)}
                          className="cursor-pointer rounded-lg border border-gray-200 p-2 text-gray-600 hover:text-red-600"
                          title="Delete Advertisement"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {lastPage > 1 && (
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-5 py-4">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="cursor-pointer rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <span className="text-xs text-gray-500">
              Page {page} of {lastPage}
            </span>

            <button
              type="button"
              onClick={() => setPage((current) => Math.min(lastPage, current + 1))}
              disabled={page >= lastPage}
              className="cursor-pointer rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {editing !== undefined && (
        <AdvertisementModal
          key={editing?.id ?? "new"}
          advertisement={editing}
          onClose={() => setEditing(undefined)}
          onSaved={handleSaved}
        />
      )}

      {deleting && (
        <DeleteModal
          advertisement={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
