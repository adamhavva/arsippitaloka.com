"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateUserRole,
  resetUserPassword,
  deleteUser,
  toggleUserActive,
} from "@/app/admin/users/actions";

type Props = {
  userId: string;
  name: string;
  role: "ADMIN" | "CUSTOMER";
  isActive: boolean;
};

export default function UserRowActions({ userId, name, role, isActive }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function run(fn: () => Promise<{ ok: boolean; message: string }>) {
    startTransition(async () => {
      const res = await fn();
      setMessage(res.ok ? res.message : res.message);
      if (res.ok) {
        setPassword("");
        setConfirmPassword("");
        setShowPassword(false);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <select
          defaultValue={role}
          disabled={pending}
          onChange={(e) => {
            const next = e.target.value;
            startTransition(async () => {
              const res = await updateUserRole(userId, next);
              setMessage(res.message);
              if (res.ok) router.refresh();
            });
          }}
          className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-xs"
        >
          <option value="CUSTOMER">CUSTOMER</option>
          <option value="ADMIN">ADMIN</option>
        </select>

        <button
          type="button"
          disabled={pending}
          onClick={() => setShowPassword((v) => !v)}
          className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700"
        >
          Reset password
        </button>

        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => toggleUserActive(userId))}
          className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700"
        >
          {isActive ? "Nonaktifkan" : "Aktifkan"}
        </button>

        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (!confirm(`Hapus user ${name}?`)) return;
            run(() => deleteUser(userId));
          }}
          className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600"
        >
          Hapus
        </button>
      </div>

      {showPassword ? (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password baru"
            className="rounded-lg border border-neutral-300 px-2 py-1"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ulangi password"
            className="rounded-lg border border-neutral-300 px-2 py-1"
          />
          <button
            type="button"
            disabled={pending || password !== confirmPassword || password.length < 8}
            onClick={() => run(() => resetUserPassword(userId, password))}
            className="rounded-full bg-maroon-dark px-3 py-1 font-medium text-white disabled:opacity-50"
          >
            Simpan
          </button>
        </div>
      ) : null}

      {message ? <p className="text-xs text-neutral-600">{message}</p> : null}
    </div>
  );
}
