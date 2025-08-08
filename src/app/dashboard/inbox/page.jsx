import { getConversationsFromDB } from "@/app/lib/actions/conversations";
import { getProductsForUser } from "@/app/lib/actions/products";
import InboxClientComponent from "./InboxClientComponent";

export default async function InboxPage() {
  // load conversations AND products at the same time
  const [
    { conversations, error: convosError },
    { products, error: productsError },
  ] = await Promise.all([getConversationsFromDB(), getProductsForUser()]);

  const error = convosError || productsError;

  return (
    <div>
      <h1 className="text-2xl font-bold p-4 bg-white border-b">
        Boîte de Réception
      </h1>
      <InboxClientComponent
        conversations={conversations}
        products={products}
        error={error}
      />
    </div>
  );
}
