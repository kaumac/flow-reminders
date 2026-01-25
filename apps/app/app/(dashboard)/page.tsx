import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
      <h1 className="text-4xl font-bold tracking-tight">Welcome to Flow Reminders</h1>
      <p className="text-gray-500 max-w-lg">
        Content is coming soon to this pretty page
      </p>
      <Button>Hi, I'm a pretty button</Button>
    </div>
  );
}
