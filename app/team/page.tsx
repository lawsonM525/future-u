'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export default function TeamPage() {
  return (
    <div className="min-h-screen px-4 py-8 md:px-8 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center text-yellow-500 hover:text-yellow-600 transition mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span>Back to Home</span>
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-10 text-center">The Future U Team</h1>
        
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-48 h-48 mb-6">
            <Image 
              src="/michelle.png" 
              alt="Michelle Lawson" 
              width={192}
              height={192}
              className="w-auto h-auto"
              priority
            />
          </div>
          
          <div className="text-center max-w-lg mx-auto space-y-4">
            <h2 className="text-2xl font-bold">Hi, it&apos;s Michelle!! 👋</h2>
            
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              I&apos;m Michelle Lawson, the founder of Future U. With a background in tech and finance, 
              I&apos;m passionate about helping others find clarity in their career paths.
            </p>
            
            <p className="text-zinc-400">
              Learn more about me at{' '}
              <a 
                href="https://michellelawson.me" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-yellow-500 hover:text-yellow-400 transition"
              >
                michellelawson.me
              </a>
            </p>
            
            <div className="pt-6">
              <Link 
                href="/careers" 
                className="inline-block px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-full transition"
              >
                Join the team!
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
