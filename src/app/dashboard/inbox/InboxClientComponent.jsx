"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getCustomerDetailsForInbox } from "@/app/lib/actions/customers";
import { getConversationsFromDB } from "@/app/lib/actions/conversations";
import DraggableOrderPopup from "./DraggableOrderPopup";
import ContextPanel from "./ContextPanel";
import InboxToolbar from "./InboxToolbar";
import { sendMessage } from "@/app/lib/actions/messages";
import SubmitButton from "@/app/components/ui/SubmitButton";

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

export default function InboxClientComponent({ products }) {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({
    platform: "all",
    status: "all",
    orderStatus: "all",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for the right context panel
  const [customerDetails, setCustomerDetails] = useState(null);
  const [isContextLoading, setIsContextLoading] = useState(false);

  // --- State for the reply input ---
  const [replyText, setReplyText] = useState("");

  const formRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // --- Handler for sending a message ---
  const handleSendMessage = async (formData) => {
    const messageText = formData.get("messageText");
    const conversationId = formData.get("conversationId");
    if (!replyText.trim() || !conversationId) return;

    // --- Optimistic UI Update ---
    const tempId = `temp_${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      content: messageText,
      sent_at: new Date().toISOString(),
      sender_type: "vendeur",
    };

    // Find the right conversation and update its messages array
    const newConversations = conversations.map((convo) => {
      if (convo.id === conversationId) {
        return { ...convo, messages: [...convo.messages, optimisticMessage] };
      }
      return convo;
    });

    setConversations(newConversations);
    setSelectedConversation(
      newConversations.find((c) => c.id === conversationId)
    );
    setReplyText("");

    // --- Call Server Action in the background ---
    const result = await sendMessage(formData);

    if (result.error) {
      alert(`Erreur d'envoi: ${result.error}`);
      // On failure, revert the optimistic update
      const revertedConversations = conversations.map((convo) => {
        if (convo.id === conversationId) {
          return {
            ...convo,
            messages: convo.messages.filter((msg) => msg.id !== tempId),
          };
        }
        return convo;
      });
      setConversations(revertedConversations);
      setSelectedConversation(
        revertedConversations.find((c) => c.id === conversationId)
      );
      setReplyText(messageText); // Put text back for retry
    } else {
      setReplyText("");
    }
  };

  // This useEffect fetches data whenever the filters change
  useEffect(() => {
    const loadConversations = async () => {
      setIsLoading(true);
      const { conversations: fetchedConvos, error } =
        await getConversationsFromDB(filters);
      if (!error) {
        setConversations(fetchedConvos);
        // If there's a selected convo, find it in the new list or select the first one
        const currentSelected = fetchedConvos.find(
          (c) => c.id === selectedConversation?.id
        );
        setSelectedConversation(currentSelected || fetchedConvos[0] || null);
      }
      setIsLoading(false);
    };
    loadConversations();
  }, [filters]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery) {
      return conversations; // Return all conversations if search is empty
    }
    const filtered = conversations.filter((convo) => {
      const name = convo.customers?.full_name || convo.prospect_name || "";
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    });
    if (!filtered.length) {
      setSelectedConversation(null);
    }
    return filtered;
  }, [conversations, searchQuery]);

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

  const sortedMessages = useMemo(() => {
    if (!selectedConversation?.messages) return [];
    // Le useMemo est une bonne idée si le tri est coûteux, mais pas obligatoire ici
    return [...selectedConversation.messages].sort(
      (a, b) => new Date(a.sent_at) - new Date(b.sent_at)
    );
  }, [selectedConversation]);

  // 3. L'effet pour scroller automatiquement vers le bas
  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      // On met la position de défilement égale à la hauteur totale du contenu
      container.scrollTop = container.scrollHeight;
    }
    // Cet effet se déclenche chaque fois que la liste des messages change
  }, [sortedMessages]);

  const handleOrderCreated = async () => {
    if (!selectedConversation?.customer_id) return;

    // When an order is created, we just refetch the data for the context panel
    setIsContextLoading(true);
    const result = await getCustomerDetailsForInbox(
      selectedConversation.customer_id
    );
    if (!result.error) {
      setCustomerDetails(result.customer);
    }
    setIsContextLoading(false);
  };

  return (
    <div className="flex flex-col h-screen" style={{ maxHeight: "84vh" }}>
      <header className="flex-shrink-0">
        <h1 className="text-2xl font-bold p-4 bg-white border-b">
          Boîte de Réception
        </h1>
      </header>
      <InboxToolbar
        filters={filters}
        onFilterChange={setFilters}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      {/* This container will grow to fill the remaining space and holds our 3 panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Conversation List */}
        <div className="w-full md:w-1/4 border-r border-gray-200 flex flex-col">
          {/* This inner div will scroll if its content overflows */}
          <div className="overflow-y-auto">
            {filteredConversations && filteredConversations.length > 0 ? (
              filteredConversations.map((convo) => (
                <div
                  key={convo.id}
                  onClick={() => setSelectedConversation(convo)}
                  className={`p-4 cursor-pointer border-l-4 ${
                    selectedConversation?.id === convo.id
                      ? "border-indigo-500 bg-gray-200"
                      : "border-transparent hover:bg-gray-100"
                  } flex justify-between items-center`}
                >
                  <div className="flex-1 overflow-hidden">
                    <p className="font-semibold truncate">
                      {convo.customers?.full_name ||
                        convo.prospect_name ||
                        "Prospect inconnu"}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {convo.messages[convo.messages.length - 1]?.content ||
                        "..."}
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    {convo.platform === "facebook" && <FacebookIcon />}
                    {convo.platform === "instagram" && <InstagramIcon />}
                  </div>
                </div>
              ))
            ) : (
              <p className="p-4 text-gray-500">Aucune conversation.</p>
            )}
          </div>
        </div>

        {/* Center Panel */}
        <div className="w-full md:flex-1 md:w-1/2 flex flex-col min-w-0">
          {selectedConversation ? (
            <>
              <div className="flex justify-between p-4 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-xl font-bold">
                  {selectedConversation.customers?.full_name ||
                    selectedConversation.prospect_name}
                </h2>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Créer une commande
                </button>
              </div>

              {/* messages zone */}
              <div
                ref={messagesContainerRef}
                className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-100"
              >
                {sortedMessages.map((msg) => (
                  <div key={msg.id} className="flex">
                    <div
                      className={`p-3 rounded-lg max-w-lg break-words whitespace-pre-wrap ${
                        msg.sender_type === "vendeur"
                          ? "bg-indigo-500 text-white ml-auto"
                          : "bg-white"
                      }`}
                    >
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
                <form
                  ref={formRef}
                  action={handleSendMessage}
                  className="flex gap-2"
                >
                  <input
                    type="hidden"
                    name="conversationId"
                    value={selectedConversation.id}
                  />
                  <input
                    type="text"
                    name="messageText"
                    placeholder="Écrire une réponse..."
                    className="flex-1 p-2 border rounded-md"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    autoComplete="off"
                  />
                  <SubmitButton
                    pendingText="Envoi..."
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
                  >
                    Envoyer
                  </SubmitButton>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <p className="text-gray-500">Sélectionnez une conversation</p>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="hidden md:block md:w-1/4">
          {/* This div will scroll if its content overflows */}
          <div className="h-full overflow-y-auto">
            <ContextPanel
              conversation={selectedConversation}
              customerDetails={customerDetails}
              isLoading={isContextLoading}
            />
          </div>
        </div>
      </div>

      {/* Draggable Order Popup */}
      {isModalOpen && selectedConversation && (
        <>
          {/* The new overlay div */}
          <div className="fixed inset-0 bg-black bg-opacity-40 z-40" />

          <DraggableOrderPopup
            onClose={() => setIsModalOpen(false)}
            onOrderCreated={handleOrderCreated}
            customer={{
              id:
                selectedConversation.customer_id ||
                selectedConversation.platform_conversation_id,
              name:
                selectedConversation.customers?.full_name ||
                selectedConversation.prospect_name,
            }}
            products={products}
          />
        </>
      )}
    </div>
  );
}
