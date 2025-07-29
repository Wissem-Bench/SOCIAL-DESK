import { getOrdersForUser } from "@/app/lib/actions/orders";
import { getCustomers } from "@/app/lib/actions/customers";
import { getProductsForUser } from "@/app/lib/actions/products";
import OrderList from "./OrderList";

export default async function OrdersPage() {
  // We collect orders AND customers in parallel
  const [
    { orders, error: ordersError },
    { customers, error: customersError },
    { products, error: productsError },
  ] = await Promise.all([
    getOrdersForUser(),
    getCustomers(),
    getProductsForUser(),
  ]);

  if (ordersError || customersError || productsError) {
    return (
      <p className="p-8 text-red-500">
        {ordersError || customersError || productsError}
      </p>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <OrderList
        initialOrders={orders}
        customers={customers}
        products={products}
      />
    </div>
  );
}
