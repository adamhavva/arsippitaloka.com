"use client";

import { useState } from "react";
import Link from "next/link";
import { Field, PasswordField, SubmitButton } from "./fields";
import Spinner from "@/components/Spinner";

/**
 * Reset password dengan kode OTP.
 *
 * Tahap 1 — input email → server mengirim kode OTP 6 angka (berlaku 5 menit).
 * Tahap 2 — input kode OTP + password baru → server memverifikasi kode,
 *            lalu mengganti password.
 */
export default function ForgotPasswordForm() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function requestCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setInfo(null);

    const value = email.trim();
    if (!value) {
      setError("Email wajib diisi.");
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const data = (await response.json().catch(() => null)) as {
        message?: string;
        error?: string;
        expiresInMinutes?: number;
      } | null;

      if (!response.ok) {
        setError(data?.error ?? "Gagal mengirim kode OTP. Coba lagi nanti.");
        return;
      }

      setInfo(
        data?.message ??
          `Kode OTP sudah dikirim. Berlaku ${
            data?.expiresInMinutes ?? 5
          } menit.`,
      );
      setStep("otp");
    } catch {
      setError("Tidak bisa terhubung. Coba lagi nanti.");
    } finally {
      setPending(false);
    }
  }

  async function resetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const code = String(form.get("code") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirmPassword") ?? "");

    if (!/^\d{6}$/.test(code)) {
      setError("Kode OTP harus 6 angka.");
      return;
    }
    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password }),
      });
      const data = (await response.json().catch(() => null)) as {
        message?: string;
        error?: string;
      } | null;

      if (!response.ok) {
        setError(data?.error ?? "Gagal mengganti password. Coba lagi.");
        return;
      }

      setDone(true);
    } catch {
      setError("Tidak bisa terhubung. Coba lagi nanti.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="mt-[28px]">
        <p className="rounded-lg bg-[#eef7ef] px-4 py-3 text-[15px] text-[#245c2b]">
          Password berhasil diperbarui. Silakan masuk dengan password baru.
        </p>
        <div className="mt-[20px]">
          <Link
            href="/login"
            className="block w-full text-center text-[15px] font-medium text-[#202124] underline"
          >
            &larr; Back to login
          </Link>
        </div>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <form className="mt-[28px]" onSubmit={resetPassword}>
        {info ? (
          <p className="mb-[18px] rounded-lg bg-[#f4f6fa] px-4 py-3 text-[14px] text-[#40465a]">
            {info} Masukkan kode yang diterima di email{" "}
            <strong className="text-[#202124]">{email}</strong>.
          </p>
        ) : null}

        <Field
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="6-digit OTP code"
          required
        />

        <div className="mt-[16px]">
          <PasswordField
            name="password"
            placeholder="New password"
            autoComplete="new-password"
            required
          />
        </div>

        <div className="mt-[16px]">
          <PasswordField
            name="confirmPassword"
            placeholder="Confirm password"
            autoComplete="new-password"
            required
          />
        </div>

        <div className="mt-[20px]">
          <SubmitButton disabled={pending}>
            {pending ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size={18} /> Saving…
              </span>
            ) : (
              "Reset&nbsp; password"
            )}
          </SubmitButton>
        </div>

        {error ? (
          <p className="mt-[12px] text-center text-[14px] text-[#c0392b]">
            {error}
          </p>
        ) : null}

        <div className="mt-[16px] text-center">
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setError(null);
            }}
            className="text-[14px] font-medium text-[#606261] underline"
          >
            Ganti email
          </button>
        </div>
      </form>
    );
  }

  return (
    <form className="mt-[28px]" onSubmit={requestCode}>
      <Field
        type="email"
        name="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email address"
        autoComplete="email"
        required
      />
      <div className="mt-[20px]">
        <SubmitButton disabled={pending}>
          {pending ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner size={18} /> Sending…
            </span>
          ) : (
            "Send OTP"
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
