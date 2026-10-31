"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { CheckBox, Field, PasswordField, SubmitButton } from "./fields";
import Spinner from "@/components/Spinner";

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirmPassword") ?? "");
    const accepted = form.get("terms") === "on";

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi password tidak sama.");
      return;
    }
    if (!accepted) {
      setError("Kamu harus menyetujui Terms & conditions dan privacy policy.");
      return;
    }

    setPending(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setPending(false);
      setError(data?.error ?? "Pendaftaran gagal. Coba lagi.");
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setPending(false);

    if (result?.error) {
      setError("Akun dibuat, tapi gagal masuk. Silakan masuk.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form className="mt-[35px]" onSubmit={handleSubmit}>
      <Field
        type="email"
        name="email"
        placeholder="Email address"
        autoComplete="email"
        required
      />
      <div className="mt-[25px]">
        <PasswordField
          name="password"
          placeholder="Password"
          autoComplete="new-password"
          required
        />
      </div>

      <div className="mt-[21px] h-[9px] w-full rounded-full bg-[#dce0e4]" />

      <div className="mt-[9px] flex items-center justify-between">
        <span className="text-[15px] text-[#606261]">
          Write your password.....
        </span>
        <InfoIcon />
      </div>

      <div className="mt-[33px]">
        <Field
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          autoComplete="new-password"
          required
        />
      </div>

      <div className="mt-[36px]">
        <CheckBox
          label="I agree to all Terms & conditions and the privacy policy."
          name="terms"
        />
      </div>

      <div className="mt-[33px]">
        <SubmitButton disabled={pending}>
          {pending ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner size={18} /> Create an account
            </span>
          ) : (
            "Create an account"
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

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#606261"
      strokeWidth="1.5"
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-4" strokeLinecap="round" />
      <path d="M12 8h.01" strokeLinecap="round" />
    </svg>
  );
}
