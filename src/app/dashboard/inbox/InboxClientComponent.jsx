"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getCustomerDetailsForInbox } from "@/app/lib/actions/customers";
import CreateOrderModal from "./CreateOrderModal";
import ContextPanel from "./ContextPanel";

// Simple components for platform icons
const FacebookIcon = () => (
  <svg
    className="w-5 h-5 text-blue-600"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3l-.5 3h-2.5v6.8A10 10 0 0022 12z" />
  </svg>
);
const InstagramIcon = () => (
  <svg
    className="w-5 h-5 text-pink-600"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334" />
  </svg>
);

export default function InboxClientComponent({
  conversations,
  products,
  error,
}) {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for the right context panel
  const [customerDetails, setCustomerDetails] = useState(null);
  const [isContextLoading, setIsContextLoading] = useState(false);

  // When a conversation is selected, fetch the customer details for the context panel
  useEffect(() => {
    if (selectedConversation?.customer_id) {
      const fetchDetails = async () => {
        setIsContextLoading(true);
        const result = await getCustomerDetailsForInbox(
          selectedConversation.customer_id
        );
        if (!result.error) {
          setCustomerDetails(result.customer);
        }
        setIsContextLoading(false);
      };
      fetchDetails();
    } else {
      setCustomerDetails(null);
    }
  }, [selectedConversation]);

  if (error) {
    return <p className="p-8 text-red-500 text-center">{error}</p>;
  }
  if (!conversations || conversations.length === 0) {
    return (
      <p className="p-8 text-gray-500 text-center">Aucune conversation.</p>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full w-full overflow-hidden bg-white border-t">
      {/* Left Panel */}
      <div className="w-full md:w-1/4 flex-shrink-0 border-r border-gray-200 flex flex-col min-w-0">
        <div className="p-4 border-b">
          <h2 className="font-bold">Conversations</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((convo) => (
            <div
              key={convo.id}
              onClick={() => setSelectedConversation(convo)}
              className={`p-4 cursor-pointer border-l-4 ${
                selectedConversation?.id === convo.id
                  ? "border-blue-500 bg-gray-200"
                  : "border-transparent hover:bg-gray-100"
              }`}
            >
              <div className="flex justify-between items-center">
                <p className="font-semibold">
                  {convo.customers?.full_name ||
                    convo.prospect_name ||
                    "Prospect inconnu"}
                </p>
                {convo.platform === "facebook" && <FacebookIcon />}
                {convo.platform === "instagram" && <InstagramIcon />}
              </div>
              <p className="text-sm text-gray-600 truncate">
                {convo.messages[convo.messages.length - 1]?.content || "..."}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Center Panel */}
      <div className="w-full md:flex-1 md:w-1/2 flex flex-col min-w-0">
        {selectedConversation ? (
          <>
            <div className="flex justify-between p-3 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-xl font-bold">
                {selectedConversation.customers?.full_name}
              </h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Créer une commande
              </button>
            </div>

            {/* zone des messages (DOIT scroller) */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-100">
              {selectedConversation.messages
                .slice() // clone avant sort si nécessaire
                .sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at))
                .map((msg) => (
                  <div key={msg.id} className="flex">
                    <div
                      className={`p-3 rounded-lg max-w-lg break-words whitespace-pre-wrap ${
                        msg.sender_type === "vendeur"
                          ? "bg-blue-500 text-white ml-auto"
                          : "bg-white"
                      }`}
                    >
                      {/* break-words + whitespace-pre-wrap évitent overflow horizontal */}
                      <p className="break-words whitespace-pre-wrap">
                        {msg.content}
                      </p>
                      <p className="text-xs opacity-75 mt-1 text-right">
                        {format(new Date(msg.sent_at), "p", { locale: fr })}
                      </p>
                    </div>
                  </div>
                ))}
            </div>

            <div className="p-4 border-t bg-white flex-shrink-0">
              <input
                type="text"
                placeholder="Écrire une réponse..."
                className="w-full p-2 border rounded-md"
                disabled
              />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <p className="text-gray-500">Sélectionnez une conversation</p>
          </div>
        )}
      </div>

      {/* Right Panel */}
      <aside className="hidden md:flex md:w-1/4 flex-shrink-0 min-w-0">
        <div className="h-full w-full overflow-y-auto">
          <ContextPanel
            conversation={selectedConversation}
            customerDetails={customerDetails}
            isLoading={isContextLoading}
          />
        </div>
      </aside>

      {/* Modale */}
      {selectedConversation && selectedConversation.customers && (
        <CreateOrderModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          customer={{
            id: selectedConversation.customers.platform_customer_id,
            name: selectedConversation.customers.full_name,
          }}
          products={products}
        />
      )}
    </div>
  );
}
