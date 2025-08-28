import NextTopLoader from "nextjs-toploader";
import { checkMetaConnection } from "@/app/lib/actions/dashboard";
import { getAuthenticatedUserProfile } from "../lib/actions/profiles";
import QueryProvider from "@/app/components/providers/QueryProvider";
import DashboardLayoutClient from "./DashboardLayoutClient";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }) {
  const userProfile = await getAuthenticatedUserProfile();

  // const hasMetaConnection = await checkMetaConnection();
  // if (hasMetaConnection === 0) {
  //   return <ConnectMetaCard />;
  // }

  return (
    <QueryProvider>
      <DashboardLayoutClient user={userProfile}>
        <NextTopLoader
          color="#4F46E5"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false} // Disable the default spinner
          easing="ease"
          speed={200}
        />
        {children}
      </DashboardLayoutClient>
    </QueryProvider>
  );
}
