import { requireUser } from "@/lib/auth";
import { getOrganizationContext } from "@/lib/context";
import { Sidebar } from "@/components/sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ user }, { memberships, current }] = await Promise.all([
    requireUser(),
    getOrganizationContext(),
  ]);
  return (
    <div className="app-shell">
      <Sidebar
        memberships={memberships}
        current={current}
        userEmail={user.email ?? "Minha conta"}
      />
      <main className="app-main" id="main">
        {children}
      </main>
    </div>
  );
}
