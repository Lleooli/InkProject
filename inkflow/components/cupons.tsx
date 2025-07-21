"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Ticket,
  Plus,
  Search,
  Calendar,
  Percent,
  DollarSign,
  Users,
  Eye,
  Copy,
  Edit,
  Trash2,
  Gift,
  Star,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCoupons } from "@/lib/firebase-hooks-user"

export function Cupons() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [isNewCouponOpen, setIsNewCouponOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const { coupons, loading, addCoupon, updateCoupon, deleteCoupon } = useCoupons()
  const { toast } = useToast()

  const [newCouponData, setNewCouponData] = useState({
    code: "",
    name: "",
    description: "",
    type: "percentage", // percentage | fixed_amount
    value: "",
    minOrderValue: "",
    maxDiscount: "",
    usageLimit: "",
    usageCount: "0",
    validFrom: "",
    validUntil: "",
    isActive: true,
    clientSpecific: false,
    clientIds: [] as string[],
  })

  const couponTypes = [
    { value: "percentage", label: "Porcentagem (%)", icon: "%" },
    { value: "fixed_amount", label: "Valor Fixo (R$)", icon: "R$" },
  ]

  const handleAddCoupon = async () => {
    if (!newCouponData.code || !newCouponData.name || !newCouponData.value) {
      toast({
        title: "Campos obrigatórios",
        description: "Código, nome e valor são obrigatórios.",
        variant: "destructive",
      })
      return
    }

    // Verificar se já existe um cupom com o mesmo código
    const existingCoupon = coupons?.find(c => 
      c.code.toLowerCase() === newCouponData.code.toLowerCase()
    )
    
    if (existingCoupon) {
      toast({
        title: "Código já existe",
        description: "Já existe um cupom com este código.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await addCoupon({
        code: newCouponData.code.toUpperCase(),
        name: newCouponData.name,
        description: newCouponData.description,
        type: newCouponData.type,
        value: parseFloat(newCouponData.value) || 0,
        minOrderValue: parseFloat(newCouponData.minOrderValue) || 0,
        maxDiscount: newCouponData.maxDiscount ? parseFloat(newCouponData.maxDiscount) : null,
        usageLimit: newCouponData.usageLimit ? parseInt(newCouponData.usageLimit) : null,
        usageCount: 0,
        validFrom: newCouponData.validFrom ? new Date(newCouponData.validFrom) : null,
        validUntil: newCouponData.validUntil ? new Date(newCouponData.validUntil) : null,
        isActive: newCouponData.isActive,
        clientSpecific: newCouponData.clientSpecific,
        clientIds: newCouponData.clientIds,
      })

      toast({
        title: "Cupom criado!",
        description: `Cupom ${newCouponData.code} foi criado com sucesso.`,
      })

      setIsNewCouponOpen(false)
      setNewCouponData({
        code: "",
        name: "",
        description: "",
        type: "percentage",
        value: "",
        minOrderValue: "",
        maxDiscount: "",
        usageLimit: "",
        usageCount: "0",
        validFrom: "",
        validUntil: "",
        isActive: true,
        clientSpecific: false,
        clientIds: [],
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar cupom. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewCouponData({ ...newCouponData, code: result })
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Código copiado!",
      description: `Código ${code} copiado para a área de transferência.`,
    })
  }

  const toggleCouponStatus = async (coupon: any) => {
    try {
      await updateCoupon(coupon.id, { isActive: !coupon.isActive })
      toast({
        title: coupon.isActive ? "Cupom desativado" : "Cupom ativado",
        description: `${coupon.code} foi ${coupon.isActive ? "desativado" : "ativado"}.`,
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar status do cupom.",
        variant: "destructive",
      })
    }
  }

  const filteredCoupons = coupons?.filter((coupon: any) => {
    const matchesSearch = coupon.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coupon.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || coupon.type === selectedType
    return matchesSearch && matchesType
  }) || []

  const stats = {
    totalCoupons: coupons?.length || 0,
    activeCoupons: coupons?.filter((c: any) => c.isActive).length || 0,
    usedCoupons: coupons?.filter((c: any) => c.usageCount > 0).length || 0,
    totalDiscount: coupons?.reduce((total: number, coupon: any) => {
      if (coupon.type === "fixed_amount" && coupon.usageCount > 0) {
        return total + (coupon.value * coupon.usageCount)
      }
      return total
    }, 0) || 0,
  }

  const getCouponStatus = (coupon: any) => {
    if (!coupon.isActive) return { color: "secondary", text: "Inativo" }
    
    const now = new Date()
    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      return { color: "outline", text: "Aguardando" }
    }
    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      return { color: "destructive", text: "Expirado" }
    }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { color: "destructive", text: "Esgotado" }
    }
    
    return { color: "default", text: "Ativo" }
  }

  const formatDiscount = (coupon: any) => {
    if (coupon.type === "percentage") {
      return `${coupon.value}% OFF`
    } else {
      return `R$ ${coupon.value.toFixed(2)} OFF`
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando cupons...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Ticket className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Cupons e Promoções</h1>
        </div>
        <Dialog open={isNewCouponOpen} onOpenChange={setIsNewCouponOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cupom
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Cupom</DialogTitle>
              <DialogDescription>Configure um novo cupom de desconto</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Código do Cupom *</Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="code" 
                      placeholder="Ex: DESCONTO10" 
                      value={newCouponData.code}
                      onChange={(e) => setNewCouponData({...newCouponData, code: e.target.value.toUpperCase()})}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={generateRandomCode}>
                      <Gift className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="name">Nome do Cupom *</Label>
                  <Input 
                    id="name" 
                    placeholder="Ex: Desconto de Primeira Tatuagem" 
                    value={newCouponData.name}
                    onChange={(e) => setNewCouponData({...newCouponData, name: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  id="description" 
                  placeholder="Descrição do cupom para o cliente..." 
                  value={newCouponData.description}
                  onChange={(e) => setNewCouponData({...newCouponData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Tipo de Desconto *</Label>
                  <Select value={newCouponData.type} onValueChange={(value) => setNewCouponData({...newCouponData, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {couponTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="value">
                    Valor * {newCouponData.type === "percentage" ? "(%)" : "(R$)"}
                  </Label>
                  <Input 
                    id="value" 
                    type="number" 
                    step={newCouponData.type === "percentage" ? "1" : "0.01"}
                    placeholder={newCouponData.type === "percentage" ? "10" : "50.00"} 
                    value={newCouponData.value}
                    onChange={(e) => setNewCouponData({...newCouponData, value: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minOrderValue">Valor Mínimo do Pedido (R$)</Label>
                  <Input 
                    id="minOrderValue" 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    value={newCouponData.minOrderValue}
                    onChange={(e) => setNewCouponData({...newCouponData, minOrderValue: e.target.value})}
                  />
                </div>
                {newCouponData.type === "percentage" && (
                  <div>
                    <Label htmlFor="maxDiscount">Desconto Máximo (R$)</Label>
                    <Input 
                      id="maxDiscount" 
                      type="number" 
                      step="0.01"
                      placeholder="Sem limite" 
                      value={newCouponData.maxDiscount}
                      onChange={(e) => setNewCouponData({...newCouponData, maxDiscount: e.target.value})}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="validFrom">Válido a partir de</Label>
                  <Input 
                    id="validFrom" 
                    type="datetime-local" 
                    value={newCouponData.validFrom}
                    onChange={(e) => setNewCouponData({...newCouponData, validFrom: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="validUntil">Válido até</Label>
                  <Input 
                    id="validUntil" 
                    type="datetime-local" 
                    value={newCouponData.validUntil}
                    onChange={(e) => setNewCouponData({...newCouponData, validUntil: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="usageLimit">Limite de Uso (deixe vazio para ilimitado)</Label>
                <Input 
                  id="usageLimit" 
                  type="number" 
                  placeholder="Ilimitado" 
                  value={newCouponData.usageLimit}
                  onChange={(e) => setNewCouponData({...newCouponData, usageLimit: e.target.value})}
                />
              </div>

              <Button onClick={handleAddCoupon} className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando Cupom...
                  </>
                ) : (
                  "Criar Cupom"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cupons</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCoupons}</div>
            <p className="text-xs text-muted-foreground">Cupons criados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <Star className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.activeCoupons}</div>
            <p className="text-xs text-muted-foreground">Cupons ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilizados</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.usedCoupons}</div>
            <p className="text-xs text-muted-foreground">Cupons utilizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Desconto Total</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              R$ {stats.totalDiscount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Valor em descontos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por código ou nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="percentage">Porcentagem</SelectItem>
                  <SelectItem value="fixed_amount">Valor fixo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Cupons */}
      <div className="grid gap-4">
        {filteredCoupons.length > 0 ? (
          filteredCoupons.map((coupon: any) => {
            const status = getCouponStatus(coupon)
            return (
              <Card key={coupon.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          <Ticket className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-lg">{coupon.code}</h3>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(coupon.code)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">{coupon.name}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Badge variant={status.color as any}>{status.text}</Badge>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {formatDiscount(coupon)}
                          </Badge>
                        </div>
                      </div>

                      {coupon.description && (
                        <p className="text-sm text-muted-foreground mb-4">{coupon.description}</p>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Tipo</p>
                          <p className="font-medium">
                            {coupon.type === "percentage" ? "Porcentagem" : "Valor Fixo"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Usos</p>
                          <p className="font-medium">
                            {coupon.usageCount || 0}
                            {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Valor Mínimo</p>
                          <p className="font-medium">
                            {coupon.minOrderValue > 0 ? `R$ ${coupon.minOrderValue.toFixed(2)}` : "Sem mínimo"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Validade</p>
                          <p className="font-medium text-sm">
                            {coupon.validUntil 
                              ? new Date(coupon.validUntil).toLocaleDateString("pt-BR")
                              : "Sem prazo"
                            }
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => toggleCouponStatus(coupon)}
                          >
                            {coupon.isActive ? "Desativar" : "Ativar"}
                          </Button>
                        </div>
                        {coupon.maxDiscount && coupon.type === "percentage" && (
                          <div className="text-sm text-muted-foreground">
                            Desconto máximo: R$ {coupon.maxDiscount.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">Nenhum cupom encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedType !== "all" 
                  ? "Tente ajustar os filtros de busca"
                  : "Comece criando seus primeiros cupons de desconto"
                }
              </p>
              <Button onClick={() => setIsNewCouponOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Cupom
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
