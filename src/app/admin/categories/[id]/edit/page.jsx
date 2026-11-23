import CategoryEditor from "@/components/admin/categories/CategoryEditor";

export const metadata = {
  title: "Edit Category | SheraDeal Admin",
};

export default async function EditCategoryPage({ params }) {
  const { id } = await params;

  return <CategoryEditor categoryId={id} />;
}