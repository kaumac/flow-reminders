import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Black top section */}
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-primary-600 z-0" />
      
      <div className="relative z-10 flex h-full p-4 gap-4">
        <Sidebar className="hidden md:flex shrink-0 fixed top-4 left-4 bottom-4 rounded-2xl shadow-xl border-none" />
        <div className="flex-1 flex flex-col min-h-0 px-2 md:px-6 lg:px-12 xl:px-16 2xl:px-24 md:ml-28">
          <div className="mb-12 mt-4 text-white">
            <h1 className="text-3xl font-bold mb-1">Hi there! 👋</h1>
            <p className="opacity-80 text-lg">Let's create your first reminder</p>
          </div>
          <main className="pb-2 min-h-0">
             <div className="w-full mb-4 bg-white rounded-xl border border-border shadow-sm">
                 {children}
             </div>
          </main>
        </div>
      </div>
    </>
  );
}
