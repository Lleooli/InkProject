"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
import { ImageIcon, Plus, Search, Heart, Share2, Edit, Eye, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { usePortfolio } from "@/lib/firebase-hooks"

export function Portfolio() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  
  const { portfolioItems, loading, addPortfolioItem } = usePortfolio()

  const [newItemData, setNewItemData] = useState({
    title: "",
    description: "",
    style: "",
    bodyPart: "",
    duration: "",
    clientName: "",
    tags: "",
    imageUrl: "",
  })

  const styles = [
    "Fineline",
    "Colorida",
    "Blackwork", 
    "Realismo",
    "Aquarela",
    "Tribal",
    "Geométrico",
    "Old School",
    "New School",
    "Japonês",
    "Pontilhismo",
  ]

  const bodyParts = [
    "Braço",
    "Antebraço",
    "Ombro",
    "Costas",
    "Peito",
    "Perna",
    "Panturrilha",
    "Mão",
    "Pescoço",
    "Costela",
  ]

  const handleAddItem = async () => {
    if (!newItemData.title || !newItemData.style) {
      toast({
        title: "Campos obrigatórios",
        description: "Título e estilo são obrigatórios.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await addPortfolioItem({
        ...newItemData,
        tags: newItemData.tags.split(",").map((tag) => tag.trim()).filter((tag) => tag),
        likes: 0,
        date: new Date(),
      })

      toast({
        title: "Item adicionado!",
        description: "Nova peça foi adicionada ao portfólio.",
      })

      setIsUploadOpen(false)
      setNewItemData({
        title: "",
        description: "",
        style: "",
        bodyPart: "",
        duration: "",
        clientName: "",
        tags: "",
        imageUrl: "",
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

  // Filtrar itens baseado na pesquisa e filtros
  const filteredItems = portfolioItems?.filter((item: any) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.style?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === "all" || item.style?.toLowerCase() === selectedFilter.toLowerCase()
    return matchesSearch && matchesFilter
  }) || []

  const handleLike = (itemId: string) => {
    toast({
      title: "Curtida adicionada!",
      description: "Você curtiu esta peça.",
    })
  }

  const handleShare = (item: any) => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando portfólio...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ImageIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Portfólio</h1>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Trabalho
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Trabalho</DialogTitle>
              <DialogDescription>Adicione uma nova peça ao seu portfólio</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input 
                  id="title" 
                  placeholder="Ex: Rosa Fineline"
                  value={newItemData.title}
                  onChange={(e) => setNewItemData({...newItemData, title: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  id="description" 
                  placeholder="Descreva o trabalho..."
                  value={newItemData.description}
                  onChange={(e) => setNewItemData({...newItemData, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="style">Estilo *</Label>
                  <Select value={newItemData.style} onValueChange={(value) => setNewItemData({...newItemData, style: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha o estilo" />
                    </SelectTrigger>
                    <SelectContent>
                      {styles.map((style) => (
                        <SelectItem key={style} value={style}>
                          {style}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bodyPart">Local do Corpo</Label>
                  <Select value={newItemData.bodyPart} onValueChange={(value) => setNewItemData({...newItemData, bodyPart: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Parte do corpo" />
                    </SelectTrigger>
                    <SelectContent>
                      {bodyParts.map((part) => (
                        <SelectItem key={part} value={part}>
                          {part}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duração</Label>
                  <Input 
                    id="duration" 
                    placeholder="Ex: 3h"
                    value={newItemData.duration}
                    onChange={(e) => setNewItemData({...newItemData, duration: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="clientName">Cliente</Label>
                  <Input 
                    id="clientName" 
                    placeholder="Nome do cliente"
                    value={newItemData.clientName}
                    onChange={(e) => setNewItemData({...newItemData, clientName: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                <Input 
                  id="tags" 
                  placeholder="Ex: fineline, floral, feminina"
                  value={newItemData.tags}
                  onChange={(e) => setNewItemData({...newItemData, tags: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="imageUrl">URL da Imagem</Label>
                <Input 
                  id="imageUrl" 
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={newItemData.imageUrl}
                  onChange={(e) => setNewItemData({...newItemData, imageUrl: e.target.value})}
                />
              </div>
              <Button onClick={handleAddItem} className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  "Adicionar ao Portfólio"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título, estilo ou tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os estilos</SelectItem>
                  {styles.map((style) => (
                    <SelectItem key={style} value={style}>
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Galeria */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.length > 0 ? (
          filteredItems.map((item: any) => (
            <Card key={item.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative aspect-square">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg?height=300&width=300";
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <Button size="sm" variant="secondary" onClick={() => handleLike(item.id)}>
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleShare(item)}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="secondary">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">{item.likes || 0}</span>
                    </div>
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-1">
                    {item.style && (
                      <Badge variant="default">{item.style}</Badge>
                    )}
                    {item.bodyPart && (
                      <Badge variant="outline">{item.bodyPart}</Badge>
                    )}
                    {item.duration && (
                      <Badge variant="secondary">{item.duration}</Badge>
                    )}
                  </div>
                  
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                    {item.clientName && <span>Cliente: {item.clientName}</span>}
                    <span>
                      {item.date?.toDate 
                        ? item.date.toDate().toLocaleDateString("pt-BR")
                        : new Date(item.date).toLocaleDateString("pt-BR")
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-8 text-center">
                <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">Nenhum trabalho encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedFilter !== "all"
                    ? "Tente ajustar os filtros de busca"
                    : "Comece adicionando seus primeiros trabalhos ao portfólio"
                  }
                </p>
                <Button onClick={() => setIsUploadOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Trabalho
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
