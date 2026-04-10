'use client'

import { useEffect } from 'react'
import { Instagram } from 'lucide-react'

const InstagramGallery = () => {
  useEffect(() => {
    // Charger le script Behold Widget
    const script = document.createElement('script')
    script.type = 'module'
    script.src = 'https://w.behold.so/widget.js'
    document.head.appendChild(script)

    return () => {
      // Nettoyer le script lors du démontage du composant
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
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

      {/* Behold Widget */}
      <div className="mb-8">
        <div data-behold-id="um185St4ezNoLMgDIctg"></div>
      </div>
    </div>
  )
}

export default InstagramGallery
