import { auth } from '@/app/utils/authOptions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AvatarCreator from '@/components/AvatarCreator'
import { User } from '@/models/User'
import { Report } from '@/models/Report'
import { connect } from '@/lib/mongodb'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Connect to MongoDB and get user data
  await connect()
  const user = await User.findOne({ email: session.user.email })
  
  // Get the user's latest report
  const report = await Report.findOne({ 
    userId: session.user.id 
      }).sort({ createdAt: -1 })

  // Ensure we have the user's name
  const userName = session.user.name || 'User'
  const userEmail = session.user.email || ''

  // Placeholder timeline data
  const timelineEvents = [
    { date: '2025-04-01', title: 'Career Strategy Review', description: 'Review and update your career goals' },
    { date: '2025-05-15', title: 'Skills Assessment', description: 'Evaluate your progress in key skill areas' },
    { date: '2025-06-30', title: 'Networking Event', description: 'Virtual networking with industry professionals' },
  ]

  return (
    <div className="min-h-screen background text-zinc-400">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-12 bg-zinc-900 rounded-lg p-6">
          <div className="flex items-center space-x-6">
            <div>
              <AvatarCreator seed={userEmail} size={120} />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold text-yellow-400">{userName}</h1>
              <p className="text-zinc-500">{userEmail}</p>
              <Link
                href="/customize-avatar"
                className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black text-sm font-semibold px-3 py-0.5 rounded-full transition-colors mt-2"
              >
                Customize Character
              </Link>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-zinc-500">Member since</p>
            <p className="text-zinc-300">{new Date(user?.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Career Strategy Card */}
          <div className="bg-zinc-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-400 mb-4">Career Strategy</h2>
            <div className="space-y-4">
              {report ? (
                <>
                  <div className="mb-4">
                    <h3 className="font-semibold text-zinc-300">Your Journey</h3>
                  </div>
                  <Link 
                    href="/report/strategy"
                    className="block p-4 bg-zinc-800 rounded hover:bg-zinc-700 transition-colors"
                  >
                    <h3 className="font-semibold text-zinc-200">View Your Career Strategy</h3>
                    <p className="text-sm text-zinc-500">Access your personalized career roadmap</p>
                  </Link>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-zinc-500 mb-4">Take the career assessment to unlock your personalized strategy</p>
                  <Link 
                    href="/quiz"
                    className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-6 rounded transition-colors"
                  >
                    Start Assessment
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Timeline Card */}
          <div className="bg-zinc-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-400 mb-4">Your Timeline</h2>
            <div className="space-y-6">
              {timelineEvents.map((event, index) => (
                <div key={index} className="relative pl-4 border-l-2 border-zinc-700">
                  <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-yellow-500"></div>
                  <time className="text-sm text-yellow-500">{new Date(event.date).toLocaleDateString()}</time>
                  <h3 className="font-semibold text-zinc-300 mt-1">{event.title}</h3>
                  <p className="text-sm text-zinc-500">{event.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Resources Card */}
          <div className="bg-zinc-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-400 mb-4">Resources</h2>
            <div className="space-y-4">
              {report ? (
                <div className="space-y-4">
                  <Link 
                    href="/resources/skills"
                    className="block p-4 bg-zinc-800 rounded hover:bg-zinc-700 transition-colors"
                  >
                    <h3 className="font-semibold text-zinc-200">Skill Building</h3>
                    <p className="text-sm text-zinc-500">Resources to develop key skills</p>
                  </Link>
                  <Link 
                    href="/resources/networking"
                    className="block p-4 bg-zinc-800 rounded hover:bg-zinc-700 transition-colors"
                  >
                    <h3 className="font-semibold text-zinc-200">Networking</h3>
                    <p className="text-sm text-zinc-500">Connect with professionals in your field</p>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-500">
                  Complete the assessment to unlock career resources
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
