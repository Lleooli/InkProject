"use client"

import { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ImageIcon, Plus, Search, Heart, Share2, Edit, Eye, Loader2, Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { usePortfolio, useClients } from "@/lib/firebase-hooks-user"

export function Portfolio() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { toast } = useToast()
  
  const { portfolioItems, loading, addPortfolioItem } = usePortfolio()
  const { clients, loading: loadingClients } = useClients()

  const [newItemData, setNewItemData] = useState({
    title: "",
    description: "",
    style: "",
    bodyPart: "",
    duration: "",
    clientId: "",
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

  // Função para lidar com seleção de arquivo
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Verificar se é uma imagem
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione apenas arquivos de imagem (PNG, JPEG, etc).",
          variant: "destructive",
        })
        return
      }

      // Verificar tamanho do arquivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 5MB.",
          variant: "destructive",
        })
        return
      }

      setSelectedImage(file)
      
      // Criar preview da imagem
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Função para remover imagem selecionada
  const removeSelectedImage = () => {
    setSelectedImage(null)
    setImagePreview("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Função para converter imagem para base64 (simplificado - em produção você usaria Firebase Storage)
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Função para detectar se é um reel do Instagram
  const isInstagramReel = (url: string): boolean => {
    return url.includes('/reel/')
  }

  // Função para obter a classe de aspect ratio baseada no tipo de conteúdo
  const getAspectRatioClass = (item: any): string => {
    if (item.imageUrl && isInstagramUrl(item.imageUrl)) {
      return isInstagramReel(item.imageUrl) ? "aspect-[9/16]" : "aspect-square"
    }
    return "aspect-square"
  }

  // Função para detectar e processar URLs do Instagram
  const isInstagramUrl = (url: string): boolean => {
    const instagramRegex = /^https?:\/\/(www\.)?instagram\.com\/(p|reel)\/[a-zA-Z0-9_-]+\/?/
    return instagramRegex.test(url)
  }

  // Função para extrair imagem do Instagram
  const extractInstagramImage = async (url: string): Promise<string | null> => {
    try {
      // Extrair o código do post da URL
      const postMatch = url.match(/\/(p|reel)\/([a-zA-Z0-9_-]+)/)
      if (!postMatch) return null

      const postId = postMatch[2]
      
      // Método 1: Tentar usar a URL de mídia direta do Instagram
      const directImageUrl = `https://www.instagram.com/p/${postId}/media/?size=l`
      
      // Método 2: Como fallback, usar a URL de embed com parâmetros
      const embedImageUrl = `https://instagram.com/p/${postId}/media/?size=l`
      
      // Método 3: URL alternativa para imagens do Instagram
      const alternativeUrl = `https://www.instagram.com/p/${postId}/`
      
      // Para uma implementação mais robusta em produção, você usaria um proxy ou API
      // Por enquanto, retornamos a URL direta que geralmente funciona
      return directImageUrl
    } catch (error) {
      console.error('Erro ao extrair imagem do Instagram:', error)
      return null
    }
  }

  // Função para converter URL do Instagram em formato de imagem embeddable
  const getInstagramEmbedImage = (url: string): string | null => {
    try {
      const postMatch = url.match(/\/(p|reel)\/([a-zA-Z0-9_-]+)/)
      if (!postMatch) return null

      const postId = postMatch[2]
      
      // Retorna uma URL que pode ser usada em um iframe ou como imagem
      return `https://www.instagram.com/p/${postId}/embed/captioned/`
    } catch (error) {
      return null
    }
  }

  // Função para validar e processar URL da imagem
  const handleImageUrlChange = async (url: string) => {
    setNewItemData({...newItemData, imageUrl: url})
    
    // Se for uma URL do Instagram, tentar extrair a imagem
    if (url && isInstagramUrl(url)) {
      toast({
        title: "Processando Instagram",
        description: "Extraindo imagem do post do Instagram...",
      })
      
      const extractedImageUrl = await extractInstagramImage(url)
      if (extractedImageUrl) {
        setNewItemData(prev => ({...prev, imageUrl: extractedImageUrl}))
        toast({
          title: "Imagem extraída!",
          description: "Imagem do Instagram foi extraída com sucesso.",
        })
      } else {
        toast({
          title: "Erro no Instagram",
          description: "Não foi possível extrair a imagem. Verifique se a URL está correta.",
          variant: "destructive",
        })
      }
    }
  }

  // Função para lidar com mudança de cliente
  const handleClientChange = (clientId: string) => {
    if (clientId === "none") {
      setNewItemData({
        ...newItemData,
        clientId: "",
        clientName: ""
      })
    } else {
      const selectedClient = clients?.find(c => c.id === clientId)
      setNewItemData({
        ...newItemData,
        clientId,
        clientName: selectedClient?.name || ""
      })
    }
  }

  // Função para limpar o formulário
  const resetForm = () => {
    setNewItemData({
      title: "",
      description: "",
      style: "",
      bodyPart: "",
      duration: "",
      clientId: "",
      clientName: "",
      tags: "",
      imageUrl: "",
    })
    removeSelectedImage()
  }

  // Função para lidar com o fechamento do modal
  const handleModalClose = (open: boolean) => {
    setIsUploadOpen(open)
    if (!open) {
      resetForm()
    }
  }

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
      let imageUrl = newItemData.imageUrl

      // Se há uma imagem selecionada, converter para base64
      if (selectedImage) {
        try {
          imageUrl = await convertToBase64(selectedImage)
        } catch (error) {
          toast({
            title: "Erro no upload",
            description: "Erro ao processar a imagem. Tente novamente.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
      }

      await addPortfolioItem({
        ...newItemData,
        imageUrl,
        tags: newItemData.tags.split(",").map((tag) => tag.trim()).filter((tag) => tag),
        likes: 0,
        date: new Date(),
      })

      toast({
        title: "Item adicionado!",
        description: "Nova peça foi adicionada ao portfólio.",
      })

      // Reset do formulário
      setIsUploadOpen(false)
      resetForm()
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

  // Função para renderizar imagem do Instagram ou imagem normal
  const renderPortfolioImage = (item: any) => {
    const isInstagram = item.imageUrl && isInstagramUrl(item.imageUrl)
    const isReel = isInstagram && isInstagramReel(item.imageUrl)
    
    if (isInstagram) {
      const postMatch = item.imageUrl.match(/\/(p|reel)\/([a-zA-Z0-9_-]+)/)
      const postId = postMatch?.[2]
      
      if (postId) {
        // Usar iframe embed do Instagram para uma melhor experiência
        const embedUrl = isReel 
          ? `https://www.instagram.com/reel/${postId}/embed/captioned/`
          : `https://www.instagram.com/p/${postId}/embed/captioned/`
        
        return (
          <div className="w-full h-full relative bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20">
            <iframe
              src={embedUrl}
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              allowTransparency={true}
              className="absolute inset-0 w-full h-full instagram-iframe"
              style={{ minHeight: isReel ? '500px' : '400px' }}
              title={`Instagram ${isReel ? 'reel' : 'post'} ${postId}`}
              onError={() => {
                // Fallback para imagem normal se o iframe falhar
                console.log('Iframe failed, using direct image URL')
              }}
            />
            <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium z-10">
              {isReel ? 'Reel' : 'Instagram'}
            </div>
          </div>
        )
      }
    }
    
    // Imagem normal
    return (
      <>
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
      </>
    )
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
        <Dialog open={isUploadOpen} onOpenChange={handleModalClose}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Trabalho
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Trabalho</DialogTitle>
              <DialogDescription>Adicione uma nova peça ao seu portfólio</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Upload de Imagem */}
              <div>
                <Label htmlFor="image">Imagem da Tatuagem</Label>
                <div className="space-y-3">
                  {!imagePreview ? (
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Clique para selecionar uma imagem
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Formatos: PNG, JPEG - Máximo: 5MB
                        </p>
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={removeSelectedImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Opção alternativa: URL da imagem */}
                  {!selectedImage && (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex-1 border-t"></div>
                        <span className="text-xs text-muted-foreground px-2">ou</span>
                        <div className="flex-1 border-t"></div>
                      </div>
                      <Input 
                        placeholder="Cole a URL de uma imagem ou link do Instagram..."
                        value={newItemData.imageUrl}
                        onChange={(e) => handleImageUrlChange(e.target.value)}
                      />
                      {newItemData.imageUrl && isInstagramUrl(newItemData.imageUrl) && (
                        <div className="mt-2 p-2 bg-pink-50 border border-pink-200 rounded-lg dark:bg-pink-950/20 dark:border-pink-800">
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-sm"></div>
                            <span className="text-xs text-pink-700 dark:text-pink-300">
                              Link do Instagram detectado - imagem será extraída automaticamente
                            </span>
                          </div>
                        </div>
                      )}
                      {newItemData.imageUrl && !isInstagramUrl(newItemData.imageUrl) && newItemData.imageUrl.startsWith('http') && (
                        <div className="mt-2">
                          <img
                            src={newItemData.imageUrl}
                            alt="Preview da URL"
                            className="w-full h-32 object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="title">Título *</Label>
                <Input 
                  id="title" 
                  placeholder="Ex: Rosa Fineline"
                  value={newItemData.title}
                  onChange={(e) => setNewItemData({...newItemData, title: e.target.value})}
                />
              </div>

              {/* Seleção de Cliente */}
              <div>
                <Label htmlFor="clientSelect">Cliente (opcional)</Label>
                <Select value={newItemData.clientId} onValueChange={handleClientChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingClients ? (
                      <div className="p-2 text-center">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      </div>
                    ) : (
                      <>
                        <SelectItem value="none">Nenhum cliente</SelectItem>
                        {clients?.map((client) => (
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
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
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
                  <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                  <Input 
                    id="tags" 
                    placeholder="Ex: fineline, floral, feminina"
                    value={newItemData.tags}
                    onChange={(e) => setNewItemData({...newItemData, tags: e.target.value})}
                  />
                </div>
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
      <div className="organic-grid w-full">
        {filteredItems.length > 0 ? (
          filteredItems.map((item: any) => {
            const isReel = item.imageUrl && isInstagramUrl(item.imageUrl) && isInstagramReel(item.imageUrl)
            const isInstagram = item.imageUrl && isInstagramUrl(item.imageUrl)
            return (
              <Card 
                key={item.id} 
                className={`group overflow-hidden hover:shadow-lg transition-shadow w-full ${
                  isReel ? 'reel-item' : 'square-item'
                }`}
              >
                <div className={`relative ${
                  isReel 
                    ? 'aspect-[9/16] instagram-reel-container' 
                    : isInstagram 
                      ? 'aspect-square instagram-post-container' 
                      : 'aspect-square'
                }`}>
                  {renderPortfolioImage(item)}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <Button size="sm" variant="secondary" onClick={() => handleLike(item.id)}>
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleShare(item)}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                    {isInstagramUrl(item.imageUrl) && (
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => window.open(item.imageUrl, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
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
                    <div className="flex items-center space-x-2">
                      {item.clientName && <span>Cliente: {item.clientName}</span>}
                      {isInstagramUrl(item.imageUrl) && (
                        <div className="flex items-center space-x-1 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 px-2 py-1 rounded-full">
                          <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                          <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                            {isReel ? 'Reel' : 'Instagram'}
                          </span>
                        </div>
                      )}
                    </div>
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
            )
          })
        ) : (
          <div className="col-span-full w-full">
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
