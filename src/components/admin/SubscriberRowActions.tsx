"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleSubscriber, deleteSubscriber } from "@/app/admin/newsletter/actions";

export default function SubscriberRowActions({
  subscriberId,
  email,
  isActive,
}: {
  subscriberId: string;
  email: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function run(fn: () => Promise<{ ok: boolean; message: string }>) {
    startTransition(async () => {
      const res = await fn();
      setMessage(res.message);
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => toggleSubscriber(subscriberId))}
          className="inline-flex min-h-8 items-center rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700"
        >
          {isActive ? "Nonaktifkan" : "Aktifkan"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (!confirm(`Hapus pelanggan ${email}?`)) return;
            run(() => deleteSubscriber(subscriberId));
          }}
          className="inline-flex min-h-8 items-center rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600"
        >
          Hapus
        </button>
      </div>
      {message ? <p className="text-xs text-neutral-600">{message}</p> : null}
    </div>
  );
}
