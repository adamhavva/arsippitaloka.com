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

export const metadata = { title: "Login — Pitaloka" };

export default function LoginPage() {
  return (
    <AuthShell
      image="/images/auth-login.jpg"
      alt="Perbukitan dan sawah terasering"
      imagePercent={54.9}
      contentLeft={75.5}
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
        <SocialButtons />
      </div>
      <div className="mt-[29px]">
        <OrDivider />
      </div>

      <form className="mt-[39px]">
        <Field type="email" placeholder="Email address" />
        <div className="mt-[24px]">
          <PasswordField placeholder="Password" />
        </div>

        <div className="mt-[29px] flex items-center justify-between">
          <CheckBox label="Remember me" />
          <Link
            href="/forgot-password"
            className="text-[15px]"
            style={{ color: AMBER }}
          >
            Fotget password
          </Link>
        </div>

        <div className="mt-[20px]">
          <SubmitButton>Login</SubmitButton>
        </div>
      </form>

      <p className="mt-[24px] text-center text-[15px] text-[#606261]">
        Not registered yet?{" "}
        <Link href="/register" style={{ color: AMBER }}>
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
