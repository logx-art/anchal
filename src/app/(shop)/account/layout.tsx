import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { AccountSidebar } from "@/components/account/AccountSidebar";

// Every /account/** page requires a signed-in user. Checked here, once,
// server-side — not left to each page to remember.
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (!user) redirect("/login?callbackUrl=/account");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-12">
      <div className="flex flex-col gap-8 md:flex-row">
        <AccountSidebar />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
