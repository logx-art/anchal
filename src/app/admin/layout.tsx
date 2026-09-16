import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { MobileAdminNav } from "@/components/admin/MobileAdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  if (!admin) redirect("/login?callbackUrl=/admin");

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <MobileAdminNav />
      <div className="hidden w-56 shrink-0 md:block">
        <div className="sticky top-0 h-screen">
          <AdminSidebar />
        </div>
      </div>
      <main className="flex-1 overflow-x-hidden bg-cream p-4 md:p-8">{children}</main>
    </div>
  );
}
