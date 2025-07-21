import { getProductsForUser, deleteProduct } from "@/app/lib/actions/products";
import AddProductForm from "./AddProductForm";
import ProductList from "./ProductList";

export default async function ProductsPage() {
  const { products, error } = await getProductsForUser();

  if (error) {
    return <p className="p-8 text-red-500">{error}</p>;
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Gestion des Produits</h1>

      {/* Add form */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">
          Ajouter un nouveau produit
        </h2>
        <AddProductForm />
      </div>
      <ProductList products={products} />
    </div>
  );
}
