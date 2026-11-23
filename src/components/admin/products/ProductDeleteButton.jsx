
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

export default function ProductDeleteButton({
    product,
    onDeleted,
}) {
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    function closeModal() {
        if (deleting) return;

        setOpen(false);
        setError("");
    }

    async function handleDelete() {
        if (!product?.id || deleting) return;

        setDeleting(true);
        setError("");

        try {
            const response = await fetch(
                `/api/admin/products/${product.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Accept: "application/json",
                    },
                    cache: "no-store",
                }
            );

            const result = await response.json().catch(() => ({}));

            if (!response.ok || result.success === false) {
                const firstError = Object.values(result.errors || {})
                    .flat()
                    .find(Boolean);

                throw new Error(
                    firstError ||
                    result.message ||
                    "Unable to delete this product."
                );
            }

            setOpen(false);

            if (typeof onDeleted === "function") {
                await onDeleted(product);
            } else {
                router.refresh();
            }
        } catch (err) {
            setError(err.message || "Product deletion failed.");
        } finally {
            setDeleting(false);
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => {
                    setError("");
                    setOpen(true);
                }}
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                title="Delete product"
                aria-label={`Delete ${product?.name || product?.title || "product"}`}
            >
                <Trash2 size={16} />
            </button>

            {open && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-product-title"
                        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
                    >
                        <div className="h-1 bg-red-500" />

                        <button
                            type="button"
                            onClick={closeModal}
                            disabled={deleting}
                            aria-label="Close dialog"
                            className="absolute right-4 top-5 cursor-pointer rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed"
                        >
                            <X size={19} />
                        </button>

                        <div className="px-7 pb-7 pt-7">
                            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                                <Trash2 size={29} className="text-red-500" />
                            </div>

                            <h2
                                id="delete-product-title"
                                className="text-xl font-bold text-gray-900"
                            >
                                Delete Product
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-gray-600">
                                Are you sure you want to delete{" "}
                                <strong className="font-semibold text-gray-900">
                                    {product?.name || product?.title || "this product"}
                                </strong>
                                ? This action cannot be undone.
                            </p>

                            <div className="mt-5 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
                                <AlertTriangle size={17} className="mt-0.5 shrink-0" />

                                <span>
                                    This product will be removed from the active
                                    product catalog.
                                </span>
                            </div>

                            {error && (
                                <div
                                    role="alert"
                                    className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                                >
                                    {error}
                                </div>
                            )}

                            <div className="mt-7 grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={deleting}
                                    className="h-11 cursor-pointer rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {deleting ? (
                                        <>
                                            <Loader2 size={17} className="animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={17} />
                                            Delete
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
