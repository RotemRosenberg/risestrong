import type { Metadata } from "next";
export const metadata: Metadata = { title: "Weight Log — RiseStrong" };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
