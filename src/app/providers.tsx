"use client";
import ToasterProvider from "@/components/ToasterProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ToasterProvider />
      {children}
    </>
  );
}
