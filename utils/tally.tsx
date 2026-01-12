// Add TypeScript interface for the Tally window object
declare global {
  interface Window {
    Tally?: {
      loadEmbeds: () => void;
    };
  }
}

// Shared component for embedding Tally forms
import { useEffect } from 'react';
import Script from 'next/script';

interface TallyEmbedProps {
  formId: string;
  title: string;
}

export function TallyEmbed({ formId, title }: TallyEmbedProps) {
  useEffect(() => {
    // Load Tally script dynamically
    const loadTally = async () => {
      if (window.Tally) {
        window.Tally.loadEmbeds();
      }
    };
    
    loadTally();
    
    // Attempt to reload embeds when visibility changes
    // This helps with forms loading when returning to the page
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && window.Tally) {
        window.Tally.loadEmbeds();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="h-screen w-full overflow-hidden">
      <iframe 
        data-tally-src={`https://tally.so/r/${formId}`} 
        width="100%" 
        height="100%" 
        frameBorder="0"
        className="w-full h-full"
        title={title}
      ></iframe>
      <Script src="https://tally.so/widgets/embed.js" strategy="afterInteractive" />
    </div>
  );
}


