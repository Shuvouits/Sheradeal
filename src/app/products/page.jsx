import ProductSearchPage from "@/components/frontend/products/ProductSearchPage";

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;

  const search = String(params?.search || "").trim();

  if (search) {
    return {
      title: `Search Results for "${search}" | SheraDeal`,
      description: `Shop products matching ${search} at SheraDeal Bangladesh.`,
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  return {
    title: "All Products | SheraDeal Bangladesh",
    description: "Shop products online at SheraDeal Bangladesh.",
  };
}

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;

  const search = String(params?.search || "");
  const sort = String(params?.sort || "relevance");

  const parsedPage = Number(params?.page || 1);

  const page = Number.isInteger(parsedPage) && parsedPage > 0
    ? parsedPage
    : 1;

  return (
    <>
      <ProductSearchPage
        search={search}
        sort={sort}
        page={page}
      />


    </>
  );
}

