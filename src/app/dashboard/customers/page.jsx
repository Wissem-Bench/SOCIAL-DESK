import { getCustomers } from "@/app/lib/actions/customers";
import Link from "next/link";

export default async function CustomersPage() {
  let customers;
  let error;
  try {
    const result = await getCustomers();
    customers = result.customers;
    error = result.error;
    if (!customers) {
      throw new Error("Aucun client trouvé.");
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des clients:", error);
    return { error: "Impossible de charger les clients." };
  }

  if (error) {
    return <p className="p-8 text-red-500">{error}</p>;
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Mes Clients</h1>
      <div className="bg-white shadow rounded-lg">
        <div className="divide-y divide-gray-200">
          {customers && customers.length > 0 ? (
            customers.map((customer) => (
              <Link
                key={customer.id}
                href={`/dashboard/customers/${customer.id}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-lg text-blue-600">
                      {customer.full_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {customer.phone_number || "Pas de numéro"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {customer.address || "Pas d'adresse"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-400 capitalize">
                      via {customer.platform}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="p-4 text-gray-500">
              Vous n'avez encore aucun client.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
