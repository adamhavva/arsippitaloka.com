import Image from "next/image";
import type { ComponentProps, ReactNode } from "react";

export const AMBER = "#ffee33";

export function LogoMark({ ring = false }: { ring?: boolean }) {
  return (
    <Image
      src={ring ? "/images/logo-mark-ring.png" : "/images/logo-mark.png"}
      alt="Pitaloka"
      width={112}
      height={112}
      className="h-[54px] w-auto"
    />
  );
}

export function Heading({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-[44px] font-bold leading-[1.05] tracking-[-0.02em] text-black">
      {children}
    </h1>
  );
}

export function SubText({ children }: { children: ReactNode }) {
  return <p className="text-[15px] text-[#606261]">{children}</p>;
}

export function Field(props: ComponentProps<"input">) {
  return (
    <input
      {...props}
      className="h-[51px] w-full rounded-lg border border-[#f1f2f5] px-5 text-[15px] text-black outline-none placeholder:text-[#b4b6ba] focus:border-[#d6d8dd]"
    />
  );
}

export function PasswordField(props: ComponentProps<"input">) {
  return (
    <div className="relative">
      <input
        {...props}
        type="password"
        className="h-[51px] w-full rounded-lg border border-[#f1f2f5] pl-5 pr-14 text-[15px] text-black outline-none placeholder:text-[#b4b6ba] focus:border-[#d6d8dd]"
      />
      <EyeOff className="absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#4b4d52]" />
    </div>
  );
}

export function SubmitButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="submit"
      className="h-[47px] w-full rounded-lg bg-[#202124] text-[15px] font-medium text-white"
    >
      {children}
    </button>
  );
}

export function SocialButtons() {
  return (
    <div className="flex gap-[30px]">
      <button
        type="button"
        className="flex h-[43px] flex-1 items-center justify-center gap-2.5 rounded-lg bg-[#f8f8f8] text-[15px] text-black"
      >
        <GoogleIcon />
        Signup with Google
      </button>
    </div>
  );
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-4">
      <span className="h-px flex-1 bg-[#e9eaee]" />
      <span className="text-[15px] text-[#606261]">or</span>
      <span className="h-px flex-1 bg-[#e9eaee]" />
    </div>
  );
}

export function CheckBox({ label }: { label: ReactNode }) {
  return (
    <label className="flex items-center gap-2 text-[15px] text-[#303236]">
      <input
        type="checkbox"
        className="h-[15px] w-[15px] shrink-0 appearance-none rounded-[3px] bg-[#dfe1e5]"
      />
      {label}
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-[18px] w-[18px]" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59A14.5 14.5 0 0 1 9.77 24c0-1.6.27-3.15.76-4.59l-7.98-6.19A23.94 23.94 0 0 0 0 24c0 3.88.93 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <path
        fill="#1877F2"
        d="M15.12 5.32H17V2.14A26.1 26.1 0 0 0 14.26 2C11.54 2 9.68 3.66 9.68 6.7v2.62H6.61v3.56h3.07V22h3.68v-9.12h3.06l.46-3.56h-3.52V7.05c0-1.03.28-1.73 1.76-1.73z"
      />
    </svg>
  );
}

function EyeOff({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.5 13.5 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <path d="m2 2 20 20" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    </svg>
  );
}
