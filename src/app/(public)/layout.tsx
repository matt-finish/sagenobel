import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getSectionSettings } from "@/lib/actions/settings";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sections = await getSectionSettings();

  return (
    <>
      <Navbar sections={sections} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
