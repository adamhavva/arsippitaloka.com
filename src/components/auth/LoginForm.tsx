"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { sanitizeCallbackUrl } from "@/lib/callback-url";
import { AMBER, CheckBox, Field, PasswordField, SubmitButton } from "./fields";
import Spinner from "@/components/Spinner";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [callbackUrl, setCallbackUrl] = useState<string | null>(null);

  // `callbackUrl` dibaca di client, bukan lewat `searchParams` server-side:
  //-awaiting `searchParams` di page membuat route tidak bisa di-prerender
  // (cacheComponents), dan `useSearchParams` butuh <Suspense> yang akan
  // membuat form hanya ter-render di client.
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("callbackUrl");
    const safe = sanitizeCallbackUrl(raw);
    // Kalau tidak ada callbackUrl eksplisit, pembeli diarahkan ke pustakanya
    // (/akun) dan admin ke dashboard — bukan ke beranda.
    setCallbackUrl(safe === "/" ? null : safe);
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setPending(false);

    if (result?.error) {
      setError("Email atau password salah.");
      return;
    }

    let target = callbackUrl;

    if (!target) {
      const session = await getSession();
      target = session?.user?.role === "ADMIN" ? "/admin" : "/akun";
    }

    router.push(target ?? "/");
    router.refresh();
  }

  return (
    <form className="mt-[39px] sm:mt-10" onSubmit={handleSubmit}>
      <Field
        type="email"
        name="email"
        placeholder="Email address"
        autoComplete="email"
        required
        inputClassName="py-3 text-sm active:bg-white focus:ring-maroon"
      />
      <div className="mt-[24px]">
        <PasswordField
          name="password"
          placeholder="Password"
          autoComplete="current-password"
          required
          inputClassName="py-3 text-sm active:bg-white focus:ring-maroon"
        />
      </div>

      <div className="mt-[29px] flex items-center justify-between">
        {/* "Remember me" sudah ada di desain; durasi session per-device
            belum dibedakan (rencana auth A17 — minor). */}
        <CheckBox label="Remember me" name="remember" defaultChecked />
        <Link
          href="/forgot-password"
          className="inline-flex min-h-9 items-center text-[15px]"
          style={{ color: AMBER }}
        >
          Fotget password
        </Link>
      </div>

      <div className="mt-[20px]">
        <SubmitButton disabled={pending}>
          {pending ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner size={18} /> Login
            </span>
          ) : (
            "Login"
          )}
        </SubmitButton>
      </div>

      {error ? (
        <p className="mt-[12px] text-center text-[14px] text-[#c0392b]">
          {error}
        </p>
      ) : null}
    </form>
  );
}
