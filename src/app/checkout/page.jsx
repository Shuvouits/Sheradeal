import CheckoutPage from "@/components/frontend/checkout/CheckoutPage";
import SiteFooter from "@/components/frontend/footer/SiteFooter";

export const metadata = {
  title: "Checkout | SheraDeal",
  description: "Complete your SheraDeal checkout.",
};

export default function Checkout() {
  return (
    <>
      <CheckoutPage />
      <SiteFooter />
    </>
  );
}