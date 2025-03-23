'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen px-4 py-8 md:px-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center text-yellow-500 hover:text-yellow-600 transition mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span>Back to Home</span>
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-10 text-center">Cookie Policy</h1>
        
        <div className="prose prose-invert prose-yellow max-w-none">
          <p className="text-lg mb-6">
            Last updated: March 23, 2025
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Introduction</h2>
          <p>
            Future U ("we," "our," or "us") uses cookies and similar technologies on our website. This Cookie Policy explains how we use cookies, how they help us provide you with a better experience, and what choices you have regarding their use.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">What Are Cookies?</h2>
          <p>
            Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit our website. They allow us to recognize your device and remember certain information about your visit, such as your preferences and actions on our site. Cookies are widely used to make websites work more efficiently and provide valuable information to website owners.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Cookies</h2>
          <p>
            Future U uses cookies for several purposes, including:
          </p>
          
          <ul className="list-disc pl-6 mb-6">
            <li><strong>Authentication:</strong> We use cookies to identify you when you visit our website and as you navigate through pages. This helps us secure your account and provide personalized experiences.</li>
            <li><strong>Session Management:</strong> We use cookies to maintain your session state across our website, allowing you to remain logged in as you navigate between pages.</li>
            <li><strong>Preferences:</strong> We use cookies to remember information about how you prefer the site to behave and look.</li>
            <li><strong>Analytics:</strong> We use cookies to help us understand how visitors interact with our website, which pages are visited most often, and how users navigate through the site.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Types of Cookies We Use</h2>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">Essential Cookies</h3>
          <p>
            These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and account access. You cannot opt out of these cookies.
          </p>
          <table className="w-full border-collapse mb-6">
            <thead>
              <tr className="bg-white/5">
                <th className="border border-zinc-700 p-2 text-left">Cookie Name</th>
                <th className="border border-zinc-700 p-2 text-left">Purpose</th>
                <th className="border border-zinc-700 p-2 text-left">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-zinc-700 p-2">next-auth.session-token</td>
                <td className="border border-zinc-700 p-2">Used by NextAuth.js to maintain your authentication session</td>
                <td className="border border-zinc-700 p-2">Session / 30 days</td>
              </tr>
              <tr>
                <td className="border border-zinc-700 p-2">next-auth.callback-url</td>
                <td className="border border-zinc-700 p-2">Used by NextAuth.js to redirect after authentication</td>
                <td className="border border-zinc-700 p-2">Session</td>
              </tr>
              <tr>
                <td className="border border-zinc-700 p-2">next-auth.csrf-token</td>
                <td className="border border-zinc-700 p-2">Used by NextAuth.js to prevent CSRF attacks</td>
                <td className="border border-zinc-700 p-2">Session</td>
              </tr>
            </tbody>
          </table>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">Functional Cookies</h3>
          <p>
            These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.
          </p>
          <table className="w-full border-collapse mb-6">
            <thead>
              <tr className="bg-white/5">
                <th className="border border-zinc-700 p-2 text-left">Cookie Name</th>
                <th className="border border-zinc-700 p-2 text-left">Purpose</th>
                <th className="border border-zinc-700 p-2 text-left">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-zinc-700 p-2">user_preferences</td>
                <td className="border border-zinc-700 p-2">Stores user interface preferences</td>
                <td className="border border-zinc-700 p-2">1 year</td>
              </tr>
            </tbody>
          </table>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">Analytics Cookies</h3>
          <p>
            These cookies collect information about how visitors use our website, which pages visitors go to most often, and if they get error messages from web pages. These cookies don't collect information that identifies a visitor.
          </p>
          <table className="w-full border-collapse mb-6">
            <thead>
              <tr className="bg-white/5">
                <th className="border border-zinc-700 p-2 text-left">Cookie Name</th>
                <th className="border border-zinc-700 p-2 text-left">Purpose</th>
                <th className="border border-zinc-700 p-2 text-left">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-zinc-700 p-2">_ga</td>
                <td className="border border-zinc-700 p-2">Google Analytics cookie used to distinguish users</td>
                <td className="border border-zinc-700 p-2">2 years</td>
              </tr>
              <tr>
                <td className="border border-zinc-700 p-2">_ga_[ID]</td>
                <td className="border border-zinc-700 p-2">Google Analytics cookie used to persist session state</td>
                <td className="border border-zinc-700 p-2">2 years</td>
              </tr>
            </tbody>
          </table>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Third-Party Cookies</h2>
          <p>
            In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the service and deliver advertisements on and through the service.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">How NextAuth.js Uses Cookies</h2>
          <p>
            Future U uses NextAuth.js for authentication. NextAuth.js sets several cookies to manage user sessions:
          </p>
          
          <ul className="list-disc pl-6 mb-6">
            <li><strong>Session Token:</strong> This cookie contains an encrypted JWT (JSON Web Token) with information about your current session. It's used to keep you logged in.</li>
            <li><strong>CSRF Token:</strong> This cookie helps protect against Cross-Site Request Forgery attacks by ensuring requests come from legitimate sources.</li>
            <li><strong>Callback URL:</strong> This cookie remembers where to redirect you after authentication.</li>
          </ul>
          
          <p>
            These cookies are essential for the secure functioning of our authentication system and cannot be disabled while using our services that require authentication.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Managing Cookies</h2>
          <p>
            Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience and/or lose access to certain functionalities on our website.
          </p>
          
          <p>
            To manage cookies in different browsers, please refer to the following links:
          </p>
          
          <ul className="list-disc pl-6 mb-6">
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-yellow-500 hover:text-yellow-400">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-yellow-500 hover:text-yellow-400">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-yellow-500 hover:text-yellow-400">Safari</a></li>
            <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-yellow-500 hover:text-yellow-400">Microsoft Edge</a></li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Changes to This Cookie Policy</h2>
          <p>
            We may update our Cookie Policy from time to time. We will notify you of any changes by posting the new Cookie Policy on this page and updating the "Last updated" date at the top of this page.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
          <p className="mb-12">
            If you have any questions about our Cookie Policy, please contact us by visiting our <Link href="/contact" className="text-yellow-500 hover:text-yellow-400">Contact page</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
