/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Future U — Your Future, Mapped Out'
export const size = { width: 800, height: 418 }
export const contentType = 'image/png'

export default function TwitterImage() {
  const { width, height } = size
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #000000 0%, #111111 100%)',
          color: '#fff',
          padding: 36,
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background:
                'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6), rgba(255,255,255,0) 60%), #fde047',
              boxShadow: '0 0 50px rgba(253, 224, 71, 0.5)',
            }}
          />
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>Future U</div>
        </div>

        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 10px',
          }}
        >
          <div
            style={{
              fontSize: 42,
              lineHeight: 1.15,
              whiteSpace: 'pre-wrap',
              textAlign: 'center',
              maxWidth: 800,
              color: 'rgba(255,255,255,0.95)',
              fontWeight: 800,
            }}
          >
            AI Career Strategy • Goals • Quests • Rewards
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)' }}>future-u.app</div>
        </div>
      </div>
    ),
    { width, height }
  )
}
