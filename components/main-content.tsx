"use client"

import * as React from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { TimeAnalysisTool } from "@/components/time-analysis-tool"
import { Base64EncoderTool } from "@/components/base64-encoder-tool"

export function MainContent() {
  const [selectedTool, setSelectedTool] = React.useState("time-analysis")

  // Función para recibir la selección del sidebar
  React.useEffect(() => {
    const handleToolChange = (event: CustomEvent) => {
      setSelectedTool(event.detail.toolId)
    }

    window.addEventListener("toolChanged", handleToolChange as EventListener)
    return () => {
      window.removeEventListener("toolChanged", handleToolChange as EventListener)
    }
  }, [])

  const renderTool = () => {
    switch (selectedTool) {
      case "time-analysis":
        return <TimeAnalysisTool />
      case "base64-encoder":
        return <Base64EncoderTool />
      default:
        return <TimeAnalysisTool />
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">
          {selectedTool === "time-analysis" ? "Análisis de Horas Trabajadas" : "Codificador/Decodificador Base64"}
        </h1>
      </header>
      <div className="flex-1 p-4">{renderTool()}</div>
    </div>
  )
}
