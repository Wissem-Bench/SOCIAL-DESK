import { getConversations } from "@/app/lib/actions/meta";
import { getProductsForUser } from "@/app/lib/actions/products"; // Importer l'action des produits
import InboxClientComponent from "./InboxClientComponent";

export default async function InboxPage() {
  // load conversations AND products at the same time
  const [
    { conversations, error: convosError },
    { products, error: productsError },
  ] = await Promise.all([getConversations(), getProductsForUser()]);

  const error = convosError || productsError;

  return (
    <div>
      <h1 className="text-2xl font-bold p-4 bg-white border-b">
        Boîte de Réception
      </h1>
      {/* We pass the products as props to the client component */}
      <InboxClientComponent
        conversations={conversations}
        products={products}
        error={error}
      />
    </div>
  );
}
