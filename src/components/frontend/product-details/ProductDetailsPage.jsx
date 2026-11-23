"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LoaderCircle,
  ArrowLeft,
  AlertCircle,
  PackageSearch,
} from "lucide-react";

import ProductGallery from "./ProductGallery";
import ProductPurchasePanel from "./ProductPurchasePanel";
import RelatedProductsSidebar from "./RelatedProductsSidebar";
import ProductInformation, {
  CustomerReviews,
} from "./ProductInformation";

import PopularProductCard from "@/components/frontend/products/PopularProductCard";
import SiteFooter from "@/components/frontend/footer/SiteFooter";

export default function ProductDetailsPage({ slug }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProduct() {
      setLoading(true);
      setError("");
      setData(null);

      try {
        const response = await fetch(
          `/api/storefront/product-details/${encodeURIComponent(slug)}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const result = await response.json().catch(() => ({}));

        if (!response.ok || result.success !== true) {
          throw new Error(
            response.status === 404
              ? "Product not found."
              : result.message || "Unable to load product details."
          );
        }

        if (!controller.signal.aborted) {
          setData(result.data);
        }
      } catch (err) {
        if (err.name !== "AbortError" && !controller.signal.aborted) {
          setError(err.message || "Unable to load product.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => controller.abort();
  }, [slug]);

  if (loading) {
    return (
      <>
        <main className="flex min-h-[65vh] items-center justify-center bg-white">
          <div className="text-center">
            <LoaderCircle
              size={33}
              className="mx-auto animate-spin text-[#05714B]"
            />

            <p className="mt-4 text-sm text-gray-500">
              Loading product details...
            </p>
          </div>
        </main>

        <SiteFooter />
      </>
    );
  }

  if (error || !data?.product) {
    return (
      <>
        <main className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
          {error ? (
            <AlertCircle
              size={40}
              className="text-red-400"
            />
          ) : (
            <PackageSearch
              size={40}
              className="text-gray-300"
            />
          )}

          <h1 className="mt-4 text-xl font-bold text-gray-900">
            {error || "Product not found"}
          </h1>

          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#05714B] px-5 py-3 text-sm font-semibold text-white"
          >
            <ArrowLeft size={17} />
            Back to Home
          </Link>
        </main>

        <SiteFooter />
      </>
    );
  }

  const product = data.product;
  const relatedProducts = data.related_products || [];
  const sameBrandProducts = data.same_brand_products || [];
  const reviews = data.reviews || [];

  const reviewSummary = data.review_summary || {
    average: null,
    count: 0,
  };

  return (
    <>
      <main className="bg-white pb-16 pt-5">
        <div className="mx-auto w-[calc(100%-28px)] max-w-[1440px] sm:w-[calc(100%-40px)]">
          <nav
            aria-label="Breadcrumb"
            className="mb-5 flex flex-wrap items-center gap-2 text-xs text-gray-500"
          >
            <Link
              href="/"
              className="hover:text-[#05714B]"
            >
              Home
            </Link>

            <span>/</span>

            <Link
              href="/products"
              className="hover:text-[#05714B]"
            >
              Products
            </Link>

            <span>/</span>

            <span className="line-clamp-1 font-medium text-[#05714B]">
              {product.title}
            </span>
          </nav>

          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,3fr)_minmax(280px,1fr)]">
            <div className="min-w-0">
              <div className="grid gap-5 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
                <ProductGallery
                  key={product.id}
                  product={product}
                />

                <ProductPurchasePanel
                  key={product.id}
                  product={product}
                  reviewSummary={reviewSummary}
                />
              </div>
            </div>

            <RelatedProductsSidebar
              products={relatedProducts}
            />
          </div>

          <div className="mt-6">
            <ProductInformation
              product={product}
              reviews={reviews}
            />
          </div>

          {sameBrandProducts.length > 0 && (
            <section className="mt-10">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-950 sm:text-3xl">
                  From{" "}
                  <span className="text-[#05714B]">
                    Same Brand
                  </span>
                </h2>

                <div className="mt-3 h-[3px] w-20 rounded-full bg-[#05714B]" />
              </div>

              <div className="grid grid-cols-2 items-stretch gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {sameBrandProducts.map((item) => (
                  <PopularProductCard
                    key={item.id}
                    product={item}
                  />
                ))}
              </div>
            </section>
          )}

          <CustomerReviews
            reviews={reviews}
            reviewSummary={reviewSummary}
          />
        </div>
      </main>

      <SiteFooter />
    </>
  );
}