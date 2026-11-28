import HomeSlider from "@/components/frontend/home/HomeSlider";
import FeaturedCategories from "@/components/frontend/home/FeaturedCategories";
import PopularProducts from "@/components/frontend/home/PopularProducts";
import HomeAdvertisements from "@/components/frontend/home/HomeAdvertisements";
import NewArrivalProducts from "@/components/frontend/home/NewArrivalProducts";
import HomepageCategorySections from "@/components/frontend/home/HomepageCategorySections";
import HomeOutlets from "@/components/frontend/home/HomeOutlets";

export default function HomePage() {
  return (
    <>
    
      <HomeSlider />
      <FeaturedCategories />
      <PopularProducts />
      <HomeAdvertisements />
      <NewArrivalProducts />
      <HomepageCategorySections />
      <HomeOutlets />


    </>
  );
}
