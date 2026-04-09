import { NextRequest, NextResponse } from 'next/server'

// Configuration n8n avec RAG
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/chatbot-rag'
const N8N_API_KEY = process.env.N8N_API_KEY
const N8N_TIMEOUT = 30000 // 30 secondes

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { message, history } = await request.json()

    // Validation
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        {
          error: 'Message requis',
          message: "Veuillez entrer un message valide.",
        },
        { status: 400 }
      )
    }

    if (message.trim().length === 0) {
      return NextResponse.json(
        {
          error: 'Message vide',
          message: "Votre message est vide. Que puis-je faire pour vous ?",
        },
        { status: 400 }
      )
    }

    // Extraire les metadata
    const sessionId = request.headers.get('x-session-id') || generateSessionId()
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Préparer le payload enrichi pour n8n RAG
    const n8nPayload = {
      message: message.trim(),
      history: history || [],
      timestamp: new Date().toISOString(),
      sessionId,
      userAgent,
      metadata: {
        source: 'geek-gaming-website',
        version: '2.0.0-rag',
      },
    }

    console.log('[RAG Chat] Sending to n8n:', {
      message: n8nPayload.message,
      sessionId,
      historyLength: n8nPayload.history.length,
    })

    // Appeler le webhook n8n avec timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), N8N_TIMEOUT)

    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(N8N_API_KEY && { 'Authorization': `Bearer ${N8N_API_KEY}` }),
        'X-Session-ID': sessionId,
      },
      body: JSON.stringify(n8nPayload),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId))

    const responseTime = Date.now() - startTime

    // Gestion des erreurs HTTP
    if (!n8nResponse.ok) {
      console.error('[RAG Chat] n8n HTTP error:', {
        status: n8nResponse.status,
        statusText: n8nResponse.statusText,
        responseTime,
      })

      const errorText = await n8nResponse.text()
      console.error('[RAG Chat] n8n error body:', errorText)

      // Retourner une réponse de secours enrichie
      return NextResponse.json({
        message: getFallbackResponse(message),
        error: true,
        fallback: true,
        responseTime,
        timestamp: new Date().toISOString(),
      })
    }

    const n8nData = await n8nResponse.json()
    console.log('[RAG Chat] n8n response:', {
      messagePreview: n8nData.message?.substring(0, 100),
      model: n8nData.model,
      contextUsed: n8nData.contextUsed,
      responseTime,
    })

    // Retourner la réponse enrichie de n8n avec métadonnées RAG
    return NextResponse.json({
      message: n8nData.message || n8nData.output || n8nData.text || 'Réponse reçue',
      metadata: {
        model: n8nData.model || 'rag-glm5',
        contextUsed: n8nData.contextUsed ?? true,
        responseTime,
        sessionId,
        timestamp: n8nData.timestamp || new Date().toISOString(),
      },
    })

  } catch (error) {
    const responseTime = Date.now() - startTime

    // Timeout handling
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[RAG Chat] Timeout error:', {
        url: N8N_WEBHOOK_URL,
        timeout: N8N_TIMEOUT,
      })

      return NextResponse.json(
        {
          message: "⏱️ Le chatbot met du temps à répondre. Veuillez réessayer ou nous contacter directement.",
          error: true,
          fallback: true,
          timeout: true,
          responseTime,
        },
        { status: 504 }
      )
    }

    // Generic error handling
    console.error('[RAG Chat] Unexpected error:', {
      error: error instanceof Error ? error.message : String(error),
      responseTime,
    })

    return NextResponse.json(
      {
        message: getFallbackResponse("") + "\n\n⚠️ Le service de chatbot est temporairement indisponible.",
        error: true,
        fallback: true,
        responseTime,
      },
      { status: 500 }
    )
  }
}

// Générateur de Session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Réponses de secours si n8n ne répond pas
function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase()

  // Horaires
  if (lowerMessage.includes('horaire') || lowerMessage.includes('ouvert') || lowerMessage.includes('heure')) {
    return "🕐 Nos horaires d'ouverture :\n\nLundi - Vendredi : 9h30 - 21h00\nSamedi : 9h30 - 21h00\nDimanche : 12h00 - 21h00\n\nNous serons ravis de vous accueillir !"
  }

  // Réservations
  if (lowerMessage.includes('réserver') || lowerMessage.includes('réservation') || lowerMessage.includes('reserver')) {
    return "🎮 Pour réserver une session de gaming :\n\n1. Allez dans la section 'Arena' → 'Réserver'\n2. Choisissez votre date et créneau\n3. Sélectionnez votre équipement (PS5, PS4, XBOX, Switch, PC, VR)\n4. Confirmez votre réservation\n\nOu réservez directement ici : /arena/booking"
  }

  // Tarifs
  if (lowerMessage.includes('tarif') || lowerMessage.includes('prix') || lowerMessage.includes('combien')) {
    return "💰 Nos tarifs par heure :\n\n• PC Gaming : 1 500F\n• PS5 : 2 000F\n• PS4 : 1 000F\n• XBOX Series X : 1 500F\n• Switch : 1 500F\n• VR (PS4/Oculus) : 2 500F\n• Simu Racing : 2 000F\n\nProfitez de promotions pour les longues sessions !"
  }

  // Boutique
  if (lowerMessage.includes('boutique') || lowerMessage.includes('acheter') || lowerMessage.includes('commander')) {
    return "🛒 Notre boutique propose :\n\n• Consoles (PS5, Switch, XBOX)\n• Accessoires (manettes, casques)\n• Jeux vidéo\n• Composants PC\n• Goodies gaming\n\nVisitez notre boutique : /store"
  }

  // Localisation
  if (lowerMessage.includes('où') || lowerMessage.includes('adresse') || lowerMessage.includes('trouver')) {
    return "📍 Nous sommes situés à Mvog Ada, Yaoundé !\n\nVenez nous rendre visite pour découvrir nos installations."
  }

  // Événements
  if (lowerMessage.includes('événement') || lowerMessage.includes('tournoi') || lowerMessage.includes('tournoi')) {
    return "🏆 Nous organisons régulièrement des tournois et événements gaming !\n\nSuivez-nous sur les réseaux sociaux pour ne rien rater.\nProchain événement : [À définir]"
  }

  // Contact
  if (lowerMessage.includes('contact') || lowerMessage.includes('téléphone') || lowerMessage.includes('appeler')) {
    return "📞 Nous contacter :\n\n• Téléphone : +237 600 000 000\n• Email : contact@geekgamingcenter.cm\n\nOu passez nous voir directement à Mvog Ada !"
  }

  // Réponse par défaut
  return "Bonjour ! 👋 Je suis l'assistant du Geek Gaming Center.\n\nJe peux vous aider sur :\n\n• 🕐 Nos horaires d'ouverture\n• 🎮 Les réservations\n• 💰 Nos tarifs\n• 🛒 La boutique\n• 📍 Notre localisation\n• 🏆 Les événements\n\nComment puis-je vous aider aujourd'hui ?"
}
