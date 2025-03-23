'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function RoadmapPage() {
  return (
    <div className="min-h-screen px-4 py-8 md:px-8 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center text-yellow-500 hover:text-yellow-600 transition mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span>Back to Home</span>
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">🌟 Future U Roadmap</h1>
        
        <p className="text-lg text-center mb-12">
          We're building Future U to be your go-to space for clarity, motivation, and good vibes as you grow your career.
          Here's what's already live—and what's on the way:
        </p>

        {/* Available Now Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <span className="mr-2 text-green-500">✅</span>
            <span>Available Now</span>
          </h2>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 transition hover:bg-white/10">
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <span className="mr-2">📄</span>
              <span>Future U Strategy Report</span>
            </h3>
            
            <p className="text-md text-gray-200">
              Take the quiz and get a personalized report with career paths, key goals, and steps to grow. 
              It's made to help you move forward with direction—and yes, you can download it as a cute 
              little PDF to keep forever.
            </p>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <span className="mr-2 text-yellow-500">🚧</span>
            <span>Coming Soon</span>
          </h2>
          
          {/* Feature 1 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-6 transition hover:bg-white/10">
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <span className="mr-2">🔮</span>
              <span>Future You Dashboard</span>
            </h3>
            
            <p className="text-md text-gray-200 mb-4">
              Build a version of your "future me" based on your quiz results.
              You'll be able to:
            </p>
            
            <ul className="list-disc pl-6 text-gray-300 space-y-1">
              <li>Pick a career vibe (startup founder, quant queen, indie hacker, etc.)</li>
              <li>View your timeline with future milestones</li>
              <li>Check in on your progress as you go</li>
            </ul>
          </div>
          
          {/* Feature 2 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-6 transition hover:bg-white/10">
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <span className="mr-2">📈</span>
              <span>Weekly Glow Scorecard + XP System</span>
            </h3>
            
            <p className="text-md text-gray-200 mb-4">
              Track your progress and earn glow points for taking small steps—like updating your resume, 
              practicing a coding question, or sending a cold email.
              You'll get:
            </p>
            
            <ul className="list-disc pl-6 text-gray-300 space-y-1">
              <li>A weekly scorecard showing what you completed</li>
              <li>A growing XP total to reflect your momentum</li>
              <li>A visual report you can share on socials or just save for yourself</li>
            </ul>
          </div>
          
          {/* Feature 3 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-6 transition hover:bg-white/10">
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <span className="mr-2">💌</span>
              <span>Weekly Check-ins from Your Future U</span>
            </h3>
            
            <p className="text-md text-gray-200 mb-4">
              Each week, get a gentle (or bold) nudge from your future self.
              Choose your tone:
            </p>
            
            <ul className="list-disc pl-6 text-gray-300 space-y-1">
              <li>Affirming mom</li>
              <li>Brutally honest baddie</li>
              <li>Wise Ghanaian uncle</li>
            </ul>
            
            <p className="text-md text-gray-200 mt-4">
              Your future U will send encouragement, reminders, and some well-timed real talk to keep you moving.
            </p>
          </div>
          
          {/* Feature 4 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-6 transition hover:bg-white/10">
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <span className="mr-2">🧠</span>
              <span>Career Path Explorer</span>
            </h3>
            
            <p className="text-md text-gray-200 mb-4">
              Get inspired by real stories.
              Scroll through anonymous submissions from people sharing how they got where they are—from internships to dream jobs.
              See their "past me → now me" journey, and tag yourself in the version you're working toward.
            </p>
          </div>
          
          {/* Feature 5 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-6 transition hover:bg-white/10">
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <span className="mr-2">📸</span>
              <span>Shareable Visual Timeline</span>
            </h3>
            
            <p className="text-md text-gray-200">
              Show off your future path with a timeline graphic you can post on Instagram stories, LinkedIn, or anywhere else.
              You'll get a personalized design based on your quiz results—perfect for manifesting or just showing the world what you're working toward.
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
          
          <Button variant="yellow" className="w-full md:w-auto">
            Send Feedback
          </Button>
        </div>
      </div>
    </div>
  )
}
