import { Suspense } from "react";
import { connection } from "next/server";
import { requireUser } from "@/lib/library";
import ProfileForms from "@/components/account/ProfileForms";
import PageLoader from "@/components/PageLoader";

export const metadata = {
  title: "Profil — Arsip Pitaloka",
};

export default function AccountProfilePage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AccountProfilePageContent />
    </Suspense>
  );
}

async function AccountProfilePageContent() {
  await connection();

  const user = await requireUser();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold text-black">Profil</h1>
        <p className="text-sm text-neutral-500">
          Akun <span className="font-medium text-neutral-700">{user.email}</span>{" "}
          dengan role {user.role}.
        </p>
      </header>

      <ProfileForms name={user.name} />
    </div>
  );
}
