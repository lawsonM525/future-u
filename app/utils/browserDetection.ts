/**
 * Utility functions for detecting browser types and in-app browsers
 */

// List of known in-app browser patterns
const IN_APP_BROWSER_PATTERNS = [
  'Instagram',
  'FBAV',
  'FBAN',
  'Twitter',
  'LinkedIn',
  'Line',
  'KAKAOTALK',
  'Snapchat',
  'Pinterest',
  'WhatsApp',
  'WeChat',
  'FB_IAB',
  'FB4A',
  'TikTok',
];

// List of safe browsers
const SAFE_BROWSERS = [
  'Chrome',
  'Firefox',
  'Safari',
  'Edge',
  'Opera',
  'Vivaldi',
  'Brave',
];

/**
 * Detects if the current browser is an in-app browser
 */
export function isInAppBrowser(userAgent: string): boolean {
  return IN_APP_BROWSER_PATTERNS.some(pattern => 
    userAgent.includes(pattern)
  );
}

/**
 * Checks if the browser is known to be secure for Google authentication
 */
export function isSafeBrowser(userAgent: string): boolean {
  return SAFE_BROWSERS.some(browser => 
    userAgent.includes(browser)
  );
}

/**
 * Determines if the current browser is suitable for FutureU
 * Returns true if the browser is safe to use
 */
export function isBrowserSafe(userAgent: string): boolean {
  // If it's a known safe browser and not an in-app browser
  if (isSafeBrowser(userAgent) && !isInAppBrowser(userAgent)) {
    return true;
  }
  
  // Additional check for WebView
  if (userAgent.includes('wv') || 
      userAgent.includes('WebView') ||
      (/Android/.test(userAgent) && /Version\//.test(userAgent) && /Chrome\//.test(userAgent))) {
    return false;
  }
  
  return !isInAppBrowser(userAgent);
}
