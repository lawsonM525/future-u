"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const SECTIONS = [
  {
    id: "what-does",
    title: "Section 1.\nWhat an AI Engineer Does",
    content: (
      <div className="space-y-6 animate-in fade-in duration-500">
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
      <div className="space-y-6 animate-in fade-in duration-500">
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
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="border border-[#00ff00] p-4">
            <p className="mb-4 text-xl">Use a simple diagram to guide your thinking.</p>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 my-6 text-center font-mono">
                <div className="flex flex-col items-center">
                    <div className="border border-[#00ff00] px-4 py-2 mb-2">Input</div>
                    <p className="text-sm text-[#00ff00]/70 max-w-[120px]">Your message or data.</p>
                </div>
                <div className="text-2xl">→</div>
                <div className="flex flex-col items-center">
                    <div className="border border-[#00ff00] px-4 py-2 mb-2">Model</div>
                    <p className="text-sm text-[#00ff00]/70 max-w-[120px]">The API that processes your input.</p>
                </div>
                <div className="text-2xl">→</div>
                <div className="flex flex-col items-center">
                    <div className="border border-[#00ff00] px-4 py-2 mb-2">Output</div>
                    <p className="text-sm text-[#00ff00]/70 max-w-[120px]">The response you use in your product.</p>
                </div>
            </div>

            <p className="font-bold mb-2 mt-6">Action step</p>
            <p className="mb-2">Draw this diagram on paper.</p>
            <p className="mb-2">Write an example input and output. This helps you understand the flow of AI work.</p>
        </div>

        <div className="mt-8">
            <p className="font-bold mb-2">BONUS TIP</p>
            <p>Always decide what you want the output format to be and clarify this in your code via prompt engineering.</p>
        </div>

        <div className="mt-8 border-t border-[#00ff00] pt-6">
             <p className="mb-4">You can use four model features early on.</p>
             <ul className="list-disc list-inside space-y-2 ml-2">
                 <li>Chat completions for text.</li>
                 <li>Embeddings for finding meaning.</li>
                 <li>Vision for image inputs.</li>
                 <li>Fine tuning for custom behavior.</li>
             </ul>
        </div>

        <div className="mt-8">
            <p className="font-bold mb-2">To do:</p>
            <p>Call one model through an API. (fr, try it)</p>
            <p>Use the sample code from the docs.</p>
            <p>Run it and print the output to your terminal.</p>
        </div>
      </div>
    ),
  },
  {
    id: "open-source",
    title: "Section 4.\nOpen Source Models",
    content: (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="border-l-2 border-[#00ff00] pl-4">
            <p className="mb-4">Open source models teach you how models run outside cloud APIs.</p>
            <p className="mb-4">You can use Ollama for local tests.</p>
            <p className="mb-4">You can use Hugging Face for model downloads.</p>
            <p>You should learn how model size affects speed.</p>
        </div>

        <div className="border border-[#00ff00] p-4 mt-8">
            <p className="font-bold mb-2">To do:</p>
            <ul className="space-y-2">
                <li>Install Ollama.</li>
                <li>Run a small model like llama3.</li>
                <li>Ask it a simple question.</li>
                <li>Observe the response time.</li>
            </ul>
        </div>
      </div>
    ),
  },
  {
    id: "embeddings",
    title: "Section 5.\nEmbeddings and Vector Databases",
    content: (
      <div className="space-y-6 animate-in fade-in duration-500">
        <p>Embeddings convert text into vectors.</p>
        <p>Vectors let you compare the meanings of words and phrases with similarity scores.</p>
        <p>You store vectors in a database built for this purpose.</p>

        <div className="border border-[#00ff00] p-4 mt-8 relative min-h-[300px] flex items-center justify-center bg-black/50">
            {/* Vector Graph SVG */}
            <svg width="100%" height="300" viewBox="0 0 400 300" className="w-full h-full overflow-visible">
                {/* Axes */}
                <line x1="40" y1="260" x2="360" y2="260" stroke="#00ff00" strokeWidth="2" markerEnd="url(#arrow)" />
                <line x1="40" y1="260" x2="40" y2="40" stroke="#00ff00" strokeWidth="2" markerEnd="url(#arrow)" />
                
                {/* Axis Labels */}
                <text x="200" y="290" fill="#00ff00" textAnchor="middle" fontFamily="monospace">Dimension 1</text>
                <text x="20" y="150" fill="#00ff00" textAnchor="middle" fontFamily="monospace" transform="rotate(-90 20 150)">Dimension 2</text>

                {/* Vectors */}
                {/* King */}
                <line x1="40" y1="260" x2="150" y2="100" stroke="#00ff00" strokeWidth="1.5" markerEnd="url(#arrow-sm)" className="opacity-70" />
                <circle cx="150" cy="100" r="3" fill="#00ff00" />
                <text x="140" y="90" fill="#00ff00" fontSize="14">King</text>

                {/* Queen */}
                <line x1="40" y1="260" x2="220" y2="120" stroke="#00ff00" strokeWidth="1.5" markerEnd="url(#arrow-sm)" className="opacity-70" />
                <circle cx="220" cy="120" r="3" fill="#00ff00" />
                <text x="220" y="110" fill="#00ff00" fontSize="14">Queen</text>

                {/* Man */}
                <line x1="40" y1="260" x2="120" y2="200" stroke="#00ff00" strokeWidth="1.5" markerEnd="url(#arrow-sm)" className="opacity-70" />
                <circle cx="120" cy="200" r="3" fill="#00ff00" />
                <text x="110" y="190" fill="#00ff00" fontSize="14">Man</text>

                {/* Woman */}
                <line x1="40" y1="260" x2="250" y2="210" stroke="#00ff00" strokeWidth="1.5" markerEnd="url(#arrow-sm)" className="opacity-70" />
                <circle cx="250" cy="210" r="3" fill="#00ff00" />
                <text x="250" y="200" fill="#00ff00" fontSize="14">Woman</text>

                {/* Orange (far away) */}
                <line x1="40" y1="260" x2="300" y2="250" stroke="#00ff00" strokeWidth="1.5" markerEnd="url(#arrow-sm)" className="opacity-70" />
                <circle cx="300" cy="250" r="3" fill="#00ff00" />
                <text x="290" y="270" fill="#00ff00" fontSize="14">Orange</text>

                {/* Relationships */}
                <line x1="150" y1="100" x2="220" y2="120" stroke="#00ff00" strokeWidth="1" strokeDasharray="4" className="opacity-50" />
                <line x1="120" y1="200" x2="250" y2="210" stroke="#00ff00" strokeWidth="1" strokeDasharray="4" className="opacity-50" />

                {/* Definitions */}
                <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L0,6 L9,3 z" fill="#00ff00" />
                    </marker>
                    <marker id="arrow-sm" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L0,6 L9,3 z" fill="#00ff00" />
                    </marker>
                </defs>
            </svg>
        </div>
      </div>
    ),
  },
  {
    id: "rag",
    title: "Section 6.\nRAG Systems",
    content: (
      <div className="space-y-6 animate-in fade-in duration-500">
        <p>RAG stands for Retrieval Augmented Generation.</p>
        <p>RAG lets your model pull from real, accurate data instead of &quot;guessing&quot;.</p>
        
        <div className="border-l-2 border-[#00ff00] pl-4 my-6">
            <p>You use RAG for tasks where answers must match real data e.g, company policies or health documentation</p>
        </div>

        <div className="mt-6">
            <p className="font-bold mb-4">Here is how RAG works:</p>
            <ul className="space-y-2 list-disc list-inside">
                <li>You split your documents into small chunks.</li>
                <li>You turn each chunk into an embedding.</li>
                <li>You store those embeddings in a vector database.</li>
                <li>When the user asks a question, you search for the most similar chunks.</li>
                <li>You send those chunks into the model, along with the question.</li>
            </ul>
        </div>

        <div className="mt-8 border border-[#00ff00] p-4">
            <p className="font-bold mb-2">BONUS TIP 💡</p>
            <p>When building a RAG app, start with one source of truth, not many.</p>
            <p>One clean dataset is easier to debug than ten messy ones.</p>
        </div>
      </div>
    ),
  },
  {
    id: "agents",
    title: "Section 7.\nAI Agents and Automation",
    content: (
      <div className="space-y-6 animate-in fade-in duration-500">
        <p>Coming soon...</p>
      </div>
    ),
  },
  {
    id: "projects",
    title: "Section 8.\nBuilding Projects",
    content: (
      <div className="space-y-6 animate-in fade-in duration-500">
        <p>Coming soon...</p>
      </div>
    ),
  },
];

export default function AIEngineerGuide() {
  const router = useRouter();
  const [selectedSection, setSelectedSection] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // Reset scroll on section change
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
    }
  }, [selectedSection]);

  return (
    <div className="min-h-screen bg-black text-[#00ff00] font-terminal p-4 md:p-8 overflow-hidden flex flex-col relative">
      {/* CRT Effects */}
      <div className="pointer-events-none fixed inset-0 z-50">
        {/* Scanlines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20"></div>
        {/* Flicker */}
        <div className="absolute inset-0 bg-white opacity-[0.02] animate-flicker pointer-events-none"></div>
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)]"></div>
      </div>
      
      <div className="flex-1 flex gap-8 max-w-6xl mx-auto w-full relative z-10 h-[calc(100vh-100px)]">
        {/* Sidebar */}
        <div className="w-1/3 border-r border-[#00ff00]/30 pr-8 overflow-y-auto scrollbar-hide">
          <h2 className="text-xl mb-6 border-b border-[#00ff00] pb-2 tracking-widest">SECTIONS</h2>
          <div className="space-y-4">
            {SECTIONS.map((section, index) => (
              <div
                key={section.id}
                onClick={() => setSelectedSection(index)}
                className={cn(
                  "p-4 border cursor-pointer transition-all relative group",
                  selectedSection === index
                    ? "border-[#00ff00] shadow-[0_0_10px_rgba(0,255,0,0.3)] bg-[#00ff00]/10"
                    : "border-[#00ff00]/30 hover:border-[#00ff00]/60"
                )}
              >
                <pre className="whitespace-pre-wrap font-inherit text-lg leading-tight group-hover:text-white transition-colors">
                  {section.title}
                </pre>
                {selectedSection === index && (
                  <div className="absolute -right-[33px] top-1/2 -translate-y-1/2 w-8 h-[1px] bg-[#00ff00] shadow-[0_0_5px_#00ff00]" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div 
            className="flex-1 border border-[#00ff00] p-8 text-xl md:text-2xl leading-relaxed shadow-[0_0_15px_rgba(0,255,0,0.1)] overflow-y-auto custom-scrollbar relative bg-black"
            ref={scrollRef}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ff00]/50 to-transparent opacity-50 animate-scan" />
          {SECTIONS[selectedSection].content}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="mt-auto pt-4 border-t border-[#00ff00]/30 text-[#00ff00]/70 text-center font-mono text-lg relative z-10">
        <span className="animate-pulse">_</span> UP, DOWN: select folder | LEFT, RIGHT: scroll | q: exit
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
        @keyframes flicker {
            0% { opacity: 0.02; }
            5% { opacity: 0.05; }
            10% { opacity: 0.02; }
            15% { opacity: 0.06; }
            20% { opacity: 0.02; }
            50% { opacity: 0.02; }
            55% { opacity: 0.05; }
            60% { opacity: 0.02; }
            100% { opacity: 0.02; }
        }
        .animate-flicker {
            animation: flicker 4s infinite;
        }
        @keyframes scan {
            0% { transform: translateY(0); }
            100% { transform: translateY(100vh); }
        }
        .animate-scan {
            animation: scan 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
