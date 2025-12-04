import Link from "next/link";
import { ArrowRight, Terminal } from "lucide-react";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";

export default function GuidesPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav active="guides" onChange={() => {}} />
      <div className="flex-1 flex flex-col mb-16 md:mb-0 md:ml-64">
        <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full">
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Guides</h1>
            <p className="text-muted-foreground text-lg">
              Deep dives into career paths and skills.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* AI Engineer Guide Card */}
            <Link
              href="/guides/ai-engineer"
              className="group block h-full"
            >
              <div className="bg-[#111] border border-[#333] rounded-xl overflow-hidden h-full transition-all duration-300 hover:border-[#00ff00] hover:shadow-[0_0_20px_rgba(0,255,0,0.2)]">
                <div className="aspect-video bg-black flex items-center justify-center border-b border-[#333] group-hover:border-[#00ff00]">
                  <Terminal className="w-16 h-16 text-[#00ff00]" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 font-mono group-hover:text-[#00ff00]">
                    So you wanna be an AI Engineer?
                  </h3>
                  <p className="text-gray-400 mb-4 text-sm">
                    A complete technical roadmap to becoming an AI Engineer. Learn about models, APIs, and building AI products.
                  </p>
                  <div className="flex items-center text-[#00ff00] font-mono text-sm">
                    <span>START_GUIDE</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </main>
      </div>
      <MobileBottomNav active="guides" onChange={() => {}} />
    </div>
  );
}
