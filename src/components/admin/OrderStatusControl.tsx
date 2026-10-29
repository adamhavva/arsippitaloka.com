"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/app/admin/orders/actions";

export default function OrderStatusControl({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        defaultValue={status}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value;
          startTransition(async () => {
            const res = await updateOrderStatus(orderId, next);
            setMessage(res.message);
            if (res.ok) router.refresh();
          });
        }}
        className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm"
      >
        <option value="PENDING">PENDING</option>
        <option value="PAID">PAID</option>
        <option value="SHIPPED">SHIPPED</option>
        <option value="COMPLETED">COMPLETED</option>
        <option value="CANCELLED">CANCELLED</option>
      </select>
      {pending ? <span className="text-xs text-neutral-500">Menyimpan…</span> : null}
      {message ? <span className="text-xs text-neutral-600">{message}</span> : null}
    </div>
  );
}
