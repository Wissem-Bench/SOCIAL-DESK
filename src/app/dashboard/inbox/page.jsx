import { getProductsForUser } from "@/app/lib/actions/products";
import InboxClientComponent from "./InboxClientComponent";

export default async function InboxPage() {
  // We still need the products for the "Create Order" modal
  const { products, error } = await getProductsForUser();

  return <InboxClientComponent products={products} error={error} />;
}
