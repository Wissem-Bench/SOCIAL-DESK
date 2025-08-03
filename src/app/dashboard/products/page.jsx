import { getProductsForUser, getCategories } from "@/app/lib/actions/products";
import ProductList from "./ProductList";

export default async function ProductsPage() {
  const [{ products, error }, { categories, error: catError }] =
    await Promise.all([getProductsForUser(), getCategories()]);

  if (error || catError) {
    return <p className="p-8 text-red-500">{error}</p>;
  }

  return (
    <div className="p-4 md:p-8">
      <ProductList initialProducts={products} categories={categories} />
    </div>
  );
}
