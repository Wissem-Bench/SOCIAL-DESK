import { getSupabaseWithUser } from "@/app/lib/supabase/server-utils";
import { getProductsForUser, getCategories } from "@/app/lib/actions/products";
import ProductList from "./ProductList";

export default async function ProductsPage() {
  const { supabase, user } = await getSupabaseWithUser();

  const [{ products, error }, { categories, error: catError }] =
    await Promise.all([
      getProductsForUser({ supabase, user }),
      getCategories({ supabase, user }),
    ]);

  if (error || catError) {
    return <p className="p-8 text-red-500">{error}</p>;
  }

  return (
    <div className="p-4 md:p-8">
      <ProductList initialProducts={products} categories={categories} />
    </div>
  );
}
