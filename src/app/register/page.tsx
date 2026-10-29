import Image from "next/image";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";
import { isGoogleAuthEnabled } from "@/lib/auth-config";
import {
  AMBER,
  Heading,
  LogoMark,
  OrDivider,
  SocialButtons,
  SubText,
} from "@/components/auth/fields";

export const metadata = { title: "Create your account — Pitaloka" };

export default function RegisterPage() {
  return (
    <AuthShell
      image="/images/auth-register.jpg"
      alt="Interior perpustakaan klasik"
      imagePercent={54.9}
      contentLeft={77}
      contentRight={85.9}
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
        <SocialButtons googleEnabled={isGoogleAuthEnabled()} />
      </div>
      <div className="mt-[26px]">
        <OrDivider />
      </div>

      <RegisterForm />

      <p className="mt-[34px] text-center text-[15px] text-[#606261]">
        Already have an account?{" "}
        <Link href="/login" style={{ color: AMBER }}>
          Sign in here
        </Link>
      </p>
    </AuthShell>
  );
}
