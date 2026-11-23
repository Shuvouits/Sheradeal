import BrandProductsPage from "@/components/frontend/brands/BrandProductsPage";
import SiteFooter from "@/components/frontend/footer/SiteFooter";

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const name = decodeURIComponent(slug)
    .split("-")
    .filter(Boolean)
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");

  return {
    title: `${name} Products | SheraDeal Bangladesh`,
    description: `Shop ${name} products online at SheraDeal Bangladesh.`,
  };
}

export default async function BrandPage({ params }) {
  const { slug } = await params;

  return (
    <>
      <BrandProductsPage slug={slug} />
      <SiteFooter />
    </>
  );
}