import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth, hasRole } from '@/lib/auth/utils'

// GET /api/dashboard/equipment/status - Statut des équipements en temps réel
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['CASHIER', 'MANAGER', 'ADMIN'])) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Récupérer tous les équipements avec leurs sessions actives
    const equipment = await prisma.equipment.findMany({
      include: {
        sessions: {
          where: {
            status: { in: ['PENDING', 'ACTIVE'] },
          },
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
          orderBy: {
            scheduledEndAt: 'asc',
          },
        },
      },
      orderBy: [
        { type: 'asc' },
        { code: 'asc' },
      ],
    })

    // Calculer les stats par type
    const statsByType = equipment.reduce((acc, eq) => {
      if (!acc[eq.type]) {
        acc[eq.type] = {
          total: 0,
          available: 0,
          inUse: 0,
          reserved: 0,
          maintenance: 0,
        }
      }

      acc[eq.type].total++
      acc[eq.type][eq.status.toLowerCase() as keyof typeof acc[typeof eq.type]]++

      return acc
    }, {} as Record<string, any>)

    // Formater les équipements avec info session active
    const formattedEquipment = equipment.map(eq => {
      const activeSession = eq.sessions[0]

      return {
        id: eq.id,
        name: eq.name,
        type: eq.type,
        code: eq.code,
        status: eq.status,
        healthScore: eq.healthScore,
        activeSession: activeSession ? {
          id: activeSession.id,
          sessionNumber: activeSession.sessionNumber,
          customer: `${activeSession.customer.firstName} ${activeSession.customer.lastName}`,
          customerPhone: activeSession.customer.phone,
          scheduledEndAt: activeSession.scheduledEndAt,
          timeRemaining: Math.max(0, new Date(activeSession.scheduledEndAt).getTime() - Date.now()),
        } : null,
      }
    })

    return NextResponse.json({
      equipment: formattedEquipment,
      statsByType,
      summary: {
        total: equipment.length,
        available: equipment.filter(e => e.status === 'AVAILABLE').length,
        inUse: equipment.filter(e => e.status === 'IN_USE').length,
        reserved: equipment.filter(e => e.status === 'RESERVED').length,
        maintenance: equipment.filter(e => e.status === 'MAINTENANCE').length,
      },
    })

  } catch (error: any) {
    console.error('Equipment status error:', error)

    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération du statut des équipements' },
      { status: 500 }
    )
  }
}
