import DashboardLayoutClient from "./DashboardLayoutClient";

// a Server Component that simply wraps our main interactive client component.
export default function DashboardLayout({ children }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
