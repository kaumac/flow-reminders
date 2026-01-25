import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Black top section */}
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-[#111111] z-0" />
      
      <div className="relative z-10 flex h-full p-4 gap-4">
        <Sidebar className="hidden md:flex shrink-0 h-full rounded-2xl shadow-xl border-none" />
        <div className="flex-1 flex flex-col min-h-0">
          <Header />
          <main className="flex-1 pb-2 min-h-0 overflow-hidden">
             <div className="h-full w-full bg-white rounded-xl overflow-auto border border-border shadow-sm p-6">
                 {children}
             </div>
          </main>
        </div>
      </div>
    </>
  );
}
