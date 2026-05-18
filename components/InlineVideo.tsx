'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'

interface Props {
  youtubeUrl: string
  /** Fallback shown when URL can't be parsed (rare). */
  fallback?: React.ReactNode
  className?: string
}

// Accepts: youtube.com/embed/ID, youtu.be/ID, youtube.com/watch?v=ID, youtube.com/shorts/ID
function extractVideoId(url: string): string | null {
  const m = url.match(/(?:embed\/|v=|youtu\.be\/|shorts\/)([\w-]{11})/)
  return m ? m[1] : null
}

/**
 * Lite YouTube embed — shows a static thumbnail by default; replaces with
 * the actual iframe (autoplay-muted-looped) on first click. Avoids loading
 * a heavy iframe for every exercise card on first render.
 */
export default function InlineVideo({ youtubeUrl, fallback = null, className = '' }: Props) {
  const [activated, setActivated] = useState(false)
  const videoId = extractVideoId(youtubeUrl)

  if (!videoId) return <>{fallback}</>

  // hqdefault: 480x360, always exists. maxresdefault may 404 for some videos.
  const thumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
  const embed = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=1&rel=0&playsinline=1&modestbranding=1`

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gray-200 aspect-video ${className}`}>
      {activated ? (
        <iframe
          src={embed}
          title="Exercise demo"
          className="absolute inset-0 w-full h-full"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <button
          type="button"
          onClick={() => setActivated(true)}
          className="absolute inset-0 group block"
          aria-label="Play exercise demo"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumb}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 group-active:bg-black/45 transition-colors flex items-center justify-center">
            <div className="bg-white/95 rounded-full p-3 shadow-lg group-active:scale-95 transition-transform">
              <Play size={20} fill="#000" className="text-black translate-x-0.5" />
            </div>
          </div>
        </button>
      )}
    </div>
  )
}
