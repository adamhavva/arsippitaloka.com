import Image from "next/image";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import {
  AMBER,
  CheckBox,
  Field,
  Heading,
  LogoMark,
  OrDivider,
  PasswordField,
  SocialButtons,
  SubText,
  SubmitButton,
} from "@/components/auth/fields";

export const metadata = { title: "Create your account — Pitaloka" };

export default function RegisterPage() {
  return (
    <AuthShell
      image="/images/auth-register.jpg"
      alt="Interior perpustakaan klasik"
      imagePercent={54.9}
      contentLeft={77}
      contentTop={119.5}
    >
      <LogoMark ring />

      <div className="mt-[22px]">
        <Heading>
          Create your{" "}
          <span className="relative inline-block">
            <Image
              src="/images/swoosh-account.png"
              alt=""
              width={333}
              height={47}
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-[-2px] h-auto w-full select-none"
            />
            <span className="relative">account</span>
          </span>
        </Heading>
      </div>
      <div className="mt-[15px]">
        <SubText>Let&apos;s get started with your 30 days free trial</SubText>
      </div>

      <div className="mt-[32px]">
        <SocialButtons />
      </div>
      <div className="mt-[26px]">
        <OrDivider />
      </div>

      <form className="mt-[35px]">
        <Field type="email" placeholder="Email address" />
        <div className="mt-[25px]">
          <PasswordField placeholder="Password" />
        </div>

        <div className="mt-[21px] h-[9px] w-full rounded-full bg-[#dce0e4]" />

        <div className="mt-[9px] flex items-center justify-between">
          <span className="text-[15px] text-[#606261]">
            Write your password.....
          </span>
          <InfoIcon />
        </div>

        <div className="mt-[33px]">
          <Field type="password" placeholder="Confirm Password" />
        </div>

        <div className="mt-[36px]">
          <CheckBox label="I agree to all Terms & conditions and the privacy policy." />
        </div>

        <div className="mt-[33px]">
          <SubmitButton>Create an account</SubmitButton>
        </div>
      </form>

      <p className="mt-[34px] text-center text-[15px] text-[#606261]">
        Already have an account?{" "}
        <Link href="/login" style={{ color: AMBER }}>
          Sign in here
        </Link>
      </p>
    </AuthShell>
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
