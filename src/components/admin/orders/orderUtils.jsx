export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export const NEXT_STATUS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function formatMoney(value) {
  const amount = Number(value || 0);

  return `৳${amount.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(value) {
  if (!value) return "N/A";

  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Dhaka",
  }).format(new Date(value));
}

export function statusClass(status) {
  const styles = {
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    confirmed: "bg-blue-50 text-blue-700 ring-blue-200",
    processing: "bg-violet-50 text-violet-700 ring-violet-200",
    shipped: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    cancelled: "bg-red-50 text-red-700 ring-red-200",
    paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    unpaid: "bg-orange-50 text-orange-700 ring-orange-200",
  };

  return styles[status] || "bg-gray-50 text-gray-700 ring-gray-200";
}

export function StatusBadge({ value }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${statusClass(value)}`}
    >
      {value || "Unknown"}
    </span>
  );
}

export async function orderRequest(url, options = {}) {
  const response = await fetch(url, {
    cache: "no-store",
    credentials: "same-origin",
    ...options,
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.success) {
    const validationMessage = result?.errors
      ? Object.values(result.errors).flat()[0]
      : null;

    throw new Error(
      validationMessage ||
      result?.message ||
      `Request failed (HTTP ${response.status}).`
    );
  }

  return result.data;
}
