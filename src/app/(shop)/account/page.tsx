import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const sessionUser = await requireUser();
  const user = await prisma.user.findUnique({ where: { id: sessionUser!.id } });
  if (!user) return null;

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl text-charcoal">Profile</h1>
      <dl className="flex max-w-md flex-col gap-4 rounded-card bg-beige/30 p-5 text-sm">
        <Field label="Name" value={user.name} />
        <Field label="Email" value={user.email} />
        <Field label="Phone" value={user.phone ?? "Not added"} />
        <Field label="Member since" value={user.createdAt.toLocaleDateString("en-IN", { year: "numeric", month: "long" })} />
      </dl>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-beige pb-3 last:border-0 last:pb-0">
      <dt className="text-charcoal/60">{label}</dt>
      <dd className="font-medium text-charcoal">{value}</dd>
    </div>
  );
}
