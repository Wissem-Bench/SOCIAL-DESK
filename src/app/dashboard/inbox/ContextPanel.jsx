"use client";

import { addProspectAsCustomer } from "@/app/lib/actions/customers";
import SubmitButton from "@/app/components/ui/SubmitButton";
import OrderStatusBadge from "../OrderStatusBadge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// This is the view for a confirmed customer
function CustomerDetailsView({ customer }) {
  const totalSpent = customer.orders.reduce(
    (sum, order) => sum + order.total_amount,
    0
  );
  return (
    <div className="p-6 bg-gray-50 flex-1 min-h-0 box-border">
      <h3 className="font-bold text-lg">{customer.full_name}</h3>
      <p className="text-sm text-gray-600">Client via {customer.platform}</p>

      <div className="space-y-2 text-sm text-gray-700 border-t border-b py-4">
        <div className="flex items-center">
          <svg
            className="w-5 h-6 text-gray-800 dark:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="rgba(55, 65, 81, var(--tw-text-opacity))"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="evenodd"
              d="M5 4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4Zm12 12V5H7v11h10Zm-5 1a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H12Z"
              clipRule="evenodd"
            />
          </svg>

          {/* Phone Icon */}
          <span>{customer.phone_number || "Pas de numéro"}</span>
        </div>
        <div className="flex items-center">
          <svg
            className="w-5 h-6 text-gray-800 dark:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="rgba(55, 65, 81, var(--tw-text-opacity))"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="evenodd"
              d="M11.906 1.994a8.002 8.002 0 0 1 8.09 8.421 7.996 7.996 0 0 1-1.297 3.957.996.996 0 0 1-.133.204l-.108.129c-.178.243-.37.477-.573.699l-5.112 6.224a1 1 0 0 1-1.545 0L5.982 15.26l-.002-.002a18.146 18.146 0 0 1-.309-.38l-.133-.163a.999.999 0 0 1-.13-.202 7.995 7.995 0 0 1 6.498-12.518ZM15 9.997a3 3 0 1 1-5.999 0 3 3 0 0 1 5.999 0Z"
              clipRule="evenodd"
            />
          </svg>

          {/* Location Icon */}
          <span>{customer.address || "Pas d'adresse"}</span>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total dépensé</p>
          <p className="text-2xl font-semibold">{totalSpent.toFixed(2)} TND</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-500">Commandes totales</p>
          <p className="text-2xl font-semibold">{customer.orders.length}</p>
        </div>
      </div>

      <div className="mt-8">
        <h4 className="font-semibold mb-2">Historique des commandes</h4>
        <div className="space-y-3">
          {customer.orders.length > 0 ? (
            customer.orders.map((order) => (
              <div
                key={order.id}
                className="bg-white p-3 rounded-lg shadow-sm text-sm"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-indigo-600">
                    #{order.order_number}
                  </span>
                  <span className="font-semibold">
                    {order.total_amount.toFixed(2)} TND
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    {format(new Date(order.order_date), "dd MMM yyyy", {
                      locale: fr,
                    })}
                  </p>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 italic">
              Aucune commande pour ce client.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// This is the view for a prospect who is not yet a customer
function ProspectView({ conversation }) {
  const handleAddCustomer = async () => {
    await addProspectAsCustomer(
      conversation.id,
      conversation.platform_conversation_id,
      conversation.platform,
      conversation.prospect_name
    );
  };

  return (
    <div className="p-6 bg-gray-50 h-full text-center flex flex-col justify-center">
      <h3 className="font-bold text-lg">
        {conversation.prospect_name || "Nouveau Prospect"}
      </h3>
      <p className="text-sm text-gray-600 mt-2 mb-4">
        Cette personne n'est pas encore dans votre liste de clients.
      </p>
      <form action={handleAddCustomer}>
        <SubmitButton
          pendingText="En cours..."
          className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Ajouter comme client
        </SubmitButton>
      </form>
    </div>
  );
}

export default function ContextPanel({
  conversation,
  customerDetails,
  isLoading,
}) {
  if (isLoading) {
    return <div className="p-6 text-center text-gray-500">Chargement...</div>;
  }
  if (!conversation) {
    return (
      <div className="p-6 text-center text-gray-500">
        Sélectionnez une conversation.
      </div>
    );
  }

  // The main logic: is the person in the conversation a customer?
  const isCustomer = !!conversation.customer_id;

  if (isCustomer && customerDetails) {
    // If they are a customer and we have their details, show them.
    return <CustomerDetailsView customer={customerDetails} />;
  } else {
    // Otherwise, show the Prospect view.
    return <ProspectView conversation={conversation} />;
  }
}
