'use client'

import { motion } from 'framer-motion'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Mic, Square, Loader2 } from 'lucide-react'
import { QuizQuestion as QuizQuestionType } from '@/lib/quiz-data'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useSound } from '@/hooks/useSound'

interface QuizQuestionProps {
  question: QuizQuestionType
  answer: string
  onAnswerChange: (answer: string) => void
  onNext: () => void
  onPrevious: () => void
  onSkip: () => void
  canGoNext: boolean
  canGoPrevious: boolean
  isLastQuestion: boolean
  currentIndex: number
  totalQuestions: number
}

const questionVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95
  }),
  animate: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
      opacity: { duration: 0.2 }
    }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
      opacity: { duration: 0.2 }
    }
  })
}

export function QuizQuestion({
  question,
  answer,
  onAnswerChange,
  onNext,
  onPrevious,
  onSkip,
  canGoNext,
  canGoPrevious,
  isLastQuestion,
  currentIndex,
  totalQuestions
}: QuizQuestionProps) {
  const direction = 1 // You can track this in parent component for proper direction
  const { play } = useSound()

  // Microphone recording + STT (ElevenLabs via /api/stt)
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])

  const getSupportedMimeType = useCallback((): string => {
    if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') return ''
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4;codecs=mp4a.40.2',
      'audio/mpeg',
      'audio/ogg;codecs=opus',
    ]
    for (const t of candidates) {
      try {
        if (MediaRecorder.isTypeSupported(t)) return t
      } catch {}
    }
    return ''
  }, [])

  const transcribeBlob = useCallback(async (blob: Blob) => {
    setIsTranscribing(true)
    try {
      const form = new FormData()
      const ext = blob.type.includes('mp4') ? 'mp4' : blob.type.includes('mpeg') ? 'mp3' : blob.type.includes('ogg') ? 'ogg' : 'webm'
      form.append('file', blob, `recording.${ext}`)
      form.append('tagAudioEvents', 'true')
      form.append('diarize', 'false')
      // languageCode left unset for autodetect; could set to 'eng'

      const res = await fetch('/api/stt', { method: 'POST', body: form })
      const data = await res.json().catch(() => ({})) as { text?: string; error?: string }
      if (!res.ok) throw new Error(data?.error || 'Failed to transcribe')

      const text = (data.text || '').trim()
      if (text) {
        const next = answer?.trim() ? `${answer.trim()} ${text}` : text
        onAnswerChange(next)
      }
    } catch (e) {
      console.error('Transcription failed:', e)
    } finally {
      setIsTranscribing(false)
    }
  }, [answer, onAnswerChange])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = getSupportedMimeType()
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } as MediaRecorderOptions : undefined)
      mediaRecorderRef.current = mr
      chunksRef.current = []
      mr.ondataavailable = (evt: BlobEvent) => {
        if (evt.data && evt.data.size > 0) chunksRef.current.push(evt.data)
      }
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' })
        // stop tracks
        try { stream.getTracks().forEach(t => t.stop()) } catch {}
        await transcribeBlob(blob)
      }
      mr.start()
      setIsRecording(true)
    } catch (e) {
      console.error('Mic permission/recording error:', e)
    }
  }, [getSupportedMimeType, transcribeBlob])

  const stopRecording = useCallback(() => {
    const mr = mediaRecorderRef.current
    if (mr && mr.state !== 'inactive') {
      try { mr.stop() } catch {}
    }
    setIsRecording(false)
  }, [])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && canGoNext) {
      e.preventDefault()
      try { play('ding') } catch {}
      onNext()
    }
  }

  const wordCount = answer.trim().split(/\s+/).filter(word => word.length > 0).length
  const maxWords = question.maxWords || 100
  const isOverLimit = wordCount > maxWords

  // Autofocus management for textarea on question change
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    const id = window.setTimeout(() => {
      try {
        el.focus()
        const len = el.value.length
        el.setSelectionRange(len, len)
      } catch {}
    }, 60) // allow small delay for animation
    return () => window.clearTimeout(id)
  }, [question.id])

  return (
    <motion.div
      key={question.id}
      custom={direction}
      variants={questionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      {/* Question Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <h2 className="text-2xl font-bold text-foreground">
          {question.prompt}
        </h2>
        {question.helpText && (
          <p className="text-sm text-muted-foreground">{question.helpText}</p>
        )}
      </motion.div>

      {/* Answer Input */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <Textarea
          ref={textareaRef}
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={question.placeholder || `Your answer (1-${maxWords} words)`}
          className="min-h-[150px] resize-none focus:ring-2 focus:ring-accent transition-all"
          aria-label={`Answer for: ${question.prompt}`}
        />

        {/* Mic toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={isRecording ? 'destructive' : 'outline'}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isTranscribing}
              aria-label={isRecording ? 'Stop recording' : 'Record with microphone'}
            >
              {isRecording ? (
                <>
                  <Square className="mr-2 h-4 w-4" /> Stop
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" /> Speak
                </>
              )}
            </Button>
            {isRecording && (
              <span className="text-xs text-rose-400 animate-pulse">Recording…</span>
            )}
            {isTranscribing && (
              <span className="flex items-center text-xs text-muted-foreground">
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> Transcribing…
              </span>
            )}
          </div>
        </div>
        
        {/* Word Count */}
        <motion.div 
          className="flex justify-between items-center text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className={`${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
            {wordCount} / {maxWords} words
          </span>
          {answer.trim() && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-accent font-medium"
            >
              {canGoNext ? '✓ Ready' : 'Keep writing...'}
            </motion.span>
          )}
        </motion.div>

        {/* Optional Multiple-Choice Options */}
        {Array.isArray(question.options) && question.options.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="flex flex-wrap gap-2 pt-1"
          >
            {question.options.map((opt) => {
              // Determine if option is currently present in answer (comma/semicolon separated)
              const tokens = answer
                .split(/[;,]/)
                .map(t => t.trim())
                .filter(Boolean)
              const selected = tokens.some(t => t.toLowerCase() === opt.toLowerCase())

              const toggle = () => {
                let nextTokens = tokens.slice()
                if (selected) {
                  nextTokens = nextTokens.filter(t => t.toLowerCase() !== opt.toLowerCase())
                } else {
                  nextTokens.push(opt)
                }

                // If the textarea also has free text beyond tokens, preserve it.
                // Best-effort: remove token portion from the end if it looks tokenized; otherwise, just use tokens joined.
                const nextValue = nextTokens.join(', ')
                onAnswerChange(nextValue)
              }

              return (
                <Button
                  key={opt}
                  type="button"
                  size="sm"
                  variant={selected ? 'default' : 'outline'}
                  className={selected ? 'bg-accent text-accent-foreground hover:bg-accent/90' : ''}
                  onClick={toggle}
                  aria-pressed={selected}
                >
                  {opt}
                </Button>
              )
            })}
          </motion.div>
        )}
      </motion.div>

      {/* Navigation Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 items-center gap-3 sm:flex sm:justify-between sm:gap-4"
      >
        <Button
          onClick={onPrevious}
          disabled={!canGoPrevious}
          variant="outline"
          className="group"
        >
          <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Previous
        </Button>

        <span className="col-span-2 row-start-1 text-center text-sm text-muted-foreground sm:order-none">
          Question {currentIndex} of {totalQuestions}
        </span>

        <div className="flex min-w-0 items-center justify-end gap-1 sm:gap-2">
          <Button
            onClick={onSkip}
            variant="ghost"
            className="group px-2 sm:px-4"
            aria-label="Skip this question"
          >
            Skip
          </Button>
          <Button
            onClick={() => { try { play('ding') } catch {} ; onNext() }}
            disabled={!canGoNext}
            className="bg-accent text-accent-foreground hover:bg-accent/90 group px-3 sm:px-4"
          >
            {isLastQuestion ? 'Finish' : 'Next'}
            {!isLastQuestion && (
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            )}
          </Button>
        </div>
      </motion.div>

      {/* Keyboard Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-center text-muted-foreground"
      >
        Press <kbd className="px-2 py-1 text-xs bg-muted rounded">Enter</kbd> to continue
      </motion.p>
    </motion.div>
  )
}