"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteEntity } from "@/lib/admin/actions";

export default function ConfirmButton({
  entityKey,
  id,
  label = "Hapus",
}: {
  entityKey: string;
  id: string;
  label?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm("Yakin dihapus?")) return;
          startTransition(async () => {
            const res = await deleteEntity(entityKey, id);
            if (!res.ok) setMessage(res.message);
            else router.refresh();
          });
        }}
        className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600 disabled:opacity-50"
      >
        {pending ? "…" : label}
      </button>
      {message ? <span className="text-xs text-red-600">{message}</span> : null}
    </span>
  );
}
