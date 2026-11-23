"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpDown,
  ChevronDown,
  Download,
  Upload,
  FileDown,
  FileSpreadsheet,
  X,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

const ACCEPT = ".csv,text/csv";

async function readJSON(response) {
  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.success) {
    const firstError = result?.errors
      ? Object.values(result.errors).flat()[0]
      : null;

    throw new Error(
      firstError ||
      result?.message ||
      `Request failed (HTTP ${response.status}).`
    );
  }

  return result.data;
}

async function downloadCSV(url, fallbackName) {
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);

    throw new Error(
      result?.message || "Unable to download CSV."
    );
  }

  const blob = await response.blob();

  const disposition =
    response.headers.get("content-disposition") || "";

  const filenameMatch = disposition.match(
    /filename="?([^";]+)"?/i
  );

  const filename = filenameMatch?.[1] || fallbackName;

  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = objectUrl;
  anchor.download = filename;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

function ImportModal({
  open,
  onClose,
  onImported,
}) {
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [batchId, setBatchId] = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");

  const completedRef = useRef(false);

  useEffect(() => {
    if (!open || !batchId) return;

    let active = true;
    let timer;

    async function checkProgress() {
      try {
        const response = await fetch(
          `/api/admin/products/imports/${batchId}`,
          { cache: "no-store" }
        );

        const data = await readJSON(response);

        if (!active) return;

        setProgress(data);

        if (data.status === "completed") {
          if (!completedRef.current) {
            completedRef.current = true;
            onImported?.();
          }
          return;
        }

        if (data.status === "failed") {
          setError(data.error_message || "Import failed.");
          return;
        }

        timer = setTimeout(checkProgress, 2000);
      } catch (err) {
        if (!active) return;

        setError(err.message);
        timer = setTimeout(checkProgress, 5000);
      }
    }

    checkProgress();

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [open, batchId, onImported]);

  if (!open) return null;

  const isRunning =
    uploading ||
    (batchId &&
      !["completed", "failed"].includes(progress?.status));

  async function startImport() {
    if (!file || uploading || batchId) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "/api/admin/products/imports",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await readJSON(response);

      if (!data?.batch_id) {
        throw new Error("Import batch ID was not returned.");
      }

      completedRef.current = false;
      setBatchId(data.batch_id);
      setProgress({
        status: "pending",
        total_rows: 0,
        processed_rows: 0,
        created_rows: 0,
        skipped_rows: 0,
        failed_rows: 0,
        progress: 0,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  function closeModal() {
    if (uploading) return;
    onClose();
  }

  function reset() {
    setFile(null);
    setBatchId(null);
    setProgress(null);
    setError("");
    completedRef.current = false;

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  const percent = Math.min(
    100,
    Math.max(0, Number(progress?.progress || 0))
  );

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-import-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2
              id="product-import-title"
              className="text-lg font-bold text-gray-900"
            >
              Import Products
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Upload products using the SheraDeal CSV format.
            </p>
          </div>

          <button
            type="button"
            onClick={closeModal}
            disabled={uploading}
            aria-label="Close import"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={19} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          {!batchId && (
            <>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                className="hidden"
                onChange={(event) => {
                  setFile(event.target.files?.[0] || null);
                  setError("");
                }}
              />

              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center hover:border-[#05714B]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-[#05714B]">
                  <FileSpreadsheet size={24} />
                </div>

                <span className="text-sm font-semibold text-gray-800">
                  {file ? file.name : "Choose CSV file"}
                </span>

                <span className="text-xs text-gray-500">
                  CSV only, up to 20 MB
                </span>
              </button>

              <p className="text-xs leading-5 text-gray-500">
                The importer creates new products using the Barcode
                as the duplicate identifier. Existing product
                records will not be intentionally overwritten.
              </p>
            </>
          )}

          {batchId && progress && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">
                  {progress.status === "completed"
                    ? "Import completed"
                    : progress.status === "failed"
                      ? "Import failed"
                      : "Import in progress"}
                </span>

                <span className="text-sm font-bold text-[#05714B]">
                  {percent.toFixed(1)}%
                </span>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-[#05714B] transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Total Rows", progress.total_rows],
                  ["Processed", progress.processed_rows],
                  ["Created", progress.created_rows],
                  ["Skipped", progress.skipped_rows],
                  ["Failed", progress.failed_rows],
                  ["Batch ID", batchId],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-gray-100 bg-gray-50 p-3"
                  >
                    <p className="text-xs text-gray-500">
                      {label}
                    </p>

                    <p className="mt-1 text-lg font-bold text-gray-900">
                      {Number(value || 0).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {progress.status === "completed" && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
                  <CheckCircle2 size={18} />
                  Import processing finished.
                </div>
              )}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
          {batchId ? (
            <>
              <button
                type="button"
                onClick={reset}
                disabled={Boolean(isRunning)}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 disabled:opacity-40"
              >
                Import another
              </button>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg bg-[#05714B] px-5 py-2.5 text-sm font-semibold text-white"
              >
                Close
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={startImport}
                disabled={!file || uploading}
                className="inline-flex items-center gap-2 rounded-lg bg-[#05714B] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {uploading ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <Upload size={16} />
                )}

                {uploading ? "Uploading..." : "Start Import"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductImportExport({
  status = "all",
  search = "",
  onImported,
}) {
  const [open, setOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [downloading, setDownloading] = useState("");
  const [error, setError] = useState("");

  const menuRef = useRef(null);

  useEffect(() => {
    function closeOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeOutside);

    return () => {
      document.removeEventListener(
        "pointerdown",
        closeOutside
      );
    };
  }, []);

  async function handleDownload(type) {
    if (downloading) return;

    setOpen(false);
    setError("");
    setDownloading(type);

    try {
      if (type === "sample") {
        await downloadCSV(
          "/api/admin/products/exports/sample",
          "sheradeal-product-import-sample.csv"
        );
      } else {
        const params = new URLSearchParams();

        if (status && status !== "all") {
          params.set("status", status);
        }

        if (search) {
          params.set("search", search);
        }

        const query = params.toString();

        await downloadCSV(
          `/api/admin/products/exports/csv${
            query ? `?${query}` : ""
          }`,
          "sheradeal-products.csv"
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloading("");
    }
  }

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-haspopup="menu"
          disabled={Boolean(downloading)}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {downloading ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <ArrowUpDown size={16} />
          )}

          Import / Export
          <ChevronDown size={15} />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 top-12 z-40 w-56 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => handleDownload("export")}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              <Download size={17} />
              Export
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                setImportOpen(true);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              <Upload size={17} />
              Import
            </button>

            <div className="my-1 border-t border-gray-100" />

            <button
              type="button"
              role="menuitem"
              onClick={() => handleDownload("sample")}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              <FileDown size={17} />
              Download sample file
            </button>
          </div>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="fixed bottom-5 right-5 z-[500] flex max-w-sm items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm text-red-700 shadow-lg"
        >
          <AlertCircle size={17} />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={onImported}
      />
    </>
  );
}
