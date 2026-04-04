const CACHE_NAME = 'ggt-crm-v1'
const urlsToCache = [
  '/',
  '/login',
  '/dashboard',
  '/manifest.json',
  '/logo.png',
]

// Installation du service worker
self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    })
  )
})

// Activation du service worker
self.addEventListener('activate', (event: any) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Interception des requêtes
self.addEventListener('fetch', (event: any) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retourner la version cached si elle existe
      if (response) {
        return response
      }

      // Sinon, faire la requête réseau
      return fetch(event.request).then((response) => {
        // Vérifier si la réponse est valide
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response
        }

        // Cloner la réponse pour la mettre en cache
        const responseToCache = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      }).catch(() => {
        // En cas d'erreur réseau, retourner une page offline
        return caches.match('/offline')
      })
    })
  )
})

// Sync des données offline
self.addEventListener('sync', (event: any) => {
  if (event.tag === 'sync-sessions') {
    event.waitUntil(syncSessions())
  }
})

async function syncSessions() {
  // Synchroniser les sessions créées offline
  try {
    const offlineData = await getOfflineData()
    for (const data of offlineData) {
      await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    }
    await clearOfflineData()
  } catch (error) {
    console.error('Error syncing sessions:', error)
  }
}

async function getOfflineData() {
  // Récupérer les données stockées en offline
  return []
}

async function clearOfflineData() {
  // Nettoyer les données synchronisées
}
