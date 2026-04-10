'use client'

import { useEffect } from 'react'
import { Instagram } from 'lucide-react'

const InstagramGallery = () => {
  useEffect(() => {
    // Charger le script Lightwidget
    const script = document.createElement('script')
    script.src = 'https://cdn.lightwidget.com/widgets/lightwidget.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      // Nettoyer le script lors du démontage du composant
      document.body.removeChild(script)
    }
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

      {/* LightWidget WIDGET */}
      <div className="mb-8">
        <iframe
          src="//lightwidget.com/widgets/caf67b0528575e0aa322c58018136e86.html"
          scrolling="no"
          allowTransparency
          className="lightwidget-widget w-full border-0 overflow-hidden"
          style={{ height: '400px' }}
        />
      </div>
    </div>
  )
}

export default InstagramGallery
