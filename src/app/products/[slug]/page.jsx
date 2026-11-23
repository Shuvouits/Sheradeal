import ProductDetailsPage from "@/components/frontend/product-details/ProductDetailsPage";

export default async function ProductPage({ params }) {
  const { slug } = await params;

  return <ProductDetailsPage slug={slug} />;
}