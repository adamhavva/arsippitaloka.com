import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import {
  Field,
  Heading,
  LogoMark,
  SubText,
  SubmitButton,
} from "@/components/auth/fields";

export const metadata = { title: "Forget password — Pitaloka" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      image="/images/auth-forgot.jpg"
      alt="Gunung dan persawahan"
      imagePercent={53.2}
      contentLeft={95}
      contentRight={99.1}
      contentTop={362.9}
    >
      <LogoMark ring />

      <div className="mt-[25px]">
        <Heading>Forget password</Heading>
      </div>
      <div className="mt-[17px]">
        <SubText>Enter the email address associated with an account.</SubText>
      </div>

      <form className="mt-[28px]">
        <Field type="email" placeholder="Email address" />
        <div className="mt-[20px]">
          <SubmitButton>Reset&nbsp; password</SubmitButton>
        </div>
      </form>

      <p className="mt-[20px] text-center text-[15px] font-medium text-[#202124]">
        <Link href="/login">&larr; Back to login</Link>
      </p>
    </AuthShell>
  );
}