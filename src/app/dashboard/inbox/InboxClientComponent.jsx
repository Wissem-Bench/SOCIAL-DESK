"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import CreateOrderModal from "./CreateOrderModal";

export default function InboxClientComponent({
  conversations,
  products,
  error,
}) {
  // the selected conversation is stored in a state
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // by default, the first conversation is selected when loading.
  useEffect(() => {
    if (conversations && conversations.length > 0) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations]);

  if (error) {
    return <p className="p-8 text-red-500 text-center">{error}</p>;
  }

  if (!conversations || conversations.length === 0) {
    return (
      <p className="p-8 text-gray-500 text-center">
        Aucune conversation à afficher.
      </p>
    );
  }

  const getParticipant = (participants) => {
    return participants.data.find((p) => p.email !== "page_email@example.com"); // Logique à affiner
  };

  // We are looking for the name of the participant who is not us (the page)
  const getParticipantName = (participants) => {
    // Note : the logic for identifying "us" vs. "the other" may need to be refined
    return participants.data[0]?.name || "Utilisateur inconnu";
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left column: List of conversations */}
      <div className="w-1/3 border-r border-gray-200 bg-white overflow-y-auto">
        {conversations.map((convo) => (
          <div
            key={convo.id}
            onClick={() => setSelectedConversation(convo)}
            className={`p-4 cursor-pointer hover:bg-gray-50 ${
              selectedConversation?.id === convo.id
                ? "bg-blue-50 border-r-2 border-blue-500"
                : ""
            }`}
          >
            <p className="font-semibold">
              {getParticipantName(convo.participants)}
            </p>
            <p className="text-sm text-gray-600 truncate">
              {convo.messages?.data[0]?.message || "..."}
            </p>
          </div>
        ))}
      </div>

      {/* Right column: Messages from the selected conversation */}
      <div className="w-2/3 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {getParticipant(selectedConversation.participants)?.name}
              </h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 text-sm text-white bg-green-500 rounded hover:bg-green-600"
              >
                Créer une commande
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {selectedConversation.messages?.data
                .slice()
                .reverse()
                .map((msg) => (
                  <div key={msg.id} className="flex">
                    <div
                      className={`p-3 rounded-lg max-w-lg ${
                        msg.from.name !==
                        getParticipantName(selectedConversation.participants)
                          ? "bg-blue-500 text-white ml-auto"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      <p>{msg.message}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {format(new Date(msg.created_time), "p", {
                          locale: fr,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">
              Sélectionnez une conversation pour voir les messages.
            </p>
          </div>
        )}
      </div>
      {selectedConversation && (
        <CreateOrderModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          customer={getParticipant(selectedConversation.participants)}
          products={products}
        />
      )}
    </div>
  );
}
