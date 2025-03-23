import Link from 'next/link'

export function Footer() {
  return (
    <footer className="w-full py-6 px-4 mt-auto border-t border-zinc-800">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-4">
            <h3 className="text-zinc-400 font-semibold">About</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/why-futureu" className="text-zinc-500 hover:text-zinc-300 text-sm font-light">
                  Why FutureU?
                </Link>
              </li>
              <li>
                <Link href="/team" className="text-zinc-500 hover:text-zinc-300 text-sm font-light">
                  The Team
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-zinc-500 hover:text-zinc-300 text-sm font-light">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-zinc-400 font-semibold">1% Better Daily</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/roadmap" className="text-zinc-500 hover:text-zinc-300 text-sm font-light">
                  Future U Roadmap
                </Link>
              </li>
              <li>
                <Link href="/feature-requests" className="text-zinc-500 hover:text-zinc-300 text-sm font-light">
                  Request a feature
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-zinc-400 font-semibold">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-zinc-500 hover:text-zinc-300 text-sm font-light">
                  Shoot us a message
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-zinc-500 hover:text-zinc-300 text-sm font-light">
                  FAQ
                </Link>
              </li>
              
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-zinc-400 font-semibold">Policies</h3>
            <ul className="space-y-2">
              
              <li>
                <Link href="/cookies" className="text-zinc-500 hover:text-zinc-300 text-sm font-light">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-zinc-800">
          <p className="text-center text-zinc-500 text-sm font-light">
            Copyright © {new Date().getFullYear()} FutureU by Michelle Lawson. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
