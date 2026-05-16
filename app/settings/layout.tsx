import type { Metadata } from "next";
export const metadata: Metadata = { title: "Settings — RiseStrong" };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
