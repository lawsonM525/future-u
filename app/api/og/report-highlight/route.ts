/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og'
import React from 'react'

export const runtime = 'edge'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const text = (searchParams.get('text') || 'Future U Highlight').slice(0, 280)

  const root: React.ReactElement = React.createElement(
    'div',
    {
      style: {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#000000',
        color: 'white',
        padding: 48,
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
      } as React.CSSProperties,
    },
    [
      React.createElement(
        'div',
        { key: 'brand', style: { display: 'flex', alignItems: 'center', gap: 12 } as React.CSSProperties },
        [
          React.createElement('div', {
            key: 'dot',
            style: {
              width: 36,
              height: 36,
              borderRadius: 8,
              background:
                'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6), rgba(255,255,255,0) 60%), #22d3ee',
              boxShadow: '0 0 60px rgba(34,211,238,0.5)',
            } as React.CSSProperties,
          }),
          React.createElement(
            'div',
            { key: 'title', style: { fontSize: 24, fontWeight: 700, letterSpacing: -0.5 } as React.CSSProperties },
            'Future U'
          ),
        ]
      ),
      React.createElement(
        'div',
        {
          key: 'text-wrap',
          style: {
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 12px',
          } as React.CSSProperties,
        },
        React.createElement(
          'div',
          {
            key: 'text',
            style: {
              fontSize: 44,
              lineHeight: 1.2,
              whiteSpace: 'pre-wrap',
              textAlign: 'center',
              maxWidth: 1000,
              color: 'rgba(255,255,255,0.94)',
            } as React.CSSProperties,
          },
          text
        )
      ),
      React.createElement(
        'div',
        { key: 'footer', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } as React.CSSProperties },
        [
          React.createElement(
            'div',
            { key: 'cta', style: { fontSize: 20, color: 'rgba(255,255,255,0.6)' } as React.CSSProperties },
            'Share your progress'
          ),
          React.createElement(
            'div',
            { key: 'url', style: { fontSize: 18, color: 'rgba(255,255,255,0.7)' } as React.CSSProperties },
            'futureu.app'
          ),
        ]
      ),
    ]
  )

  return new ImageResponse(root, { width: 1200, height: 630 })
}
