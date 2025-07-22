import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { MainContent } from "@/components/main-content"
import { Footer } from "@/components/footer"

export default function Page() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset className="flex flex-1 flex-col">
            <MainContent />
          </SidebarInset>
        </div>
        <Footer />
      </div>
    </SidebarProvider>
  )
}
