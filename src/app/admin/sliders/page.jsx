"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ImageIcon,
  X,
  LoaderCircle,
  Eye,
  EyeOff,
  ExternalLink,
  RefreshCw,
  Upload,
} from "lucide-react";

const initialForm = {
  title: "",
  subtitle: "",
  description: "",
  button_text: "",
  button_link: "",
  text_position: "left",
  text_color: "#FFFFFF",
  overlay_opacity: 0,
  sort_order: 0,
  is_active: true,
  starts_at: "",
  ends_at: "",
  desktop_image: null,
  mobile_image: null,
};

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#05714B] focus:ring-2 focus:ring-[#05714B]/10";

function FormField({ label, children, hint }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-gray-700">
        {label}
      </span>

      {children}

      {hint && (
        <span className="block text-xs text-gray-400">{hint}</span>
      )}
    </label>
  );
}

function ImageUpload({
  label,
  file,
  existingUrl,
  onChange,
  required = false,
}) {
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
      <p className="text-xs font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </p>

      <label className="group flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 transition hover:border-[#05714B]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={label}
            className="h-40 w-full object-contain"
          />
        ) : (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-gray-400">
            <Upload size={25} />
            <span className="text-xs">Click to upload image</span>
          </div>
        )}

        <div className="w-full border-t border-gray-200 bg-white py-2 text-center text-xs font-medium text-[#05714B]">
          {imageUrl ? "Replace Image" : "Choose Image"}
        </div>

        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) =>
            onChange(event.target.files?.[0] || null)
          }
        />
      </label>
    </div>
  );
}

function SliderModal({ slider, onClose, onSaved }) {
  const [form, setForm] = useState(() => ({
    ...initialForm,
    ...(slider || {}),
    desktop_image: null,
    mobile_image: null,
    starts_at: slider?.starts_at
      ? slider.starts_at.slice(0, 16)
      : "",
    ends_at: slider?.ends_at
      ? slider.ends_at.slice(0, 16)
      : "",
  }));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");

    try {
      const body = new FormData();

      const fields = [
        "title",
        "subtitle",
        "description",
        "button_text",
        "button_link",
        "text_position",
        "text_color",
        "overlay_opacity",
        "sort_order",
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

      const url = slider
        ? `/api/admin/sliders/${slider.id}`
        : "/api/admin/sliders";

      const response = await fetch(url, {
        method: slider ? "PUT" : "POST",
        body,
        credentials: "same-origin",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        const validationMessage = result.errors
          ? Object.values(result.errors).flat()[0]
          : null;

        throw new Error(
          validationMessage ||
          result.message ||
          "Unable to save slider."
        );
      }

      onSaved();
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
              {slider ? "Edit Slider" : "Add New Slider"}
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Manage homepage banner content and images.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-2 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto"
        >
          <div className="space-y-5 p-6">
            {error && (
              <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <ImageUpload
                label="Desktop Banner"
                file={form.desktop_image}
                existingUrl={slider?.desktop_image_url}
                onChange={(file) => update("desktop_image", file)}
                required={!slider}
              />

              <ImageUpload
                label="Mobile Banner"
                file={form.mobile_image}
                existingUrl={slider?.mobile_image_url}
                onChange={(file) => update("mobile_image", file)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Title">
                <input
                  className={inputClass}
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="Korean Skincare Collection"
                />
              </FormField>

              <FormField label="Subtitle">
                <input
                  className={inputClass}
                  value={form.subtitle}
                  onChange={(e) => update("subtitle", e.target.value)}
                  placeholder="Healthy Skin, Real Confidence"
                />
              </FormField>
            </div>

            <FormField label="Description">
              <textarea
                className={inputClass}
                rows={3}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Optional banner description"
              />
            </FormField>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Button Text">
                <input
                  className={inputClass}
                  value={form.button_text}
                  onChange={(e) => update("button_text", e.target.value)}
                  placeholder="Shop Now"
                />
              </FormField>

              <FormField label="Button Link">
                <input
                  className={inputClass}
                  value={form.button_link}
                  onChange={(e) => update("button_link", e.target.value)}
                  placeholder="/products"
                />
              </FormField>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <FormField label="Text Position">
                <select
                  className={inputClass}
                  value={form.text_position}
                  onChange={(e) => update("text_position", e.target.value)}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </FormField>

              <FormField label="Text Color">
                <input
                  type="color"
                  className="h-10 w-full cursor-pointer rounded-lg border border-gray-200 bg-white p-1"
                  value={form.text_color}
                  onChange={(e) => update("text_color", e.target.value)}
                />
              </FormField>

              <FormField label="Overlay Opacity">
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={form.overlay_opacity}
                    onChange={(e) => update("overlay_opacity", Number(e.target.value))}
                    className="w-full accent-[#05714B]"
                  />
                  <span className="w-9 text-right text-xs">
                    {form.overlay_opacity}%
                  </span>
                </div>
              </FormField>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <FormField label="Sort Order">
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={form.sort_order}
                  onChange={(e) => update("sort_order", Number(e.target.value))}
                />
              </FormField>

              <FormField label="Start Date (Optional)">
                <input
                  type="datetime-local"
                  className={inputClass}
                  value={form.starts_at}
                  onChange={(e) => update("starts_at", e.target.value)}
                />
              </FormField>

              <FormField label="End Date (Optional)">
                <input
                  type="datetime-local"
                  className={inputClass}
                  value={form.ends_at}
                  onChange={(e) => update("ends_at", e.target.value)}
                />
              </FormField>
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => update("is_active", e.target.checked)}
                className="h-4 w-4 accent-[#05714B]"
              />
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Active Slider
                </p>
                <p className="text-xs text-gray-500">
                  Display this banner on the storefront.
                </p>
              </div>
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-gray-200 px-5 py-2.5 text-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#05714B] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving && <LoaderCircle size={16} className="animate-spin" />}
              {saving ? "Saving..." : slider ? "Update Slider" : "Create Slider"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteSliderModal({ slider, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/sliders/${slider.id}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Delete failed.");
      }

      onDeleted();
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="h-1 bg-red-500" />

        <div className="relative p-6 text-center">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 cursor-pointer text-gray-400 hover:text-gray-700"
          >
            <X size={18} />
          </button>

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <Trash2 size={24} />
          </div>

          <h3 className="text-xl font-bold text-gray-900">
            Delete Slider
          </h3>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Are you sure you want to delete{" "}
            <strong>{slider.title || `Slider #${slider.id}`}</strong>?
            This action cannot be undone.
          </p>

          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 cursor-pointer rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {deleting && <LoaderCircle size={16} className="animate-spin" />}
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminSlidersPage() {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(undefined);
  const [deleting, setDeleting] = useState(null);

  const loadSliders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/sliders?per_page=100",
        { cache: "no-store" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load sliders.");
      }

      setSliders(result.data?.data || []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSliders();
  }, [loadSliders]);

  function afterMutation() {
    setEditing(undefined);
    setDeleting(null);
    loadSliders();
  }

  const activeCount = sliders.filter((slider) => slider.is_active).length;

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Homepage Sliders
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage homepage banners, promotional content and links.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setEditing(null)}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#05714B] px-5 py-3 text-sm font-semibold text-white"
        >
          <Plus size={18} />
          Add Slider
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Sliders", value: sliders.length, icon: ImageIcon },
          { label: "Active Sliders", value: activeCount, icon: Eye },
          { label: "Inactive Sliders", value: sliders.length - activeCount, icon: EyeOff },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between text-sm text-gray-500">
                {stat.label}
                <Icon size={19} className="text-[#05714B]" />
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-bold text-gray-900">
            Slider List
          </h2>

          <button
            type="button"
            onClick={loadSliders}
            className="flex cursor-pointer items-center gap-2 text-sm text-gray-500 hover:text-[#05714B]"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {error && (
          <div role="alert" className="m-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <LoaderCircle size={30} className="animate-spin text-[#05714B]" />
          </div>
        ) : sliders.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-gray-400">
            <ImageIcon size={40} />
            <p className="text-sm">No sliders added yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th className="px-5 py-4">Banner</th>
                  <th className="px-5 py-4">Content</th>
                  <th className="px-5 py-4">Link</th>
                  <th className="px-5 py-4">Order</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {sliders.map((slider) => (
                  <tr key={slider.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-5 py-4">
                      {slider.desktop_image_url ? (
                        <img
                          src={slider.desktop_image_url}
                          alt={slider.title || "Banner"}
                          className="h-16 w-32 rounded-lg border border-gray-100 object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-32 items-center justify-center rounded-lg bg-gray-100">
                          <ImageIcon size={22} className="text-gray-400" />
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <p className="max-w-xs truncate font-semibold text-gray-900">
                        {slider.title || "Untitled Slide"}
                      </p>
                      <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                        {slider.subtitle || "No subtitle"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      {slider.button_link ? (
                        <a
                          href={slider.button_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#05714B] hover:underline"
                        >
                          View Link
                          <ExternalLink size={13} />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">No link</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {slider.sort_order}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          slider.is_active
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {slider.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditing(slider)}
                          className="cursor-pointer rounded-lg border border-gray-200 p-2 text-gray-600 hover:text-[#05714B]"
                          aria-label="Edit slider"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleting(slider)}
                          className="cursor-pointer rounded-lg border border-gray-200 p-2 text-gray-600 hover:text-red-600"
                          aria-label="Delete slider"
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
        )}
      </div>

      {editing !== undefined && (
        <SliderModal
          slider={editing}
          onClose={() => setEditing(undefined)}
          onSaved={afterMutation}
        />
      )}

      {deleting && (
        <DeleteSliderModal
          slider={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={afterMutation}
        />
      )}
    </div>
  );
}
