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
      contentTop={362.9}
      topSlot={<Steps current={1} total={4} />}
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

function Steps({ current, total }: { current: number; total: number }) {
  return (
    <div className="absolute top-[42px] left-1/2 flex -translate-x-1/2 gap-[18px]">
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => {
        const active = n === current;
        return (
          <span
            key={n}
            className={`flex h-[41px] w-[41px] items-center justify-center rounded-full text-[15px] ${
              active
                ? "border-[1.5px] border-[#202124] font-medium text-[#202124]"
                : "bg-[#f8f8f8] text-[#c2c4c8]"
            }`}
          >
            {n}
          </span>
        );
      })}
    </div>
  );
}
