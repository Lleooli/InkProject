"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Settings, User, Bell, Calculator, MessageSquare, Shield, Download, Upload, Plus, Trash2, Edit, RotateCcw, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { ActiveSessions } from "@/components/active-sessions"
import { QRCodeDisplay } from "@/components/qr-code-display"
import { useCalculatorConfig, ComplexityOption, BodyPartOption } from "@/contexts/calculator-config-context"
import { NumericFormat } from 'react-number-format'

// Componente customizado para campos monetários
const CurrencyInput = ({ 
  id, 
  value, 
  onChange, 
  placeholder = "R$ 0,00" 
}: { 
  id: string
  value: number
  onChange: (value: number) => void
  placeholder?: string 
}) => (
  <NumericFormat
    id={id}
    customInput={Input}
    value={value}
    onValueChange={(values) => {
      onChange(values.floatValue || 0)
    }}
    thousandSeparator="."
    decimalSeparator=","
    prefix="R$ "
    decimalScale={2}
    fixedDecimalScale={true}
    placeholder={placeholder}
    allowNegative={false}
    className="w-full"
  />
)

// Funções para formatação de outras máscaras (mantidas para telefone, porcentagem, etc)
const formatPhone = (value: string): string => {
  const cleaned = value.replace(/\D/g, '')
  
  if (cleaned.length <= 2) {
    return `+${cleaned}`
  } else if (cleaned.length <= 4) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2)}`
  } else if (cleaned.length <= 9) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4)}`
  } else if (cleaned.length <= 11) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`
  } else {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 9)}-${cleaned.slice(9, 13)}`
  }
}

const parsePhone = (value: string): string => {
  return value.replace(/\D/g, '')
}

const formatPercentage = (value: string | number): string => {
  const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value
  return `${numericValue}%`
}

const parsePercentage = (value: string): number => {
  return parseFloat(value.replace('%', '')) || 0
}

const formatMultiplier = (value: string | number): string => {
  const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value
  return `${numericValue.toFixed(1)}x`
}

const parseMultiplier = (value: string): number => {
  return parseFloat(value.replace('x', '')) || 0
}

export function Configuracoes() {
  const { user, userProfile } = useAuth()
  const { 
    config, 
    updateConfig, 
    addComplexityOption, 
    updateComplexityOption, 
    removeComplexityOption,
    addBodyPartOption,
    updateBodyPartOption,
    removeBodyPartOption,
    resetToDefaults
  } = useCalculatorConfig()

  const [profile, setProfile] = useState({
    name: "João Silva",
    email: "joao@inkflow.com",
    phone: "+55 11 99999-9999",
    studio: "Ink Studio",
    address: "Rua das Flores, 123 - São Paulo, SP",
    bio: "Tatuador especializado em realismo e fineline com 8 anos de experiência.",
    instagram: "@joaosilva_tattoo",
    website: "www.joaosilvatattoo.com",
  })

  const [notifications, setNotifications] = useState({
    appointments: true,
    reminders: true,
    marketing: false,
    trends: true,
    whatsapp: true,
    email: false,
  })

  // Estados para edição de opções da calculadora
  const [isAddComplexityOpen, setIsAddComplexityOpen] = useState(false)
  const [isAddBodyPartOpen, setIsAddBodyPartOpen] = useState(false)
  const [isCalculationInfoOpen, setIsCalculationInfoOpen] = useState(false)
  const [editingComplexity, setEditingComplexity] = useState<ComplexityOption | null>(null)
  const [editingBodyPart, setEditingBodyPart] = useState<BodyPartOption | null>(null)
  const [newComplexityForm, setNewComplexityForm] = useState({
    label: "",
    value: "",
    multiplier: 1.0
  })
  const [newBodyPartForm, setNewBodyPartForm] = useState({
    label: "",
    value: "",
    multiplier: 1.0
  })

  const [whatsapp, setWhatsapp] = useState({
    phone: "+55 11 99999-9999",
    botEnabled: false,
    appointmentTemplate: `Olá! Gostaria de marcar uma tatuagem.

📝 *Informações necessárias:*
• Ideia da tatuagem: [descreva sua ideia]
• Tamanho aproximado: [ex: 10cm x 15cm]
• Local do corpo: [onde será feita]
• Preferência de data: [quando gostaria]
• Estilo desejado: [fineline, colorida, realismo, etc.]

Responda com essas informações para eu preparar seu orçamento! 🎨`,
    reminderTemplate: `Olá {nome}! Lembrete do seu agendamento de tatuagem amanhã às {horario}. Nos vemos em breve! 🎨`,
    quoteTemplate: `💉 ORÇAMENTO DE TATUAGEM 💉

📏 Tamanho: {tamanho}
🎨 Estilo: {estilo}
📍 Local: {local}
⏱️ Tempo estimado: {tempo}

💰 VALOR TOTAL: R$ {valor}

Agendamento pelo WhatsApp! 📱`,
  })

  const [botStatus, setBotStatus] = useState({
    running: false,
    loading: false,
    showQR: false
  })

  const { toast } = useToast()

  // Verifica status do bot ao carregar
  useEffect(() => {
    const checkBotStatus = async () => {
      try {
        const response = await fetch('/api/whatsapp')
        const result = await response.json()
        setBotStatus(prev => ({ 
          ...prev, 
          running: result.running 
        }))
      } catch (error) {
        console.error('Erro ao verificar status do bot:', error)
      }
    }
    
    checkBotStatus()
  }, [])

  const handleSaveProfile = () => {
    toast({
      title: "Perfil atualizado!",
      description: "Suas informações foram salvas com sucesso.",
    })
  }

  const handleSaveNotifications = () => {
    toast({
      title: "Notificações atualizadas!",
      description: "Suas preferências de notificação foram salvas.",
    })
  }

  const handleSaveWhatsApp = async () => {
    toast({
      title: "Templates atualizados!",
      description: "Os templates do WhatsApp foram salvos.",
    })

    // Se o bot está rodando, atualiza as configurações
    if (botStatus.running) {
      try {
        const response = await fetch('/api/whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update-config',
            config: {
              studioName: profile.studio,
              ownerName: profile.name,
              address: profile.address,
              instagram: profile.instagram,
              ...whatsapp
            }
          })
        })

        const result = await response.json()
        if (result.success) {
          toast({
            title: "Bot atualizado!",
            description: "Configurações do bot foram atualizadas.",
          })
        }
      } catch (error) {
        console.error('Erro ao atualizar bot:', error)
      }
    }
  }

  const handleBotToggle = async () => {
    setBotStatus(prev => ({ ...prev, loading: true }))
    
    try {
      const action = botStatus.running ? 'stop' : 'start'
      const config = {
        studioName: profile.studio,
        ownerName: profile.name,
        address: profile.address,
        instagram: profile.instagram,
        ...whatsapp
      }

      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, config })
      })

      const result = await response.json()
      
      if (result.success) {
        setBotStatus(prev => ({ 
          ...prev, 
          running: action === 'start',
          showQR: action === 'start'
        }))
        
        toast({
          title: result.message,
          description: action === 'start' 
            ? "QR Code aparecerá abaixo para conexão" 
            : "Bot do WhatsApp foi parado",
        })
      } else {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar com o bot",
        variant: "destructive"
      })
    } finally {
      setBotStatus(prev => ({ ...prev, loading: false }))
    }
  }

  const handleExportData = () => {
    toast({
      title: "Exportação iniciada!",
      description: "Seus dados estão sendo preparados para download.",
    })
  }

  const handleImportData = () => {
    toast({
      title: "Importação concluída!",
      description: "Seus dados foram importados com sucesso.",
    })
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-xl sm:text-2xl font-bold">Configurações</h1>
      </div>

      <Tabs defaultValue="perfil" className="space-y-6">
        <div className="flex justify-center">
          <TabsList className="flex flex-wrap justify-center gap-1 w-fit max-w-full h-auto p-1">
            <TabsTrigger value="perfil" className="text-sm sm:text-base px-4 py-2 h-10 min-w-[80px]">Perfil</TabsTrigger>
            <TabsTrigger value="seguranca" className="text-sm sm:text-base px-4 py-2 h-10 min-w-[80px] hidden xs:flex">Segurança</TabsTrigger>
            <TabsTrigger value="notificacoes" className="text-sm sm:text-base px-4 py-2 h-10 min-w-[100px] hidden lg:flex">Notificações</TabsTrigger>
            <TabsTrigger value="calculadora" className="text-sm sm:text-base px-4 py-2 h-10 min-w-[100px]">Calculadora</TabsTrigger>
            <TabsTrigger value="whatsapp" className="text-sm sm:text-base px-4 py-2 h-10 min-w-[80px]">WhatsApp</TabsTrigger>
            <TabsTrigger value="dados" className="text-sm sm:text-base px-4 py-2 h-10 min-w-[80px]">Dados</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="perfil" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Informações Pessoais</span>
              </CardTitle>
              <CardDescription>Atualize suas informações de perfil e estúdio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL || "/placeholder.svg"}
                      alt={user.displayName || "Avatar"}
                      className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover"
                    />
                  ) : (
                    <AvatarFallback className="text-base sm:text-lg">
                      {profile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="text-center sm:text-left">
                  <p className="text-sm text-muted-foreground">Foto sincronizada com sua conta Google</p>
                  <p className="text-xs text-muted-foreground mt-1">Para alterar, atualize em sua conta Google</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 space-y-0">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" value={user?.displayName || profile.name} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">Sincronizado com sua conta Google</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" value={user?.email || profile.email} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">Sincronizado com sua conta Google</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value)
                      setProfile({ ...profile, phone: formatted })
                    }}
                    placeholder="+55 11 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studio">Nome do Estúdio</Label>
                  <Input
                    id="studio"
                    value={profile.studio}
                    onChange={(e) => setProfile({ ...profile, studio: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={profile.instagram}
                    onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Endereço do Estúdio</Label>
                <Input
                  id="address"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Conte um pouco sobre você e seu trabalho..."
                />
              </div>

              <Button onClick={handleSaveProfile}>Salvar Alterações</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca" className="space-y-6">
          <ActiveSessions />
        </TabsContent>

        <TabsContent value="notificacoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Preferências de Notificação</span>
              </CardTitle>
              <CardDescription>Configure como e quando você quer receber notificações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="appointments">Novos Agendamentos</Label>
                    <p className="text-sm text-muted-foreground">Receba notificações de novos agendamentos</p>
                  </div>
                  <Switch
                    id="appointments"
                    checked={notifications.appointments}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, appointments: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="reminders">Lembretes</Label>
                    <p className="text-sm text-muted-foreground">Lembretes de agendamentos próximos</p>
                  </div>
                  <Switch
                    id="reminders"
                    checked={notifications.reminders}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, reminders: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="trends">Tendências</Label>
                    <p className="text-sm text-muted-foreground">Notícias e tendências do mundo da tatuagem</p>
                  </div>
                  <Switch
                    id="trends"
                    checked={notifications.trends}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, trends: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <p className="text-sm text-muted-foreground">Notificações via WhatsApp</p>
                  </div>
                  <Switch
                    id="whatsapp"
                    checked={notifications.whatsapp}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, whatsapp: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <p className="text-sm text-muted-foreground">Notificações por e-mail</p>
                  </div>
                  <Switch
                    id="email"
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="marketing">Marketing</Label>
                    <p className="text-sm text-muted-foreground">Dicas de marketing e promoções</p>
                  </div>
                  <Switch
                    id="marketing"
                    checked={notifications.marketing}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, marketing: checked })}
                  />
                </div>
              </div>

              <Button onClick={handleSaveNotifications}>Salvar Preferências</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculadora" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Configurações da Calculadora</span>
                <Dialog open={isCalculationInfoOpen} onOpenChange={setIsCalculationInfoOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="ml-2">
                      <Info className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] sm:w-full max-w-xs sm:max-w-4xl max-h-[90vh] overflow-y-auto mx-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <Calculator className="h-5 w-5" />
                        <span>Como Funcionam os Cálculos</span>
                      </DialogTitle>
                      <DialogDescription>
                        Entenda como o sistema calcula o valor final das tatuagens
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3 text-primary">Fórmula de Cálculo:</h4>
                        <div className="space-y-2 text-sm font-mono bg-background p-3 rounded border max-h-48 overflow-y-auto">
                          <div><strong>Área da Tatuagem</strong> = Largura × Altura (em cm²)</div>
                          <div><strong>Custos de Materiais:</strong></div>
                          <div className="ml-4">• Agulhas = Área × Custo por cm²</div>
                          <div className="ml-4">• Tintas = Área × Custo por cm² × Multiplicador de Complexidade</div>
                          <div className="ml-4">• Luvas/Descartáveis = Valor fixo</div>
                          <div className="ml-4">• Filme/Proteção = Área × Custo por cm²</div>
                          <div className="ml-4">• Pomada/Cuidados = Área × Custo por cm²</div>
                          <div className="ml-4">• Outros Materiais = Valor fixo</div>
                          <div className="mt-2"><strong>Mão de Obra</strong> = Tempo (horas) × Valor/hora × Multiplicador Complexidade × Multiplicador Parte do Corpo</div>
                          <div className="mt-2"><strong>Subtotal</strong> = Custos Materiais + Mão de Obra</div>
                          <div className="mt-2"><strong>Valor Final</strong> = Subtotal × (1 + Margem de Lucro%)</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-primary">Multiplicadores de Complexidade:</h4>
                          <div className="space-y-2 text-sm">
                            <p><strong>Função:</strong> Aumenta o custo de tintas e mão de obra baseado na dificuldade técnica</p>
                            <p><strong>Exemplo:</strong> Realismo (x2.0) custa o dobro de Linhas Finas (x1.0)</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold text-primary">Multiplicadores de Parte do Corpo:</h4>
                          <div className="space-y-2 text-sm">
                            <p><strong>Função:</strong> Ajusta o custo da mão de obra baseado na dificuldade de acesso</p>
                            <p><strong>Exemplo:</strong> Pescoço (x1.5) é mais difícil que Braço (x1.0)</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">💡 Exemplo Prático:</h4>
                        <div className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                          <div>Tatuagem: 10cm × 15cm = 150cm² | Realismo (x2.0) | Braço (x1.0) | 3 horas</div>
                          <div>• Materiais: R$ 89,00 (agulhas + tintas×2.0 + descartáveis + etc.)</div>
                          <div>• Mão de obra: 3h × R$ 80 × 2.0 × 1.0 = R$ 480,00</div>
                          <div>• Subtotal: R$ 569,00 | Com 30% de margem: <strong>R$ 739,70</strong></div>
                        </div>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                        <h4 className="font-semibold text-amber-700 dark:text-amber-300 mb-2">⚙️ Personalizações:</h4>
                        <div className="text-sm text-amber-600 dark:text-amber-400 space-y-1">
                          <div>• Ajuste todos os custos de materiais conforme seus fornecedores</div>
                          <div>• Modifique multiplicadores baseado na sua experiência</div>
                          <div>• Adicione novas complexidades e partes do corpo</div>
                          <div>• Configure sua margem de lucro ideal</div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <CardDescription>Ajuste os valores base para cálculo de orçamentos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Informação sobre os cálculos */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300">Como Funcionam os Cálculos</h4>
                    <p className="text-sm text-blue-600 dark:text-blue-400 leading-relaxed">
                      O sistema calcula o valor baseado em: <strong>Área da tatuagem × Custos de materiais + (Tempo × Valor/hora × Multiplicadores)</strong>. 
                      Os multiplicadores de complexidade e parte do corpo ajustam automaticamente o preço final. 
                      Clique no ícone <Info className="h-3 w-3 inline mx-1" /> ao lado do título para ver detalhes completos da fórmula.
                    </p>
                  </div>
                </div>
              </div>

              {/* Configurações Básicas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Valor por Hora</Label>
                  <CurrencyInput
                    id="hourlyRate"
                    value={config.hourlyRate}
                    onChange={(value) => updateConfig({ hourlyRate: value })}
                    placeholder="R$ 80,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profitMargin">Margem de Lucro</Label>
                  <Input
                    id="profitMargin"
                    value={`${config.profitMargin}%`}
                    onChange={(e) => {
                      const value = parsePercentage(e.target.value)
                      updateConfig({ profitMargin: value })
                    }}
                    placeholder="30%"
                  />
                </div>
              </div>

              {/* Custos de Materiais */}
              <div className="space-y-4">
                <h4 className="font-medium">Custos de Materiais</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="needleCost">Agulhas por cm²</Label>
                    <CurrencyInput
                      id="needleCost"
                      value={config.materialCosts.needleCost}
                      onChange={(value) => updateConfig({ 
                        materialCosts: { 
                          ...config.materialCosts, 
                          needleCost: value 
                        }
                      })}
                      placeholder="R$ 0,50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inkCost">Tintas por cm²</Label>
                    <CurrencyInput
                      id="inkCost"
                      value={config.materialCosts.inkCost}
                      onChange={(value) => updateConfig({ 
                        materialCosts: { 
                          ...config.materialCosts, 
                          inkCost: value 
                        }
                      })}
                      placeholder="R$ 2,00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gloveCost">Luvas e Descartáveis (fixo)</Label>
                    <CurrencyInput
                      id="gloveCost"
                      value={config.materialCosts.gloveCost}
                      onChange={(value) => updateConfig({ 
                        materialCosts: { 
                          ...config.materialCosts, 
                          gloveCost: value 
                        }
                      })}
                      placeholder="R$ 5,00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="filmCost">Filme e Proteção por cm²</Label>
                    <CurrencyInput
                      id="filmCost"
                      value={config.materialCosts.filmCost}
                      onChange={(value) => updateConfig({ 
                        materialCosts: { 
                          ...config.materialCosts, 
                          filmCost: value 
                        }
                      })}
                      placeholder="R$ 0,30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ointmentCost">Pomada e Cuidados por cm²</Label>
                    <CurrencyInput
                      id="ointmentCost"
                      value={config.materialCosts.ointmentCost}
                      onChange={(value) => updateConfig({ 
                        materialCosts: { 
                          ...config.materialCosts, 
                          ointmentCost: value 
                        }
                      })}
                      placeholder="R$ 0,80"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="otherCosts">Outros Materiais (fixo)</Label>
                    <CurrencyInput
                      id="otherCosts"
                      value={config.materialCosts.otherCosts}
                      onChange={(value) => updateConfig({ 
                        materialCosts: { 
                          ...config.materialCosts, 
                          otherCosts: value 
                        }
                      })}
                      placeholder="R$ 10,00"
                    />
                  </div>
                </div>
              </div>

              {/* Opções de Complexidade */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Tipos de Complexidade</h4>
                  <Dialog open={isAddComplexityOpen} onOpenChange={setIsAddComplexityOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nova Complexidade</DialogTitle>
                        <DialogDescription>
                          Adicione um novo tipo de complexidade de tatuagem
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Nome da Complexidade</Label>
                          <Input
                            value={newComplexityForm.label}
                            onChange={(e) => setNewComplexityForm({ 
                              ...newComplexityForm, 
                              label: e.target.value,
                              value: e.target.value.toLowerCase().replace(/\s+/g, '-')
                            })}
                            placeholder="Ex: Hiper Realismo"
                          />
                        </div>
                        <div>
                          <Label>Valor Identificador</Label>
                          <Input
                            value={newComplexityForm.value}
                            onChange={(e) => setNewComplexityForm({ 
                              ...newComplexityForm, 
                              value: e.target.value 
                            })}
                            placeholder="Ex: hiper-realismo"
                          />
                        </div>
                        <div>
                          <Label>Multiplicador de Preço</Label>
                          <Input
                            value={`${newComplexityForm.multiplier.toFixed(1)}x`}
                            onChange={(e) => {
                              const value = parseMultiplier(e.target.value)
                              setNewComplexityForm({ 
                                ...newComplexityForm, 
                                multiplier: value 
                              })
                            }}
                            placeholder="2.0x"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setIsAddComplexityOpen(false)
                              setNewComplexityForm({ label: "", value: "", multiplier: 1.0 })
                            }}
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                          <Button 
                            onClick={() => {
                              if (newComplexityForm.label && newComplexityForm.value) {
                                addComplexityOption({
                                  label: newComplexityForm.label,
                                  value: newComplexityForm.value,
                                  multiplier: newComplexityForm.multiplier
                                })
                                setIsAddComplexityOpen(false)
                                setNewComplexityForm({ label: "", value: "", multiplier: 1.0 })
                                toast({
                                  title: "Complexidade adicionada!",
                                  description: `${newComplexityForm.label} foi adicionada com sucesso.`,
                                })
                              }
                            }}
                            className="flex-1"
                          >
                            Adicionar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="space-y-2">
                  {config.complexityOptions.map((option) => (
                    <div key={option.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg space-y-2 sm:space-y-0">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
                          <span className="font-medium">{option.label}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">({option.value})</span>
                            <span className="text-sm bg-primary/10 px-2 py-1 rounded">x{option.multiplier}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 self-end sm:self-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setEditingComplexity(option)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar Complexidade</DialogTitle>
                            </DialogHeader>
                            {editingComplexity && (
                              <div className="space-y-4">
                                <div>
                                  <Label>Nome da Complexidade</Label>
                                  <Input
                                    value={editingComplexity.label}
                                    onChange={(e) => setEditingComplexity({ 
                                      ...editingComplexity, 
                                      label: e.target.value 
                                    })}
                                  />
                                </div>
                                <div>
                                  <Label>Valor Identificador</Label>
                                  <Input
                                    value={editingComplexity.value}
                                    onChange={(e) => setEditingComplexity({ 
                                      ...editingComplexity, 
                                      value: e.target.value 
                                    })}
                                  />
                                </div>
                                <div>
                                  <Label>Multiplicador de Preço</Label>
                                  <Input
                                    value={`${editingComplexity.multiplier.toFixed(1)}x`}
                                    onChange={(e) => {
                                      const value = parseMultiplier(e.target.value)
                                      setEditingComplexity({ 
                                        ...editingComplexity, 
                                        multiplier: value 
                                      })
                                    }}
                                    placeholder="2.0x"
                                  />
                                </div>
                                <div className="flex space-x-2">
                                  <Button variant="outline" className="flex-1">
                                    Cancelar
                                  </Button>
                                  <Button 
                                    onClick={() => {
                                      updateComplexityOption(editingComplexity.id, editingComplexity)
                                      setEditingComplexity(null)
                                      toast({
                                        title: "Complexidade atualizada!",
                                        description: `${editingComplexity.label} foi atualizada com sucesso.`,
                                      })
                                    }}
                                    className="flex-1"
                                  >
                                    Salvar
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            removeComplexityOption(option.id)
                            toast({
                              title: "Complexidade removida!",
                              description: `${option.label} foi removida.`,
                            })
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Opções de Partes do Corpo */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Partes do Corpo</h4>
                  <Dialog open={isAddBodyPartOpen} onOpenChange={setIsAddBodyPartOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nova Parte do Corpo</DialogTitle>
                        <DialogDescription>
                          Adicione uma nova localização para tatuagens
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Nome da Parte</Label>
                          <Input
                            value={newBodyPartForm.label}
                            onChange={(e) => setNewBodyPartForm({ 
                              ...newBodyPartForm, 
                              label: e.target.value,
                              value: e.target.value.toLowerCase().replace(/\s+/g, '-')
                            })}
                            placeholder="Ex: Antebraço"
                          />
                        </div>
                        <div>
                          <Label>Valor Identificador</Label>
                          <Input
                            value={newBodyPartForm.value}
                            onChange={(e) => setNewBodyPartForm({ 
                              ...newBodyPartForm, 
                              value: e.target.value 
                            })}
                            placeholder="Ex: antebraco"
                          />
                        </div>
                        <div>
                          <Label>Multiplicador de Dificuldade</Label>
                          <Input
                            value={`${newBodyPartForm.multiplier.toFixed(1)}x`}
                            onChange={(e) => {
                              const value = parseMultiplier(e.target.value)
                              setNewBodyPartForm({ 
                                ...newBodyPartForm, 
                                multiplier: value 
                              })
                            }}
                            placeholder="1.5x"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setIsAddBodyPartOpen(false)
                              setNewBodyPartForm({ label: "", value: "", multiplier: 1.0 })
                            }}
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                          <Button 
                            onClick={() => {
                              if (newBodyPartForm.label && newBodyPartForm.value) {
                                addBodyPartOption({
                                  label: newBodyPartForm.label,
                                  value: newBodyPartForm.value,
                                  multiplier: newBodyPartForm.multiplier
                                })
                                setIsAddBodyPartOpen(false)
                                setNewBodyPartForm({ label: "", value: "", multiplier: 1.0 })
                                toast({
                                  title: "Parte do corpo adicionada!",
                                  description: `${newBodyPartForm.label} foi adicionada com sucesso.`,
                                })
                              }
                            }}
                            className="flex-1"
                          >
                            Adicionar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="space-y-2">
                  {config.bodyPartOptions.map((option) => (
                    <div key={option.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg space-y-2 sm:space-y-0">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
                          <span className="font-medium">{option.label}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">({option.value})</span>
                            <span className="text-sm bg-primary/10 px-2 py-1 rounded">x{option.multiplier}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 self-end sm:self-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setEditingBodyPart(option)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar Parte do Corpo</DialogTitle>
                            </DialogHeader>
                            {editingBodyPart && (
                              <div className="space-y-4">
                                <div>
                                  <Label>Nome da Parte</Label>
                                  <Input
                                    value={editingBodyPart.label}
                                    onChange={(e) => setEditingBodyPart({ 
                                      ...editingBodyPart, 
                                      label: e.target.value 
                                    })}
                                  />
                                </div>
                                <div>
                                  <Label>Valor Identificador</Label>
                                  <Input
                                    value={editingBodyPart.value}
                                    onChange={(e) => setEditingBodyPart({ 
                                      ...editingBodyPart, 
                                      value: e.target.value 
                                    })}
                                  />
                                </div>
                                <div>
                                  <Label>Multiplicador de Dificuldade</Label>
                                  <Input
                                    value={`${editingBodyPart.multiplier.toFixed(1)}x`}
                                    onChange={(e) => {
                                      const value = parseMultiplier(e.target.value)
                                      setEditingBodyPart({ 
                                        ...editingBodyPart, 
                                        multiplier: value 
                                      })
                                    }}
                                    placeholder="1.5x"
                                  />
                                </div>
                                <div className="flex space-x-2">
                                  <Button variant="outline" className="flex-1">
                                    Cancelar
                                  </Button>
                                  <Button 
                                    onClick={() => {
                                      updateBodyPartOption(editingBodyPart.id, editingBodyPart)
                                      setEditingBodyPart(null)
                                      toast({
                                        title: "Parte do corpo atualizada!",
                                        description: `${editingBodyPart.label} foi atualizada com sucesso.`,
                                      })
                                    }}
                                    className="flex-1"
                                  >
                                    Salvar
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            removeBodyPartOption(option.id)
                            toast({
                              title: "Parte do corpo removida!",
                              description: `${option.label} foi removida.`,
                            })
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                <Button 
                  onClick={() => {
                    toast({
                      title: "Configurações salvas!",
                      description: "As configurações da calculadora foram atualizadas.",
                    })
                  }}
                  className="flex-1 w-full sm:w-auto"
                >
                  Salvar Todas as Configurações
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    resetToDefaults()
                    toast({
                      title: "Configurações restauradas!",
                      description: "Todas as configurações foram restauradas ao padrão.",
                    })
                  }}
                  className="w-full sm:w-auto"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restaurar Padrões
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Bot do WhatsApp</span>
              </CardTitle>
              <CardDescription>Controle e configure o bot automático do WhatsApp</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Status do Bot</h4>
                  <p className="text-sm text-muted-foreground">
                    {botStatus.running ? "Bot ativo e respondendo mensagens" : "Bot desativado"}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${botStatus.running ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <Button 
                    onClick={handleBotToggle}
                    disabled={botStatus.loading}
                    variant={botStatus.running ? "destructive" : "default"}
                  >
                    {botStatus.loading ? "Processando..." : (botStatus.running ? "Parar Bot" : "Iniciar Bot")}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="whatsappPhone">Número do WhatsApp</Label>
                <Input
                  id="whatsappPhone"
                  value={whatsapp.phone}
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value)
                    setWhatsapp({ ...whatsapp, phone: formatted })
                  }}
                  placeholder="+55 11 99999-9999"
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Número que será usado para o bot (com código do país)
                </p>
              </div>

              {botStatus.running && !botStatus.showQR && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800">Bot Ativo! 🤖</h4>
                  <p className="text-sm text-blue-600 mt-1">
                    Seu bot está respondendo mensagens automaticamente.
                  </p>
                </div>
              )}

              {/* Componente QR Code */}
              <QRCodeDisplay 
                isVisible={botStatus.showQR} 
                onConnect={() => {
                  setBotStatus(prev => ({ ...prev, showQR: false }));
                  toast({
                    title: "WhatsApp Conectado!",
                    description: "Bot ativo e respondendo mensagens.",
                  });
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Templates de Mensagens</span>
              </CardTitle>
              <CardDescription>Personalize as mensagens automáticas do bot</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="appointmentTemplate">Template de Novo Agendamento</Label>
                <Textarea
                  id="appointmentTemplate"
                  rows={8}
                  value={whatsapp.appointmentTemplate}
                  onChange={(e) => setWhatsapp({ ...whatsapp, appointmentTemplate: e.target.value })}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Esta mensagem será enviada quando o cliente clicar em "Novo Agendamento"
                </p>
              </div>

              <div>
                <Label htmlFor="reminderTemplate">Template de Lembrete</Label>
                <Textarea
                  id="reminderTemplate"
                  rows={3}
                  value={whatsapp.reminderTemplate}
                  onChange={(e) => setWhatsapp({ ...whatsapp, reminderTemplate: e.target.value })}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Use {"{nome}"} e {"{horario}"} para personalizar a mensagem
                </p>
              </div>

              <div>
                <Label htmlFor="quoteTemplate">Template de Orçamento</Label>
                <Textarea
                  id="quoteTemplate"
                  rows={6}
                  value={whatsapp.quoteTemplate}
                  onChange={(e) => setWhatsapp({ ...whatsapp, quoteTemplate: e.target.value })}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Use {"{tamanho}"}, {"{estilo}"}, {"{local}"}, {"{tempo}"} e {"{valor}"} para personalizar
                </p>
              </div>

              <Button onClick={handleSaveWhatsApp}>Salvar Templates</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dados" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Gerenciamento de Dados</span>
              </CardTitle>
              <CardDescription>Exporte, importe ou faça backup dos seus dados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Exportar Dados</CardTitle>
                    <CardDescription>Baixe todos os seus dados em formato JSON</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={handleExportData} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Dados
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Importar Dados</CardTitle>
                    <CardDescription>Restaure seus dados de um backup</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input type="file" accept=".json" />
                    <Button onClick={handleImportData} className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Importar Dados
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-lg text-destructive">Zona de Perigo</CardTitle>
                  <CardDescription>Ações irreversíveis - use com cuidado</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Limpar Todos os Dados</h4>
                      <p className="text-sm text-muted-foreground">
                        Remove todos os clientes, agendamentos e configurações
                      </p>
                    </div>
                    <Button variant="destructive" size="sm">
                      Limpar Dados
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Excluir Conta</h4>
                      <p className="text-sm text-muted-foreground">Remove permanentemente sua conta e todos os dados</p>
                    </div>
                    <Button variant="destructive" size="sm">
                      Excluir Conta
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
