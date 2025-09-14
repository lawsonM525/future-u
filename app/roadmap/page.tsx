'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StarSprite } from '@/components/ui/star-sprite'

export default function RoadmapPage() {
  return (
    <div className="min-h-screen px-4 py-8 md:px-8 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center text-yellow-500/60 hover:text-yellow-500 transition mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span>Back to Home</span>
        </Link>
        
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center flex items-center justify-center gap-3 font-rubik-mono-one">
          <StarSprite size={128} />
          Future U Roadmap
          <StarSprite size={128} />
        </h1>
        
        <p className="text-lg text-center mb-3">
          We&apos;re building Future U to be your comprehensive guide from your present self to your dream future self, every step of the way.
        </p>
        <p className="text-lg text-center mb-12">
          Here&apos;s what we&apos;ve already done and what we&apos;re working on next:
        </p>

        {/* Available Now Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <span className="mr-2 text-green-500">✅</span>
            <span>Available Now</span>
          </h2>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-6 transition hover:bg-white/10">
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <span className="mr-2">📄</span>
              <span>Future U Strategy Report</span>
            </h3>
            
            <p className="text-md text-gray-200">
              Take the quiz and get a personalized report with your strengths, where you&apos;re heading, and the steps and milestones
              that you can take and check off on the way there. Knowing what steps you need to take helps you to actually move
              forward in that direction.
            </p>
          </div>

          {/* Strategy Summary + Timeline (available now) */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-6 transition hover:bg-white/10">
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <span className="mr-2">📸</span>
              <span> Strategy Summary + Timeline</span>
            </h3>
            
            <p className="text-md text-gray-200">
              See a concise summary of your strategy report along with a clear timeline of the steps to reach your dream life.
            </p>
            
            <p className="text-md text-gray-200 mt-2">
              Use it to keep your weekly focus tight and your momentum strong.
            </p>
          </div>

          {/* Future U Avatar (available now) */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-6 transition hover:bg-white/10">
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <span className="mr-2">👩‍✈️</span>
              <span>Future U Avatar</span>
            </h3>
            <p className="text-md text-gray-200 mb-4">
              Build and customize a character of your Future You — a visual reminder of who you&apos;re becoming. Save it and share it anywhere.
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-1">
              <li>Start from a default character</li>
              <li>Customize to match your vibe and ambition</li>
              <li>Download as an image for your profile picture</li>
            </ul>
          </div>

          {/* Weekly Check-ins (available now, Premium) */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-6 transition hover:bg-white/10">
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <span className="mr-2">💌</span>
              <span>Weekly Check-ins (Premium)</span>
            </h3>
            <p className="text-md text-gray-200">
              A weekly reminder that keeps your strategy top of mind — what matters this week and what you need to accomplish to move toward your goal.
            </p>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <span className="mr-2 text-yellow-500">🚧</span>
            <span>Coming Soon</span>
          </h2>
          
          {/* Shareable Timeline Card (coming soon) */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-6 transition hover:bg-white/10">
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <span className="mr-2">🖼️</span>
              <span>Shareable Timeline Card</span>
            </h3>
            <p className="text-md text-gray-200 mb-4">
              A polished visual card of your strategy timeline — perfect for Instagram Stories, LinkedIn, or anywhere you share wins.
            </p>
            <div className="mt-4 p-4 bg-yellow-500/10 rounded-lg">
              <p className="text-sm text-yellow-200">
                🎨 We&apos;re looking for an animator to make this extra cute!
                <Link href="/careers" className="ml-1 underline hover:text-yellow-300">
                  See open roles
                </Link>
              </p>
            </div>
          </div>
          
          {/* Weekly Scorecard + XP System (coming soon) */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-6 transition hover:bg-white/10">
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <span className="mr-2">📈</span>
              <span>Weekly Scorecard + XP System</span>
            </h3>
            
            <p className="text-md text-gray-200 mb-4">
              We&apos;ll help keep you accountable to your goals. Snap pictures of the quests you complete each week — the more you complete, the more we update your scorecard and your XP.
            </p>
            
            <ul className="list-disc pl-6 text-gray-300 space-y-1">
              <li>Weekly scorecard summarizes your wins and progress</li>
              <li>XP system grows as you complete more quests</li>
              <li>Share progress with friends and your community</li>
            </ul>
          </div>
          
          {/* Feature 4 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-6 transition hover:bg-white/10">
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <span className="mr-2">🧠</span>
              <span>Career Path Explorer</span>
            </h3>
            
            <p className="text-md text-gray-200">
              Future U is so great because it&apos;s not simply an AI generated guide. It&apos;s based on lots and lots of data from real humans with real 
              career advice and real insights. 
            </p>
            <p className="text-md text-gray-200 mt-2">
             We&apos;re making a page where you can go through these stories and get inspired. 
              See people talking about their past self to their present self, and just know that everything is possible and you can 
              achieve whatever you want.
            </p>
          </div>
        </div>
        
        {/* Feedback Section */}
        <div className="mt-12 bg-yellow-900/20 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <span className="mr-2">📮</span>
            <span>Feedback + Feature Requests</span>
          </h3>
          
          <p className="text-md mb-4">
            Have an idea? Want to see something added?
            Let us know!!!
          </p>
          
          <Link href="https://lwsnlabs.featurebase.app/?b=68b4751d77012e1594a760c9">
            <Button variant="yellow" className="w-full md:w-auto">
              Send Feedback
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}