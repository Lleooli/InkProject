import { NextRequest, NextResponse } from 'next/server'

// Dados de fallback garantidos - sempre funcionam
const FALLBACK_NEWS = [
  {
    title: "Micro Tatuagens Ganham Destaque em 2025",
    excerpt: "Designs ultra pequenos e delicados conquistam jovens que buscam arte corporal discreta. Técnica exige precisão extrema e equipamentos especializados para resultados perfeitos.",
    category: "Tendências",
    tags: ["micro", "minimalista", "delicado", "precisão"],
    source: "Tattoo Today BR",
    author: "Ana Silva",
    readTime: "4 min"
  },
  {
    title: "Tintas Veganas Revolucionam Mercado Nacional",
    excerpt: "Marcas brasileiras desenvolvem tintas 100% veganas sem comprometer qualidade. Movimento sustentável ganha força entre tatuadores conscientes e clientes eco-friendly.",
    category: "Inovação",
    tags: ["vegano", "sustentável", "inovação", "qualidade"],
    source: "Eco Ink Magazine",
    author: "Carlos Mendoza",
    readTime: "6 min"
  },
  {
    title: "Pós-Tatuagem: Novos Protocolos de Cuidado",
    excerpt: "Produtos inovadores e técnicas atualizadas revolucionam cicatrização. Especialistas revelam métodos que garantem melhor resultado e reduzem tempo de recuperação.",
    category: "Cuidados",
    tags: ["cuidados", "cicatrização", "produtos", "protocolo"],
    source: "Tattoo Care Brasil",
    author: "Dra. Ana Ferreira",
    readTime: "8 min"
  },
  {
    title: "Arte 3D: Ilusões que Saltam da Pele",
    excerpt: "Técnicas avançadas de sombreado criam efeitos tridimensionais impressionantes. Artistas brasileiros se destacam mundialmente com trabalhos que desafiam a percepção.",
    category: "Estilos",
    tags: ["3d", "ilusão", "perspectiva", "sombreado"],
    source: "3D Ink Brasil",
    author: "Pedro Oliveira",
    readTime: "5 min"
  },
  {
    title: "Setor de Tatuagem Cresce 35% no País",
    excerpt: "Mercado movimenta bilhões e gera milhares de empregos. Profissionalização se intensifica com cursos técnicos e regulamentação, elevando padrões de qualidade.",
    category: "Mercado",
    tags: ["mercado", "crescimento", "profissionalização", "economia"],
    source: "Business Tattoo",
    author: "Marina Santos",
    readTime: "7 min"
  },
  {
    title: "Tecnologia Laser Avança na Remoção",
    excerpt: "Equipamentos de última geração chegam ao Brasil com menor dor e melhores resultados. Procedimento se torna mais acessível e eficiente para remoção segura.",
    category: "Tecnologia",
    tags: ["laser", "remoção", "tecnologia", "segurança"],
    source: "Laser Tech BR",
    author: "Dr. João Santos",
    readTime: "6 min"
  }
]

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 API Tendências SIMPLES iniciada')
    
    const { searchParams } = new URL(request.url)
    const forceUpdate = searchParams.get('forceUpdate') === 'true'
    
    // Por enquanto, sempre retornar dados de fallback
    // TODO: Adicionar Gemini e Firebase depois que estiver estável
    
    const processedNews = FALLBACK_NEWS.map((news, index) => ({
      ...news,
      id: `news-${Date.now()}-${index}`,
      publishedAt: new Date().toISOString(),
      views: Math.floor(Math.random() * 2000) + 100,
      image: `/placeholder.svg?height=200&width=300&text=${encodeURIComponent(news.title.substring(0, 20))}`,
      url: "#",
      createdAt: new Date().toISOString(),
      generatedBy: 'fallback'
    }))

    console.log('✅ Retornando', processedNews.length, 'notícias')

    return NextResponse.json({ 
      tendencias: processedNews,
      generated: true,
      timestamp: new Date().toISOString(),
      source: 'fallback',
      success: true
    })

  } catch (error) {
    console.error('💥 Erro na API simples:', error)
    
    // Mesmo com erro, retornar dados básicos
    return NextResponse.json({ 
      tendencias: FALLBACK_NEWS.map((news, index) => ({
        ...news,
        id: `error-${index}`,
        publishedAt: new Date().toISOString(),
        views: 100,
        image: "/placeholder.svg",
        url: "#"
      })),
      generated: false,
      timestamp: new Date().toISOString(),
      source: 'emergency',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
