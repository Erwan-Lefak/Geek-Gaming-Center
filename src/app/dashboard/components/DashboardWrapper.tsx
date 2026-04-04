'use client'

import { useEffect, useState } from 'react'

export function DashboardWrapper({ user }: { user: { name: string; role: string; email: string } }) {
  useEffect(() => {
    // Stocker les infos utilisateur pour le layout
    localStorage.setItem('user', JSON.stringify(user))
  }, [user])

  return null
}
