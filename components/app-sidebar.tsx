"use client"

import * as React from "react"
import { Clock, ImageIcon, Settings } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const menuItems = [
  {
    title: "Análisis de Horas",
    icon: Clock,
    id: "time-analysis",
  },
  {
    title: "Codificador Base64",
    icon: ImageIcon,
    id: "base64-encoder",
  },
]

export function AppSidebar() {
  const [selectedTool, setSelectedTool] = React.useState("time-analysis")

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId)
    // Emitir evento personalizado para comunicar el cambio
    const event = new CustomEvent("toolChanged", { detail: { toolId } })
    window.dispatchEvent(event)
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <Settings className="h-6 w-6" />
          <span className="font-semibold">Herramientas</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Aplicaciones</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton isActive={selectedTool === item.id} onClick={() => handleToolSelect(item.id)}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
