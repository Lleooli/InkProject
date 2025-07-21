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
  Package,
  Plus,
  Search,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  ShoppingCart,
  Edit,
  BarChart3,
  DollarSign,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useStock, useStockMovements } from "@/lib/firebase-hooks"

export function Estoque() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isNewItemOpen, setIsNewItemOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const { stockItems, loading, addStockItem } = useStock()
  const { movements, loading: loadingMovements } = useStockMovements()
  const { toast } = useToast()

  const [newItemData, setNewItemData] = useState({
    name: "",
    category: "",
    brand: "",
    quantity: "",
    minimumStock: "",
    maximumStock: "",
    unit: "unidades",
    costPrice: "",
    supplier: "",
    location: "",
    description: "",
  })

  const categories = [
    { value: "tintas", label: "Tintas", icon: "🎨" },
    { value: "agulhas", label: "Agulhas", icon: "💉" },
    { value: "descartaveis", label: "Descartáveis", icon: "🧤" },
    { value: "equipamentos", label: "Equipamentos", icon: "⚡" },
    { value: "cuidados", label: "Cuidados", icon: "🧴" },
    { value: "outros", label: "Outros", icon: "📦" },
  ]

  const handleAddItem = async () => {
    if (!newItemData.name || !newItemData.category) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e categoria são obrigatórios.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await addStockItem({
        name: newItemData.name,
        category: newItemData.category,
        brand: newItemData.brand,
        quantity: parseInt(newItemData.quantity) || 0,
        minimumStock: parseInt(newItemData.minimumStock) || 0,
        maximumStock: parseInt(newItemData.maximumStock) || 100,
        unit: newItemData.unit,
        costPrice: parseFloat(newItemData.costPrice) || 0,
        supplier: newItemData.supplier,
        location: newItemData.location,
        description: newItemData.description,
      })

      toast({
        title: "Item adicionado!",
        description: "Novo item foi adicionado ao estoque.",
      })

      setIsNewItemOpen(false)
      setNewItemData({
        name: "",
        category: "",
        brand: "",
        quantity: "",
        minimumStock: "",
        maximumStock: "",
        unit: "unidades",
        costPrice: "",
        supplier: "",
        location: "",
        description: "",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar item. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar itens baseado na pesquisa e categoria
  const filteredItems = stockItems?.filter((item: any) => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  }) || []

  // Calcular estatísticas
  const stats = {
    totalItems: stockItems?.length || 0,
    lowStockItems: stockItems?.filter((item: any) => item.quantity <= item.minimumStock).length || 0,
    outOfStockItems: stockItems?.filter((item: any) => item.quantity === 0).length || 0,
    totalValue: stockItems?.reduce((total: number, item: any) => 
      total + (item.quantity * (item.costPrice || 0)), 0) || 0,
  }

  const getStatusColor = (item: any) => {
    if (item.quantity === 0) return "destructive"
    if (item.quantity <= item.minimumStock) return "secondary"
    return "default"
  }

  const getStatusText = (item: any) => {
    if (item.quantity === 0) return "Esgotado"
    if (item.quantity <= item.minimumStock) return "Estoque baixo"
    return "Em estoque"
  }

  const handleReorder = (item: any) => {
    const message = encodeURIComponent(`🛒 *PEDIDO DE REPOSIÇÃO*

📦 Item: ${item.name}
🏷️ Marca: ${item.brand || "Sem marca"}
📊 Estoque atual: ${item.quantity || 0} ${item.unit}
📈 Quantidade sugerida: ${(item.maximumStock || 100) - (item.quantity || 0)} ${item.unit}
💰 Custo unitário: R$ ${(item.costPrice || 0).toFixed(2)}

${item.supplier ? `🏪 Fornecedor: ${item.supplier}` : ""}

Gostaria de fazer este pedido!`)

    window.open(`https://wa.me/?text=${message}`, "_blank")
  }
  
  if (loading || loadingMovements) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando estoque...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Package className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Controle de Estoque</h1>
        </div>
        <Dialog open={isNewItemOpen} onOpenChange={setIsNewItemOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Item</DialogTitle>
              <DialogDescription>Cadastre um novo item no estoque</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Item *</Label>
                <Input 
                  id="name" 
                  placeholder="Ex: Tinta Preta - Eternal Ink" 
                  value={newItemData.name}
                  onChange={(e) => setNewItemData({...newItemData, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="category">Categoria *</Label>
                <Select value={newItemData.category} onValueChange={(value) => setNewItemData({...newItemData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand">Marca</Label>
                  <Input 
                    id="brand" 
                    placeholder="Ex: Eternal Ink" 
                    value={newItemData.brand}
                    onChange={(e) => setNewItemData({...newItemData, brand: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unidade</Label>
                  <Select value={newItemData.unit} onValueChange={(value) => setNewItemData({...newItemData, unit: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unidades">Unidades</SelectItem>
                      <SelectItem value="caixas">Caixas</SelectItem>
                      <SelectItem value="rolos">Rolos</SelectItem>
                      <SelectItem value="tubos">Tubos</SelectItem>
                      <SelectItem value="frascos">Frascos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input 
                    id="quantity" 
                    type="number" 
                    placeholder="0" 
                    value={newItemData.quantity}
                    onChange={(e) => setNewItemData({...newItemData, quantity: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="minimumStock">Mínimo</Label>
                  <Input 
                    id="minimumStock" 
                    type="number" 
                    placeholder="0" 
                    value={newItemData.minimumStock}
                    onChange={(e) => setNewItemData({...newItemData, minimumStock: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="maximumStock">Máximo</Label>
                  <Input 
                    id="maximumStock" 
                    type="number" 
                    placeholder="100" 
                    value={newItemData.maximumStock}
                    onChange={(e) => setNewItemData({...newItemData, maximumStock: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="costPrice">Preço de Custo (R$)</Label>
                <Input 
                  id="costPrice" 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00" 
                  value={newItemData.costPrice}
                  onChange={(e) => setNewItemData({...newItemData, costPrice: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="supplier">Fornecedor</Label>
                <Input 
                  id="supplier" 
                  placeholder="Nome do fornecedor" 
                  value={newItemData.supplier}
                  onChange={(e) => setNewItemData({...newItemData, supplier: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="location">Localização</Label>
                <Input 
                  id="location" 
                  placeholder="Ex: Prateleira A1" 
                  value={newItemData.location}
                  onChange={(e) => setNewItemData({...newItemData, location: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  id="description" 
                  placeholder="Descrição detalhada do item..." 
                  value={newItemData.description}
                  onChange={(e) => setNewItemData({...newItemData, description: e.target.value})}
                />
              </div>
              <Button onClick={handleAddItem} className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  "Cadastrar Item"
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
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">Itens cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Itens com estoque baixo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esgotados</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.outOfStockItems}</div>
            <p className="text-xs text-muted-foreground">Itens esgotados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              R$ {stats.totalValue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Valor do estoque</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="estoque" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="estoque">Estoque</TabsTrigger>
          <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
        </TabsList>

        <TabsContent value="estoque" className="space-y-6">
          {/* Filtros e Busca */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome, marca..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Itens */}
          <div className="grid gap-4">
            {filteredItems.length > 0 ? (
              filteredItems.map((item: any) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">
                            {categories.find((c) => c.value === item.category)?.icon || "📦"}
                          </span>
                          <div>
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">{item.brand || "Sem marca"}</p>
                          </div>
                          <Badge variant={getStatusColor(item)}>{getStatusText(item)}</Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Estoque Atual</p>
                            <p className="font-medium">
                              {item.quantity || 0} {item.unit || "unidades"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Estoque Mínimo</p>
                            <p className="font-medium">{item.minimumStock || 0}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Custo Unitário</p>
                            <p className="font-medium text-green-600">
                              R$ {(item.costPrice || 0).toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Valor Total</p>
                            <p className="font-medium text-green-600">
                              R$ {((item.quantity || 0) * (item.costPrice || 0)).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                          {item.location && <span>📍 {item.location}</span>}
                          {item.supplier && <span>🏪 {item.supplier}</span>}
                        </div>

                        {item.description && (
                          <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                          {(item.quantity <= item.minimumStock) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReorder(item)}
                              className="text-orange-600 border-orange-300"
                            >
                              <ShoppingCart className="h-3 w-3 mr-1" />
                              Repor
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Barra de progresso do estoque */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Estoque</span>
                        <span>
                          {item.quantity || 0}/{item.maximumStock || 100} {item.unit || "unidades"}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            item.quantity === 0
                              ? "bg-red-500"
                              : item.quantity <= item.minimumStock
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min(((item.quantity || 0) / (item.maximumStock || 100)) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">Nenhum item encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || selectedCategory !== "all" 
                      ? "Tente ajustar os filtros de busca"
                      : "Comece adicionando seus primeiros itens ao estoque"
                    }
                  </p>
                  <Button onClick={() => setIsNewItemOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Item
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="movimentacoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Movimentações</CardTitle>
              <CardDescription>Registro de todas as entradas e saídas de materiais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {movements?.length > 0 ? (
                  movements.map((movement: any) => (
                    <div key={movement.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-2 rounded-full ${
                            movement.type === "entrada" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                          }`}
                        >
                          {movement.type === "entrada" ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{movement.itemName || "Item"}</p>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span className={movement.type === "entrada" ? "text-green-600" : "text-red-600"}>
                              {movement.type === "entrada" ? "+" : "-"}
                              {movement.quantity || 0}
                            </span>
                            <span>•</span>
                            <span>{movement.reason || "Sem motivo"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {movement.date?.toDate 
                            ? movement.date.toDate().toLocaleDateString("pt-BR")
                            : new Date(movement.date).toLocaleDateString("pt-BR")
                          }
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma movimentação registrada</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
