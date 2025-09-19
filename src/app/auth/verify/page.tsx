"use client";
import dynamic from "next/dynamic";

const VerifyEmailPage = dynamic(() => import("@/components/VerifyEmailPage"), {
  ssr: false,
});
export default function Verify() {
  return <VerifyEmailPage />;
}
