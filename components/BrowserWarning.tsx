'use client';

import { useEffect, useState } from 'react';
import { isBrowserSafe } from '@/app/utils/browserDetection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export function BrowserWarning(): JSX.Element | null {
  const [isUnsafeBrowser, setIsUnsafeBrowser] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // Don't render anything if the browser is safe
  if (!isUnsafeBrowser) {
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-xl text-accent">Browser Compatibility Notice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            It looks like you&apos;re using an in-app browser. 
          </p>
          <p>Please open Future U in your device&apos;s
          standard browser (Chrome, Safari, Firefox, etc.) to continue.</p>
          <p className="text-sm opacity-80">
            In-app browsers can cause issues with authentication and other features. :/
          </p>
          <div className="flex flex-col space-y-2 pt-2">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
