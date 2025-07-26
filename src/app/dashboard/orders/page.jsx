import { getOrdersForUser } from "@/app/lib/actions/orders";
import { getCustomers } from "@/app/lib/actions/customers";
import OrderList from "./OrderList";

export default async function OrdersPage() {
  // On récupère les commandes ET les clients en parallèle
  const [{ orders, error: ordersError }, { customers, error: customersError }] =
    await Promise.all([getOrdersForUser(), getCustomers()]);

  if (ordersError || customersError) {
    return <p className="p-8 text-red-500">{ordersError || customersError}</p>;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Gestion des Commandes</h1>
        {/* We should add a "New Order" button here later */}
      </div>
      <OrderList initialOrders={orders} customers={customers} />
    </div>
  );
}
