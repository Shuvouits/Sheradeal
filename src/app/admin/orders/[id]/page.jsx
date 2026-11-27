import OrderDetails from "@/components/admin/orders/OrderDetails";

export const metadata = {
  title: "Order Details | SheraDeal Admin",
};

export default async function OrderDetailsPage({ params }) {
  const { id } = await params;

  return <OrderDetails orderId={id} />;
}
