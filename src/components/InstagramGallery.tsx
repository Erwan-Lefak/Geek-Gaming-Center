'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Instagram } from 'lucide-react'

interface MediaItem {
  id: string
  type: string
  url: string
  thumbnail: string
  caption: string
  permalink: string
  timestamp: string
}

const InstagramGallery = () => {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchInstagramMedia() {
      try {
        const response = await fetch('/api/instagram')
        const data = await response.json()

        if (data.media && data.media.length > 0) {
          setMedia(data.media)
        } else {
          setError(true)
        }
      } catch (err) {
        console.error('Error fetching Instagram:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchInstagramMedia()
  }, [])

  return (
    <div className="w-full">
      <a
        href="https://www.instagram.com/ggc_cameroun/"
        target="_blank"
        rel="noopener noreferrer"
        className="block mb-8 text-center"
      >
        <Instagram className="w-8 h-8 text-pink-500 mx-auto mb-2" />
        <h3 className="text-2xl md:text-3xl font-bold text-white uppercase italic">
          Suivez nous sur Instagram
        </h3>
        <p className="text-white/70">@ggc_cameroun</p>
      </a>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-slate-800 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : error || media.length === 0 ? (
        <div className="text-center py-12">
          <Instagram className="w-16 h-16 text-pink-500 mx-auto mb-4" />
          <p className="text-white/70 mb-4">
            Retrouvez-nous sur Instagram pour voir nos dernières actualités
          </p>
          <a
            href="https://www.instagram.com/ggc_cameroun/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-bold uppercase rounded-lg hover:opacity-90 transition-opacity"
          >
            <Instagram className="w-5 h-5" />
            @ggc_cameroun
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 mb-8">
          {media.map((item) => (
            <a
              key={item.id}
              href={item.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="aspect-square relative overflow-hidden rounded-lg group hover:opacity-90 transition-opacity"
            >
              <Image
                src={item.thumbnail}
                alt={item.caption || 'Instagram post'}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              {item.type === 'VIDEO' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                    <svg className="w-6 h-6 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

export default InstagramGallery
