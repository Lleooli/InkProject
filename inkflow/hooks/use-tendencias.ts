import { useState, useEffect } from 'react'

export interface Tendencia {
  id: string
  title: string
  excerpt: string
  image: string
  source: string
  author: string
  publishedAt: string
  readTime: string
  category: string
  tags: string[]
  views: number
  url: string
  createdAt?: any
  generatedBy?: string
}

interface UseTendenciasReturn {
  tendencias: Tendencia[]
  loading: boolean
  error: string | null
  refreshTendencias: () => Promise<void>
  isRefreshing: boolean
}

// Dados locais garantidos - sempre funcionam
const LOCAL_TENDENCIAS: Tendencia[] = [
  {
    id: "1",
    title: "Micro Tatuagens Conquistam 2025",
    excerpt: "Designs ultra pequenos e delicados ganham popularidade entre jovens que buscam arte corporal discreta mas significativa. A técnica exige precisão extrema.",
    image: "/placeholder.svg?height=200&width=300",
    source: "Tattoo Today BR",
    author: "Ana Silva",
    publishedAt: new Date().toISOString(),
    readTime: "4 min",
    category: "Tendências",
    tags: ["micro", "minimalista", "delicado"],
    views: 1250,
    url: "#",
    generatedBy: "local"
  },
  {
    id: "2",
    title: "Tintas Veganas Revolucionam Mercado",
    excerpt: "Marcas brasileiras desenvolvem tintas 100% veganas sem comprometer qualidade. Movimento sustentável ganha força entre tatuadores conscientes.",
    image: "/placeholder.svg?height=200&width=300",
    source: "Eco Ink Magazine",
    author: "Carlos Mendoza",
    publishedAt: new Date().toISOString(),
    readTime: "6 min",
    category: "Inovação",
    tags: ["vegano", "sustentável", "inovação"],
    views: 890,
    url: "#",
    generatedBy: "local"
  },
  {
    id: "3",
    title: "Cuidados Pós-Tatuagem Modernos",
    excerpt: "Novos produtos e técnicas de cicatrização revolutionam o pós-procedimento. Especialistas revelam protocolos atualizados para melhor resultado.",
    image: "/placeholder.svg?height=200&width=300",
    source: "Tattoo Care Brasil",
    author: "Dra. Ana Ferreira",
    publishedAt: new Date().toISOString(),
    readTime: "8 min",
    category: "Cuidados",
    tags: ["cuidados", "cicatrização", "produtos"],
    views: 2100,
    url: "#",
    generatedBy: "local"
  },
  {
    id: "4",
    title: "Arte 3D: Ilusões na Pele",
    excerpt: "Técnicas avançadas de sombreado criam efeitos tridimensionais impressionantes. Artistas brasileiros se destacam mundialmente.",
    image: "/placeholder.svg?height=200&width=300",
    source: "3D Ink Brasil",
    author: "Pedro Oliveira",
    publishedAt: new Date().toISOString(),
    readTime: "5 min",
    category: "Estilos",
    tags: ["3d", "ilusão", "perspectiva"],
    views: 756,
    url: "#",
    generatedBy: "local"
  },
  {
    id: "5",
    title: "Mercado Cresce 35% no Brasil",
    excerpt: "Setor movimenta bilhões e gera milhares de empregos. Profissionalização se intensifica com cursos técnicos e regulamentação.",
    image: "/placeholder.svg?height=200&width=300",
    source: "Business Tattoo",
    author: "Marina Santos",
    publishedAt: new Date().toISOString(),
    readTime: "7 min",
    category: "Mercado",
    tags: ["mercado", "crescimento", "economia"],
    views: 1800,
    url: "#",
    generatedBy: "local"
  },
  {
    id: "6",
    title: "Tecnologia Laser Avança",
    excerpt: "Equipamentos de última geração chegam ao Brasil com menor dor e melhores resultados. Procedimento se torna mais acessível.",
    image: "/placeholder.svg?height=200&width=300",
    source: "Laser Tech BR",
    author: "Dr. João Santos",
    publishedAt: new Date().toISOString(),
    readTime: "6 min",
    category: "Tecnologia",
    tags: ["laser", "remoção", "tecnologia"],
    views: 1200,
    url: "#",
    generatedBy: "local"
  }
]

export function useTendencias(): UseTendenciasReturn {
  const [tendencias, setTendencias] = useState<Tendencia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    // Simular carregamento e depois mostrar dados locais
    const timer = setTimeout(() => {
      setTendencias(LOCAL_TENDENCIAS)
      setLoading(false)
      setError(null)
      console.log('✅ Tendências locais carregadas:', LOCAL_TENDENCIAS.length)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const refreshTendencias = async () => {
    try {
      setIsRefreshing(true)
      setError(null)
      
      console.log('🔄 Simulando atualização de tendências...')
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Embaralhar os dados para simular nova geração
      const shuffled = [...LOCAL_TENDENCIAS]
        .sort(() => Math.random() - 0.5)
        .map(item => ({
          ...item,
          views: Math.floor(Math.random() * 3000) + 100,
          publishedAt: new Date().toISOString()
        }))
      
      setTendencias(shuffled)
      console.log('✅ Tendências atualizadas com sucesso!')
      
    } catch (err) {
      console.error('💥 Erro ao atualizar tendências:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao atualizar tendências'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsRefreshing(false)
    }
  }

  return {
    tendencias,
    loading,
    error,
    refreshTendencias,
    isRefreshing
  }
}
