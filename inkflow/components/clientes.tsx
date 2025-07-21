"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Plus, Search, Phone, MessageSquare, Calendar, Edit, Star, MapPin, Loader2, Eye, Trash, UserX, UserCheck, Save, X, Image, Calculator as CalculatorIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useClients, useQuotes } from "@/lib/firebase-hooks-user"
import { usePortfolio } from "@/lib/firebase-hooks-user"

export function Clientes() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewClientOpen, setIsNewClientOpen] = useState(false)
  const [isClientDetailOpen, setIsClientDetailOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [tempNotes, setTempNotes] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    birthDate: "",
    address: "",
    preferences: "",
    notes: "",
  })

  const { clients, loading, addClient, updateClient, deleteClient } = useClients()
  const { portfolioItems, loading: loadingPortfolio } = usePortfolio()
  const { quotes } = useQuotes()
  const { toast } = useToast()

  const handleNewClient = async () => {
    if (!formData.name || !formData.phone) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e telefone são obrigatórios.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await addClient({
        ...formData,
        preferences: formData.preferences
          ? formData.preferences
              .split(",")
              .map((p) => p.trim())
              .filter((p) => p.length > 0)
          : [],
        totalSessions: 0,
        totalSpent: 0,
        rating: 5,
        status: "ativo",
        tattoos: [],
      })

      toast({
        title: "Cliente adicionado!",
        description: "Novo cliente foi cadastrado com sucesso.",
      })

      setIsNewClientOpen(false)
      setFormData({
        name: "",
        phone: "",
        email: "",
        birthDate: "",
        address: "",
        preferences: "",
        notes: "",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao cadastrar cliente. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleWhatsApp = (phone: string, name: string) => {
    const message = encodeURIComponent(`Olá ${name}! Como você está? Gostaria de agendar uma nova sessão? 🎨`)
    window.open(`https://wa.me/${phone.replace(/\D/g, "")}?text=${message}`, "_blank")
  }

  const handleSchedule = (client: any) => {
    const message = encodeURIComponent(`Olá ${client.name}! Vamos agendar sua próxima tatuagem?

📅 Tenho disponibilidade para:
• Esta semana: [dias disponíveis]
• Próxima semana: [dias disponíveis]

Qual seria o melhor dia e horário para você? 🎨`)

    window.open(`https://wa.me/${client.phone.replace(/\D/g, "")}?text=${message}`, "_blank")
  }

  const openClientDetail = (client: any) => {
    setSelectedClient(client)
    setTempNotes(client.notes || "")
    setIsClientDetailOpen(true)
  }

  const handleUpdateNotes = async () => {
    if (!selectedClient) return

    setIsLoading(true)
    try {
      await updateClient(selectedClient.id, { ...selectedClient, notes: tempNotes })
      setSelectedClient({ ...selectedClient, notes: tempNotes })
      setIsEditingNotes(false)
      toast({
        title: "Observações atualizadas!",
        description: "As observações do cliente foram salvas.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar observações.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!selectedClient) return

    const newStatus = selectedClient.status === "ativo" ? "inativo" : "ativo"
    
    setIsLoading(true)
    try {
      await updateClient(selectedClient.id, { status: newStatus })
      setSelectedClient({ ...selectedClient, status: newStatus })
      toast({
        title: `Cliente ${newStatus === "ativo" ? "ativado" : "desativado"}!`,
        description: `O cliente foi ${newStatus === "ativo" ? "ativado" : "desativado"} com sucesso.`,
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar status do cliente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClient = async () => {
    if (!selectedClient) return

    setIsLoading(true)
    try {
      await deleteClient(selectedClient.id)
      setIsClientDetailOpen(false)
      toast({
        title: "Cliente excluído!",
        description: "O cliente e todos os dados vinculados foram removidos.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir cliente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar itens do portfólio relacionados ao cliente
  const getClientPortfolioItems = (clientId: string) => {
    return portfolioItems.filter(item => 
      item.clientId === clientId || 
      (item.description && item.description.toLowerCase().includes(selectedClient?.name.toLowerCase()))
    )
  }

  // Simular orçamentos (agora busca os orçamentos reais)
  const getClientQuotes = (clientId: string) => {
    return quotes.filter(quote => quote.clientId === clientId)
  }

  // Simular tatuagens finalizadas
  const getClientTattoos = (clientId: string) => {
    // Aqui você pode implementar um hook para buscar tatuagens finalizadas
    return []
  }

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      (client.preferences &&
        client.preferences.some((pref: string) => pref.toLowerCase().includes(searchTerm.toLowerCase()))),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const activeClients = clients.filter((c) => c.status === "ativo").length
  const totalRevenue = clients.reduce((sum, client) => sum + (client.totalSpent || 0), 0)
  const averageRating =
    clients.length > 0 ? clients.reduce((sum, client) => sum + (client.rating || 5), 0) / clients.length : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Clientes</h1>
        </div>
        <Dialog open={isNewClientOpen} onOpenChange={setIsNewClientOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Cliente</DialogTitle>
              <DialogDescription>Cadastre um novo cliente no sistema</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  placeholder="Nome do cliente"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  placeholder="+55 11 99999-9999"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="cliente@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  placeholder="Cidade, Estado"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="preferences">Preferências</Label>
                <Input
                  id="preferences"
                  placeholder="fineline, colorido, realismo..."
                  value={formData.preferences}
                  onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Notas sobre o cliente..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <Button onClick={handleNewClient} className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cadastrar Cliente
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">{activeClients} ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <span className="text-green-500">R$</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">R$ {totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">De todos os clientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">De 5 estrelas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Totais</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.reduce((sum, c) => sum + (c.totalSessions || 0), 0)}</div>
            <p className="text-xs text-muted-foreground">Todas as sessões</p>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, telefone ou preferências..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes */}
      <div className="grid gap-4">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openClientDetail(client)}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {client.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{client.name}</h3>
                      <Badge variant={client.status === "ativo" ? "default" : "secondary"}>{client.status}</Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3" />
                        <span>{client.phone}</span>
                      </div>
                      {client.address && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{client.address}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-green-500 font-medium">R$ {(client.totalSpent || 0).toLocaleString()}</span>
                      <span className="text-muted-foreground">{client.totalSessions || 0} sessões</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span>{client.rating || 5}</span>
                      </div>
                    </div>
                    {client.preferences && client.preferences.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {client.preferences.map((pref: string) => (
                          <Badge key={pref} variant="outline" className="text-xs">
                            {pref}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" variant="outline" onClick={() => handleWhatsApp(client.phone, client.name)}>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => window.open(`tel:${client.phone}`, "_self")}>
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleSchedule(client)}>
                    <Calendar className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openClientDetail(client)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {client.notes && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">{client.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Nenhum cliente encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Tente ajustar os termos de busca" : "Comece cadastrando seu primeiro cliente"}
            </p>
            <Button variant="outline" onClick={() => setIsNewClientOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Primeiro Cliente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal de Detalhes do Cliente */}
      <Dialog open={isClientDetailOpen} onOpenChange={setIsClientDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedClient && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {selectedClient.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <DialogTitle className="text-xl">{selectedClient.name}</DialogTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={selectedClient.status === "ativo" ? "default" : "secondary"}>
                          {selectedClient.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{selectedClient.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant={selectedClient.status === "ativo" ? "destructive" : "default"}
                      onClick={handleToggleStatus}
                      disabled={isLoading}
                    >
                      {selectedClient.status === "ativo" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Cliente</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir este cliente? Esta ação removerá todos os dados vinculados e não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteClient} className="bg-destructive text-destructive-foreground">
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="quotes">Orçamentos</TabsTrigger>
                  <TabsTrigger value="tattoos">Tatuagens</TabsTrigger>
                  <TabsTrigger value="portfolio">Portfólio</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Informações Pessoais</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Email:</span>
                          <p>{selectedClient.email || "Não informado"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Data de Nascimento:</span>
                          <p>{selectedClient.birthDate || "Não informada"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Endereço:</span>
                          <p>{selectedClient.address || "Não informado"}</p>
                        </div>
                        {selectedClient.preferences && selectedClient.preferences.length > 0 && (
                          <div>
                            <span className="text-muted-foreground">Preferências:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedClient.preferences.map((pref: string) => (
                                <Badge key={pref} variant="outline" className="text-xs">
                                  {pref}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Estatísticas</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Gasto:</span>
                          <span className="font-medium text-green-500">R$ {(selectedClient.totalSpent || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total de Sessões:</span>
                          <span className="font-medium">{selectedClient.totalSessions || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Avaliação:</span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="font-medium">{selectedClient.rating || 5}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">Observações</CardTitle>
                        {!isEditingNotes ? (
                          <Button size="sm" variant="outline" onClick={() => setIsEditingNotes(true)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                        ) : (
                          <div className="flex space-x-2">
                            <Button size="sm" onClick={handleUpdateNotes} disabled={isLoading}>
                              <Save className="h-4 w-4 mr-1" />
                              Salvar
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => {
                              setIsEditingNotes(false)
                              setTempNotes(selectedClient.notes || "")
                            }}>
                              <X className="h-4 w-4 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {!isEditingNotes ? (
                        <p className="text-sm text-muted-foreground">
                          {selectedClient.notes || "Nenhuma observação adicionada"}
                        </p>
                      ) : (
                        <Textarea
                          value={tempNotes}
                          onChange={(e) => setTempNotes(e.target.value)}
                          placeholder="Adicione observações sobre o cliente..."
                          className="min-h-20"
                        />
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="quotes">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <CalculatorIcon className="h-5 w-5 mr-2" />
                        Orçamentos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const clientQuotes = getClientQuotes(selectedClient.id)
                        return clientQuotes.length > 0 ? (
                          <div className="space-y-4">
                            {clientQuotes.map((quote) => (
                              <div key={quote.id} className="border rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <Badge variant={
                                      quote.status === "aprovado" ? "default" : 
                                      quote.status === "rejeitado" ? "destructive" : "secondary"
                                    }>
                                      {quote.status}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                      {quote.createdAt?.toDate ? quote.createdAt.toDate().toLocaleDateString() : "Data não disponível"}
                                    </span>
                                  </div>
                                  <span className="font-bold text-green-500 text-lg">
                                    R$ {quote.finalPrice?.toFixed(2) || "0.00"}
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Dimensões:</span>
                                    <p>{quote.width}cm x {quote.height}cm</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Área:</span>
                                    <p>{quote.area?.toFixed(1)}cm²</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Complexidade:</span>
                                    <p>{quote.complexity}</p>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Tempo:</span>
                                    <p>{quote.timeEstimate}h</p>
                                  </div>
                                  {quote.bodyPart && (
                                    <div>
                                      <span className="text-muted-foreground">Local:</span>
                                      <p>{quote.bodyPart}</p>
                                    </div>
                                  )}
                                </div>
                                
                                {quote.description && (
                                  <div>
                                    <span className="text-muted-foreground text-sm">Descrição:</span>
                                    <p className="text-sm">{quote.description}</p>
                                  </div>
                                )}
                                
                                <div className="flex justify-between text-sm">
                                  <span>Materiais: R$ {quote.totalMaterials?.toFixed(2)}</span>
                                  <span>Mão de obra: R$ {quote.laborCost?.toFixed(2)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <CalculatorIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Nenhum orçamento encontrado</p>
                            <p className="text-sm">Os orçamentos criados na calculadora aparecerão aqui quando vinculados ao cliente</p>
                          </div>
                        )
                      })()}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="tattoos">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tatuagens Finalizadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma tatuagem finalizada</p>
                        <p className="text-sm">As tatuagens concluídas do cliente aparecerão aqui</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="portfolio">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Image className="h-5 w-5 mr-2" />
                        Portfólio do Cliente
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingPortfolio ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      ) : (
                        (() => {
                          const clientPortfolio = getClientPortfolioItems(selectedClient.id)
                          return clientPortfolio.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {clientPortfolio.map((item) => (
                                <div key={item.id} className="space-y-2">
                                  <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                                    {item.imageUrl && (
                                      <img
                                        src={item.imageUrl}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                      />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{item.title}</p>
                                    <p className="text-xs text-muted-foreground">{item.category}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <p>Nenhuma foto no portfólio</p>
                              <p className="text-sm">As fotos das tatuagens deste cliente aparecerão aqui</p>
                            </div>
                          )
                        })()
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
