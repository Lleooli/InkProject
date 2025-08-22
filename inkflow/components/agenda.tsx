"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useInView } from "react-intersection-observer"
import CountUp from "react-countup"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Calendar, Clock, Plus, MessageSquare, Phone, ChevronLeft, ChevronRight, Edit, Loader2, User, DollarSign, AlertTriangle, Package, TrendingDown, ShoppingCart, Trash, CheckCircle, Star, MoreVertical } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAppointments, useClients, useQuotes } from "@/lib/firebase-hooks-user"
import { useStock } from "@/lib/firebase-hooks-user"
import { format, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"

export function AgendaComponent() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
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

  // Estados para o modal de detalhes/edição do agendamento
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [isAppointmentDetailOpen, setIsAppointmentDetailOpen] = useState(false)
  const [isEditingAppointment, setIsEditingAppointment] = useState(false)
  const [isFinishingAppointment, setIsFinishingAppointment] = useState(false)
  const [editAppointmentFormData, setEditAppointmentFormData] = useState({
    date: "",
    time: "",
    duration: "2",
    type: "tatuagem",
    notes: "",
  })
  const [finishAppointmentFormData, setFinishAppointmentFormData] = useState({
    finalValue: "",
    clientNotes: "",
    rating: 5,
    nextSessionNotes: "",
  })

  const { toast } = useToast()
  const { appointments, loading, addAppointment, updateAppointment, deleteAppointment } = useAppointments()
  const { clients, loading: loadingClients, updateClient } = useClients()
  const { quotes, loading: loadingQuotes } = useQuotes()
  const { stockItems } = useStock()

  // Filtrar agendamentos para a data selecionada
  const selectedDateAppointments = appointments?.filter((appointment) => {
    const appointmentDate = appointment.date?.toDate ? appointment.date.toDate() : new Date(appointment.date)
    return isSameDay(appointmentDate, selectedDate)
  }).sort((a, b) => {
    const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date)
    const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date)
    return dateA.getTime() - dateB.getTime()
  }) || []

  // Filtrar orçamentos por cliente selecionado
  const selectedClientQuotes = quotes?.filter((quote) => 
    quote.clientId === appointmentFormData.clientId && quote.status === "pendente"
  ) || []

  // Calcular estatísticas do dia
  const dayStats = {
    totalAppointments: selectedDateAppointments.length,
    estimatedDuration: selectedDateAppointments.reduce((total, apt) => 
      total + (Number(apt.duration) || 2), 0),
    estimatedRevenue: selectedDateAppointments.reduce((total, apt) => 
      total + (apt.estimatedValue || 0), 0),
  }

  // Verificar itens de estoque com baixa quantidade
  const lowStockItems = stockItems?.filter((item) => 
    item.quantity <= item.minimumStock && item.quantity > 0
  ) || []

  const outOfStockItems = stockItems?.filter((item) => 
    item.quantity === 0
  ) || []

  const stockSuggestions = [
    ...lowStockItems.map(item => ({
      type: 'low' as const,
      item,
      message: `${item.name} está com estoque baixo (${item.quantity} restantes)`
    })),
    ...outOfStockItems.map(item => ({
      type: 'out' as const,
      item,
      message: `${item.name} está esgotado`
    }))
  ].slice(0, 3) // Mostrar apenas 3 sugestões principais

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

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    // Auto-preencher a data no formulário quando clicar em uma data
    setAppointmentFormData(prev => ({
      ...prev,
      date: date.toISOString().split('T')[0]
    }))
    setIsNewAppointmentOpen(true)
  }

  const handleContactClient = (phone: string, clientName: string) => {
    const message = encodeURIComponent(
      `Olá ${clientName}! Lembrete do seu agendamento de tatuagem. Nos vemos em breve! 🎨`,
    )
    window.open(`https://wa.me/${phone.replace(/\D/g, "")}?text=${message}`, "_blank")
  }

  // Função para abrir detalhes do agendamento
  const openAppointmentDetail = (appointment: any) => {
    setSelectedAppointment(appointment)
    const appointmentDate = appointment.date?.toDate ? appointment.date.toDate() : new Date(appointment.date)
    setEditAppointmentFormData({
      date: appointmentDate.toISOString().split('T')[0],
      time: appointmentDate.toTimeString().split(' ')[0].substring(0, 5),
      duration: appointment.duration?.toString() || "2",
      type: appointment.type || "tatuagem",
      notes: appointment.notes || "",
    })
    setFinishAppointmentFormData({
      finalValue: appointment.estimatedValue?.toString() || "",
      clientNotes: "",
      rating: 5,
      nextSessionNotes: "",
    })
    setIsAppointmentDetailOpen(true)
  }

  // Função para editar agendamento
  const handleUpdateAppointment = async () => {
    if (!selectedAppointment || !editAppointmentFormData.date || !editAppointmentFormData.time) {
      toast({
        title: "Campos obrigatórios",
        description: "Data e horário são obrigatórios.",
        variant: "destructive",
      })
      return
    }

    setIsLoadingAppointment(true)
    try {
      const updatedDate = new Date(`${editAppointmentFormData.date}T${editAppointmentFormData.time}`)
      
      await updateAppointment(selectedAppointment.id, {
        date: updatedDate,
        duration: Number(editAppointmentFormData.duration),
        type: editAppointmentFormData.type,
        notes: editAppointmentFormData.notes,
      })

      toast({
        title: "Agendamento atualizado!",
        description: "As alterações foram salvas com sucesso.",
      })

      setIsEditingAppointment(false)
      setIsAppointmentDetailOpen(false)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar agendamento. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingAppointment(false)
    }
  }

  // Função para excluir agendamento
  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) return

    setIsLoadingAppointment(true)
    try {
      await deleteAppointment(selectedAppointment.id)
      
      toast({
        title: "Agendamento excluído!",
        description: "O agendamento foi removido com sucesso.",
      })

      setIsAppointmentDetailOpen(false)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir agendamento. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingAppointment(false)
    }
  }

  // Função para finalizar agendamento
  const handleFinishAppointment = async () => {
    if (!selectedAppointment || !finishAppointmentFormData.finalValue) {
      toast({
        title: "Valor obrigatório",
        description: "Informe o valor final da sessão.",
        variant: "destructive",
      })
      return
    }

    setIsLoadingAppointment(true)
    try {
      const finalValue = Number(finishAppointmentFormData.finalValue)
      
      // Atualizar o agendamento como finalizado
      await updateAppointment(selectedAppointment.id, {
        status: "finalizado",
        finalValue: finalValue,
        clientNotes: finishAppointmentFormData.clientNotes,
        finishedAt: new Date(),
      })

      // Atualizar dados do cliente
      const client = clients?.find(c => c.id === selectedAppointment.clientId)
      if (client) {
        await updateClient(selectedAppointment.clientId, {
          totalSessions: (client.totalSessions || 0) + 1,
          totalSpent: (client.totalSpent || 0) + finalValue,
          rating: finishAppointmentFormData.rating,
          // Adicionar notas se houver
          ...(finishAppointmentFormData.clientNotes && {
            notes: client.notes ? 
              `${client.notes}\n\n[${new Date().toLocaleDateString('pt-BR')}] ${finishAppointmentFormData.clientNotes}` : 
              `[${new Date().toLocaleDateString('pt-BR')}] ${finishAppointmentFormData.clientNotes}`
          })
        })
      }

      toast({
        title: "Sessão finalizada!",
        description: "A sessão foi finalizada e os dados do cliente foram atualizados.",
      })

      // Enviar mensagem automática se houver observações para próxima sessão
      if (finishAppointmentFormData.nextSessionNotes && selectedAppointment.clientPhone) {
        const message = encodeURIComponent(`Olá ${selectedAppointment.clientName}! 🎨

Obrigado pela sessão de hoje! Espero que tenha gostado do resultado.

📝 *Observações para próxima sessão:*
${finishAppointmentFormData.nextSessionNotes}

Qualquer dúvida, estou à disposição! Até a próxima! ✨`)
        
        setTimeout(() => {
          window.open(`https://wa.me/${selectedAppointment.clientPhone.replace(/\D/g, "")}?text=${message}`, "_blank")
        }, 1000)
      }

      setIsFinishingAppointment(false)
      setIsAppointmentDetailOpen(false)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao finalizar sessão. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingAppointment(false)
    }
  }

  // Função para verificar se uma data tem agendamentos
  const hasAppointments = (date: Date) => {
    return appointments?.some((appointment) => {
      const appointmentDate = appointment.date?.toDate ? appointment.date.toDate() : new Date(appointment.date)
      return isSameDay(appointmentDate, date)
    }) || false
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Dias do mês anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i)
      days.push({ date: prevDate, isCurrentMonth: false })
    }

    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true })
    }

    // Dias do próximo mês para completar a grade
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false })
    }

    return days
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const days = getDaysInMonth(currentDate)
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  return (
    <div className="space-y-6">
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="flex items-center space-x-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatDelay: 5,
              ease: "easeInOut"
            }}
          >
            <Calendar className="h-6 w-6 text-primary" />
          </motion.div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Agenda
          </h1>
        </motion.div>
        <motion.div 
          className="flex space-x-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="outline" 
              onClick={handleNewAppointment}
              className="hover:bg-green-50 hover:border-green-300 hover:text-green-700 dark:hover:bg-green-950/20 dark:hover:border-green-700 dark:hover:text-green-400 transition-all duration-300"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={() => setIsNewAppointmentOpen(true)}
              className="bg-primary hover:bg-primary/90 transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div 
        className="grid gap-6 lg:grid-cols-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {/* Calendário */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="backdrop-blur-sm bg-card/80 border border-border/50 hover:border-border transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex space-x-2">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button variant="outline" size="icon" onClick={() => navigateMonth("next")}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </div>
            </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {weekDays.map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              <AnimatePresence>
                {days.map((day, index) => {
                  const hasAppointment = hasAppointments(day.date)
                  const isToday = day.date.toDateString() === new Date().toDateString()
                  const isSelected = day.date.toDateString() === selectedDate.toDateString()

                  return (
                    <motion.button
                      key={index}
                      onClick={() => day.isCurrentMonth ? handleDateClick(day.date) : setSelectedDate(day.date)}
                      className={`
                        p-2 text-sm rounded-md transition-colors relative
                        ${!day.isCurrentMonth ? "text-muted-foreground" : ""}
                        ${isToday ? "bg-primary text-primary-foreground shadow-lg" : ""}
                        ${isSelected && !isToday ? "bg-accent ring-2 ring-primary/20" : ""}
                        ${hasAppointment ? "font-bold" : ""}
                        hover:bg-accent cursor-pointer
                        ${day.isCurrentMonth ? "hover:bg-primary/10" : ""}
                      `}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.01 }}
                      whileHover={{ 
                        scale: 1.1, 
                        backgroundColor: isToday ? undefined : "rgba(var(--primary), 0.1)",
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {day.date.getDate()}
                      {hasAppointment && (
                        <motion.div 
                          className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        />
                      )}
                      {day.isCurrentMonth && !hasAppointment && (
                        <motion.div 
                          className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                          whileHover={{ opacity: 1 }}
                        >
                          <Plus className="h-3 w-3 text-primary" />
                        </motion.div>
                      )}
                    </motion.button>
                  )
                })}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
        </motion.div>

        {/* Agendamentos do Dia */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {/* Estatísticas do Dia */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="backdrop-blur-sm bg-gradient-to-br from-card/80 to-card/60 border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
              <CardHeader>
                <CardTitle className="text-lg bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {selectedDate.toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                    year: selectedDate.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
                  })}
                </CardTitle>
                <CardDescription>Resumo do dia selecionado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <motion.div 
                    className="text-center group"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div 
                      className="text-2xl font-bold text-primary"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                    >
                      <CountUp end={dayStats.totalAppointments} duration={1} />
                    </motion.div>
                    <div className="text-xs text-muted-foreground group-hover:text-primary/80 transition-colors">Agendamentos</div>
                  </motion.div>
                  <motion.div 
                    className="text-center group"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div 
                      className="text-2xl font-bold text-blue-600"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                    >
                      <CountUp end={dayStats.estimatedDuration} duration={1} />h
                    </motion.div>
                    <div className="text-xs text-muted-foreground group-hover:text-blue-600/80 transition-colors">Tempo estimado</div>
                  </motion.div>
                  <motion.div 
                    className="text-center group"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div 
                      className="text-2xl font-bold text-green-600"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.9 }}
                    >
                      R$ <CountUp end={dayStats.estimatedRevenue} duration={1} />
                    </motion.div>
                    <div className="text-xs text-muted-foreground group-hover:text-green-600/80 transition-colors">Receita prevista</div>
                  </motion.div>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    onClick={() => setIsNewAppointmentOpen(true)} 
                    className="w-full bg-primary hover:bg-primary/90 transition-all duration-300"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Agendamento
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sugestões de Estoque */}
          {stockSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
            >
              <Card className="backdrop-blur-sm bg-gradient-to-br from-yellow-50/80 to-orange-50/80 dark:from-yellow-950/20 dark:to-orange-950/20 border border-yellow-200/50 dark:border-yellow-800/50 hover:border-yellow-300/70 dark:hover:border-yellow-700/70 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <motion.div
                      animate={{ 
                        rotate: [0, -10, 10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        repeatDelay: 3,
                        ease: "easeInOut"
                      }}
                    >
                      <Package className="h-5 w-5 mr-2 text-yellow-600" />
                    </motion.div>
                    Alertas de Estoque
                  </CardTitle>
                  <CardDescription>Itens que precisam de atenção</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <AnimatePresence>
                      {stockSuggestions.map((suggestion, index) => (
                        <motion.div 
                          key={index} 
                          className="flex items-center justify-between p-3 rounded-lg border bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 hover:shadow-md transition-all duration-300"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                        >
                          <div className="flex items-center space-x-3">
                            <motion.div
                              animate={{ 
                                rotate: suggestion.type === 'out' ? [0, -15, 15, 0] : [0, 10, -10, 0]
                              }}
                              transition={{ 
                                duration: 1.5, 
                                repeat: Infinity, 
                                repeatDelay: 2 
                              }}
                            >
                              {suggestion.type === 'out' ? (
                                <TrendingDown className="h-4 w-4 text-red-500" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              )}
                            </motion.div>
                            <div>
                              <p className="text-sm font-medium">{suggestion.item.name}</p>
                              <p className="text-xs text-muted-foreground">{suggestion.message}</p>
                            </div>
                          </div>
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-950/20 dark:hover:border-blue-700 dark:hover:text-blue-400 transition-all duration-300"
                              onClick={() => {
                                const message = encodeURIComponent(`🛒 *PEDIDO DE REPOSIÇÃO*

📦 Item: ${suggestion.item.name}
🏷️ Marca: ${suggestion.item.brand || "Sem marca"}
📊 Estoque atual: ${suggestion.item.quantity || 0}
📈 Quantidade sugerida: ${(suggestion.item.maximumStock || 100) - (suggestion.item.quantity || 0)}

Gostaria de fazer este pedido!`)
                                window.open(`https://wa.me/?text=${message}`, "_blank")
                              }}
                            >
                              <ShoppingCart className="h-3 w-3 mr-1" />
                              Repor
                            </Button>
                          </motion.div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Lista de Agendamentos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
          >
            <Card className="backdrop-blur-sm bg-card/80 border border-border/50 hover:border-border transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Agendamentos
                </CardTitle>
                <CardDescription>Detalhes dos agendamentos do dia</CardDescription>
              </CardHeader>
          <CardContent>
            {loading ? (
              <motion.div 
                className="flex items-center justify-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="h-6 w-6 text-primary mr-2" />
                </motion.div>
                <span>Carregando agendamentos...</span>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {selectedDateAppointments.map((appointment: any, index: number) => (
                    <motion.div 
                      key={appointment.id} 
                      className="p-4 border rounded-lg space-y-3 cursor-pointer hover:bg-accent/50 transition-colors bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm border-border/50 hover:border-primary/20 hover:shadow-lg"
                      onClick={() => openAppointmentDetail(appointment)}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ 
                        scale: 1.02, 
                        y: -2,
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {appointment.clientName
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("") || "C"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{appointment.clientName || "Cliente"}</p>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              {format(
                                appointment.date?.toDate ? appointment.date.toDate() : new Date(appointment.date),
                                "HH:mm",
                                { locale: ptBR }
                              )}
                              {appointment.duration && ` (${appointment.duration}h)`}
                            </span>
                          </div>
                          {appointment.estimatedValue && (
                            <div className="flex items-center space-x-1 text-xs text-green-600">
                              <DollarSign className="h-3 w-3" />
                              <span>R$ {appointment.estimatedValue.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={appointment.status === "confirmado" ? "default" : appointment.status === "finalizado" ? "outline" : "secondary"}>
                          {appointment.status || "pendente"}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            openAppointmentDetail(appointment)
                          }}
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      {appointment.type && (
                        <Badge variant="outline" className="text-xs">
                          {appointment.type}
                        </Badge>
                      )}
                      {appointment.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{appointment.notes}</p>
                      )}
                    </div>

                    <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                      {appointment.clientPhone && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full hover:bg-green-50 hover:border-green-300 hover:text-green-700 dark:hover:bg-green-950/20 dark:hover:border-green-700 dark:hover:text-green-400 transition-all duration-300"
                            onClick={() => handleContactClient(appointment.clientPhone, appointment.clientName)}
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            WhatsApp
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-950/20 dark:hover:border-blue-700 dark:hover:text-blue-400 transition-all duration-300"
                            onClick={() => window.open(`tel:${appointment.clientPhone}`, "_self")}
                          >
                            <Phone className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>                {selectedDateAppointments.length === 0 && (
                  <motion.div 
                    className="text-center text-muted-foreground py-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        repeatDelay: 2,
                        ease: "easeInOut"
                      }}
                    >
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    </motion.div>
                    <p>Nenhum agendamento para este dia</p>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 hover:bg-primary/10 hover:border-primary/30 hover:text-primary dark:hover:bg-primary/20 transition-all duration-300" 
                        onClick={() => setIsNewAppointmentOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agendar Cliente
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Modal de Novo Agendamento */}
      <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto backdrop-blur-sm bg-card/95 border border-border/50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DialogHeader>
              <DialogTitle className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Novo Agendamento
              </DialogTitle>
              <DialogDescription>
                Selecione um cliente e vincule um orçamento ao agendamento
              </DialogDescription>
            </DialogHeader>
            
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
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
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>{client.name}</span>
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
                          <div className="flex items-center justify-between w-full">
                            <span className="text-sm">
                              {quote.width}x{quote.height}cm - {quote.complexity}
                            </span>
                            <span className="text-sm font-medium text-green-600">
                              R$ {quote.finalPrice?.toFixed(2)}
                            </span>
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
              <motion.div
                className="flex-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  onClick={() => setIsNewAppointmentOpen(false)}
                  className="w-full hover:bg-red-50 hover:border-red-300 hover:text-red-700 dark:hover:bg-red-950/20 dark:hover:border-red-700 dark:hover:text-red-400 transition-all duration-300"
                >
                  Cancelar
                </Button>
              </motion.div>
              <motion.div
                className="flex-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={handleCreateAppointment} 
                  disabled={isLoadingAppointment} 
                  className="w-full bg-primary hover:bg-primary/90 transition-all duration-300"
                >
                  {isLoadingAppointment ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="h-4 w-4 mr-2" />
                    </motion.div>
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Agendar
                </Button>
              </motion.div>
            </div>
            </motion.div>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes do Agendamento */}
      <Dialog open={isAppointmentDetailOpen} onOpenChange={setIsAppointmentDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedAppointment && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {selectedAppointment.clientName
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("") || "C"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <DialogTitle>{selectedAppointment.clientName || "Cliente"}</DialogTitle>
                      <p className="text-sm text-muted-foreground">
                        {format(
                          selectedAppointment.date?.toDate ? selectedAppointment.date.toDate() : new Date(selectedAppointment.date),
                          "dd/MM/yyyy 'às' HH:mm",
                          { locale: ptBR }
                        )}
                      </p>
                    </div>
                  </div>
                  <Badge variant={selectedAppointment.status === "confirmado" ? "default" : selectedAppointment.status === "finalizado" ? "outline" : "secondary"}>
                    {selectedAppointment.status || "pendente"}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="grid gap-6">
                {/* Informações do Agendamento */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Detalhes da Sessão</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tipo:</span>
                        <Badge variant="outline" className="text-xs">{selectedAppointment.type || "tatuagem"}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duração:</span>
                        <span>{selectedAppointment.duration || 2}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valor estimado:</span>
                        <span className="text-green-600 font-medium">
                          R$ {(selectedAppointment.estimatedValue || 0).toFixed(2)}
                        </span>
                      </div>
                      {selectedAppointment.finalValue && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Valor final:</span>
                          <span className="text-green-600 font-bold">
                            R$ {selectedAppointment.finalValue.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Contato</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedAppointment.clientPhone && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full hover:bg-green-50 hover:border-green-300 hover:text-green-700 dark:hover:bg-green-950/20 dark:hover:border-green-700 dark:hover:text-green-400 transition-all duration-300"
                            onClick={() => handleContactClient(selectedAppointment.clientPhone, selectedAppointment.clientName)}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Enviar WhatsApp
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-950/20 dark:hover:border-blue-700 dark:hover:text-blue-400 transition-all duration-300"
                            onClick={() => window.open(`tel:${selectedAppointment.clientPhone}`, "_self")}
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            Ligar
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Observações */}
                {selectedAppointment.notes && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Observações</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{selectedAppointment.notes}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Ações */}
                <div className="flex flex-col space-y-3">
                  {selectedAppointment.status !== "finalizado" && (
                    <>
                      {!isEditingAppointment && !isFinishingAppointment && (
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            className="flex-1 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-950/20 dark:hover:border-blue-700 dark:hover:text-blue-400 transition-all duration-300"
                            onClick={() => setIsEditingAppointment(true)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white transition-all duration-300"
                            onClick={() => setIsFinishingAppointment(true)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Finalizar
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon" className="hover:bg-red-600 transition-all duration-300">
                                <Trash className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir Agendamento</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteAppointment} className="bg-destructive text-destructive-foreground">
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}

                      {/* Formulário de Edição */}
                      {isEditingAppointment && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Editar Agendamento</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="editDate">Data</Label>
                                <Input
                                  id="editDate"
                                  type="date"
                                  value={editAppointmentFormData.date}
                                  onChange={(e) => setEditAppointmentFormData({ ...editAppointmentFormData, date: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="editTime">Horário</Label>
                                <Input
                                  id="editTime"
                                  type="time"
                                  value={editAppointmentFormData.time}
                                  onChange={(e) => setEditAppointmentFormData({ ...editAppointmentFormData, time: e.target.value })}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="editDuration">Duração (horas)</Label>
                                <Input
                                  id="editDuration"
                                  type="number"
                                  step="0.5"
                                  value={editAppointmentFormData.duration}
                                  onChange={(e) => setEditAppointmentFormData({ ...editAppointmentFormData, duration: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="editType">Tipo</Label>
                                <Select 
                                  value={editAppointmentFormData.type} 
                                  onValueChange={(value) => setEditAppointmentFormData({ ...editAppointmentFormData, type: value })}
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
                            <div>
                              <Label htmlFor="editNotes">Observações</Label>
                              <Textarea
                                id="editNotes"
                                value={editAppointmentFormData.notes}
                                onChange={(e) => setEditAppointmentFormData({ ...editAppointmentFormData, notes: e.target.value })}
                                placeholder="Observações sobre o agendamento..."
                              />
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => setIsEditingAppointment(false)}
                                className="flex-1 hover:bg-red-50 hover:border-red-300 hover:text-red-700 dark:hover:bg-red-950/20 dark:hover:border-red-700 dark:hover:text-red-400 transition-all duration-300"
                              >
                                Cancelar
                              </Button>
                              <Button
                                onClick={handleUpdateAppointment}
                                disabled={isLoadingAppointment}
                                className="flex-1 bg-primary hover:bg-primary/90 transition-all duration-300"
                              >
                                {isLoadingAppointment && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                Salvar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Formulário de Finalização */}
                      {isFinishingAppointment && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Finalizar Sessão</CardTitle>
                            <CardDescription>Complete os dados da sessão finalizada</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <Label htmlFor="finalValue">Valor Final (R$) *</Label>
                              <Input
                                id="finalValue"
                                type="number"
                                step="0.01"
                                placeholder="0,00"
                                value={finishAppointmentFormData.finalValue}
                                onChange={(e) => setFinishAppointmentFormData({ ...finishAppointmentFormData, finalValue: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="clientNotes">Observações sobre o Cliente</Label>
                              <Textarea
                                id="clientNotes"
                                placeholder="Notas sobre o comportamento, preferências, reações do cliente..."
                                value={finishAppointmentFormData.clientNotes}
                                onChange={(e) => setFinishAppointmentFormData({ ...finishAppointmentFormData, clientNotes: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="rating">Avaliação do Cliente (1-5 estrelas)</Label>
                              <div className="flex items-center space-x-2 mt-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Button
                                    key={star}
                                    variant={finishAppointmentFormData.rating >= star ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setFinishAppointmentFormData({ ...finishAppointmentFormData, rating: star })}
                                  >
                                    <Star className={`h-4 w-4 ${finishAppointmentFormData.rating >= star ? 'fill-current' : ''}`} />
                                  </Button>
                                ))}
                                <span className="text-sm text-muted-foreground ml-2">
                                  {finishAppointmentFormData.rating} estrela{finishAppointmentFormData.rating !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="nextSessionNotes">Observações para Próxima Sessão</Label>
                              <Textarea
                                id="nextSessionNotes"
                                placeholder="Cuidados, próximas etapas, lembretes para o cliente..."
                                value={finishAppointmentFormData.nextSessionNotes}
                                onChange={(e) => setFinishAppointmentFormData({ ...finishAppointmentFormData, nextSessionNotes: e.target.value })}
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Estas observações serão enviadas automaticamente para o cliente via WhatsApp
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => setIsFinishingAppointment(false)}
                                className="flex-1 hover:bg-red-50 hover:border-red-300 hover:text-red-700 dark:hover:bg-red-950/20 dark:hover:border-red-700 dark:hover:text-red-400 transition-all duration-300"
                              >
                                Cancelar
                              </Button>
                              <Button
                                onClick={handleFinishAppointment}
                                disabled={isLoadingAppointment}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white transition-all duration-300"
                              >
                                {isLoadingAppointment && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Finalizar Sessão
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}

                  {selectedAppointment.status === "finalizado" && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg text-green-600 flex items-center">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Sessão Finalizada
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          {selectedAppointment.finalValue && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Valor final:</span>
                              <span className="font-bold text-green-600">R$ {selectedAppointment.finalValue.toFixed(2)}</span>
                            </div>
                          )}
                          {selectedAppointment.finishedAt && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Finalizada em:</span>
                              <span>{format(selectedAppointment.finishedAt.toDate(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                            </div>
                          )}
                          {selectedAppointment.clientNotes && (
                            <div className="mt-3 p-3 bg-muted rounded-lg">
                              <p className="text-sm">{selectedAppointment.clientNotes}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
