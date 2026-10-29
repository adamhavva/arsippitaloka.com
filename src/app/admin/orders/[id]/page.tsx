import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import OrderStatusControl from "@/components/admin/OrderStatusControl";

export const metadata = {
  title: "Detail Order — Admin",
};

function rupiah(value: unknown): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<p className="text-sm text-neutral-500">Memuat…</p>}>
      <AdminOrderDetailPageContent params={params} />
    </Suspense>
  );
}

async function AdminOrderDetailPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const admin = await requireAdmin();
  if (!admin) notFound();

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      items: {
        include: {
          book: { select: { id: true, title: true, slug: true } },
        },
      },
    },
  });
  if (!order) notFound();

  const dateFmt = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const subtotal = order.items.reduce(
    (sum, item) => sum + Number(item.priceUsd) * item.qty,
    0,
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold text-black">
          Order #{order.id.slice(-8)}
        </h1>
        <p className="text-sm text-neutral-500">
          Dibuat {dateFmt.format(order.createdAt)}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-xs uppercase tracking-wide text-neutral-500">
            Pembeli
          </h2>
          <p className="mt-1 font-medium text-black">{order.user.name}</p>
          <p className="text-sm text-neutral-600">{order.user.email}</p>
          {order.deliveryAddress ? (
            <p className="mt-2 whitespace-pre-line text-sm text-neutral-600">
              {order.deliveryAddress}
            </p>
          ) : null}
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-xs uppercase tracking-wide text-neutral-500">
            Pembayaran
          </h2>
          <p className="mt-1 text-sm text-neutral-700">
            Metode: {order.paymentMethod ?? "—"}
          </p>
          <p className="text-sm text-neutral-700">
            Provider: {order.paymentProvider ?? "—"}
          </p>
          <p className="text-sm text-neutral-700">
            Ref: {order.paymentRef ?? "—"}
          </p>
          <p className="text-sm text-neutral-700">
            Dibayar: {order.paidAt ? dateFmt.format(order.paidAt) : "—"}
          </p>
          <p className="text-sm text-neutral-700">
            Pengiriman: {order.deliveryMethod}
          </p>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="text-xs uppercase tracking-wide text-neutral-500">
            Status
          </h2>
          <p className="mt-1 text-sm text-neutral-700">
            Status: {order.status}
          </p>
          <div className="mt-2">
            <OrderStatusControl orderId={order.id} status={order.status} />
          </div>
        </section>
      </div>

      <section className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Buku</th>
              <th className="px-4 py-3 font-medium">Qty</th>
              <th className="px-4 py-3 font-medium">Harga (USD)</th>
              <th className="px-4 py-3 font-medium">Subtotal (USD)</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-neutral-100 last:border-0"
              >
                <td className="px-4 py-3 text-neutral-800">{item.title}</td>
                <td className="px-4 py-3 text-neutral-600">{item.qty}</td>
                <td className="px-4 py-3 text-neutral-600">
                  ${String(item.priceUsd)}
                </td>
                <td className="px-4 py-3 text-neutral-800">
                  ${(Number(item.priceUsd) * item.qty).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-black">Ringkasan</h2>
        <dl className="mt-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-600">Subtotal item (USD)</dt>
            <dd className="text-neutral-800">${subtotal.toFixed(2)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-600">Kurs USD → IDR</dt>
            <dd className="text-neutral-800">{String(order.usdToIdrRate)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-600">Pajak ({order.taxType ?? "—"})</dt>
            <dd className="text-neutral-800">{rupiah(order.taxAmount)}</dd>
          </div>
          <div className="flex justify-between border-t border-neutral-200 pt-1 font-semibold">
            <dt>Total</dt>
            <dd>{rupiah(order.total)}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
