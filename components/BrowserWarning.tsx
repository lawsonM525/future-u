'use client';

import { useEffect, useState, useMemo } from 'react';
import { isBrowserSafe } from '@/app/utils/browserDetection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export function BrowserWarning(): JSX.Element | null {
  const [isUnsafeBrowser, setIsUnsafeBrowser] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent;
      setIsUnsafeBrowser(!isBrowserSafe(userAgent));
    }
    // No return value needed for this effect
  }, []);

  // Reset copy status after 3 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
    // Return undefined for paths where we don't need cleanup
    return undefined;
  }, [copied]);

  const ua = typeof window !== 'undefined' ? window.navigator.userAgent : ''
  const appName = useMemo(() => {
    const map: Array<{ token: RegExp, name: string }> = [
      { token: /LinkedIn/i, name: 'LinkedIn' },
      { token: /Instagram/i, name: 'Instagram' },
      { token: /FBAV|FBAN|FB_IAB|FB4A/i, name: 'Facebook' },
      { token: /Twitter|X-Client/i, name: 'Twitter/X' },
      { token: /TikTok/i, name: 'TikTok' },
      { token: /Snapchat/i, name: 'Snapchat' },
      { token: /Pinterest/i, name: 'Pinterest' },
      { token: /WhatsApp/i, name: 'WhatsApp' },
      { token: /WeChat/i, name: 'WeChat' },
      { token: /Line/i, name: 'LINE' },
    ]
    const hit = map.find(m => m.token.test(ua))
    return hit?.name || null
  }, [ua])

  // Don't render anything if the browser is safe or user dismissed
  if (!isUnsafeBrowser || dismissed) {
    return null;
  }

  const copyLinkToClipboard = (): void => {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopied(true);
        toast({
          title: "Link copied!",
          description: "You can now paste it or click 'Open in Browser' within the app you're in",
          duration: 3000,
        });
      })
      .catch(err => {
        console.error('Failed to copy URL:', err);
        // Still provide feedback even if clipboard fails
        setCopied(true);
      });
  };

  const tryOpenExternally = (): void => {
    try {
      const href = window.location.href
      const isAndroid = /Android/i.test(ua)
      const isIOS = /iPhone|iPad|iPod/i.test(ua)

      if (isAndroid) {
        // Attempt Chrome intent to break out of in-app browser
        const url = new URL(href)
        const intent = `intent://${url.host}${url.pathname}${url.search}#Intent;scheme=${url.protocol.replace(':','')};package=com.android.chrome;end`
        // First try intent
        window.location.href = intent
        // Fallback: open in new tab
        setTimeout(() => { try { window.open(href, '_blank') } catch {} }, 400)
      } else if (isIOS) {
        // iOS cannot be forced; best effort open new tab and show guidance
        window.open(href, '_blank')
      } else {
        // Desktop or unknown — open in new tab
        window.open(href, '_blank')
      }
    } catch (e) {
      console.error('Open externally failed:', e)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-xl text-accent">Browser Compatibility Notice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            It looks like you&apos;re using an in-app browser{appName ? ` (${appName})` : ''}.
          </p>
          <p>Please open Future U in your device&apos;s
          standard browser (Chrome, Safari, Firefox, etc.) to continue.</p>
          <p className="text-sm opacity-80">
            In-app browsers can cause issues with authentication and saving your quiz progress.
          </p>
          {appName && (
            <div className="rounded-md bg-muted/50 p-3 text-sm">
              <p className="font-medium mb-1">How to open in your browser:</p>
              {appName === 'LinkedIn' && (<p>Tap the ⋯ menu in the top right and choose <span className="font-semibold">Open in external browser</span>.</p>)}
              {appName === 'Instagram' && (<p>Tap the ⋯ in the top right and select <span className="font-semibold">Open in system browser</span>.</p>)}
              {appName === 'Facebook' && (<p>Tap the ⋯ menu and choose <span className="font-semibold">Open in browser</span>.</p>)}
              {!['LinkedIn','Instagram','Facebook'].includes(appName) && (
                <p>Look for an <span className="font-semibold">Open in browser</span> option in the ⋯ menu.</p>
              )}
            </div>
          )}
          <div className="flex flex-col space-y-2 pt-2">
            <Button 
              onClick={tryOpenExternally}
              className="flex items-center justify-center gap-2"
            >
              <ExternalLink size={16} />
              Open in Browser
            </Button>
            <Button 
              onClick={copyLinkToClipboard}
              className="flex items-center justify-center gap-2"
              disabled={copied}
            >
              {copied ? (
                <>
                  <CheckCircle size={16} />
                  Link Copied!
                </>
              ) : (
                <>
                  <ExternalLink size={16} />
                  Copy Link to Clipboard
                </>
              )}
            </Button>
            {copied && (
              <p className="text-sm text-center mt-2 text-accent">
                You can now paste it or click &apos;Open in Browser&apos; within the app you&apos;re in
              </p>
            )}
            <Button
              variant="ghost"
              onClick={() => setDismissed(true)}
            >
              Continue here for now
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              You can re-open this page later in your main browser to keep everything working smoothly.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
