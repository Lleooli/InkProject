"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calculator, Share2, Save, Users, Plus, Loader2, Settings2, Ticket, Check, Eye, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useClients, useQuotes, useCoupons } from "@/lib/firebase-hooks-user"
import { useCalculatorConfig } from "@/contexts/calculator-config-context"
import { useAvailableNeedles } from "@/lib/stock-hooks"

export function TattooCalculator() {
  const { config } = useCalculatorConfig()
  const { needles, loading: loadingNeedles } = useAvailableNeedles()
  const { coupons, incrementCouponUsage } = useCoupons()
  
  const [formData, setFormData] = useState({
    width: "",
    height: "",
    complexity: "",
    timeEstimate: "",
    bodyPart: "",
    colors: "",
    description: "",
    // Novas opções de customização
    selectedNeedles: [] as Array<{id: string, name: string, quantity: number, unitPrice: number}>,
    glovesQuantity: "1",
    useOintment: true,
    customMaterials: [] as Array<{name: string, cost: number}>,
  })

  const [calculation, setCalculation] = useState<any>(null)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [isNewClientOpen, setIsNewClientOpen] = useState(false)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false)
  const [isNeedleSelectionOpen, setIsNeedleSelectionOpen] = useState(false)
  const [isLoadingClient, setIsLoadingClient] = useState(false)
  const [isConfigViewOpen, setIsConfigViewOpen] = useState(false)
  
  // Estados para cupons
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [couponCode, setCouponCode] = useState("")
  const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false)
  const [clientFormData, setClientFormData] = useState({
    name: "",
    phone: "",
    email: "",
    birthDate: "",
    address: "",
    preferences: "",
    notes: "",
  })

  const { clients, loading: loadingClients, addClient } = useClients()
  const { addQuote } = useQuotes()
  const { toast } = useToast()

  // Funções auxiliares para gerenciar agulhas e materiais
  const addNeedle = (needle: any) => {
    const existingIndex = formData.selectedNeedles.findIndex(n => n.id === needle.id)
    if (existingIndex >= 0) {
      const updatedNeedles = [...formData.selectedNeedles]
      updatedNeedles[existingIndex].quantity += 1
      setFormData({ ...formData, selectedNeedles: updatedNeedles })
    } else {
      setFormData({
        ...formData,
        selectedNeedles: [...formData.selectedNeedles, {
          id: needle.id || '',
          name: needle.name || '',
          quantity: 1,
          unitPrice: needle.unitPrice || 0
        }]
      })
    }
  }

  const removeNeedle = (needleId: string) => {
    setFormData({
      ...formData,
      selectedNeedles: formData.selectedNeedles.filter(n => n.id !== needleId)
    })
  }

  const updateNeedleQuantity = (needleId: string, quantity: number) => {
    const updatedNeedles = formData.selectedNeedles.map(needle =>
      needle.id === needleId ? { ...needle, quantity: Math.max(1, quantity || 1) } : needle
    )
    setFormData({ ...formData, selectedNeedles: updatedNeedles })
  }

  const addCustomMaterial = (name: string, cost: number) => {
    if (name && cost > 0) {
      setFormData({
        ...formData,
        customMaterials: [...formData.customMaterials, { name, cost }]
      })
    }
  }

  const removeCustomMaterial = (index: number) => {
    const updatedMaterials = formData.customMaterials.filter((_, i) => i !== index)
    setFormData({ ...formData, customMaterials: updatedMaterials })
  }

  // Função para validar cupom
  const validateCoupon = (coupon: any, orderValue: number) => {
    const now = new Date()
    
    if (!coupon.isActive) {
      return { valid: false, message: "Cupom inativo" }
    }
    
    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      return { valid: false, message: "Cupom ainda não está válido" }
    }
    
    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      return { valid: false, message: "Cupom expirado" }
    }
    
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, message: "Cupom esgotado" }
    }
    
    if (coupon.minOrderValue && orderValue < coupon.minOrderValue) {
      return { valid: false, message: `Valor mínimo: R$ ${coupon.minOrderValue.toFixed(2)}` }
    }
    
    return { valid: true, message: "Cupom válido" }
  }

  // Função para calcular desconto do cupom
  const calculateCouponDiscount = (coupon: any, orderValue: number) => {
    if (coupon.type === "percentage") {
      const discount = (orderValue * coupon.value) / 100
      if (coupon.maxDiscount) {
        return Math.min(discount, coupon.maxDiscount)
      }
      return discount
    } else if (coupon.type === "fixed_amount") {
      return Math.min(coupon.value, orderValue)
    }
    return 0
  }

  // Função para aplicar cupom
  const applyCoupon = () => {
    if (!calculation) {
      toast({
        title: "Calcule primeiro",
        description: "É necessário calcular o orçamento antes de aplicar um cupom.",
        variant: "destructive",
      })
      return
    }

    const coupon = coupons?.find((c: any) => 
      c.code.toLowerCase() === couponCode.toLowerCase()
    )
    
    if (!coupon) {
      toast({
        title: "Cupom não encontrado",
        description: "Verifique o código digitado.",
        variant: "destructive",
      })
      return
    }
    
    const originalPrice = appliedCoupon ? appliedCoupon.originalPrice : calculation.finalPrice
    const validation = validateCoupon(coupon, originalPrice)
    
    if (!validation.valid) {
      toast({
        title: "Cupom inválido",
        description: validation.message,
        variant: "destructive",
      })
      return
    }
    
    const discount = calculateCouponDiscount(coupon, originalPrice)
    const newFinalPrice = originalPrice - discount
    
    setAppliedCoupon({ 
      ...coupon, 
      discount,
      originalPrice,
      finalPrice: newFinalPrice 
    })
    
    // Atualizar o calculation com o desconto
    setCalculation({
      ...calculation,
      couponDiscount: discount,
      finalPrice: newFinalPrice
    })
    
    toast({
      title: "Cupom aplicado!",
      description: `Desconto de R$ ${discount.toFixed(2)} aplicado.`,
    })
    
    setCouponCode("")
    setIsCouponDialogOpen(false)
  }

  // Função para remover cupom
  const removeCoupon = () => {
    if (!appliedCoupon) return
    
    setCalculation({
      ...calculation,
      couponDiscount: 0,
      finalPrice: appliedCoupon.originalPrice
    })
    
    setAppliedCoupon(null)
    
    toast({
      title: "Cupom removido",
      description: "Desconto foi removido do orçamento.",
    })
  }

  const calculateTattoo = () => {
    if (!formData.width || !formData.height || !formData.complexity || !formData.timeEstimate) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios para calcular.",
        variant: "destructive",
      })
      return
    }

    const area = Number.parseFloat(formData.width) * Number.parseFloat(formData.height)
    const complexity = config.complexityOptions.find((c) => c.value === formData.complexity)
    const bodyPart = config.bodyPartOptions.find((b) => b.value === formData.bodyPart)
    const timeHours = Number.parseFloat(formData.timeEstimate)
    const colorCount = formData.colors ? Number.parseFloat(formData.colors) : 1 // Default para 1 se não informado

    // Custos base dos materiais usando as configurações
    const materialCosts = {
      // Custo de agulhas: usa preço real do estoque ou custo padrão por área
      agulhas: formData.selectedNeedles.length > 0 
        ? formData.selectedNeedles.reduce((total, needle) => total + (needle.quantity * needle.unitPrice), 0)
        : area * config.materialCosts.needleCost,
      
      // Custo de tintas: área × complexidade × custo base × número de cores
      tintas: area * (complexity?.multiplier || 1) * config.materialCosts.inkCost * Math.max(1, colorCount),
      
      // Custo de luvas: quantidade de pares × custo unitário
      luvas: Number(formData.glovesQuantity || 1) * config.materialCosts.gloveCost,
      
      // Custo de filme: proporcional à área
      filme: area * config.materialCosts.filmCost,
      
      // Pomada: opcional, proporcional à área
      pomada: formData.useOintment ? area * config.materialCosts.ointmentCost : 0,
      
      // Outros materiais: custo fixo por sessão
      outros: config.materialCosts.otherCosts || 0,
      
      // Materiais extras personalizados
      customMaterials: (formData.customMaterials || []).reduce((total, material) => total + (material.cost || 0), 0),
    }

    const totalMaterials = Object.values(materialCosts).reduce((sum, cost) => sum + (cost || 0), 0)

    // Valor da mão de obra: tempo × valor/hora × multiplicadores × margem de lucro
    const baseLaborCost = timeHours * config.hourlyRate * (complexity?.multiplier || 1) * (bodyPart?.multiplier || 1)
    const laborCost = baseLaborCost * (1 + (config.profitMargin || 0) / 100) // Margem aplicada na mão de obra

    const subtotal = totalMaterials + laborCost
    const finalPrice = subtotal // Preço final já com margem incluída na mão de obra

    // Validações e alertas para orçamentos irreais
    const warnings = []
    
    if (area < 1) {
      warnings.push("Área muito pequena para uma tatuagem (< 1cm²)")
    }
    if (area > 2000) {
      warnings.push("Área muito grande - considere dividir em múltiplas sessões")
    }
    if (timeHours < 0.5) {
      warnings.push("Tempo mínimo recomendado: 30 minutos")
    }
    if (timeHours > 8) {
      warnings.push("Sessões longas (>8h) podem requerer múltiplas consultas")
    }
    if (materialCosts.agulhas > laborCost) {
      warnings.push("Custo de agulhas alto comparado à mão de obra")
    }
    if (finalPrice < 50) {
      warnings.push("Valor final muito baixo - verifique configurações")
    }

    // Mostrar avisos se necessário
    if (warnings.length > 0) {
      toast({
        title: "Atenção aos valores calculados",
        description: warnings[0], // Mostrar primeiro aviso
        variant: "default",
      })
    }

    setCalculation({
      area,
      materialCosts,
      totalMaterials,
      laborCost,
      subtotal,
      finalPrice,
      complexity: complexity?.label,
      bodyPart: bodyPart?.label,
      timeHours,
      // Informações adicionais para debugging/transparência
      calculations: {
        baseLaborCost, // Valor base da mão de obra (sem margem)
        colorMultiplier: Math.max(1, colorCount),
        complexityMultiplier: complexity?.multiplier || 1,
        bodyPartMultiplier: bodyPart?.multiplier || 1,
        profitMargin: config.profitMargin || 0,
        warnings
      }
    })
  }

  const shareQuote = () => {
    if (!calculation) return

    const clientInfo = selectedClient ? `👤 Cliente: ${selectedClient.name}
📞 ${selectedClient.phone}

` : ""

    const message = `� ORÇAMENTO DE TATUAGEM 🎨

${clientInfo}� Dimensões: ${formData.width}cm x ${formData.height}cm (${calculation.area.toFixed(1)}cm²)
� Complexidade: ${calculation.complexity}
🫀 Local: ${calculation.bodyPart}
⏱️ Tempo estimado: ${calculation.timeHours}h

💰 DETALHAMENTO:
• Materiais: R$ ${calculation.totalMaterials.toFixed(2)}
• Mão de obra: R$ ${calculation.laborCost.toFixed(2)}
• Subtotal: R$ ${(calculation.totalMaterials + calculation.laborCost).toFixed(2)}${appliedCoupon ? `
🎟️ CUPOM: ${appliedCoupon.code} (-R$ ${appliedCoupon.discount.toFixed(2)})` : ""}

💎 VALOR TOTAL: R$ ${calculation.finalPrice.toFixed(2)}

${formData.description ? `📝 Descrição: ${formData.description}` : ""}

Agendamento pelo WhatsApp! 📱`

    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank")
  }

  const handleNewClient = async () => {
    if (!clientFormData.name || !clientFormData.phone) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e telefone são obrigatórios.",
        variant: "destructive",
      })
      return
    }

    setIsLoadingClient(true)
    try {
      const newClient = await addClient({
        ...clientFormData,
        preferences: clientFormData.preferences
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p),
        totalSessions: 0,
        totalSpent: 0,
        rating: 5,
        status: "ativo",
        tattoos: [],
      })

      setSelectedClient(newClient)
      toast({
        title: "Cliente criado!",
        description: "Novo cliente foi cadastrado e vinculado ao orçamento.",
      })

      setIsNewClientOpen(false)
      setIsClientModalOpen(false)
      setClientFormData({
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
      setIsLoadingClient(false)
    }
  }

  const saveQuote = async () => {
    if (!calculation) {
      toast({
        title: "Erro",
        description: "Calcule um orçamento primeiro.",
        variant: "destructive",
      })
      return
    }

    try {
      const quoteData = {
        // Dados da tatuagem
        width: formData.width,
        height: formData.height,
        complexity: formData.complexity,
        timeEstimate: formData.timeEstimate,
        bodyPart: formData.bodyPart,
        colors: formData.colors,
        description: formData.description,
        
        // Dados do cálculo
        area: calculation.area,
        materialCosts: calculation.materialCosts,
        totalMaterials: calculation.totalMaterials,
        laborCost: calculation.laborCost,
        subtotal: calculation.subtotal,
        finalPrice: calculation.finalPrice,
        
        // Informações do cupom (se aplicado)
        appliedCoupon: appliedCoupon ? {
          id: appliedCoupon.id,
          code: appliedCoupon.code,
          name: appliedCoupon.name,
          type: appliedCoupon.type,
          value: appliedCoupon.value,
          discount: appliedCoupon.discount,
          originalPrice: appliedCoupon.originalPrice
        } : null,
        
        // Cliente vinculado (se houver)
        clientId: selectedClient?.id || null,
        clientName: selectedClient?.name || null,
        
        // Status do orçamento
        status: "pendente", // pendente, aprovado, rejeitado
      }

      await addQuote(quoteData)

      // Incrementar contador de uso do cupom se aplicado
      if (appliedCoupon) {
        await incrementCouponUsage(appliedCoupon.id)
      }

      toast({
        title: "Orçamento salvo!",
        description: selectedClient 
          ? `Orçamento vinculado ao cliente ${selectedClient.name}`
          : "Orçamento salvo como rascunho",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar orçamento. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calculator className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Calculadora de Tatuagem</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsConfigViewOpen(!isConfigViewOpen)}
          className="flex items-center space-x-2"
        >
          <Eye className="h-4 w-4" />
          <span>{isConfigViewOpen ? 'Ocultar' : 'Ver'} Configurações</span>
        </Button>
      </div>

      {/* Painel de Configurações */}
      {isConfigViewOpen && (
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
              <Settings2 className="h-5 w-5" />
              <span>Configurações Atuais</span>
            </CardTitle>
            <CardDescription className="text-blue-600 dark:text-blue-400">
              Visualize as configurações definidas na aba de configurações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Configurações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-blue-700 dark:text-blue-300">Valores Base</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Valor por hora:</span>
                    <span className="font-medium">R$ {config.hourlyRate.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Margem de lucro:</span>
                    <span className="font-medium">{config.profitMargin}%</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-blue-700 dark:text-blue-300">Custos de Materiais</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Agulhas/cm²:</span>
                    <span className="font-medium">R$ {config.materialCosts.needleCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tintas/cm²:</span>
                    <span className="font-medium">R$ {config.materialCosts.inkCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Luvas/descartáveis:</span>
                    <span className="font-medium">R$ {config.materialCosts.gloveCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Filme/proteção/cm²:</span>
                    <span className="font-medium">R$ {config.materialCosts.filmCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pomada/cuidados/cm²:</span>
                    <span className="font-medium">R$ {config.materialCosts.ointmentCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Outros materiais:</span>
                    <span className="font-medium">R$ {config.materialCosts.otherCosts.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tipos de Complexidade */}
            <div className="space-y-2">
              <h4 className="font-medium text-blue-700 dark:text-blue-300">Tipos de Complexidade</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {config.complexityOptions.map((option) => (
                  <div key={option.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                    <span className="text-sm font-medium">{option.label}</span>
                    <Badge variant="secondary" className="text-xs">x{option.multiplier}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Partes do Corpo */}
            <div className="space-y-2">
              <h4 className="font-medium text-blue-700 dark:text-blue-300">Partes do Corpo</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {config.bodyPartOptions.map((option) => (
                  <div key={option.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                    <span className="text-sm font-medium">{option.label}</span>
                    <Badge variant="secondary" className="text-xs">x{option.multiplier}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Informação adicional */}
            <div className="flex items-start space-x-2 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium">Como usar essas configurações:</p>
                <p className="mt-1 text-blue-600 dark:text-blue-400">
                  Estas configurações são aplicadas automaticamente nos cálculos. Para alterá-las, vá para a aba <strong>Configurações</strong>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Dados da Tatuagem</CardTitle>
            <CardDescription>Preencha as informações para calcular o orçamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="width">Largura (cm) *</Label>
                <Input
                  id="width"
                  type="number"
                  placeholder="10"
                  value={formData.width}
                  onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="height">Altura (cm) *</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="15"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="complexity">Complexidade *</Label>
              <Select
                value={formData.complexity}
                onValueChange={(value) => setFormData({ ...formData, complexity: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a complexidade" />
                </SelectTrigger>
                <SelectContent>
                  {config.complexityOptions.map((option) => (
                    <SelectItem key={option.id} value={option.value}>
                      {option.label} (x{option.multiplier})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bodyPart">Local do Corpo</Label>
              <Select
                value={formData.bodyPart}
                onValueChange={(value) => setFormData({ ...formData, bodyPart: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o local" />
                </SelectTrigger>
                <SelectContent>
                  {config.bodyPartOptions.map((option) => (
                    <SelectItem key={option.id} value={option.value}>
                      {option.label} (x{option.multiplier})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="timeEstimate">Tempo Estimado (horas) *</Label>
              <Input
                id="timeEstimate"
                type="number"
                step="0.5"
                placeholder="2.5"
                value={formData.timeEstimate}
                onChange={(e) => setFormData({ ...formData, timeEstimate: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="colors">Número de Cores</Label>
              <Input
                id="colors"
                type="number"
                placeholder="3"
                value={formData.colors}
                onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição da Tatuagem</Label>
              <Textarea
                id="description"
                placeholder="Descreva a ideia da tatuagem..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Configurações Avançadas */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Configurações Avançadas</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAdvancedSettingsOpen(true)}
                >
                  <Settings2 className="h-4 w-4 mr-2" />
                  Personalizar Materiais
                </Button>
              </div>
              
              {/* Preview das configurações */}
              <div className="space-y-2 text-sm text-muted-foreground">
                {formData.selectedNeedles.length > 0 && (
                  <div>
                    🏷️ Agulhas personalizadas: {formData.selectedNeedles.length} tipo(s)
                  </div>
                )}
                <div>
                  🧤 Luvas: {formData.glovesQuantity} par(es)
                </div>
                <div>
                  🧴 Pomada: {formData.useOintment ? "Incluída" : "Não incluída"}
                </div>
                {formData.customMaterials.length > 0 && (
                  <div>
                    📦 Materiais extras: {formData.customMaterials.length} item(s)
                  </div>
                )}
              </div>
            </div>

            <Button onClick={calculateTattoo} className="w-full">
              <Calculator className="h-4 w-4 mr-2" />
              Calcular Orçamento
            </Button>
          </CardContent>
        </Card>

        {/* Resultado */}
        <Card>
          <CardHeader>
            <CardTitle>Orçamento Calculado</CardTitle>
            <CardDescription>Detalhamento dos custos e valor final</CardDescription>
          </CardHeader>
          <CardContent>
            {calculation ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Área:</span>
                    <p className="font-medium">{calculation.area.toFixed(1)} cm²</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tempo:</span>
                    <p className="font-medium">{calculation.timeHours}h</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Custos de Materiais:</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Agulhas:</span>
                      <span>R$ {(calculation.materialCosts.agulhas || 0).toFixed(2)}</span>
                    </div>
                    {(formData.selectedNeedles || []).length > 0 && (
                      <div className="ml-4 space-y-1 text-xs text-muted-foreground">
                        {(formData.selectedNeedles || []).map((needle, index) => (
                          <div key={index} className="flex justify-between">
                            <span>• {needle.name} x{needle.quantity || 1}</span>
                            <span>R$ {((needle.quantity || 1) * (needle.unitPrice || 0)).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Tintas ({formData.colors || 1} cor{(formData.colors && Number(formData.colors) > 1) ? 'es' : ''}):</span>
                      <span>R$ {(calculation.materialCosts.tintas || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Luvas e descartáveis ({formData.glovesQuantity || 1} par(es)):</span>
                      <span>R$ {(calculation.materialCosts.luvas || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Filme e proteção:</span>
                      <span>R$ {(calculation.materialCosts.filme || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pomada e cuidados {formData.useOintment ? "" : "(não incluída)"}:</span>
                      <span>R$ {(calculation.materialCosts.pomada || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Outros materiais:</span>
                      <span>R$ {(calculation.materialCosts.outros || 0).toFixed(2)}</span>
                    </div>
                    {(calculation.materialCosts.customMaterials || 0) > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span>Materiais extras:</span>
                          <span>R$ {(calculation.materialCosts.customMaterials || 0).toFixed(2)}</span>
                        </div>
                        {(formData.customMaterials || []).length > 0 && (
                          <div className="ml-4 space-y-1 text-xs text-muted-foreground">
                            {(formData.customMaterials || []).map((material, index) => (
                              <div key={index} className="flex justify-between">
                                <span>• {material.name}</span>
                                <span>R$ {(material.cost || 0).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex justify-between font-medium border-t pt-2">
                    <span>Total Materiais:</span>
                    <span>R$ {(calculation.totalMaterials || 0).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span>Mão de obra:</span>
                  <span className="font-medium">R$ {(calculation.laborCost || 0).toFixed(2)}</span>
                </div>

                <div className="border-t pt-4">
                  {/* Cupom aplicado */}
                  {appliedCoupon && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Ticket className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-700">
                            Cupom: {appliedCoupon.code}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={removeCoupon}
                          className="h-6 w-6 p-0 text-green-600 hover:text-red-600"
                        >
                          ×
                        </Button>
                      </div>
                      <div className="text-sm text-green-600 mt-1">
                        Desconto: R$ {appliedCoupon.discount.toFixed(2)} 
                        {appliedCoupon.type === "percentage" 
                          ? ` (${appliedCoupon.value}%)`
                          : " (valor fixo)"
                        }
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between text-lg font-bold">
                    <span>VALOR FINAL:</span>
                    <span className="text-green-500">R$ {(calculation.finalPrice || 0).toFixed(2)}</span>
                  </div>

                  {/* Botão para aplicar cupom */}
                  {!appliedCoupon && (
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsCouponDialogOpen(true)}
                        className="w-full"
                      >
                        <Ticket className="h-4 w-4 mr-2" />
                        Aplicar Cupom
                      </Button>
                    </div>
                  )}
                  
                  {/* Informações dos multiplicadores aplicados */}
                  {calculation.calculations && (
                    <div className="mt-2 p-2 bg-muted/50 rounded text-xs space-y-1">
                      <div className="font-medium text-muted-foreground">Multiplicadores aplicados:</div>
                      <div className="grid grid-cols-2 gap-1 text-muted-foreground">
                        <span>• Complexidade: x{calculation.calculations.complexityMultiplier}</span>
                        <span>• Cores: x{calculation.calculations.colorMultiplier}</span>
                        <span>• Local: x{calculation.calculations.bodyPartMultiplier}</span>
                        <span>• Margem: +{calculation.calculations.profitMargin}% (na mão de obra)</span>
                      </div>
                      {calculation.calculations.baseLaborCost && (
                        <div className="text-xs text-muted-foreground border-t pt-1">
                          💼 Base mão de obra: R$ {calculation.calculations.baseLaborCost.toFixed(2)}
                        </div>
                      )}
                      {calculation.calculations.warnings && calculation.calculations.warnings.length > 0 && (
                        <div className="mt-2 text-yellow-600">
                          ⚠️ {calculation.calculations.warnings.length} aviso(s) detectado(s)
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Seção do Cliente */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Cliente</h4>
                    <Dialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Users className="h-4 w-4 mr-2" />
                          {selectedClient ? "Alterar" : "Vincular"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Vincular Cliente</DialogTitle>
                          <DialogDescription>
                            Selecione um cliente existente ou cadastre um novo
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          {loadingClients ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                          ) : (
                            <>
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                <Label>Clientes Existentes</Label>
                                {clients.map((client) => (
                                  <div
                                    key={client.id}
                                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                      selectedClient?.id === client.id 
                                        ? "border-primary bg-primary/5" 
                                        : "border-border hover:border-primary/50"
                                    }`}
                                    onClick={() => {
                                      setSelectedClient(client)
                                      setIsClientModalOpen(false)
                                    }}
                                  >
                                    <div className="font-medium">{client.name}</div>
                                    <div className="text-sm text-muted-foreground">{client.phone}</div>
                                  </div>
                                ))}
                              </div>
                              
                              <div className="border-t pt-4">
                                <Button
                                  variant="outline"
                                  onClick={() => setIsNewClientOpen(true)}
                                  className="w-full"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Cadastrar Novo Cliente
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {selectedClient ? (
                    <div className="bg-primary/5 rounded-lg p-3">
                      <div className="font-medium">{selectedClient.name}</div>
                      <div className="text-sm text-muted-foreground">{selectedClient.phone}</div>
                      {selectedClient.email && (
                        <div className="text-sm text-muted-foreground">{selectedClient.email}</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 text-center">
                      Nenhum cliente vinculado
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button onClick={shareQuote} className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 bg-transparent"
                    onClick={saveQuote}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {selectedClient ? "Salvar p/ Cliente" : "Salvar"}
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="secondary">{calculation.complexity}</Badge>
                  {calculation.bodyPart && <Badge variant="outline">{calculation.bodyPart}</Badge>}
                  <Badge variant="outline">{calculation.area.toFixed(1)} cm²</Badge>
                  {selectedClient && <Badge variant="default" className="bg-green-600">Cliente: {selectedClient.name}</Badge>}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Preencha os dados para ver o orçamento calculado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Novo Cliente */}
      <Dialog open={isNewClientOpen} onOpenChange={setIsNewClientOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
            <DialogDescription>Cadastre um novo cliente no sistema</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Nome *</Label>
                <Input
                  id="clientName"
                  placeholder="Nome completo"
                  value={clientFormData.name}
                  onChange={(e) => setClientFormData({ ...clientFormData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="clientPhone">Telefone *</Label>
                <Input
                  id="clientPhone"
                  placeholder="(11) 99999-9999"
                  value={clientFormData.phone}
                  onChange={(e) => setClientFormData({ ...clientFormData, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="clientEmail">E-mail</Label>
              <Input
                id="clientEmail"
                type="email"
                placeholder="email@exemplo.com"
                value={clientFormData.email}
                onChange={(e) => setClientFormData({ ...clientFormData, email: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientBirthDate">Data de Nascimento</Label>
                <Input
                  id="clientBirthDate"
                  type="date"
                  value={clientFormData.birthDate}
                  onChange={(e) => setClientFormData({ ...clientFormData, birthDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="clientAddress">Endereço</Label>
                <Input
                  id="clientAddress"
                  placeholder="Cidade, Estado"
                  value={clientFormData.address}
                  onChange={(e) => setClientFormData({ ...clientFormData, address: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="clientPreferences">Preferências (separadas por vírgula)</Label>
              <Input
                id="clientPreferences"
                placeholder="Realismo, Blackwork, Colorido"
                value={clientFormData.preferences}
                onChange={(e) => setClientFormData({ ...clientFormData, preferences: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="clientNotes">Observações</Label>
              <Textarea
                id="clientNotes"
                placeholder="Notas sobre o cliente..."
                value={clientFormData.notes}
                onChange={(e) => setClientFormData({ ...clientFormData, notes: e.target.value })}
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsNewClientOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button onClick={handleNewClient} disabled={isLoadingClient} className="flex-1">
                {isLoadingClient ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Cadastrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Configurações Avançadas */}
      <Dialog open={isAdvancedSettingsOpen} onOpenChange={setIsAdvancedSettingsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configurações Avançadas de Materiais</DialogTitle>
            <DialogDescription>
              Personalize os materiais utilizados neste orçamento específico
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Seleção de Agulhas */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Agulhas Selecionadas</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNeedleSelectionOpen(true)}
                  disabled={loadingNeedles}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {loadingNeedles ? "Carregando..." : "Adicionar do Estoque"}
                </Button>
              </div>
              
              <div className="space-y-2">
                {formData.selectedNeedles.length === 0 ? (
                  <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4 text-center">
                    Nenhuma agulha selecionada. Será usado o custo padrão por cm².
                  </div>
                ) : (
                  formData.selectedNeedles.map((needle) => (
                    <div key={needle.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{needle.name}</div>
                        <div className="text-sm text-muted-foreground">
                          R$ {(needle.unitPrice || 0).toFixed(2)} por unidade
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          min="1"
                          value={needle.quantity}
                          onChange={(e) => updateNeedleQuantity(needle.id, Number(e.target.value))}
                          className="w-20"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNeedle(needle.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Configuração de Luvas */}
            <div className="space-y-4">
              <h4 className="font-medium">Luvas e Descartáveis</h4>
              <div className="flex items-center space-x-4">
                <Label htmlFor="glovesQuantity">Quantidade de pares:</Label>
                <Input
                  id="glovesQuantity"
                  type="number"
                  min="1"
                  value={formData.glovesQuantity}
                  onChange={(e) => setFormData({ ...formData, glovesQuantity: e.target.value })}
                  className="w-20"
                />
              </div>
            </div>

            {/* Configuração de Pomada */}
            <div className="space-y-4">
              <h4 className="font-medium">Pomada e Cuidados Pós-Tatuagem</h4>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useOintment"
                  checked={formData.useOintment}
                  onChange={(e) => setFormData({ ...formData, useOintment: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="useOintment">
                  Incluir pomada no orçamento (R$ {config.materialCosts.ointmentCost.toFixed(2)} por cm²)
                </Label>
              </div>
            </div>

            {/* Materiais Customizados */}
            <div className="space-y-4">
              <h4 className="font-medium">Materiais Extras</h4>
              <div className="space-y-2">
                {formData.customMaterials.map((material, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <span className="font-medium">{material.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">R$ {material.cost.toFixed(2)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomMaterial(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        ✕
                      </Button>
                    </div>
                  </div>
                ))}
                <MaterialInput onAdd={addCustomMaterial} />
              </div>
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsAdvancedSettingsOpen(false)}
              className="flex-1"
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Seleção de Agulhas do Estoque */}
      <Dialog open={isNeedleSelectionOpen} onOpenChange={setIsNeedleSelectionOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Selecionar Agulhas do Estoque</DialogTitle>
            <DialogDescription>
              Escolha as agulhas disponíveis em seu estoque
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {loadingNeedles ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : needles.length === 0 ? (
              <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4 text-center">
                Nenhuma agulha disponível no estoque. Adicione agulhas na seção de estoque primeiro.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {needles.map((needle) => (
                  <div
                    key={needle.id}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:border-primary/50"
                    onClick={() => addNeedle(needle)}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{needle.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {needle.brand && `${needle.brand} • `}
                        R$ {(needle.unitPrice || 0).toFixed(2)} • Em estoque: {needle.quantity || 0}
                      </div>
                    </div>
                    <Button size="sm">
                      Adicionar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button 
            variant="outline" 
            onClick={() => setIsNeedleSelectionOpen(false)}
            className="w-full"
          >
            Fechar
          </Button>
        </DialogContent>
      </Dialog>

      {/* Dialog para aplicar cupom */}
      <Dialog open={isCouponDialogOpen} onOpenChange={setIsCouponDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Aplicar Cupom de Desconto</DialogTitle>
            <DialogDescription>
              Digite o código do cupom para aplicar o desconto
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {calculation && (
              <div className="bg-muted p-3 rounded-lg">
                <div className="text-sm text-muted-foreground">Valor atual do orçamento:</div>
                <div className="font-bold text-lg">
                  R$ {(appliedCoupon ? appliedCoupon.originalPrice : calculation.finalPrice).toFixed(2)}
                </div>
              </div>
            )}
            
            <div>
              <Label htmlFor="couponCode">Código do Cupom</Label>
              <div className="flex space-x-2">
                <Input
                  id="couponCode"
                  placeholder="Digite o código do cupom"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1"
                />
                <Button onClick={applyCoupon} disabled={!couponCode.trim()}>
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Lista de cupons disponíveis para seleção rápida */}
            {coupons && coupons.length > 0 && (
              <div>
                <Label>Cupons Disponíveis</Label>
                <div className="max-h-32 overflow-y-auto space-y-2 mt-2">
                  {coupons
                    .filter((coupon: any) => {
                      if (!calculation) return false
                      const orderValue = appliedCoupon ? appliedCoupon.originalPrice : calculation.finalPrice
                      const validation = validateCoupon(coupon, orderValue)
                      return validation.valid
                    })
                    .slice(0, 5)
                    .map((coupon: any) => (
                      <div 
                        key={coupon.id}
                        className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          setCouponCode(coupon.code)
                          applyCoupon()
                        }}
                      >
                        <div>
                          <div className="font-medium text-sm">{coupon.code}</div>
                          <div className="text-xs text-muted-foreground">{coupon.name}</div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {coupon.type === "percentage" 
                            ? `${coupon.value}%`
                            : `R$ ${coupon.value.toFixed(2)}`
                          }
                        </Badge>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsCouponDialogOpen(false)
                  setCouponCode("")
                }}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={applyCoupon}
                disabled={!couponCode.trim()}
              >
                Aplicar Cupom
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Componente auxiliar para adicionar materiais customizados
function MaterialInput({ onAdd }: { onAdd: (name: string, cost: number) => void }) {
  const [name, setName] = useState("")
  const [cost, setCost] = useState("")

  const handleAdd = () => {
    const parsedCost = Number(cost)
    if (name && cost && parsedCost > 0 && !isNaN(parsedCost)) {
      onAdd(name, parsedCost)
      setName("")
      setCost("")
    }
  }

  return (
    <div className="flex space-x-2">
      <Input
        placeholder="Nome do material"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1"
      />
      <Input
        placeholder="Custo (R$)"
        type="number"
        step="0.01"
        value={cost}
        onChange={(e) => setCost(e.target.value)}
        className="w-24"
      />
      <Button onClick={handleAdd} size="sm">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
