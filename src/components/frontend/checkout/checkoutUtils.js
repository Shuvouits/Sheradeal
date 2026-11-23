export const CHECKOUT_STORAGE_KEY = "sheradeal_buy_now";

export const SHIPPING_RATES = {
  dhaka: 80,
  outside: 150,
};

export function formatBDT(amount) {
  return `৳${Number(amount || 0).toLocaleString("en-BD", {
    maximumFractionDigits: 2,
  })}`;
}

function toAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
}

export function normalizeCheckoutProduct(product) {
  const sellingPrice = toAmount(
    product.selling_price ??
    product.sale_price ??
    product.special_price ??
    product.price
  );

  const originalPrice = toAmount(
    product.original_price ??
    product.compare_at_price ??
    product.price ??
    sellingPrice
  );

  return {
    id: Number(product.id),
    title: String(product.title || product.name || ""),
    slug: String(product.slug || ""),
    image_url: product.image_url || product.image || "",
    brand: product.brand?.name || product.brand_name || "",
    selling_price: sellingPrice,
    original_price: Math.max(originalPrice, sellingPrice),
    in_stock: product.in_stock !== false,
  };
}

export function saveBuyNowItem(product, quantity) {
  const item = {
    product: normalizeCheckoutProduct(product),
    quantity: Math.max(1, Math.min(99, Number(quantity) || 1)),
  };

  sessionStorage.setItem(
    CHECKOUT_STORAGE_KEY,
    JSON.stringify(item)
  );

  return item;
}

export function getBuyNowItem() {
  try {
    const stored = sessionStorage.getItem(CHECKOUT_STORAGE_KEY);

    if (!stored) return null;

    const parsed = JSON.parse(stored);

    if (!parsed?.product?.id || !parsed?.quantity) {
      return null;
    }

    return {
      product: normalizeCheckoutProduct(parsed.product),
      quantity: Math.max(1, Math.min(99, Number(parsed.quantity))),
    };
  } catch {
    return null;
  }
}