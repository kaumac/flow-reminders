import Image from "next/image";
import authSidebar from "../../public/images/auth-sidebar.png";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 p-4">
      <div className="flex h-full max-h-[800px] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl lg:h-[700px]">
        <div className="relative hidden w-1/3 flex-col justify-end text-white lg:flex bg-red-500">
          <div className="absolute inset-0 h-full w-full bg-zinc-100">
            <Image
              src={authSidebar}
              alt="Sidebar Illustration"
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </div>
          <div className="z-10 absolute h-1/2 left-0 w-full bottom-0 bg-linear-to-t from-black/90 to-transparent flex items-center justify-end p-12 flex-col gap-4">
            <h2 className="text-xl font-bold leading-tight">
              Never miss a reminder again!
            </h2>
            <p className="text-sm text-white">
              Flow Reminders is a simple and effective way to never miss a reminder again. Create reminders for important events, appointments and tasks, and we'll call to remind you. 
            </p>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
