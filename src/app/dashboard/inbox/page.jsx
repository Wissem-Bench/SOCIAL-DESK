import { getProductsForUser } from "@/app/lib/actions/products";
import InboxClientComponent from "./InboxClientComponent";

export default async function InboxPage() {
  // We still need the products for the "Create Order" modal
  const { products, error } = await getProductsForUser();

  if (error) {
    return <p className="p-8 text-red-500 text-center">{error}</p>;
  }

  return <InboxClientComponent products={products} />;
}
