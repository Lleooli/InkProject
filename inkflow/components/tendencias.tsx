"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Search, ExternalLink, Bookmark, Share2, Clock, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function Tendencias() {
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const trendingNews = [
    {
      id: 1,
      title: "Fineline Tattoos: A Arte da Delicadeza em 2024",
      excerpt:
        "As tatuagens fineline continuam dominando as tendências, com técnicas cada vez mais refinadas e designs minimalistas que conquistam todos os públicos.",
      image: "/placeholder.svg?height=200&width=300",
      source: "Tattoo Magazine",
      author: "Marina Santos",
      publishedAt: "2024-01-20T10:00:00Z",
      readTime: "5 min",
      category: "Tendências",
      tags: ["fineline", "minimalismo", "técnicas"],
      views: 1250,
      url: "#",
    },
    {
      id: 2,
      title: "Cores Neon: O Futuro Brilhante das Tatuagens",
      excerpt:
        "Tintas neon e UV estão revolucionando o mundo da tatuagem, criando efeitos únicos que brilham sob luz negra e chamam atenção durante o dia.",
      image: "/placeholder.svg?height=200&width=300",
      source: "Ink World",
      author: "Carlos Mendoza",
      publishedAt: "2024-01-18T14:30:00Z",
      readTime: "7 min",
      category: "Inovação",
      tags: ["neon", "uv", "cores", "inovação"],
      views: 890,
      url: "#",
    },
    {
      id: 3,
      title: "Cuidados Pós-Tatuagem: Guia Completo 2024",
      excerpt:
        "Novos produtos e técnicas de cicatrização estão mudando a forma como cuidamos das tatuagens recém-feitas, garantindo melhor resultado final.",
      image: "/placeholder.svg?height=200&width=300",
      source: "Tattoo Care",
      author: "Dra. Ana Ferreira",
      publishedAt: "2024-01-15T09:15:00Z",
      readTime: "10 min",
      category: "Cuidados",
      tags: ["cuidados", "cicatrização", "produtos"],
      views: 2100,
      url: "#",
    },
    {
      id: 4,
      title: "Tatuagens Geométricas: Precisão e Simetria",
      excerpt:
        "O estilo geométrico ganha força com designs cada vez mais complexos, utilizando software especializado para criar padrões perfeitos.",
      image: "/placeholder.svg?height=200&width=300",
      source: "Geometric Ink",
      author: "Pedro Oliveira",
      publishedAt: "2024-01-12T16:45:00Z",
      readTime: "6 min",
      category: "Estilos",
      tags: ["geometrico", "precisão", "software"],
      views: 756,
      url: "#",
    },
  ]

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

  const filteredNews = trendingNews.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <TrendingUp className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Tendências</h1>
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
          <div className="grid gap-6 md:grid-cols-2">
            {filteredNews.map((news) => (
              <Card key={news.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img src={news.image || "/placeholder.svg"} alt={news.title} className="w-full h-48 object-cover" />
                  <Badge className="absolute top-2 left-2" variant="secondary">
                    {news.category}
                  </Badge>
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
