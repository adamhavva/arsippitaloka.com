import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";
import { isGoogleAuthEnabled } from "@/lib/auth-config";
import {
  AMBER,
  Heading,
  LogoMark,
  OrDivider,
  SocialButtons,
  SubText,
} from "@/components/auth/fields";

export const metadata = { title: "Login — Pitaloka" };

export default function LoginPage() {
  return (
    <AuthShell
      image="/images/auth-login.jpg"
      alt="Perbukitan dan sawah terasering"
      imagePercent={54.9}
      contentLeft={75.5}
      contentRight={85.9}
      contentTop={218.9}
    >
      <LogoMark />

      <div className="mt-[19px]">
        <Heading>Welcome back</Heading>
      </div>
      <div className="mt-[19px]">
        <SubText>Welcome back, please enter your detail</SubText>
      </div>

      <div className="mt-[37px]">
        <SocialButtons googleEnabled={isGoogleAuthEnabled()} />
      </div>
      <div className="mt-[29px]">
        <OrDivider />
      </div>

      <LoginForm />

      <p className="mt-[24px] text-center text-[15px] text-[#606261]">
        Not registered yet?{" "}
        <Link href="/register" style={{ color: AMBER }}>
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
