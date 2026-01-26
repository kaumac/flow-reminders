"use client"

import { cn } from "@/lib/utils"
import {
  Home,
  PlusCircle,
  Users,
  Sparkles,
  type LucideIcon
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  return (
    <div className={cn("pb-12 min-h-0 bg-white w-24 flex flex-col items-center", className)} {...props}>
      <div className="flex flex-col items-center w-full py-10">
        <div className="mb-10">
          <div className="bg-black text-white p-2.5 rounded-full shadow-lg">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>
        
        <div className="w-full flex flex-col items-center">
          <NavButton icon={Home} label="Home" active />
          <div className="w-8 h-px bg-gray-100 my-4" />
          <NavButton icon={PlusCircle} label="Reminders" />
        </div>
      </div>
      
      <div className="mt-auto w-full flex flex-col items-center px-4">
        <div className="w-8 h-px bg-gray-100 mb-8" />
        <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
          <Users className="h-6 w-6 text-gray-500" />
        </div>
      </div>
    </div>
  )
}

function NavButton({ icon: Icon, label, active }: { icon: LucideIcon; label: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "w-full flex flex-col items-center justify-center gap-1.5 py-4 transition-all relative group",
        active ? "text-black" : "text-gray-400 hover:text-black"
      )}
    >
      <Icon className={cn("h-6 w-6 transition-transform group-hover:scale-110", active ? "stroke-[2.5px]" : "stroke-[2px]")} />
      <span className={cn("text-[10px] font-semibold tracking-tight transition-colors", active ? "text-black" : "text-gray-500")}>
        {label}
      </span>
      {active && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-black rounded-l-full" />
      )}
    </button>
  )
}

