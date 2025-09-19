import { checkMetaConnection } from "@/app/lib/actions/dashboard";
import { getAuthenticatedUserProfile } from "../lib/actions/profiles";
import ConnectMetaCard from "@/app/components/ui/meta/ConnectMetaCard";
import DashboardLayoutClient from "./DashboardLayoutClient";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }) {
  const userProfile = await getAuthenticatedUserProfile();

  const hasMetaConnection = await checkMetaConnection();
  if (hasMetaConnection === 0) {
    return <ConnectMetaCard />;
  }

  return (
    <DashboardLayoutClient user={userProfile}>{children}</DashboardLayoutClient>
  );
}
