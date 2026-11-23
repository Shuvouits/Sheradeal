
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  MapPin,
  ExternalLink,
  Phone,
  Clock3,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  ImageIcon,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

const PUBLIC_API = "/api/storefront/outlets";
const ADMIN_API = "/api/admin/store-outlets";

const DEFAULT_HOURS = [
  { days: "Sat - Mon", hours: "11:00 AM - 09:00 PM" },
  { days: "Tuesday", hours: "Closed" },
  { days: "Wed - Fri", hours: "11:00 AM - 09:00 PM" },
];

const EMPTY_FORM = {
  name: "",
  address: "",
  phone: "",
  map_query: "",
  opening_hours: DEFAULT_HOURS,
  display_order: 0,
  is_active: true,
};

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#05714B]";

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    cache: "no-store",
    credentials: "same-origin",
    ...options,
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.success !== true) {
    const validationError = result.errors
      ? Object.values(result.errors).flat()[0]
      : null;

    throw new Error(
      validationError ||
      result.message ||
      `Request failed (${response.status}).`
    );
  }

  return result.data;
}

function hasAdminRole(result) {
  const user =
    result?.user ||
    result?.data?.user ||
    result?.data;

  const role = String(user?.role || "").toLowerCase();

  return ["admin", "super_admin", "administrator"].includes(role);
}

function mapsQuery(outlet) {
  return outlet.map_query?.trim() || outlet.address || outlet.name;
}

function mapEmbedUrl(outlet) {
  return `https://www.google.com/maps?q=${encodeURIComponent(
    mapsQuery(outlet)
  )}&output=embed`;
}

function mapOpenUrl(outlet) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    mapsQuery(outlet)
  )}`;
}

function OutletEditor({ outlet, onClose, onSaved }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    name: outlet?.name || "",
    address: outlet?.address || "",
    phone: outlet?.phone || "",
    map_query: outlet?.map_query || "",
    opening_hours:
      Array.isArray(outlet?.opening_hours) &&
      outlet.opening_hours.length > 0
        ? outlet.opening_hours.map((row) => ({ ...row }))
        : DEFAULT_HOURS.map((row) => ({ ...row })),
    display_order: outlet?.display_order ?? 0,
    is_active: outlet?.is_active ?? true,
  }));

  const [savedOutlet, setSavedOutlet] = useState(outlet || null);
  const [pendingImages, setPendingImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [removingImage, setRemovingImage] = useState(null);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function updateHours(index, field, value) {
    setForm((previous) => ({
      ...previous,
      opening_hours: previous.opening_hours.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      ),
    }));
  }

  function addHoursRow() {
    setForm((previous) => ({
      ...previous,
      opening_hours: [
        ...previous.opening_hours,
        { days: "", hours: "" },
      ],
    }));
  }

  function removeHoursRow(index) {
    setForm((previous) => ({
      ...previous,
      opening_hours: previous.opening_hours.filter(
        (_, rowIndex) => rowIndex !== index
      ),
    }));
  }

  function addFiles(event) {
    const files = Array.from(event.target.files || []);

    if (files.some((file) => file.size > 5 * 1024 * 1024)) {
      setError("Each image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (files.some((file) => !allowedTypes.includes(file.type))) {
      setError("Only JPG, PNG and WEBP images are allowed.");
      event.target.value = "";
      return;
    }

    const total =
      (savedOutlet?.images?.length || 0) +
      pendingImages.length +
      files.length;

    if (total > 12) {
      setError("An outlet can have a maximum of 12 images.");
      event.target.value = "";
      return;
    }

    setError("");
    setPendingImages((previous) => [...previous, ...files]);
    event.target.value = "";
  }

  async function removeSavedImage(imageId) {
    if (!savedOutlet || removingImage) return;

    setRemovingImage(imageId);
    setError("");

    try {
      const updated = await apiRequest(
        `${ADMIN_API}/${savedOutlet.id}/images/${imageId}`,
        { method: "DELETE" }
      );

      setSavedOutlet(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setRemovingImage(null);
    }
  }

  async function handleSave(event) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");

    try {
      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        phone: form.phone.trim() || null,
        map_query: form.map_query.trim() || null,
        opening_hours: form.opening_hours
          .filter((row) => row.days.trim() || row.hours.trim())
          .map((row) => ({
            days: row.days.trim(),
            hours: row.hours.trim(),
          })),
        display_order: Number(form.display_order) || 0,
        is_active: Boolean(form.is_active),
      };

      const id = savedOutlet?.id;

      const stored = await apiRequest(
        id ? `${ADMIN_API}/${id}` : ADMIN_API,
        {
          method: id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      setSavedOutlet(stored);

      if (pendingImages.length > 0) {
        const body = new FormData();

        pendingImages.forEach((file) => {
          body.append("images[]", file);
        });

        const withImages = await apiRequest(
          `${ADMIN_API}/${stored.id}/images`,
          {
            method: "POST",
            body,
          }
        );

        setSavedOutlet(withImages);
        setPendingImages([]);
      }

      onSaved(stored.id);
    } catch (err) {
      setError(err.message || "Unable to save outlet.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-3 sm:p-5">
      <div className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {savedOutlet ? "Edit Outlet" : "Add Outlet"}
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Manage outlet information and gallery photos.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-2 hover:bg-gray-100"
            aria-label="Close editor"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSave}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="space-y-5 overflow-y-auto p-5">
            {error && (
              <div role="alert" className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                Outlet Name *
              </label>
              <input
                required
                maxLength={180}
                value={form.name}
                onChange={(event) =>
                  update("name", event.target.value)
                }
                className={inputClass}
                placeholder="Shimanto Shombhar Shopping Complex"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                Address *
              </label>
              <textarea
                required
                rows={3}
                value={form.address}
                onChange={(event) =>
                  update("address", event.target.value)
                }
                className={inputClass}
                placeholder="Shop number, floor, shopping complex, city"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold">
                  Phone Number
                </label>
                <input
                  type="tel"
                  maxLength={40}
                  value={form.phone}
                  onChange={(event) =>
                    update("phone", event.target.value)
                  }
                  className={inputClass}
                  placeholder="01303-779646"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold">
                  Display Order
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.display_order}
                  onChange={(event) =>
                    update("display_order", event.target.value)
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                Google Maps Search / Location
              </label>
              <input
                value={form.map_query}
                maxLength={255}
                onChange={(event) =>
                  update("map_query", event.target.value)
                }
                className={inputClass}
                placeholder="Shop name, address or latitude,longitude"
              />
              <p className="mt-1 text-xs text-gray-500">
                Leave blank to use the outlet address. You can enter
                coordinates for a more precise map pin.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold">Opening Hours</h3>

                <button
                  type="button"
                  disabled={form.opening_hours.length >= 14}
                  onClick={addHoursRow}
                  className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-[#05714B] disabled:opacity-40"
                >
                  <Plus size={15} />
                  Add Row
                </button>
              </div>

              <div className="space-y-2">
                {form.opening_hours.map((row, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      required
                      value={row.days}
                      onChange={(event) =>
                        updateHours(index, "days", event.target.value)
                      }
                      className={inputClass}
                      placeholder="Sat - Mon"
                    />

                    <input
                      required
                      value={row.hours}
                      onChange={(event) =>
                        updateHours(index, "hours", event.target.value)
                      }
                      className={inputClass}
                      placeholder="11:00 AM - 09:00 PM"
                    />

                    <button
                      type="button"
                      onClick={() => removeHoursRow(index)}
                      className="cursor-pointer rounded-lg border border-gray-200 px-2 text-red-500"
                      aria-label="Remove opening hours row"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold">
                  Outlet Gallery
                </h3>

                <span className="text-xs text-gray-500">
                  {(savedOutlet?.images?.length || 0) +
                    pendingImages.length}/12
                </span>
              </div>

              {savedOutlet?.images?.length > 0 && (
                <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {savedOutlet.images.map((image) => (
                    <div
                      key={image.id}
                      className="relative aspect-square overflow-hidden rounded-lg bg-gray-100"
                    >
                      <img
                        src={image.image_url}
                        alt="Outlet gallery"
                        className="h-full w-full object-cover"
                      />

                      <button
                        type="button"
                        disabled={removingImage === image.id}
                        onClick={() => removeSavedImage(image.id)}
                        className="absolute right-1 top-1 cursor-pointer rounded-md bg-white p-1.5 text-red-600 shadow"
                        aria-label="Remove gallery image"
                      >
                        {removingImage === image.id ? (
                          <LoaderCircle size={15} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm font-medium text-gray-600 hover:border-[#05714B]">
                <ImageIcon size={20} />
                Select Gallery Images

                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={addFiles}
                  className="hidden"
                />
              </label>

              {pendingImages.length > 0 && (
                <div className="mt-3 space-y-2">
                  {pendingImages.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-xs"
                    >
                      <span className="truncate">{file.name}</span>

                      <button
                        type="button"
                        onClick={() =>
                          setPendingImages((previous) =>
                            previous.filter((_, i) => i !== index)
                          )
                        }
                        className="ml-2 cursor-pointer text-red-500"
                        aria-label="Remove pending image"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-2 text-xs text-gray-500">
                Maximum 12 images. JPG, PNG or WEBP. Each up to 5 MB.
              </p>
            </div>

            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 p-4">
              <div>
                <p className="text-sm font-semibold">Active Outlet</p>
                <p className="mt-1 text-xs text-gray-500">
                  Show this outlet on the website.
                </p>
              </div>

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
              className="cursor-pointer rounded-lg border border-gray-200 px-5 py-2.5 text-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#05714B] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}

              {saving ? "Saving..." : "Save Outlet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteOutletModal({ outlet, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (deleting) return;

    setDeleting(true);
    setError("");

    try {
      await apiRequest(`${ADMIN_API}/${outlet.id}`, {
        method: "DELETE",
      });

      onDeleted();
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[310] flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="h-1 bg-red-500" />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-5 cursor-pointer p-1 text-gray-400"
          aria-label="Close"
        >
          <X size={19} />
        </button>

        <div className="px-6 pb-6 pt-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
            <Trash2 size={27} />
          </div>

          <h2 className="mt-5 text-xl font-bold">
            Delete Outlet
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Are you sure you want to delete{" "}
            <strong className="text-gray-800">{outlet.name}</strong>?
            This action cannot be undone.
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
              className="cursor-pointer rounded-xl border border-gray-200 py-3 text-sm font-semibold"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white disabled:opacity-50"
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

export default function HomeOutlets() {
  const [outlets, setOutlets] = useState([]);
  const [admin, setAdmin] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [editing, setEditing] = useState(undefined);
  const [deleting, setDeleting] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(async (signal) => {
    let isAdmin = false;

    try {
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
        signal,
      });

      if (response.ok) {
        const result = await response.json();
        isAdmin = hasAdminRole(result);
      }
    } catch (err) {
      if (err.name === "AbortError") throw err;
    }

    let data;

    if (isAdmin) {
      try {
        data = await apiRequest(ADMIN_API, { signal });
      } catch (err) {
        if (err.name === "AbortError") throw err;
        isAdmin = false;
      }
    }

    if (!isAdmin) {
      data = await apiRequest(PUBLIC_API, { signal });
    }

    return {
      isAdmin,
      outlets: Array.isArray(data) ? data : [],
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchOutlets() {
      setLoading(true);
      setError("");

      try {
        const result = await load(controller.signal);

        if (controller.signal.aborted) return;

        setAdmin(result.isAdmin);
        setOutlets(result.outlets);

        setSelectedId((previous) => {
          if (
            previous &&
            result.outlets.some((item) => item.id === previous)
          ) {
            return previous;
          }

          return result.outlets[0]?.id ?? null;
        });
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message || "Unable to load outlets.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchOutlets();

    return () => controller.abort();
  }, [load, refreshKey]);

  const activeOutlet = outlets.find(
    (outlet) => outlet.id === selectedId
  ) || outlets[0];

  function refresh(selected = null) {
    if (selected !== null) setSelectedId(selected);
    setRefreshKey((previous) => previous + 1);
  }

  if (!loading && !error && !admin && outlets.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-12 sm:py-16" id="visit-outlets">
      <div className="mx-auto w-[calc(100%-28px)] max-w-[1440px] sm:w-[calc(100%-40px)]">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 sm:mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
            Visit <span className="text-[#05714B]">Outlets</span>
          </h2>

          <div className="flex items-center gap-3">
            {admin && (
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#05714B] px-4 py-2 text-xs font-semibold text-white"
              >
                <Plus size={16} />
                Add Outlet
              </button>
            )}

            {outlets.length > 1 && (
              <button
                type="button"
                onClick={() => setShowAll((previous) => !previous)}
                className="inline-flex cursor-pointer items-center gap-2 border-b border-gray-900 pb-1 text-sm font-medium text-gray-900"
              >
                View All
                {showAll ? (
                  <ChevronDown size={19} />
                ) : (
                  <ArrowRight size={19} />
                )}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div role="alert" className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-16">
            <LoaderCircle
              size={28}
              className="animate-spin text-[#05714B]"
            />
          </div>
        )}

        {!loading && admin && outlets.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 px-5 py-16 text-center">
            <MapPin size={36} className="mx-auto text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">
              No outlets added yet.
            </p>

            <button
              type="button"
              onClick={() => setEditing(null)}
              className="mt-4 cursor-pointer rounded-lg bg-[#05714B] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Add Your First Outlet
            </button>
          </div>
        )}

        {showAll && outlets.length > 1 && (
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {outlets.map((outlet) => (
              <button
                key={outlet.id}
                type="button"
                onClick={() => {
                  setSelectedId(outlet.id);
                  setShowAll(false);
                }}
                className={`cursor-pointer rounded-xl border p-4 text-left ${
                  activeOutlet?.id === outlet.id
                    ? "border-[#05714B] bg-emerald-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <p className="text-sm font-semibold text-gray-900">
                  {outlet.name}
                </p>
                <p className="mt-2 line-clamp-2 text-xs text-gray-500">
                  {outlet.address}
                </p>
              </button>
            ))}
          </div>
        )}

        {!loading && activeOutlet && (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:gap-7">
            <div className="space-y-4">
              <div className="relative h-[350px] overflow-hidden rounded-2xl bg-gray-100 sm:h-[460px]">
                <iframe
                  key={activeOutlet.id}
                  src={mapEmbedUrl(activeOutlet)}
                  title={`Map of ${activeOutlet.name}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full w-full border-0"
                  allowFullScreen
                />

                <a
                  href={mapOpenUrl(activeOutlet)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-gray-800 shadow-lg"
                >
                  <MapPin size={16} />
                  Open in Maps
                  <ExternalLink size={13} />
                </a>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div className="min-w-0 flex-1 space-y-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#05714B]">
                        Outlet Name
                      </p>

                      <h3 className="mt-2 text-xl font-bold text-[#064E3B] sm:text-2xl">
                        {activeOutlet.name}
                      </h3>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#05714B]">
                        Address
                      </p>

                      <p className="mt-2 text-sm leading-7 text-gray-700">
                        {activeOutlet.address}
                      </p>
                    </div>

                    {activeOutlet.phone && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#05714B]">
                          Phone
                        </p>

                        <a
                          href={`tel:${activeOutlet.phone.replace(/[^+\d]/g, "")}`}
                          className="mt-2 inline-flex items-center gap-2 text-sm text-gray-700 hover:text-[#05714B]"
                        >
                          <Phone size={15} />
                          {activeOutlet.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {activeOutlet.opening_hours?.length > 0 && (
                    <div className="w-full rounded-xl bg-gray-50 p-4 sm:w-[285px]">
                      <div className="mb-3 flex items-center gap-2">
                        <Clock3 size={16} className="text-[#05714B]" />

                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#05714B]">
                          Opening Hours
                        </p>
                      </div>

                      <div className="space-y-3">
                        {activeOutlet.opening_hours.map((row, index) => (
                          <div
                            key={index}
                            className="flex justify-between gap-3 text-xs text-gray-700"
                          >
                            <span>{row.days}</span>
                            <span className="text-right">
                              {row.hours}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {admin && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(activeOutlet)}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-[#05714B]"
                  >
                    <Pencil size={15} />
                    Edit Outlet
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleting(activeOutlet)}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-xs font-semibold text-red-600"
                  >
                    <Trash2 size={15} />
                    Delete Outlet
                  </button>

                  {!activeOutlet.is_active && (
                    <span className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                      Hidden from customers
                    </span>
                  )}
                </div>
              )}
            </div>

            <div>
              {activeOutlet.images?.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {activeOutlet.images.map((photo) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => setLightbox(photo.image_url)}
                      className="aspect-[1.16/1] cursor-pointer overflow-hidden rounded-xl bg-gray-100"
                      aria-label="View outlet photo"
                    >
                      <img
                        src={photo.image_url}
                        alt={`${activeOutlet.name} interior`}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[340px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-gray-400">
                  <ImageIcon size={36} />
                  <p className="mt-3 text-sm">No outlet photos yet</p>

                  {admin && (
                    <button
                      type="button"
                      onClick={() => setEditing(activeOutlet)}
                      className="mt-3 cursor-pointer text-sm font-semibold text-[#05714B]"
                    >
                      Add Photos
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {admin && editing !== undefined && (
        <OutletEditor
          key={editing?.id ?? "new"}
          outlet={editing}
          onClose={() => setEditing(undefined)}
          onSaved={(id) => {
            setEditing(undefined);
            refresh(id);
          }}
        />
      )}

      {admin && deleting && (
        <DeleteOutletModal
          outlet={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={() => {
            setDeleting(null);
            setSelectedId(null);
            refresh();
          }}
        />
      )}

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Outlet photo"
          className="fixed inset-0 z-[320] flex items-center justify-center bg-black/90 p-5"
        >
          <button
            type="button"
            aria-label="Close image"
            onClick={() => setLightbox(null)}
            className="absolute right-5 top-5 cursor-pointer rounded-full bg-white/15 p-3 text-white"
          >
            <X size={21} />
          </button>

          <img
            src={lightbox}
            alt="Outlet gallery full view"
            className="max-h-[85vh] max-w-full object-contain"
          />
        </div>
      )}
    </section>
  );
}
