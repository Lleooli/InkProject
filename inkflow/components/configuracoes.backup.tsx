"use client"

import { useState } from "react"
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
import { useCalculatorConfig, ComplexityOption, BodyPartOption } from "@/contexts/calculator-config-context"

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
    loading: false
  })

  const { toast } = useToast()

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
    // Salva as configurações
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
          running: action === 'start' 
        }))
        
        toast({
          title: result.message,
          description: action === 'start' 
            ? "Verifique o terminal para escanear o QR Code" 
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

  const handleBotToggle = async () => {
    setBotStatus(prev => ({ ...prev, loading: true }))
    
    try {
      const action = botStatus.running ? 'stop' : 'start'
      const config = {
        studioName: profile.studio,
        ownerName: profile.name,
        phone: whatsapp.phone,
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
          running: action === 'start' 
        }))
        
        toast({
          title: result.message,
          description: action === 'start' 
            ? "Verifique o terminal para escanear o QR Code" 
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
    })
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
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Configurações</h1>
      </div>

      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="calculadora">Calculadora</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="dados">Dados</TabsTrigger>
        </TabsList>

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
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL || "/placeholder.svg"}
                      alt={user.displayName || "Avatar"}
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <AvatarFallback className="text-lg">
                      {profile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="text-sm text-muted-foreground">Foto sincronizada com sua conta Google</p>
                  <p className="text-xs text-muted-foreground mt-1">Para alterar, atualize em sua conta Google</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" value={user?.displayName || profile.name} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground mt-1">Sincronizado com sua conta Google</p>
                </div>

                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" value={user?.email || profile.email} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground mt-1">Sincronizado com sua conta Google</p>
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
                <div>
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
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hourlyRate">Valor por Hora (R$)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={config.hourlyRate}
                    onChange={(e) => updateConfig({ hourlyRate: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="profitMargin">Margem de Lucro (%)</Label>
                  <Input
                    id="profitMargin"
                    type="number"
                    value={config.profitMargin}
                    onChange={(e) => updateConfig({ profitMargin: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Custos de Materiais */}
              <div className="space-y-4">
                <h4 className="font-medium">Custos de Materiais</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="needleCost">Agulhas por cm² (R$)</Label>
                    <Input
                      id="needleCost"
                      type="number"
                      step="0.1"
                      value={config.materialCosts.needleCost}
                      onChange={(e) => updateConfig({ 
                        materialCosts: { 
                          ...config.materialCosts, 
                          needleCost: Number(e.target.value) 
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="inkCost">Tintas por cm² (R$)</Label>
                    <Input
                      id="inkCost"
                      type="number"
                      step="0.1"
                      value={config.materialCosts.inkCost}
                      onChange={(e) => updateConfig({ 
                        materialCosts: { 
                          ...config.materialCosts, 
                          inkCost: Number(e.target.value) 
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gloveCost">Luvas e Descartáveis fixo (R$)</Label>
                    <Input
                      id="gloveCost"
                      type="number"
                      step="0.1"
                      value={config.materialCosts.gloveCost}
                      onChange={(e) => updateConfig({ 
                        materialCosts: { 
                          ...config.materialCosts, 
                          gloveCost: Number(e.target.value) 
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="filmCost">Filme e Proteção por cm² (R$)</Label>
                    <Input
                      id="filmCost"
                      type="number"
                      step="0.1"
                      value={config.materialCosts.filmCost}
                      onChange={(e) => updateConfig({ 
                        materialCosts: { 
                          ...config.materialCosts, 
                          filmCost: Number(e.target.value) 
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ointmentCost">Pomada e Cuidados por cm² (R$)</Label>
                    <Input
                      id="ointmentCost"
                      type="number"
                      step="0.1"
                      value={config.materialCosts.ointmentCost}
                      onChange={(e) => updateConfig({ 
                        materialCosts: { 
                          ...config.materialCosts, 
                          ointmentCost: Number(e.target.value) 
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="otherCosts">Outros Materiais fixo (R$)</Label>
                    <Input
                      id="otherCosts"
                      type="number"
                      step="0.1"
                      value={config.materialCosts.otherCosts}
                      onChange={(e) => updateConfig({ 
                        materialCosts: { 
                          ...config.materialCosts, 
                          otherCosts: Number(e.target.value) 
                        }
                      })}
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
                            type="number"
                            step="0.1"
                            value={newComplexityForm.multiplier}
                            onChange={(e) => setNewComplexityForm({ 
                              ...newComplexityForm, 
                              multiplier: Number(e.target.value) 
                            })}
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
                    <div key={option.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <span className="font-medium">{option.label}</span>
                          <span className="text-sm text-muted-foreground">({option.value})</span>
                          <span className="text-sm bg-primary/10 px-2 py-1 rounded">x{option.multiplier}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
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
                                    type="number"
                                    step="0.1"
                                    value={editingComplexity.multiplier}
                                    onChange={(e) => setEditingComplexity({ 
                                      ...editingComplexity, 
                                      multiplier: Number(e.target.value) 
                                    })}
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
                            type="number"
                            step="0.1"
                            value={newBodyPartForm.multiplier}
                            onChange={(e) => setNewBodyPartForm({ 
                              ...newBodyPartForm, 
                              multiplier: Number(e.target.value) 
                            })}
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
                    <div key={option.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <span className="font-medium">{option.label}</span>
                          <span className="text-sm text-muted-foreground">({option.value})</span>
                          <span className="text-sm bg-orange-100 px-2 py-1 rounded">x{option.multiplier}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
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
                                    type="number"
                                    step="0.1"
                                    value={editingBodyPart.multiplier}
                                    onChange={(e) => setEditingBodyPart({ 
                                      ...editingBodyPart, 
                                      multiplier: Number(e.target.value) 
                                    })}
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
              <div className="flex space-x-2 pt-4">
                <Button 
                  onClick={() => {
                    toast({
                      title: "Configurações salvas!",
                      description: "As configurações da calculadora foram atualizadas.",
                    })
                  }}
                  className="flex-1"
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
                <span>Templates do WhatsApp</span>
              </CardTitle>
              <CardDescription>Personalize as mensagens automáticas do WhatsApp</CardDescription>
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
