"use client"

import { cn } from "@/lib/utils"
import {
  Home,
  PlusCircle,
  Users,
  Sparkles,
  LogOut,
  type LucideIcon
} from "lucide-react"
import { useUser } from "@/hooks/use-user"
import { countryCodeEmoji } from "country-code-emoji"
import { parsePhoneNumber, type CountryCode } from "libphonenumber-js"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"
import Cookies from "js-cookie"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  const { data: user } = useUser()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    Cookies.remove("session_token")
    router.push("/signin")
  }

  const renderPhoneNumber = () => {
    if (!user?.phone_number) return "User"
    
    try {
      const phoneNumber = parsePhoneNumber(user.phone_number)
      if (phoneNumber) {
        const country = phoneNumber.country as CountryCode
        return (
          <span className="flex items-center gap-2">
            {country && <span>{countryCodeEmoji(country)}</span>}
            <span>{phoneNumber.formatInternational()}</span>
          </span>
        )
      }
    } catch (error) {
      console.error("Error parsing phone number:", error)
    }

    return user.phone_number
  }

  return (
    <>
      <div className={cn("pb-12 min-h-0 bg-white w-24 flex flex-col items-center", className)} {...props}>
        <div className="flex flex-col items-center w-full py-10">
          <div className="mb-10">
            <div className="bg-black text-white p-2.5 rounded-full shadow-lg">
              <Sparkles className="h-6 w-6" />
            </div>
          </div>
          
          <div className="w-full flex flex-col items-center">
            <NavButton 
              icon={Home} 
              label="Home" 
              href="/" 
              active={pathname === "/"} 
            />
            <div className="w-8 h-px bg-gray-100 my-4" />
            <NavButton 
              icon={PlusCircle} 
              label="Reminders" 
              href="/reminders" 
              active={pathname.startsWith("/reminders")} 
            />
          </div>
        </div>
        
        <div className="mt-auto w-full flex flex-col items-center px-4">
          <div className="w-8 h-px bg-gray-100 mb-8" />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                <Users className="h-6 w-6 text-gray-500" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end" className="w-56 ml-2">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Account</p>
                  <p className="text-xs leading-none text-muted-foreground mt-1">
                    {renderPhoneNumber()}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600 cursor-pointer"
                onSelect={() => setShowLogoutDialog(true)}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will log you out of your account. You will need to sign in again to access your reminders.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function NavButton({ icon: Icon, label, active, href }: { icon: LucideIcon; label: string; active?: boolean; href: string }) {
  const content = (
    <>
      <Icon className={cn("h-6 w-6 transition-transform group-hover:scale-110", active ? "stroke-[2.5px]" : "stroke-[2px]")} />
      <span className={cn("text-[10px] font-semibold tracking-tight transition-colors", active ? "text-black" : "text-gray-500")}>
        {label}
      </span>
      {active && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-black rounded-l-full" />
      )}
    </>
  )

  if (active) {
    return (
      <div
        className={cn(
          "w-full flex flex-col items-center justify-center gap-1.5 py-4 relative group cursor-default",
          "text-black"
        )}
      >
        {content}
      </div>
    )
  }

  return (
    <Link
      href={href}
      className={cn(
        "w-full flex flex-col items-center justify-center gap-1.5 py-4 transition-all relative group",
        "text-gray-400 hover:text-black"
      )}
    >
      {content}
    </Link>
  )
}

