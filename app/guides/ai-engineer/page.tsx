"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const SECTIONS = [
  {
    id: "what-does",
    title: "Section 1.\nWhat an AI Engineer Does",
    content: (
      <div className="space-y-6">
        <p>
          An AI Engineer builds software that uses AI systems.
          <br />
          You learn how to work with models and APIs (you dont necessarily build
          the models yourself).
        </p>
        <p>You turn AI responses into product features.</p>
        <p>You focus on how to use AI to solve user problems.</p>
        <p>
          Your first goal is simple. Understand how AI systems produce outputs
          and how to integrate those outputs into applications that people can use
          easily.
        </p>

        <div className="mt-8">
          <p className="mb-4">You need three skills for the role.</p>
          <ul className="space-y-2">
            <li>☆ You need to understand what AI models do.</li>
            <li>☆ You need to be able to call those models through APIs.</li>
            <li>
              ☆ You need to build features/products where AI output becomes
              useful.
            </li>
          </ul>
        </div>

        <p>AI engineering depends on strong product thinking.</p>

        <div className="border border-[#00ff00] p-4 mt-8">
          <p className="mb-2">Todo: Search “AI engineer job description”.</p>
          <p>Read three postings.</p>
          <p>You will see patterns in responsibilities.</p>
        </div>
      </div>
    ),
  },
  {
    id: "foundations",
    title: "Section 2.\nTechnical Foundations",
    content: (
      <div className="space-y-6">
        <p>Choose one coding path.</p>
        <ul className="space-y-1">
          <li>Frontend with JavaScript/TypeScript.</li>
          <li>Backend with Python.</li>
          <li>Full stack if you can do both.</li>
        </ul>

        <div className="mt-6">
          <p className="mb-2 font-bold">To do:</p>
          <p>Choose the language you will learn first for AI work.</p>
          <p>Python is common in AI.</p>
          <p>JavaScript is common in web apps.</p>
          <p>Pick one and master it. (I recommend Python first)</p>
        </div>

        <div className="mt-8">
          <p className="font-bold mb-2">BONUS TIP 💡</p>
          <p>
            You can get pretty good at Python by watching the free full Python
            course on Youtube by &apos;Programming with Mosh&apos;.
          </p>
          <div className="flex gap-1 text-[#00ff00] mt-2">
            <span>★</span>
            <span>★</span>
            <span>★</span>
            <span>★</span>
          </div>
        </div>

        <div className="mt-8 border-t border-[#00ff00] pt-4">
          <p>You need a basic coding setup.</p>
          <p className="mt-4 mb-2">Use these tools.</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>VS Code for editing.</li>
            <li>Python or JavaScript for coding.</li>
            <li>A browser for testing.</li>
            <li>A free hosting service like Render or Vercel.</li>
          </ul>
        </div>

        <div className="mt-8">
          <p className="font-bold mb-2">Bonus AI Tools:</p>
          <p>
            If you&apos;re down to code with AI, you can also check out these IDEs:
          </p>
          <ul className="mt-2 space-y-1">
            <li>★ Windsurf ★</li>
            <li>- Cursor</li>
            <li>
              - Warp (this is an AI terminal, not IDE, but still awesome!)
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "using-models",
    title: "Section 3.\nUsing AI Models",
    content: (
      <div className="space-y-6">
        <div className="border border-[#00ff00] p-4">
          <p>You can now work with model APIs.</p>
          <p>This is where your AI skills begin.</p>
        </div>

        <ul className="space-y-2">
          <li>You will learn to send text to a model.</li>
          <li>You will get text back.</li>
          <li>You will plug that output into your application.</li>
          <li>
            (can also be done for images, audio and other media, but start with
            text.. it&apos;s cheaper)
          </li>
        </ul>

        <div className="mt-8">
          <p className="font-bold mb-2">To do:</p>
          <p>Visit platform.openai.com/playground</p>
          <p>Type a question into the text box.</p>
          <p>Press submit.</p>
          <p>This shows you how AI responds to inputs.</p>
        </div>

        <p className="mt-6">
          Now go figure out how to get the Open AI API communicating with your
          codebase (no biggie, i promise)
        </p>
      </div>
    ),
  },
  {
    id: "open-source",
    title: "Section 4.\nOpen Source Models",
    content: (
      <div className="space-y-6">
        <p>Coming soon...</p>
      </div>
    ),
  },
  {
    id: "embeddings",
    title: "Section 5.\nEmbeddings and Vector Databases",
    content: (
      <div className="space-y-6">
        <p>Coming soon...</p>
      </div>
    ),
  },
  {
    id: "rag",
    title: "Section 6.\nRAG Systems",
    content: (
      <div className="space-y-6">
        <p>Coming soon...</p>
      </div>
    ),
  },
  {
    id: "agents",
    title: "Section 7.\nAI Agents and Automation",
    content: (
      <div className="space-y-6">
        <p>Coming soon...</p>
      </div>
    ),
  },
];

export default function AIEngineerGuide() {
  const router = useRouter();
  const [selectedSection, setSelectedSection] = useState(0);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSection((prev) => Math.min(prev + 1, SECTIONS.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSection((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "q" || e.key === "Q") {
        router.push("/guides");
      } else if (e.key === "ArrowRight") {
        // Scroll content down
        if (scrollRef.current) {
             scrollRef.current.scrollBy({ top: 100, behavior: 'smooth' });
        }
      } else if (e.key === "ArrowLeft") {
        // Scroll content up
        if (scrollRef.current) {
             scrollRef.current.scrollBy({ top: -100, behavior: 'smooth' });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-[#00ff00] font-terminal p-4 md:p-8 overflow-hidden flex flex-col">
      {/* Screen overlay effects could go here (scanlines, etc) */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%] opacity-20" />
      
      <div className="flex-1 flex gap-8 max-w-6xl mx-auto w-full relative z-10 h-[calc(100vh-100px)]">
        {/* Sidebar */}
        <div className="w-1/3 border-r border-[#00ff00]/30 pr-8 overflow-y-auto scrollbar-hide">
          <h2 className="text-xl mb-6 border-b border-[#00ff00] pb-2">SECTIONS</h2>
          <div className="space-y-4">
            {SECTIONS.map((section, index) => (
              <div
                key={section.id}
                onClick={() => setSelectedSection(index)}
                className={cn(
                  "p-4 border cursor-pointer transition-all relative",
                  selectedSection === index
                    ? "border-[#00ff00] shadow-[0_0_10px_rgba(0,255,0,0.3)] bg-[#00ff00]/10"
                    : "border-[#00ff00]/30 hover:border-[#00ff00]/60"
                )}
              >
                <pre className="whitespace-pre-wrap font-inherit text-lg leading-tight">
                  {section.title}
                </pre>
                {selectedSection === index && (
                  <div className="absolute -right-[33px] top-1/2 -translate-y-1/2 w-8 h-[1px] bg-[#00ff00]" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div 
            className="flex-1 border border-[#00ff00] p-8 text-xl md:text-2xl leading-relaxed shadow-[0_0_15px_rgba(0,255,0,0.1)] overflow-y-auto custom-scrollbar"
            ref={scrollRef}
        >
          {SECTIONS[selectedSection].content}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="mt-auto pt-4 border-t border-[#00ff00]/30 text-[#00ff00]/70 text-center font-mono text-lg relative z-10">
        UP, DOWN: select folder | LEFT, RIGHT: scroll | q: exit
      </div>
      
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #000;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #003300;
          border: 1px solid #00ff00;
        }
      `}</style>
    </div>
  );
}
