import { Header } from "@/components/header";

export default function AppsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className="h-[calc(100vh-4rem)] overflow-y-auto">{children}</div>
    </>
  );
}
