'use client'

export default function FeatureRequest() {
  return (
    <div className="h-screen w-full overflow-hidden">
      <iframe 
        data-tally-src="https://tally.so/r/wA97Gk" 
        width="100%" 
        height="100%" 
        frameBorder="0"
        className="w-full h-full"
        title="Feature requests - Future U"
      ></iframe>
      <script async src="https://tally.so/widgets/embed.js"></script>
    </div>
  )
}
