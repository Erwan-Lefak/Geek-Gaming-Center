'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface ReportData {
  todayRevenue: number
  monthRevenue: number
  monthTarget: number
  sessionCount: number
  customerCount: number
  topCustomers: Array<{
    name: string
    visits: number
    spent: number
  }>
  equipmentUsage: Array<{
    name: string
    hours: number
    count: number
  }>
  revenueByDay: Array<{
    date: string
    gaming: number
    boutique: number
    total: number
  }>
  paymentMethods: Array<{
    method: string
    amount: number
    percentage: number
  }>
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('week')

  useEffect(() => {
    fetchReportData()
  }, [period])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      // Simuler les données pour l'instant
      const mockData: ReportData = {
        todayRevenue: 125000,
        monthRevenue: 2850000,
        monthTarget: 3500000,
        sessionCount: 45,
        customerCount: 28,
        topCustomers: [
          { name: 'Jean Dupont', visits: 15, spent: 85000 },
          { name: 'Marie Kouassi', visits: 12, spent: 72000 },
          { name: 'Paul Mbarga', visits: 10, spent: 65000 },
          { name: 'Sophie Ngo', visits: 8, spent: 54000 },
          { name: 'Marc Atangana', visits: 7, spent: 48000 },
        ],
        equipmentUsage: [
          { name: 'PS5', hours: 120, count: 85 },
          { name: 'PC Gaming', hours: 95, count: 72 },
          { name: 'Xbox', hours: 78, count: 58 },
          { name: 'PS4', hours: 65, count: 48 },
          { name: 'VR', hours: 45, count: 35 },
        ],
        revenueByDay: [
          { date: 'Lun', gaming: 45000, boutique: 12000, total: 57000 },
          { date: 'Mar', gaming: 52000, boutique: 15000, total: 67000 },
          { date: 'Mer', gaming: 48000, boutique: 11000, total: 59000 },
          { date: 'Jeu', gaming: 65000, boutique: 18000, total: 83000 },
          { date: 'Ven', gaming: 85000, boutique: 25000, total: 110000 },
          { date: 'Sam', gaming: 125000, boutique: 35000, total: 160000 },
          { date: 'Dim', gaming: 110000, boutique: 28000, total: 138000 },
        ],
        paymentMethods: [
          { method: 'Espèces', amount: 420000, percentage: 45 },
          { method: 'Orange Money', amount: 285000, percentage: 30 },
          { method: 'MTN Mobile Money', amount: 195000, percentage: 21 },
          { method: 'Carte bancaire', amount: 45000, percentage: 4 },
        ],
      }
      setData(mockData)
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const achievementRate = data
    ? ((data.monthRevenue / data.monthTarget) * 100).toFixed(1)
    : '0'

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord</h1>
              <p className="text-sm text-gray-600 mt-1">
                Rapports et statistiques du Geek Gaming Center
              </p>
            </div>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="h-10 px-3 rounded-md border border-gray-300 bg-white text-sm"
            >
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="quarter">Ce trimestre</option>
              <option value="year">Cette année</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">CA Aujourd'hui</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {data.todayRevenue.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">CA Mensuel</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {(data.monthRevenue / 1000).toFixed(0)}k FCFA
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Objectif: {(data.monthTarget / 1000).toFixed(0)}k FCFA
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">Progression</span>
                  <span className="font-medium text-gray-900">{achievementRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${achievementRate}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sessions</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {data.sessionCount}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Aujourd'hui</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎮</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Clients</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {data.customerCount}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Ce mois</p>
                </div>
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue by Day Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Chiffre d'Affaires par Jour</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) => {
                      const numValue = typeof value === 'string' ? parseFloat(value) : value
                      return numValue ? `${(numValue / 1000).toFixed(0)}k FCFA` : '0 FCFA'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="gaming" name="Gaming" fill="#3b82f6" />
                  <Bar dataKey="boutique" name="Boutique" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Payment Methods Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Modes de Paiement</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.paymentMethods}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {data.paymentMethods.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `${Number(value).toLocaleString('fr-FR')} FCFA`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Customers */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topCustomers.map((customer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <p className="text-xs text-gray-600">{customer.visits} visites</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {customer.spent.toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Equipment Usage */}
          <Card>
            <CardHeader>
              <CardTitle>Utilisation des Équipements</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.equipmentUsage} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip formatter={(value: any) => `${Number(value)}h`} />
                  <Bar dataKey="hours" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Trend Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tendance du Chiffre d'Affaires</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any) => `${(Number(value) / 1000).toFixed(0)}k FCFA`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Total"
                />
                <Line
                  type="monotone"
                  dataKey="gaming"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Gaming"
                />
                <Line
                  type="monotone"
                  dataKey="boutique"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Boutique"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
