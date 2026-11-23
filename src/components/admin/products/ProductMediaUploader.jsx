
"use client";

import { useEffect, useRef, useState } from "react";
import {
  ImagePlus,
  Upload,
  Star,
  Trash2,
  X,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

const MAX_IMAGES = 250;
const MAX_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

function imageUrl(media) {
  if (!media) return "";

  const backendUrl = (
    process.env.NEXT_PUBLIC_LARAVEL_URL ||
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");

  const value =
    media.url ||
    media.external_url ||
    media.file_path ||
    "";

  if (!value) return "";

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith("//")) {
    return `http:${value}`;
  }

  const cleanPath = value
    .replace(/^\/+/, "")
    .replace(/^public\//, "")
    .replace(/^storage\//, "");

  return `${backendUrl}/storage/${cleanPath}`;
}

export default function ProductMediaUploader({
  productId = null,
  pendingMedia = [],
  setPendingMedia,
  existingMedia = [],
  setExistingMedia,
  coverChoice = null,
  setCoverChoice,
  disabled = false,
}) {
  const inputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [failedImages, setFailedImages] = useState({});

  useEffect(() => {
    if (!productId) return;

    const controller = new AbortController();

    async function loadMedia() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/admin/products/${productId}/media`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const result = await response.json();

        if (!response.ok || result.success === false) {
          throw new Error(
            result.message || "Unable to load product images."
          );
        }

        if (controller.signal.aborted) return;

        const items = Array.isArray(result.data)
          ? result.data
          : [];

        setExistingMedia(items);

        const cover = items.find((item) => item.is_cover);

        setCoverChoice((current) => {
          if (current) return current;

          return cover
            ? {
                type: "existing",
                id: cover.id,
              }
            : items.length > 0
              ? {
                  type: "existing",
                  id: items[0].id,
                }
              : null;
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            err.message || "Unable to load product images."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadMedia();

    return () => {
      controller.abort();
    };
  }, [productId, setExistingMedia, setCoverChoice]);

  function selectImages(event) {
    const files = Array.from(event.target.files || []);

    event.target.value = "";

    if (!files.length || disabled) return;

    setError("");

    const invalidType = files.find(
      (file) => !ALLOWED_TYPES.includes(file.type)
    );

    if (invalidType) {
      setError(
        "Only JPG, JPEG, PNG, WEBP and GIF images are allowed."
      );
      return;
    }

    const oversized = files.find(
      (file) => file.size > MAX_SIZE
    );

    if (oversized) {
      setError("Each image must be 5 MB or smaller.");
      return;
    }

    const total =
      existingMedia.length +
      pendingMedia.length +
      files.length;

    if (total > MAX_IMAGES) {
      setError(
        `Maximum ${MAX_IMAGES} product images are allowed.`
      );
      return;
    }

    const selected = files.map((file) => ({
      key: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));

    if (
      !coverChoice &&
      existingMedia.length === 0 &&
      pendingMedia.length === 0
    ) {
      setCoverChoice({
        type: "pending",
        id: selected[0].key,
      });
    }

    setPendingMedia((previous) => [
      ...previous,
      ...selected,
    ]);
  }

  function removePending(key) {
    if (disabled) return;

    const target = pendingMedia.find(
      (item) => item.key === key
    );

    if (target) {
      URL.revokeObjectURL(target.preview);
    }

    const remaining = pendingMedia.filter(
      (item) => item.key !== key
    );

    setPendingMedia(remaining);

    if (
      coverChoice?.type === "pending" &&
      coverChoice.id === key
    ) {
      const existingCover =
        existingMedia.find((item) => item.is_cover) ||
        existingMedia[0];

      if (existingCover) {
        setCoverChoice({
          type: "existing",
          id: existingCover.id,
        });
      } else if (remaining.length > 0) {
        setCoverChoice({
          type: "pending",
          id: remaining[0].key,
        });
      } else {
        setCoverChoice(null);
      }
    }
  }

  function selectCover(type, id) {
    if (disabled) return;

    setCoverChoice({
      type,
      id,
    });
  }

  async function deleteExisting() {
    if (!deleteTarget || !productId || disabled) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/products/${productId}/media/${deleteTarget.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Unable to delete product image."
        );
      }

      const remaining = existingMedia.filter(
        (item) => item.id !== deleteTarget.id
      );

      setExistingMedia(remaining);

      setFailedImages((previous) => {
        const next = { ...previous };
        delete next[deleteTarget.id];
        return next;
      });

      if (
        coverChoice?.type === "existing" &&
        coverChoice.id === deleteTarget.id
      ) {
        const nextCover =
          remaining.find((item) => item.is_cover) ||
          remaining[0];

        if (nextCover) {
          setCoverChoice({
            type: "existing",
            id: nextCover.id,
          });
        } else if (pendingMedia.length > 0) {
          setCoverChoice({
            type: "pending",
            id: pendingMedia[0].key,
          });
        } else {
          setCoverChoice(null);
        }
      }

      setDeleteTarget(null);
    } catch (err) {
      setError(
        err.message || "Unable to delete image."
      );
    } finally {
      setDeleting(false);
    }
  }

  function markImageFailed(id) {
    setFailedImages((previous) => ({
      ...previous,
      [id]: true,
    }));
  }

  const totalImages =
    existingMedia.length + pendingMedia.length;

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        hidden
        onChange={selectImages}
      />

      <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center">
        <ImagePlus
          size={30}
          className="mx-auto text-gray-400"
        />

        <div className="mt-3">
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 transition hover:border-[#05714B] hover:text-[#05714B] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload size={16} />
            Upload new
          </button>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          Upload JPG, PNG, WEBP or GIF images, up to 5 MB each.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700"
        >
          <AlertCircle
            size={16}
            className="shrink-0"
          />

          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <LoaderCircle
            size={17}
            className="animate-spin text-[#05714B]"
          />
          Loading product images...
        </div>
      )}

      {totalImages > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {existingMedia.map((media) => {
            const isCover =
              coverChoice?.type === "existing" &&
              Number(coverChoice.id) === Number(media.id);

            const src = imageUrl(media);
            const hasFailed = failedImages[media.id];

            return (
              <div
                key={`existing-${media.id}`}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white"
              >
                <div className="relative flex aspect-square items-center justify-center bg-gray-50">
                  {src && !hasFailed ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={src}
                      alt={
                        media.alt_text ||
                        media.original_filename ||
                        "Product image"
                      }
                      className="h-full w-full object-contain"
                      onError={() => markImageFailed(media.id)}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 px-3 text-center">
                      <ImagePlus
                        size={28}
                        className="text-gray-400"
                      />

                      <p className="text-xs text-gray-500">
                        Image unavailable
                      </p>

                      {src && (
                        <a
                          href={src}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-[#05714B] underline"
                        >
                          Check image URL
                        </a>
                      )}
                    </div>
                  )}

                  {isCover && (
                    <span className="absolute bottom-2 left-2 rounded-md bg-[#05714B] px-2 py-1 text-[10px] font-semibold text-white">
                      Cover
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 bg-white p-2">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      selectCover("existing", media.id)
                    }
                    title="Set as cover"
                    aria-label="Set as cover image"
                    className={`rounded-md p-1.5 transition ${
                      isCover
                        ? "text-amber-500"
                        : "text-gray-400 hover:bg-amber-50 hover:text-amber-500"
                    }`}
                  >
                    <Star
                      size={18}
                      fill={isCover ? "currentColor" : "none"}
                    />
                  </button>

                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setDeleteTarget(media)}
                    title="Delete image"
                    aria-label="Delete product image"
                    className="rounded-md p-1.5 text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            );
          })}

          {pendingMedia.map((item) => {
            const isCover =
              coverChoice?.type === "pending" &&
              coverChoice.id === item.key;

            return (
              <div
                key={`pending-${item.key}`}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white"
              >
                <div className="relative flex aspect-square items-center justify-center bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.preview}
                    alt={item.file.name}
                    className="h-full w-full object-contain"
                  />

                  <span className="absolute right-2 top-2 rounded-md bg-gray-900/75 px-2 py-1 text-[10px] font-medium text-white">
                    New
                  </span>

                  {isCover && (
                    <span className="absolute bottom-2 left-2 rounded-md bg-[#05714B] px-2 py-1 text-[10px] font-semibold text-white">
                      Cover
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 bg-white p-2">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      selectCover("pending", item.key)
                    }
                    title="Set as cover"
                    aria-label="Set as cover image"
                    className={`rounded-md p-1.5 transition ${
                      isCover
                        ? "text-amber-500"
                        : "text-gray-400 hover:bg-amber-50 hover:text-amber-500"
                    }`}
                  >
                    <Star
                      size={18}
                      fill={isCover ? "currentColor" : "none"}
                    />
                  </button>

                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => removePending(item.key)}
                    title="Remove image"
                    aria-label="Remove selected image"
                    className="rounded-md p-1.5 text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-500">
        {totalImages} / {MAX_IMAGES} images. Select the star
        icon to choose the cover image. New images are uploaded
        when you save the product.
      </p>

      {deleteTarget && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border-t-4 border-red-500 bg-white p-6 shadow-xl">
            <div className="flex justify-end">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                aria-label="Close"
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 size={25} />
            </div>

            <h3 className="mt-4 text-center text-lg font-bold text-gray-900">
              Delete Image
            </h3>

            <p className="mt-2 text-center text-sm text-gray-500">
              Are you sure you want to delete this image?
              This action cannot be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={deleteExisting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting && (
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />
                )}

                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
