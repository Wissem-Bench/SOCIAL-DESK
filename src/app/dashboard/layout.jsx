import { getSupabaseWithUser } from "@/app/lib/supabase/server-utils";
import { UserProvider } from "@/app/hooks/use-user";
import DashboardLayoutClient from "./DashboardLayoutClient";
import ConnectMetaCard from "@/app/components/ui/meta/ConnectMetaCard";
import { checkMetaConnection } from "@/app/lib/actions/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }) {
  // We get the user ONCE here, in the highest server component.
  const { user } = await getSupabaseWithUser();

  if (!user) {
    // If no user, we can handle the redirect logic here or in middleware.
    // For now, let's assume middleware handles it.
  }

  const hasMetaConnection = await checkMetaConnection();
  if (hasMetaConnection === 0) {
    return <ConnectMetaCard />;
  }

  return (
    // We wrap the entire client-side layout with our UserProvider
    <UserProvider user={user}>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </UserProvider>
  );
}
