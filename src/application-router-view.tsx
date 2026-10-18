import { useEffect, useRef, useState, type ComponentType } from 'react'
import { useIsFetching, useQueryClient } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import type { router } from './router'

type LoadingSceneProps = { onReady: () => void }

const STARTUP_GRACE_MS = 240
const MIN_LOADING_MS = 650
const MAX_LOADING_MS = 2800
const EXIT_ANIMATION_MS = 380

export function ApplicationRouterView({ router: appRouter }: { router: typeof router }) {
  const isFetching = useIsFetching()
  const queryClient = useQueryClient()
  const startedAt = useRef(Date.now())
  const hardTimeoutRef = useRef<number | null>(null)
  const [LoadingScene, setLoadingScene] = useState<ComponentType<LoadingSceneProps> | null>(null)
  const [sceneReadyAt, setSceneReadyAt] = useState<number | null>(null)
  const [showLoading, setShowLoading] = useState(true)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    let active = true
    let finishTimeout = 0
    hardTimeoutRef.current = window.setTimeout(() => {
      document.getElementById('boot-loader')?.remove()
      setIsLeaving(true)
      finishTimeout = window.setTimeout(() => setShowLoading(false), EXIT_ANIMATION_MS)
    }, MAX_LOADING_MS)

    const startupDelay = window.setTimeout(() => {
      if (queryClient.isFetching() === 0) {
        document.getElementById('boot-loader')?.remove()
        if (hardTimeoutRef.current !== null) window.clearTimeout(hardTimeoutRef.current)
        setShowLoading(false)
        return
      }

      import('./features/loading/ThreeNftLoadingScene')
        .then(({ ThreeNftLoadingScene }) => {
          if (active) setLoadingScene(() => ThreeNftLoadingScene)
        })
        .catch(() => {
          if (!active) return
          document.getElementById('boot-loader')?.remove()
          if (hardTimeoutRef.current !== null) window.clearTimeout(hardTimeoutRef.current)
          setShowLoading(false)
        })
    }, STARTUP_GRACE_MS)

    return () => {
      active = false
      window.clearTimeout(startupDelay)
      if (hardTimeoutRef.current !== null) window.clearTimeout(hardTimeoutRef.current)
      window.clearTimeout(finishTimeout)
    }
  }, [queryClient])

  useEffect(() => {
    if (sceneReadyAt === null || isFetching > 0 || !showLoading) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const minimum = reducedMotion ? 350 : MIN_LOADING_MS
    const exitAfter = Math.max(0, minimum - (Date.now() - startedAt.current))
    let finishTimeout = 0
    const beginExit = window.setTimeout(() => {
      setIsLeaving(true)
      finishTimeout = window.setTimeout(() => setShowLoading(false), reducedMotion ? 0 : EXIT_ANIMATION_MS)
    }, exitAfter)

    return () => {
      window.clearTimeout(beginExit)
      window.clearTimeout(finishTimeout)
    }
  }, [isFetching, sceneReadyAt, showLoading])

  const handleSceneReady = () => {
    document.getElementById('boot-loader')?.remove()
    setSceneReadyAt((current) => current ?? Date.now())
  }

  return (
    <>
      <RouterProvider router={appRouter} />
      {showLoading && LoadingScene && (
        <div className={`loading-experience ${isLeaving ? 'loading-experience--leaving' : ''}`}>
          <LoadingScene onReady={handleSceneReady} />
        </div>
      )}
    </>
  )
}
