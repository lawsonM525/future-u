"use client"

import { useEffect, useState, useCallback, useRef } from 'react'

export type StrategyResourceResult = {
  title: string
  url: string
  snippet?: string
  author?: string | null
  publishedDate?: string | null
  favicon?: string
  image?: string
}

export type StrategyResourceItem = {
  text: string
  results: StrategyResourceResult[]
}

export type StrategyResourcesGroup = {
  title: string
  details: StrategyResourceItem[]
}

export function useStrategyResources(limit = 2) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [groups, setGroups] = useState<StrategyResourcesGroup[]>([])
  const mountedRef = useRef(true)

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/strategy-resources?limit=${encodeURIComponent(limit)}`)
      if (!res.ok) {
        if (res.status === 401 || res.status === 404) {
          if (mountedRef.current) setGroups([])
          return
        }
        const text = await res.text()
        throw new Error(text || 'Failed to load resources')
      }
      const json = await res.json()
      const arr = Array.isArray(json.strategies) ? json.strategies : []
      if (mountedRef.current) setGroups(arr)
    } catch (e) {
      if (mountedRef.current) setError('Could not load resources')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    mountedRef.current = true
    fetchResources()
    return () => { mountedRef.current = false }
  }, [fetchResources])

  return { loading, error, groups, refetch: fetchResources }
}
