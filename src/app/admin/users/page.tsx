import { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import UserRowActions from "@/components/admin/UserRowActions";

export const metadata = {
  title: "User — Admin",
};

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<p className="text-sm text-neutral-500">Memuat…</p>}>
      <AdminUsersPageContent />
    </Suspense>
  );
}

async function AdminUsersPageContent() {
  await connection();

  const admin = await requireAdmin();
  if (!admin) return null;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      googleId: true,
      lastLoginAt: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });

  const dateFmt = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold text-black">User</h1>
        <p className="text-sm text-neutral-500">
          {users.length} akun terdaftar. Ubah role, reset password, atau
          nonaktifkan user.
        </p>
      </header>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Provider</th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Terakhir login</th>
              <th className="px-4 py-3 font-medium">Dibuat</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-3 text-neutral-800">{user.name}</td>
                <td className="px-4 py-3 text-neutral-600">{user.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      user.role === "ADMIN"
                        ? "bg-maroon/10 text-maroon"
                        : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {user.role}
                  </span>
                  {!user.isActive ? (
                    <span className="ml-2 rounded-full bg-red-100 px-2 py-1 text-xs text-red-700">
                      nonaktif
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {user.googleId ? "Google" : "Password"}
                </td>
                <td className="px-4 py-3 text-neutral-600">{user._count.orders}</td>
                <td className="px-4 py-3 text-neutral-600">
                  {user.lastLoginAt ? dateFmt.format(user.lastLoginAt) : "—"}
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {dateFmt.format(user.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <UserRowActions
                    userId={user.id}
                    name={user.name}
                    role={user.role}
                    isActive={user.isActive}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
