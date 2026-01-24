"use client"

import { cn } from "@/lib/utils"
import {
  Home,
  Wallet,
  ArrowRightLeft,
  PlusCircle,
  ArrowDownLeft,
  DollarSign,
  Package,
  Users,
  ChevronRight,
  Sparkles,
  type LucideIcon
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  return (
    <div className={cn("pb-12 min-h-0 bg-white w-[280px] flex flex-col", className)} {...props}>
      <div className="space-y-4 py-8">
        <div className="px-6 py-2 flex items-center gap-2">
          <div className="bg-black text-white p-1 rounded-full">
            <Sparkles className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Flow Reminders</h2>
        </div>
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-gray-500">
            Pages
          </h2>
          <div className="space-y-1">
            <NavButton icon={Home} label="Home" active />
            <NavButton icon={PlusCircle} label="My reminders" />
          </div>
        </div>
      </div>
      
      <div className="mt-auto px-6 py-6 border-t">
        <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <Users className="h-6 w-6 text-gray-500" />
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-gray-500">Admin</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
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
        "w-full flex items-center justify-between rounded-lg px-2 py-2.5 text-sm font-medium hover:bg-gray-100 transition-colors",
        active ? "text-black" : "text-gray-600"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5" />
        {label}
      </div>
      {(label !== "Home") && <ChevronRight className="h-4 w-4 text-gray-300" />}
    </button>
  )
}

function RecipientButton({ name }: { name: string }) {
    return (
        <button type="button" className="w-full flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
            <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                 {/* Placeholder generic avatar */}
                 <Users className="h-4 w-4 text-gray-400" />
            </div>
            {name}
        </button>
    )
}
