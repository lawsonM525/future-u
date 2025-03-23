'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CareersPage() {
  return (
    <div className="min-h-screen px-4 py-8 md:px-8 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center text-yellow-500 hover:text-yellow-600 transition mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span>Back to Home</span>
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">Join the Future U Team</h1>
        
        <p className="text-lg text-center mb-12">
          We&apos;re looking for passionate individuals to help us guide people to their dream future.
          Check out our open positions below and apply today!
        </p>

        {/* Job Listings */}
        <div className="space-y-8">
          {/* Illustrator Position */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 transition hover:bg-white/10">
            <h2 className="text-2xl font-bold mb-3 flex items-center">
              <span className="mr-2">🎨</span>
              <span>Illustrator</span>
            </h2>
            
            <div className="mb-4">
              <span className="inline-block bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm mr-2">
                Contract
              </span>
              <span className="inline-block bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
                Remote
              </span>
            </div>
            
            <p className="text-md text-gray-200 mb-4">
              We&apos;re looking for a talented illustrator to help create customizable avatars for our users. You&apos;ll be working
              on designing characters that represent different career paths and personalities, helping our users visualize
              their future selves.
            </p>
            
            <h3 className="text-xl font-semibold mb-2">What you&apos;ll do:</h3>
            <ul className="list-disc pl-6 text-gray-300 space-y-1 mb-4">
              <li>Design customizable character illustrations for the Future U Avatar feature</li>
              <li>Create visual assets that represent different career paths and personalities</li>
              <li>Collaborate with our product team to bring the vision to life</li>
              <li>Help establish a cohesive visual identity for the Future U platform</li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-2">Requirements:</h3>
            <ul className="list-disc pl-6 text-gray-300 space-y-1 mb-6">
              <li>Strong portfolio demonstrating character design and illustration skills</li>
              <li>Experience with digital illustration tools (Figma, Adobe Illustrator, etc.)</li>
              <li>Ability to create modular character components for customization</li>
              <li>Great communication skills and ability to iterate based on feedback</li>
            </ul>
            
            <Link href="/careers/illustrator">
              <Button variant="yellow" className="w-full md:w-auto">
                Apply for Illustrator Position
              </Button>
            </Link>
          </div>
          
          {/* Animator Position */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 transition hover:bg-white/10">
            <h2 className="text-2xl font-bold mb-3 flex items-center">
              <span className="mr-2">✨</span>
              <span>Animator</span>
            </h2>
            
            <div className="mb-4">
              <span className="inline-block bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm mr-2">
                Contract
              </span>
              <span className="inline-block bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
                Remote
              </span>
            </div>
            
            <p className="text-md text-gray-200 mb-4">
              We&apos;re seeking a creative animator to help bring our visual timeline and avatar features to life. You&apos;ll create
              engaging animations that showcase users&apos; career paths and milestones in a visually compelling way.
            </p>
            
            <h3 className="text-xl font-semibold mb-2">What you&apos;ll do:</h3>
            <ul className="list-disc pl-6 text-gray-300 space-y-1 mb-4">
              <li>Create animations for our shareable timeline feature</li>
              <li>Develop micro-interactions and motion effects for the platform</li>
              <li>Animate character avatars with personality and flair</li>
              <li>Work with our development team to implement animations</li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-2">Requirements:</h3>
            <ul className="list-disc pl-6 text-gray-300 space-y-1 mb-6">
              <li>Experience with animation tools and techniques</li>
              <li>Knowledge of web animation capabilities and limitations</li>
              <li>Portfolio showcasing motion design work</li>
              <li>Understanding of UI/UX principles and how animation enhances user experience</li>
            </ul>
            
            <Link href="/careers/animator">
              <Button variant="yellow" className="w-full md:w-auto">
                Apply for Animator Position
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Contact Section */}
        <div className="mt-12 bg-yellow-900/20 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">Don&apos;t see the right fit?</h3>
          
          <p className="text-md mb-4">
            We&apos;re always looking for talented individuals to join our team. Reach out to us with your resume and tell us how
            you can contribute to Future U&apos;s mission!
          </p>
          
          <Link href="/contact">
            <Button variant="outline" className="w-full md:w-auto border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10">
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
