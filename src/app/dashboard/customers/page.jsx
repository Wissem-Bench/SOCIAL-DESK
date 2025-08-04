import { getCustomers } from "@/app/lib/actions/customers";
import CustomerList from "./CustomerList";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  // Fetch the initial list of customers
  const { customers, error } = await getCustomers();

  if (error) {
    return <p className="p-8 text-red-500">{error}</p>;
  }

  return (
    <div className="p-4 md:p-8">
      {/* The server component's only job is to fetch initial data 
        and pass it to the interactive client component.
      */}
      <CustomerList initialCustomers={customers} />
    </div>
  );
}
