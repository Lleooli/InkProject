"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Search, ExternalLink, Bookmark, Share2, Clock, Eye, RefreshCw, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTendencias } from "@/hooks/use-tendencias"

export function Tendencias() {
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const { tendencias, loading, error, refreshTendencias, isRefreshing } = useTendencias()

  // Dados estáticos para tutoriais e artistas (mantidos como estavam)
  const tutorials = [
    {
      id: 1,
      title: "Como Dominar a Técnica Fineline",
      description: "Tutorial completo sobre agulhas, velocidade e pressão para fineline perfeita",
      duration: "25 min",
      difficulty: "Intermediário",
      instructor: "Maria Silva",
      thumbnail: "/placeholder.svg?height=150&width=200",
      tags: ["fineline", "técnica", "tutorial"],
    },
    {
      id: 2,
      title: "Sombreado Realista: Passo a Passo",
      description: "Aprenda as técnicas de sombreado para criar efeitos realistas impressionantes",
      duration: "40 min",
      difficulty: "Avançado",
      instructor: "João Santos",
      thumbnail: "/placeholder.svg?height=150&width=200",
      tags: ["realismo", "sombreado", "técnica"],
    },
    {
      id: 3,
      title: "Mistura de Cores: Teoria e Prática",
      description: "Domine a arte de misturar cores para criar gradientes perfeitos",
      duration: "30 min",
      difficulty: "Intermediário",
      instructor: "Ana Costa",
      thumbnail: "/placeholder.svg?height=150&width=200",
      tags: ["cores", "gradiente", "teoria"],
    },
  ]

  const artists = [
    {
      id: 1,
      name: "Kat Von D",
      specialty: "Realismo",
      followers: "8.2M",
      location: "Los Angeles, CA",
      avatar: "/placeholder.svg?height=80&width=80",
      recentWork: "/placeholder.svg?height=150&width=150",
      bio: "Pioneira no realismo em tatuagem, conhecida mundialmente por seus retratos detalhados.",
    },
    {
      id: 2,
      name: "Bang Bang",
      specialty: "Fineline",
      followers: "2.1M",
      location: "New York, NY",
      avatar: "/placeholder.svg?height=80&width=80",
      recentWork: "/placeholder.svg?height=150&width=150",
      bio: "Especialista em fineline, atende celebridades e é referência em delicadeza.",
    },
    {
      id: 3,
      name: "Nikko Hurtado",
      specialty: "Colorido",
      followers: "1.8M",
      location: "California, CA",
      avatar: "/placeholder.svg?height=80&width=80",
      recentWork: "/placeholder.svg?height=150&width=150",
      bio: "Mestre das cores vibrantes, conhecido por seus trabalhos coloridos únicos.",
    },
  ]

  const handleShare = (item: any) => {
    const message = encodeURIComponent(`📰 Confira esta notícia interessante sobre tatuagem:

"${item.title}"

${item.excerpt}

Fonte: ${item.source}
#tattoo #tendencias`)

    window.open(`https://wa.me/?text=${message}`, "_blank")
  }

  const handleBookmark = (item: any) => {
    toast({
      title: "Salvo!",
      description: `"${item.title}" foi adicionado aos seus favoritos.`,
    })
  }

  const filteredNews = tendencias.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleRefresh = async () => {
    try {
      await refreshTendencias()
      toast({
        title: "Conteúdo atualizado!",
        description: "As tendências foram reorganizadas com sucesso.",
      })
    } catch (error) {
      console.error('Erro ao atualizar:', error)
      toast({
        title: "Erro ao atualizar",
        description: error instanceof Error ? error.message : "Não foi possível atualizar as tendências.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Tendências</h1>
          <Badge variant="secondary" className="flex items-center space-x-1">
            <span>Conteúdo Estático</span>
          </Badge>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Atualizando...' : 'Embaralhar'}
        </Button>
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar notícias, tutoriais ou artistas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="noticias" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="noticias">Notícias</TabsTrigger>
          <TabsTrigger value="tutoriais">Tutoriais</TabsTrigger>
          <TabsTrigger value="artistas">Artistas</TabsTrigger>
        </TabsList>

        <TabsContent value="noticias" className="space-y-6">
          {error && (
            <Card className="border-destructive">
              <CardContent className="p-4">
                <p className="text-destructive">{error}</p>
                <Button 
                  onClick={handleRefresh} 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  disabled={isRefreshing}
                >
                  Tentar novamente
                </Button>
              </CardContent>
            </Card>
          )}
          
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="w-full h-48 bg-muted animate-pulse" />
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                      <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredNews.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? 'Nenhuma notícia encontrada para sua busca.' : 'Nenhuma tendência disponível no momento.'}
                </p>
                {!searchTerm && (
                  <Button onClick={handleRefresh} disabled={isRefreshing}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Embaralhar Conteúdo
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
            {filteredNews.map((news) => (
              <Card key={news.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img src={news.image || "/placeholder.svg"} alt={news.title} className="w-full h-48 object-cover" />
                  <Badge className="absolute top-2 left-2" variant="secondary">
                    {news.category}
                  </Badge>
                  {news.generatedBy === 'local' && (
                    <Badge className="absolute top-2 right-2 bg-blue-500">
                      Estático
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
                    <span>{news.source}</span>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{news.views}</span>
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2 line-clamp-2">{news.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{news.excerpt}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {news.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{news.readTime}</span>
                      <span>•</span>
                      <span>{new Date(news.publishedAt).toLocaleDateString("pt-BR")}</span>
                    </div>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="ghost" onClick={() => handleBookmark(news)}>
                        <Bookmark className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleShare(news)}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </TabsContent>

        <TabsContent value="tutoriais" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tutorials.map((tutorial) => (
              <Card key={tutorial.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={tutorial.thumbnail || "/placeholder.svg"}
                    alt={tutorial.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    {tutorial.duration}
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      variant={
                        tutorial.difficulty === "Avançado"
                          ? "destructive"
                          : tutorial.difficulty === "Intermediário"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {tutorial.difficulty}
                    </Badge>
                  </div>
                  <h3 className="font-semibold mb-2">{tutorial.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{tutorial.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {tutorial.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">por {tutorial.instructor}</span>
                    <Button size="sm">Assistir</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="artistas" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {artists.map((artist) => (
              <Card key={artist.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={artist.avatar || "/placeholder.svg"}
                      alt={artist.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">{artist.name}</h3>
                      <p className="text-sm text-muted-foreground">{artist.location}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{artist.specialty}</Badge>
                        <span className="text-xs text-muted-foreground">{artist.followers} seguidores</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{artist.bio}</p>
                  <div className="mb-4">
                    <img
                      src={artist.recentWork || "/placeholder.svg"}
                      alt="Trabalho recente"
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1">
                      Seguir
                    </Button>
                    <Button size="sm" variant="outline">
                      Ver Perfil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
