import { checkMetaConnection } from "@/app/lib/actions/dashboard";
import QueryProvider from "@/app/components/providers/QueryProvider";
import DashboardLayoutClient from "./DashboardLayoutClient";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }) {
  // const hasMetaConnection = await checkMetaConnection();
  // if (hasMetaConnection === 0) {
  //   return <ConnectMetaCard />;
  // }

  return (
    <QueryProvider>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </QueryProvider>
  );
}
