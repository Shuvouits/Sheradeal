
import ProductForm from "@/components/admin/products/ProductForm";

export const metadata = {
  title: "Add Product | SheraDeal Admin",
};

export default function NewProductPage() {
  return <ProductForm mode="create" />;
}
