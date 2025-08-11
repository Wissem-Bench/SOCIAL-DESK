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
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ maxHeight: "84vh" }}
    >
      <header className="flex-shrink-0">
        <h1 className="text-2xl font-bold p-4 bg-white border-b">
          Boîte de Réception
        </h1>
      </header>

      {/* Content: must be overflow-hidden so l'enfant gère ses propres scroll */}
      <main className="flex-1 overflow-hidden">
        <InboxClientComponent
          conversations={conversations}
          products={products}
          error={error}
        />
      </main>
    </div>
  );
}
