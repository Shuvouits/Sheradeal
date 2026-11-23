
import ProductForm from "@/components/admin/products/ProductForm";

export const metadata = {
  title: "Edit Product | SheraDeal Admin",
};

export default async function EditProductPage({ params }) {
  const { id } = await params;

  return <ProductForm mode="edit" productId={id} />;
}
