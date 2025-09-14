import { NextResponse } from 'next/server'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json({ error: 'Missing ELEVENLABS_API_KEY' }, { status: 500 })
    }

    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Expected multipart/form-data with a file field' }, { status: 400 })
    }

    const form = await request.formData()
    const file = form.get('file')
    const languageCode = (form.get('languageCode') as string | null) || undefined
    const diarize = form.get('diarize') === 'true'
    const tagAudioEvents = form.get('tagAudioEvents') === 'true'

    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: 'Invalid or missing file' }, { status: 400 })
    }

    const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY })

    // ElevenLabs SDK accepts a Blob/File directly
    const transcription = await client.speechToText.convert({
      file,
      modelId: 'scribe_v1',
      // Let language autodetect when not provided; otherwise pass explicit code (e.g., 'eng')
      languageCode,
      diarize,
      tagAudioEvents,
    })

    // Be defensive about response shape without using 'any'
    let text = ''
    const t = transcription as unknown
    if (t && typeof t === 'object') {
      const obj = t as Record<string, unknown>
      if (typeof obj.text === 'string') {
        text = obj.text
      } else if (Array.isArray(obj.segments)) {
        const segs = obj.segments as unknown[]
        text = segs
          .map((s) => {
            if (s && typeof s === 'object') {
              const ss = s as Record<string, unknown>
              return typeof ss.text === 'string' ? ss.text : ''
            }
            return ''
          })
          .join(' ')
          .trim()
      } else if (Array.isArray(obj.transcripts)) {
        const trs = obj.transcripts as unknown[]
        text = trs
          .map((u) => {
            if (u && typeof u === 'object') {
              const uu = u as Record<string, unknown>
              return typeof uu.text === 'string' ? uu.text : ''
            }
            return ''
          })
          .join(' ')
          .trim()
      }
    }

    return NextResponse.json({ text })
  } catch (err) {
    console.error('STT error:', err)
    return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: 500 })
  }
}
