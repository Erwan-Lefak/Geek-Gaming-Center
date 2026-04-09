'use client'

import { useState, useEffect } from 'react'

interface PendingSyncItem {
  endpoint: string
  method: string
  data: any
  timestamp: number
}

export function useOffline() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [pendingSync, setPendingSync] = useState<PendingSyncItem[]>([])

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false)
      syncPendingData()
    }

    const handleOffline = () => {
      setIsOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Vérifier les données en attente de synchronisation
    checkPendingSync()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const checkPendingSync = () => {
    const pending = localStorage.getItem('pendingSync')
    if (pending) {
      try {
        const data = JSON.parse(pending)
        setPendingSync(data)
      } catch (error) {
        console.error('Error parsing pending sync:', error)
      }
    }
  }

  const syncPendingData = async () => {
    if (pendingSync.length === 0) return

    try {
      for (const item of pendingSync) {
        await fetch(item.endpoint, {
          method: item.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data),
        })
      }

      localStorage.removeItem('pendingSync')
      setPendingSync([])
    } catch (error) {
      console.error('Error syncing data:', error)
    }
  }

  const saveOffline = (endpoint: string, method: string, data: any) => {
    const pending = [...pendingSync, { endpoint, method, data, timestamp: Date.now() }]
    localStorage.setItem('pendingSync', JSON.stringify(pending))
    setPendingSync(pending)
  }

  return {
    isOffline,
    pendingSync,
    saveOffline,
    canSync: !isOffline && pendingSync.length > 0,
  }
}

// IndexDB pour stocker les données offline
export class OfflineStorage {
  private dbName = 'GGC_CRM_Offline'
  private version = 1

  async open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Créer les object stores
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('customers')) {
          db.createObjectStore('customers', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('invoices')) {
          db.createObjectStore('invoices', { keyPath: 'id' })
        }
      }
    })
  }

  async add(storeName: string, data: any): Promise<void> {
    const db = await this.open()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.add(data)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getAll(storeName: string): Promise<any[]> {
    const db = await this.open()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async delete(storeName: string, id: string): Promise<void> {
    const db = await this.open()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clear(storeName: string): Promise<void> {
    const db = await this.open()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

export const offlineStorage = new OfflineStorage()
