import { getCustomers } from "@/app/lib/actions/customers";
import { getProductsForUser } from "@/app/lib/actions/products";
import OrderList from "./OrderList";
import { getSupabaseWithUser } from "@/app/lib/supabase/server-utils";

//export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const { supabase, user } = await getSupabaseWithUser();

  // We collect orders AND customers in parallel
  const [
    { customers, error: customersError },
    { products, error: productsError },
  ] = await Promise.all([
    getCustomers({ supabase, user }),
    getProductsForUser({ supabase, user }),
  ]);

  const error = customersError || productsError;

  if (error) {
    return <p className="p-8 text-red-500">{error}</p>;
  }

  return (
    <div className="p-4 md:p-8">
      <OrderList customers={customers} products={products} />
    </div>
  );
}
