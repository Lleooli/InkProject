"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { useAppointments, useClients, useInventory, usePayments, useQuotes } from "@/lib/firebase-hooks-user"
import { format, isToday, isTomorrow, startOfDay, endOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

export function Dashboard() {
  const { userProfile } = useAuth()
  const { appointments, loading: loadingAppointments, addAppointment } = useAppointments()
  const { clients, loading: loadingClients } = useClients()
  const { stockItems: inventory, loading: loadingInventory } = useInventory()
  const { payments, loading: loadingPayments } = usePayments()
  const { quotes, loading: loadingQuotes } = useQuotes()
  
  const { toast } = useToast()
  
  // Estados para o modal de novo agendamento
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false)
  const [isLoadingAppointment, setIsLoadingAppointment] = useState(false)
  const [appointmentFormData, setAppointmentFormData] = useState({
    clientId: "",
    quoteId: "",
    date: "",
    time: "",
    duration: "2",
    type: "tatuagem",
    notes: "",
  })
  
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

  // Função para gerar mensagens dinâmicas de boas vindas
  const getWelcomeMessage = () => {
    const currentHour = new Date().getHours()
    const userName = userProfile?.name?.split(" ")[0] || "Artista"
    const studioName = userProfile?.studio
    
    let greeting = ""
    let motivationalMessage = ""
    let contextualMessage = ""
    let gradientClass = ""
    
    // Definir saudação e gradiente baseado na hora
    if (currentHour < 12) {
      greeting = "Bom dia"
      gradientClass = "from-amber-500 to-orange-500" // Gradiente matinal
    } else if (currentHour < 18) {
      greeting = "Boa tarde"
      gradientClass = "from-blue-500 to-purple-500" // Gradiente vespertino
    } else {
      greeting = "Boa noite"
      gradientClass = "from-purple-600 to-indigo-600" // Gradiente noturno
    }

    // Mensagens contextuais baseadas nas estatísticas
    if (stats.todayAppointments > 0) {
      contextualMessage = `Você tem ${stats.todayAppointments} ${stats.todayAppointments === 1 ? 'agendamento' : 'agendamentos'} hoje. `
    } else {
      contextualMessage = "Nenhum agendamento para hoje. "
    }

    if (stats.todayEarnings > 0) {
      contextualMessage += `Já faturou ${formatCurrency(stats.todayEarnings)} hoje! 💰`
    } else if (stats.todayAppointments > 0) {
      contextualMessage += "Vamos fazer este dia render! 🚀"
    } else {
      contextualMessage += "Que tal capturar novos clientes? 📈"
    }

    // Mensagens motivacionais variadas para quando não há contexto específico
    const motivationalMessages = [
      "Que seu dia seja cheio de arte e inspiração! 🎨",
      "Pronto para criar obras-primas hoje? ✨",
      "Cada tatuagem é uma história única. Vamos escrever mais algumas hoje! 📖",
      "A arte flui através de você. Tenha um dia incrível! 🌟",
      "Transforme pele em tela e sonhos em realidade! 💫",
      "Seu talento ilumina o dia de cada cliente. Brilhe hoje! ⭐",
      "Mais um dia para deixar sua marca no mundo! 🖌️",
      "A criatividade não tem limites. Explore hoje! 🚀"
    ]

    // Se não há contexto específico, usar mensagem motivacional
    if (!contextualMessage || (stats.todayAppointments === 0 && stats.todayEarnings === 0)) {
      const dayIndex = new Date().getDay()
      motivationalMessage = motivationalMessages[dayIndex]
    } else {
      motivationalMessage = contextualMessage
    }

    // Montar a mensagem final
    let welcomeText = `${greeting}, ${userName}!`
    if (studioName) {
      welcomeText += ` Bem-vindo ao ${studioName}.`
    }
    
    return {
      greeting: welcomeText,
      motivation: motivationalMessage,
      gradient: gradientClass
    }
  }

  // Filtrar orçamentos por cliente selecionado
  const selectedClientQuotes = quotes?.filter((quote) => 
    quote.clientId === appointmentFormData.clientId && quote.status === "pendente"
  ) || []

  const handleNewAppointment = () => {
    const message = encodeURIComponent(`Olá! Gostaria de marcar uma tatuagem.

📝 *Informações necessárias:*
• Ideia da tatuagem: [descreva sua ideia]
• Tamanho aproximado: [ex: 10cm x 15cm]
• Local do corpo: [onde será feita]
• Preferência de data: [quando gostaria]
• Estilo desejado: [fineline, colorida, realismo, etc.]

Responda com essas informações para eu preparar seu orçamento! 🎨`)

    window.open(`https://wa.me/?text=${message}`, "_blank")
  }

  const handleCreateAppointment = async () => {
    if (!appointmentFormData.clientId || !appointmentFormData.date || !appointmentFormData.time) {
      toast({
        title: "Campos obrigatórios",
        description: "Cliente, data e horário são obrigatórios.",
        variant: "destructive",
      })
      return
    }

    const selectedClient = clients?.find(c => c.id === appointmentFormData.clientId)
    const selectedQuote = quotes?.find(q => q.id === appointmentFormData.quoteId)

    setIsLoadingAppointment(true)
    try {
      const appointmentDate = new Date(`${appointmentFormData.date}T${appointmentFormData.time}`)
      
      const appointmentData = {
        clientId: appointmentFormData.clientId,
        clientName: selectedClient?.name || "",
        clientPhone: selectedClient?.phone || "",
        quoteId: appointmentFormData.quoteId || null,
        date: appointmentDate,
        duration: Number(appointmentFormData.duration),
        type: appointmentFormData.type,
        notes: appointmentFormData.notes,
        status: "confirmado",
        estimatedValue: selectedQuote?.finalPrice || 0,
        createdAt: new Date(),
      }

      await addAppointment(appointmentData)

      toast({
        title: "Agendamento criado!",
        description: `Agendamento para ${selectedClient?.name} criado com sucesso.`,
      })

      setIsNewAppointmentOpen(false)
      setAppointmentFormData({
        clientId: "",
        quoteId: "",
        date: "",
        time: "",
        duration: "2",
        type: "tatuagem",
        notes: "",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar agendamento. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingAppointment(false)
    }
  }

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

  // Gerar mensagem de boas vindas após calcular as estatísticas
  const welcomeMessage = getWelcomeMessage()

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

  if (loadingAppointments || loadingClients || loadingPayments || loadingInventory || !userProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dados...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com botões de ação */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleNewAppointment}>
            <MessageSquare className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
          <Button onClick={() => setIsNewAppointmentOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Mensagem de Boas Vindas */}
      <Card className={`bg-gradient-to-r ${welcomeMessage.gradient} text-white border-0 shadow-lg transform transition-all duration-300 hover:shadow-xl hover:scale-[1.01]`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2 animate-in slide-in-from-left duration-500">{welcomeMessage.greeting}</h2>
              <p className="text-white/90 opacity-90 animate-in slide-in-from-left duration-700">{welcomeMessage.motivation}</p>
              {userProfile?.studio && (
                <div className="mt-3 flex items-center space-x-2 text-white/80 animate-in slide-in-from-left duration-900">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">{userProfile.studio}</span>
                </div>
              )}
            </div>
            <div className="hidden md:block ml-4 animate-in slide-in-from-right duration-700">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors duration-300">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
              <Button size="sm" onClick={() => setIsNewAppointmentOpen(true)}>
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

      {/* Modal de Novo Agendamento */}
      <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
            <DialogDescription>
              Selecione um cliente e vincule um orçamento ao agendamento
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Seleção de Cliente */}
            <div>
              <Label htmlFor="clientSelect">Cliente *</Label>
              <Select 
                value={appointmentFormData.clientId} 
                onValueChange={(value) => setAppointmentFormData({ ...appointmentFormData, clientId: value, quoteId: "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {loadingClients ? (
                    <div className="p-2 text-center">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    </div>
                  ) : (
                    clients?.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {client.name?.split(" ").map((n: string) => n[0]).join("") || "C"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{client.name}</div>
                            <div className="text-xs text-muted-foreground">{client.phone}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Seleção de Orçamento */}
            {appointmentFormData.clientId && (
              <div>
                <Label htmlFor="quoteSelect">Orçamento (opcional)</Label>
                <Select 
                  value={appointmentFormData.quoteId} 
                  onValueChange={(value) => setAppointmentFormData({ ...appointmentFormData, quoteId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um orçamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingQuotes ? (
                      <div className="p-2 text-center">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      </div>
                    ) : selectedClientQuotes.length === 0 ? (
                      <div className="p-2 text-center text-muted-foreground text-sm">
                        Nenhum orçamento pendente para este cliente
                      </div>
                    ) : (
                      selectedClientQuotes.map((quote) => (
                        <SelectItem key={quote.id} value={quote.id}>
                          <div>
                            <div className="font-medium">{quote.description}</div>
                            <div className="text-xs text-muted-foreground">
                              R$ {quote.finalPrice?.toFixed(2) || "0,00"} - {quote.estimatedHours}h
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Data e Horário */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={appointmentFormData.date}
                  onChange={(e) => setAppointmentFormData({ ...appointmentFormData, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="time">Horário *</Label>
                <Input
                  id="time"
                  type="time"
                  value={appointmentFormData.time}
                  onChange={(e) => setAppointmentFormData({ ...appointmentFormData, time: e.target.value })}
                />
              </div>
            </div>

            {/* Duração e Tipo */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duração (horas)</Label>
                <Input
                  id="duration"
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={appointmentFormData.duration}
                  onChange={(e) => setAppointmentFormData({ ...appointmentFormData, duration: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select 
                  value={appointmentFormData.type} 
                  onValueChange={(value) => setAppointmentFormData({ ...appointmentFormData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tatuagem">Tatuagem</SelectItem>
                    <SelectItem value="consulta">Consulta</SelectItem>
                    <SelectItem value="retoque">Retoque</SelectItem>
                    <SelectItem value="orcamento">Orçamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Observações */}
            <div>
              <Label htmlFor="notes">Observações</Label>
              <Input
                id="notes"
                placeholder="Observações sobre o agendamento..."
                value={appointmentFormData.notes}
                onChange={(e) => setAppointmentFormData({ ...appointmentFormData, notes: e.target.value })}
              />
            </div>

            {/* Botões */}
            <div className="flex space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsNewAppointmentOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateAppointment} 
                disabled={isLoadingAppointment} 
                className="flex-1"
              >
                {isLoadingAppointment ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Agendar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
