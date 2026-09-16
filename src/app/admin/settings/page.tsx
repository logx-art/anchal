import { redirect } from "next/navigation";
import { hash as argon2Hash, verify as argon2Verify } from "@node-rs/argon2";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function changePassword(formData: FormData) {
  "use server";
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");

  const user = await prisma.user.findUnique({ where: { id: admin.id } });
  if (!user?.passwordHash) throw new Error("Account not found.");

  const valid = await argon2Verify(user.passwordHash, currentPassword);
  if (!valid) throw new Error("Current password is incorrect.");

  const newHash = await argon2Hash(newPassword);
  await prisma.user.update({ where: { id: admin.id }, data: { passwordHash: newHash } });
}

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="mb-1 font-serif text-2xl text-charcoal">Store Settings</h1>
        <p className="text-sm text-charcoal/60">Account and store configuration.</p>
      </div>

      <section className="max-w-md rounded-card border border-beige p-4">
        <p className="mb-3 font-medium text-charcoal">Your Account</p>
        <dl className="grid grid-cols-2 gap-y-1 text-sm">
          <dt className="text-charcoal/60">Name</dt>
          <dd className="text-charcoal">{admin.name}</dd>
          <dt className="text-charcoal/60">Email</dt>
          <dd className="text-charcoal">{admin.email}</dd>
          <dt className="text-charcoal/60">Role</dt>
          <dd className="text-charcoal">{admin.role}</dd>
        </dl>
      </section>

      <section className="max-w-md rounded-card border border-beige p-4">
        <p className="mb-3 font-medium text-charcoal">Change Password</p>
        <form action={changePassword} className="flex flex-col gap-3">
          <input
            type="password"
            name="currentPassword"
            placeholder="Current password"
            required
            className="rounded-card border border-beige bg-cream px-3 py-2 text-sm"
          />
          <input
            type="password"
            name="newPassword"
            placeholder="New password"
            required
            minLength={8}
            className="rounded-card border border-beige bg-cream px-3 py-2 text-sm"
          />
          <button type="submit" className="w-fit rounded-card bg-maroon px-4 py-2 text-sm text-cream">
            Update Password
          </button>
        </form>
      </section>

      <section className="max-w-md rounded-card border border-beige p-4">
        <p className="mb-3 font-medium text-charcoal">Store Configuration</p>
        <p className="text-sm text-charcoal/60">
          Payment gateway, image storage, and email settings are configured via environment variables for
          security — see <code className="rounded bg-beige px-1">.env.example</code> in the project root and
          the README&apos;s setup section.
        </p>
      </section>
    </div>
  );
}
