'use client';

import { useEffect, useState } from 'react';
import { isBrowserSafe } from '@/app/utils/browserDetection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export function BrowserWarning() {
  const [isUnsafeBrowser, setIsUnsafeBrowser] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent;
      setIsUnsafeBrowser(!isBrowserSafe(userAgent));
    }
  }, []);

  // Don't render anything if the browser is safe or the warning is dismissed
  if (!isUnsafeBrowser || !isVisible) {
    return null;
  }

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
              onClick={() => {
                // Copy the current URL
                const url = window.location.href;
                navigator.clipboard.writeText(url).catch(err => console.error('Failed to copy URL:', err));
                alert('URL copied to clipboard! Please paste it in your browser.');
              }}
              className="flex items-center justify-center gap-2"
            >
              <ExternalLink size={16} />
              Copy Link to Clipboard
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsVisible(false)}
              className="mt-2"
            >
              Dismiss Warning
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
