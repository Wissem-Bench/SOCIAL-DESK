import { redirect } from "next/navigation";
import { getSupabaseWithUser } from "@/app/lib/supabase/server-utils";
import QueryProvider from "@/app/components/providers/QueryProvider";
import { UserProvider } from "@/app/hooks/use-user";
import DashboardLayoutClient from "./DashboardLayoutClient";
import ConnectMetaCard from "@/app/components/ui/meta/ConnectMetaCard";
import { checkMetaConnection } from "@/app/lib/actions/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }) {
  // We get the user ONCE here, in the highest server component.
  const { user } = await getSupabaseWithUser();

  if (!user) {
    redirect("/login");
  }

  const hasMetaConnection = await checkMetaConnection();
  if (hasMetaConnection === 0) {
    return <ConnectMetaCard />;
  }

  return (
    <QueryProvider>
      <UserProvider user={user}>
        <DashboardLayoutClient>{children}</DashboardLayoutClient>
      </UserProvider>
    </QueryProvider>
  );
}
