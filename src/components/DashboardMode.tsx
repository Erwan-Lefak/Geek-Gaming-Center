'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function DashboardMode() {
  const pathname = usePathname()

  useEffect(() => {
    const isDashboard = pathname?.startsWith('/dashboard')

    // NE PAS cacher le main quand on est sur le dashboard
    // Le dashboard a son propre layout qui gère l'affichage
    if (isDashboard) {
      // Sur le dashboard, on cache seulement le header et footer du site public
      const header = document.querySelector('header.dashboard-hidden')
      const footer = document.querySelector('footer.dashboard-hidden')

      header?.setAttribute('hidden', 'true')
      footer?.setAttribute('hidden', 'true')

      // S'assurer que le main est visible
      const main = document.querySelector('main.dashboard-hidden')
      main?.removeAttribute('hidden')
    } else {
      // Hors dashboard, tout est visible
      const elements = document.querySelectorAll('.dashboard-hidden')
      elements.forEach(el => {
        el.removeAttribute('hidden')
      })
    }
  }, [pathname])

  return null
}
