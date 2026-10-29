"use client";

import { signIn } from "next-auth/react";
import GoogleIcon from "./GoogleIcon";

type Props = {
  callbackUrl?: string;
};

export default function GoogleButton({ callbackUrl = "/" }: Props) {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl })}
      className="flex h-[43px] flex-1 items-center justify-center gap-2.5 rounded-lg bg-[#f8f8f8] text-[15px] text-black"
    >
      <GoogleIcon />
      Signup with Google
    </button>
  );
}
