"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  Phone,
  MessageSquare,
  Plus,
  Package,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import { useAppointments, useClients, useInventory, usePayments } from "@/lib/firebase-hooks-user"
import { format, isToday, isTomorrow, startOfDay, endOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"

export function Dashboard() {
  const { appointments, loading: loadingAppointments } = useAppointments()
  const { clients, loading: loadingClients } = useClients()
  const { stockItems: inventory, loading: loadingInventory } = useInventory()
  const { payments, loading: loadingPayments } = usePayments()
  
  const [stats, setStats] = useState({
    todayEarnings: 0,
    todayAppointments: 0,
    confirmedAppointments: 0,
    pendingAppointments: 0,
    activeClients: 0,
    newClientsThisMonth: 0,
    occupancyRate: 0,
  })

  // Filtrar agendamentos para hoje e amanhã
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const nextAppointments = appointments
    ?.filter((appointment) => {
      const appointmentDate = appointment.date?.toDate ? appointment.date.toDate() : new Date(appointment.date)
      return isToday(appointmentDate) || isTomorrow(appointmentDate)
    })
    .slice(0, 3) || []

  // Ganhos recentes (últimos 3 dias)
  const recentEarnings = payments
    ?.filter((payment) => {
      const paymentDate = payment.date?.toDate ? payment.date.toDate() : new Date(payment.date)
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      return paymentDate >= threeDaysAgo
    })
    .slice(0, 3) || []

  // Alertas de estoque baixo
  const lowStockItems = inventory?.filter((item: any) => item.quantity <= item.minimumStock) || []

  // Calcular estatísticas
  useEffect(() => {
    if (loadingAppointments || loadingClients || loadingPayments) return

    const todayStart = startOfDay(today)
    const todayEnd = endOfDay(today)
    
    // Ganhos de hoje
    const todayEarnings = payments
      ?.filter((payment) => {
        const paymentDate = payment.date?.toDate ? payment.date.toDate() : new Date(payment.date)
        return paymentDate >= todayStart && paymentDate <= todayEnd
      })
      .reduce((total, payment) => total + (payment.amount || 0), 0) || 0

    // Agendamentos de hoje
    const todayAppointmentsCount = appointments
      ?.filter((appointment) => {
        const appointmentDate = appointment.date?.toDate ? appointment.date.toDate() : new Date(appointment.date)
        return isToday(appointmentDate)
      }).length || 0

    // Status dos agendamentos
    const confirmedCount = appointments?.filter((apt) => apt.status === "confirmado").length || 0
    const pendingCount = appointments?.filter((apt) => apt.status === "pendente").length || 0

    // Clientes ativos
    const activeClientsCount = clients?.filter((client) => client.status === "ativo").length || 0

    // Novos clientes este mês
    const thisMonth = new Date()
    thisMonth.setDate(1)
    const newClientsCount = clients?.filter((client) => {
      const createdDate = client.createdAt?.toDate ? client.createdAt.toDate() : new Date(client.createdAt)
      return createdDate >= thisMonth
    }).length || 0

    // Taxa de ocupação (estimativa baseada em agendamentos da semana)
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekAppointments = appointments?.filter((appointment) => {
      const appointmentDate = appointment.date?.toDate ? appointment.date.toDate() : new Date(appointment.date)
      return appointmentDate >= weekStart
    }).length || 0
    
    // Assumindo 8 horas de trabalho por dia, 5 dias por semana = 40 slots disponíveis
    const availableSlots = 40
    const occupancyRate = Math.min(Math.round((weekAppointments / availableSlots) * 100), 100)

    setStats({
      todayEarnings,
      todayAppointments: todayAppointmentsCount,
      confirmedAppointments: confirmedCount,
      pendingAppointments: pendingCount,
      activeClients: activeClientsCount,
      newClientsThisMonth: newClientsCount,
      occupancyRate,
    })
  }, [appointments, clients, payments, loadingAppointments, loadingClients, loadingPayments])

  const trendingNews = [
    {
      title: "Novas Técnicas de Fineline em Alta",
      source: "Tattoo Magazine",
      time: "2h atrás",
    },
    {
      title: "Cores Neon: A Tendência de 2025",
      source: "Ink World",
      time: "4h atrás",
    },
    {
      title: "Cuidados Pós-Tatuagem: Guia Completo",
      source: "Tattoo Care",
      time: "6h atrás",
    },
  ]

  const handleWhatsAppContact = (phone: string, clientName: string) => {
    const message = encodeURIComponent(
      `Olá ${clientName}! Lembrete do seu agendamento de tatuagem. Nos vemos em breve!`,
    )
    window.open(`https://wa.me/${phone.replace(/\D/g, "")}?text=${message}`, "_blank")
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (date: any) => {
    const dateObj = date?.toDate ? date.toDate() : new Date(date)
    if (isToday(dateObj)) return "Hoje"
    if (isTomorrow(dateObj)) return "Amanhã"
    return format(dateObj, "dd/MM", { locale: ptBR })
  }

  const formatTime = (date: any) => {
    const dateObj = date?.toDate ? date.toDate() : new Date(date)
    return format(dateObj, "HH:mm", { locale: ptBR })
  }

  if (loadingAppointments || loadingClients || loadingPayments || loadingInventory) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dados...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganhos Hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{formatCurrency(stats.todayEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.todayEarnings > 0 ? "Receita do dia atual" : "Nenhuma receita hoje"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayAppointments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.confirmedAppointments} confirmados, {stats.pendingAppointments} pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeClients}</div>
            <p className="text-xs text-muted-foreground">+{stats.newClientsThisMonth} novos este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">Semana atual</p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Estoque */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Alertas de Estoque</span>
          </CardTitle>
          <CardDescription>Itens que precisam de atenção</CardDescription>
        </CardHeader>
        <CardContent>
          {lowStockItems.length > 0 ? (
            <div className="space-y-3">
              {lowStockItems.slice(0, 3).map((item: any) => (
                <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                  item.quantity === 0 
                    ? "bg-red-50 border-red-200" 
                    : "bg-yellow-50 border-yellow-200"
                }`}>
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className={`h-4 w-4 ${
                      item.quantity === 0 ? "text-red-500" : "text-yellow-500"
                    }`} />
                    <div>
                      <p className={`font-medium ${
                        item.quantity === 0 ? "text-red-700" : "text-yellow-700"
                      }`}>
                        {item.name} - {item.brand || "Sem marca"}
                      </p>
                      <p className={`text-sm ${
                        item.quantity === 0 ? "text-red-600" : "text-yellow-600"
                      }`}>
                        {item.quantity === 0 
                          ? "Estoque esgotado" 
                          : `Estoque baixo (${item.quantity} ${item.unit || "unidades"})`
                        }
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className={
                      item.quantity === 0 
                        ? "text-red-600 border-red-300 bg-transparent" 
                        : "text-yellow-600 border-yellow-300 bg-transparent"
                    }
                  >
                    Repor
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhum item com estoque baixo no momento.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Próximos Agendamentos */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Próximos Agendamentos</CardTitle>
                <CardDescription>Seus compromissos para hoje e amanhã</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Agendamento
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {nextAppointments.length > 0 ? (
              <div className="space-y-4">
                {nextAppointments.map((appointment: any) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {appointment.clientName
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("") || "C"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{appointment.clientName || "Cliente"}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDate(appointment.date)} às {formatTime(appointment.date)}
                          </span>
                          {appointment.type && (
                            <Badge variant="outline" className="ml-2">
                              {appointment.type}
                            </Badge>
                          )}
                          {appointment.status && (
                            <Badge 
                              variant={appointment.status === "confirmado" ? "default" : "secondary"}
                              className="ml-2"
                            >
                              {appointment.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {appointment.clientPhone && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleWhatsAppContact(appointment.clientPhone, appointment.clientName)}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`tel:${appointment.clientPhone}`, "_self")}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum agendamento para hoje ou amanhã.</p>
            )}
          </CardContent>
        </Card>

        {/* Ganhos Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Ganhos Recentes</CardTitle>
            <CardDescription>Últimas transações</CardDescription>
          </CardHeader>
          <CardContent>
            {recentEarnings.length > 0 ? (
              <div className="space-y-4">
                {recentEarnings.map((earning: any, index: number) => (
                  <div key={earning.id || index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-500">{formatCurrency(earning.amount)}</p>
                      <p className="text-sm text-muted-foreground">{earning.clientName || earning.description}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(earning.date)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum ganho recente registrado.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tendências e Notícias */}
      <Card>
        <CardHeader>
          <CardTitle>Tendências e Notícias</CardTitle>
          <CardDescription>Últimas novidades do mundo da tatuagem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {trendingNews.map((news, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                <h4 className="font-medium mb-2">{news.title}</h4>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{news.source}</span>
                  <span>{news.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
