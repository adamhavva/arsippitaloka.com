import Image from "next/image";
import type { ComponentProps, ReactNode } from "react";
import GoogleButton from "./GoogleButton";

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
    <h1 className="break-words text-[32px] font-bold leading-[1.05] tracking-[-0.02em] text-black sm:text-[44px]">
      {children}
    </h1>
  );
}

export function SubText({ children }: { children: ReactNode }) {
  return <p className="text-[15px] text-[#606261]">{children}</p>;
}

export function Field(props: ComponentProps<"input"> & { inputClassName?: string }) {
  const { inputClassName } = props;
  return (
    <input
      {...props}
      className={`h-[51px] w-full rounded-lg border border-[#f1f2f5] px-5 text-[15px] text-black outline-none placeholder:text-[#b4b6ba] focus:border-[#d6d8dd] ${inputClassName ?? ""}`}
    />
  );
}

export function PasswordField(props: ComponentProps<"input"> & { inputClassName?: string }) {
  const { inputClassName } = props;
  return (
    <div className="relative">
      <input
        {...props}
        type="password"
        className={`h-[51px] w-full rounded-lg border border-[#f1f2f5] pl-5 pr-14 text-[15px] text-black outline-none placeholder:text-[#b4b6ba] focus:border-[#d6d8dd] ${inputClassName ?? ""}`}
      />
      <EyeOff className="absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#4b4d52]" />
    </div>
  );
}

export function SubmitButton({
  children,
  ...props
}: ComponentProps<"button"> & { children: ReactNode }) {
  return (
    <button
      type="submit"
      {...props}
      className="h-[50px] w-full rounded-lg bg-[#202124] text-[15px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-60 sm:h-[47px]"
    >
      {children}
    </button>
  );
}

export function SocialButtons({
  googleEnabled = true,
}: {
  googleEnabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-[8px]">
      <div className="flex gap-[30px]">
        <GoogleButton />
      </div>
      {!googleEnabled ? (
        <p className="text-[14px] text-[#606261]">
          Google login belum dikonfigurasi.
        </p>
      ) : null}
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

export function CheckBox({
  label,
  ...props
}: ComponentProps<"input"> & { label: ReactNode }) {
  return (
    <label className="flex items-center gap-2 text-[15px] text-[#303236]">
      <input
        type="checkbox"
        {...props}
        className="h-[15px] w-[15px] shrink-0 appearance-none rounded-[3px] bg-[#dfe1e5]"
      />
      {label}
    </label>
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
