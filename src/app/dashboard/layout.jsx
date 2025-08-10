export const dynamic = "force-dynamic";
import DashboardLayoutClient from "./DashboardLayoutClient";
import { checkMetaConnection } from "@/app/lib/actions/dashboard";
import ConnectMetaCard from "@/app/meta/ConnectMetaCard";

// a Server Component that simply wraps our main interactive client component.
export default async function DashboardLayout({ children }) {
  const count = await checkMetaConnection();
  if (count === 0) {
    return <ConnectMetaCard />;
  }
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
