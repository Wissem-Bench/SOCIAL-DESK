import CustomerList from "./CustomerList";

export default async function CustomersPage() {
  return (
    <div className="p-4 md:p-8">
      <CustomerList initialCustomers={[]} />
    </div>
  );
}
