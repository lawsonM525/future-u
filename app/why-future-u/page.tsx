'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function WhyFutureUPage() {
  return (
    <div className="min-h-screen px-4 py-8 md:px-8 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center text-yellow-500 hover:text-yellow-600 transition mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span>Back to Home</span>
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-10 text-center">✨ Why I Built Future U</h1>
        
        <div className="prose prose-invert prose-yellow max-w-none text-lg">
          <p className="mb-6">
            I built Future U because I believe every single person should know that whatever they want to do, can be done.
          </p>
          
          <p className="mb-6">
            Want to go to space? You can.
          </p>
          
          <p className="mb-6">
            Want to build a billion-dollar company? You can.
          </p>
          
          <p className="mb-1">
            Want to cure hunger, write poetry from a farm, or become the best in your field?  
          </p>

          <p className="mb-6">
            You absolutely can.
          </p>

          <p className="mb-6">
            But the difference between dreaming and doing isn&apos;t talent. It&apos;s clarity. It&apos;s knowing what you want, understanding the steps you need to take, and having the courage to take them — one at a time.
          </p>

          <p className="mb-6">
            And that&apos;s what Future U is here for.
          </p>
          
          <p className="mb-6">
            To help you figure out what you truly want.
          </p>
          
          <p className="mb-6">
            To show you the exact path to get there.
          </p>
          
          <p className="mb-6">
            And to give you the motivation, structure, and belief to follow through—so one day, you look back and realize... you&apos;ve become the person you once dreamed of.
          </p>

          <p className="mb-6">
            This isn&apos;t about hustle culture. 
          </p>

          <p className="mb-6">
          It&apos;s about deliberate self-trust.
          </p>

          <p className="mb-12">
          It&apos;s about mapping out your future—then walking into it.
          </p>
        </div>
      </div>
    </div>
  )
}
