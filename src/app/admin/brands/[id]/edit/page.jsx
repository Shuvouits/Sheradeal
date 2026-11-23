import BrandEditor from "@/components/admin/brands/BrandEditor";

export const metadata = {
  title: "Edit Brand | SheraDeal Admin",
};

export default async function EditBrandPage({ params }) {
  const { id } = await params;

  return <BrandEditor brandId={id} />;
}