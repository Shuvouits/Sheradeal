"use client";

import { useSyncExternalStore } from "react";

export const CART_STORAGE_KEY = "sheradeal_cart_v1";
export const CART_CHECKOUT_KEY = "sheradeal_cart_checkout";

const CART_CHANGE_EVENT = "sheradeal:cart-change";
const CART_OPEN_EVENT = "sheradeal:cart-open";

const EMPTY_CART = [];

let cachedRaw = null;
let cachedItems = EMPTY_CART;

function amount(value) {
  const number = Number(value);

  return Number.isFinite(number) && number >= 0
    ? number
    : 0;
}

function quantityValue(value) {
  return Math.max(
    1,
    Math.min(99, Math.floor(Number(value) || 1))
  );
}

function normalizeItem(product, quantity = 1) {
  if (!product?.id) return null;

  const sellingPrice = amount(
    product.selling_price ??
    product.sale_price ??
    product.price
  );

  const originalPrice = amount(
    product.original_price ??
    product.compare_at_price ??
    product.price ??
    sellingPrice
  );

  const image =
    typeof product.image_url === "string"
      ? product.image_url
      : typeof product.image === "string"
        ? product.image
        : "";

  return {
    id: String(product.id),
    title: String(product.title || product.name || "Product"),
    slug: String(product.slug || ""),
    image_url: image,
    selling_price: sellingPrice,
    original_price: Math.max(originalPrice, sellingPrice),
    quantity: quantityValue(quantity),
    in_stock: product.in_stock !== false,
  };
}

function readCart() {
  if (typeof window === "undefined") {
    return EMPTY_CART;
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);

    if (raw === cachedRaw) {
      return cachedItems;
    }

    const parsed = JSON.parse(raw || "[]");

    cachedItems = Array.isArray(parsed)
      ? parsed
          .map((item) => normalizeItem(item, item.quantity))
          .filter(Boolean)
      : EMPTY_CART;

    cachedRaw = raw;

    return cachedItems;
  } catch {
    cachedRaw = null;
    cachedItems = EMPTY_CART;

    return EMPTY_CART;
  }
}

function subscribe(callback) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(CART_CHANGE_EVENT, callback);

  function onStorage(event) {
    if (event.key === CART_STORAGE_KEY) {
      callback();
    }
  }

  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(CART_CHANGE_EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCartItems() {
  return useSyncExternalStore(
    subscribe,
    readCart,
    () => EMPTY_CART
  );
}

function saveCart(items) {
  if (typeof window === "undefined") return;

  const raw = JSON.stringify(items);

  window.localStorage.setItem(CART_STORAGE_KEY, raw);

  cachedRaw = raw;
  cachedItems = items;

  window.dispatchEvent(new Event(CART_CHANGE_EVENT));
}

export function addCartItem(product, quantity = 1) {
  const item = normalizeItem(product, quantity);

  if (!item || !item.in_stock) return false;

  const cart = readCart();
  const existing = cart.find((entry) => entry.id === item.id);

  if (existing) {
    saveCart(
      cart.map((entry) =>
        entry.id === item.id
          ? {
              ...entry,
              quantity: quantityValue(
                entry.quantity + item.quantity
              ),
            }
          : entry
      )
    );
  } else {
    saveCart([...cart, item]);
  }

  return true;
}

export function updateCartQuantity(id, quantity) {
  const next = quantityValue(quantity);

  saveCart(
    readCart().map((item) =>
      item.id === String(id)
        ? { ...item, quantity: next }
        : item
    )
  );
}

export function removeCartItem(id) {
  saveCart(
    readCart().filter((item) => item.id !== String(id))
  );
}

export function clearCart() {
  saveCart([]);
}

export function getCartTotals(items) {
  return items.reduce(
    (totals, item) => {
      const quantity = quantityValue(item.quantity);

      totals.quantity += quantity;
      totals.subtotal += item.selling_price * quantity;
      totals.originalTotal += item.original_price * quantity;

      return totals;
    },
    {
      quantity: 0,
      subtotal: 0,
      originalTotal: 0,
    }
  );
}

export function openCartDrawer() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CART_OPEN_EVENT));
  }
}

export function subscribeCartOpen(callback) {
  window.addEventListener(CART_OPEN_EVENT, callback);

  return () => {
    window.removeEventListener(CART_OPEN_EVENT, callback);
  };
}

export function prepareCartCheckout(items = readCart()) {
  if (typeof window === "undefined" || items.length === 0) {
    return false;
  }

  window.sessionStorage.setItem(
    CART_CHECKOUT_KEY,
    JSON.stringify(items)
  );

  window.sessionStorage.setItem(
    "sheradeal_checkout_source",
    "cart"
  );

  return true;
}