"use client"

import { PanelLeft } from "lucide-react"

export function Header() {
  return (
    <div className="pt-2 pb-4">
        <div className="h-12 w-full bg-white rounded-xl flex items-center px-4 shadow-sm">
            <button type="button" className="p-1 hover:bg-gray-100 rounded-md">
                <PanelLeft className="h-5 w-5 text-gray-600" />
            </button>
        </div>
    </div>
  )
}
