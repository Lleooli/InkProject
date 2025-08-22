import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore'

// Verificar se a chave do Gemini está configurada
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
if (!GEMINI_API_KEY) {
  console.warn('⚠️ GEMINI_API_KEY não configurada - usando dados de fallback')
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Iniciando busca/geração de tendências...')
    
    const { searchParams } = new URL(request.url)
    const forceUpdate = searchParams.get('forceUpdate') === 'true'

    // Verificar se já temos tendências do dia atual
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    console.log('📅 Verificando tendências do dia:', today.toDateString())
    
    try {
      const tendenciasRef = collection(db, 'tendencias')
      const todayQuery = query(
        tendenciasRef,
        where('createdAt', '>=', Timestamp.fromDate(today)),
        orderBy('createdAt', 'desc')
      )
      
      const existingTendencias = await getDocs(todayQuery)
      
      if (!existingTendencias.empty && !forceUpdate) {
        console.log('✅ Tendências existentes encontradas:', existingTendencias.size)
        // Retornar tendências existentes do dia
        const tendencias = existingTendencias.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        return NextResponse.json({ tendencias })
      }
    } catch (firebaseError) {
      console.error('❌ Erro no Firebase:', firebaseError)
      // Continuar para gerar dados de fallback
    }

    console.log('🤖 Gerando novas tendências...')

    let generatedNews = []

    // Tentar gerar com Gemini se disponível
    if (genAI && GEMINI_API_KEY) {
      try {
        console.log('🔮 Usando Gemini para gerar conteúdo...')
        
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-pro',
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
        
        const prompt = `
        Você é um especialista em tatuagens. Gere exatamente 6 notícias sobre o mundo das tatuagens em português brasileiro.

        IMPORTANTE: Responda APENAS com um JSON válido, sem texto adicional, sem explicações, sem markdown.

        Formato obrigatório:
        {
          "noticias": [
            {
              "title": "título da notícia",
              "excerpt": "resumo da notícia em 2-3 linhas",
              "category": "categoria",
              "tags": ["tag1", "tag2", "tag3"],
              "source": "nome da fonte",
              "author": "nome do autor",
              "readTime": "X min"
            }
          ]
        }

        Categorias válidas: Tendências, Inovação, Cuidados, Estilos, Técnicas, Mercado, Tecnologia

        Temas para incluir:
        - Novas técnicas e estilos emergentes
        - Tendências de design atuais  
        - Inovações em equipamentos e tintas
        - Cuidados e saúde na tatuagem
        - Mercado e negócios do setor
        - Sustentabilidade na tatuagem

        Gere conteúdo atual e relevante para tatuadores brasileiros em 2025.
        `

        // Adicionar timeout de 30 segundos
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout do Gemini')), 30000)
        })

        const geminiPromise = model.generateContent(prompt)
        
        const result = await Promise.race([geminiPromise, timeoutPromise]) as any
        const response = await result.response
        const text = response.text()
        
        console.log('📝 Resposta do Gemini recebida, tamanho:', text?.length || 0)
        console.log('📄 Primeiros 200 chars:', text?.substring(0, 200) || 'vazio')
        
        if (!text || text.trim().length === 0) {
          throw new Error('Resposta vazia do Gemini')
        }
        
        let geminiData
        try {
          // Tentar diferentes formas de extrair JSON
          let jsonString = text.trim()
          
          // Remover markdown code blocks se existirem
          if (jsonString.includes('```json')) {
            const match = jsonString.match(/```json\s*([\s\S]*?)\s*```/)
            if (match) {
              jsonString = match[1].trim()
            }
          } else if (jsonString.includes('```')) {
            const match = jsonString.match(/```\s*([\s\S]*?)\s*```/)
            if (match) {
              jsonString = match[1].trim()
            }
          }
          
          // Procurar por JSON dentro do texto
          const jsonMatch = jsonString.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            jsonString = jsonMatch[0]
          }
          
          console.log('🔍 Tentando parsear JSON:', jsonString.substring(0, 100) + '...')
          
          geminiData = JSON.parse(jsonString)
          
          if (!geminiData.noticias || !Array.isArray(geminiData.noticias)) {
            throw new Error('Formato de resposta inválido - noticias não é array')
          }
          
          generatedNews = geminiData.noticias
          console.log('✅ Dados do Gemini processados:', generatedNews.length, 'notícias')
          
        } catch (parseError) {
          console.error('❌ Erro ao parsear resposta do Gemini:', parseError)
          console.error('📄 Texto completo da resposta:', text)
          throw new Error(`Erro ao processar resposta da IA: ${parseError instanceof Error ? parseError.message : 'formato inválido'}`)
        }
      } catch (geminiError) {
        console.error('❌ Erro no Gemini:', geminiError)
        // Continuar para dados de fallback
      }
    }

    // Se não conseguiu gerar com Gemini, usar dados de fallback
    if (generatedNews.length === 0) {
      console.log('📋 Usando dados de fallback...')
      generatedNews = [
        {
          title: "Micro Tatuagens: A Nova Tendência Minimalista de 2025",
          excerpt: "Designs ultra pequenos e delicados ganham popularidade, especialmente entre jovens que buscam arte corporal discreta mas significativa. A técnica exige precisão extrema e equipamentos especializados.",
          category: "Tendências",
          tags: ["micro", "minimalista", "delicado", "precisão"],
          source: "Tattoo Today BR",
          author: "Ana Silva",
          readTime: "4 min"
        },
        {
          title: "Tintas Veganas: Revolução Sustentável na Tatuagem",
          excerpt: "Marcas brasileiras desenvolvem tintas 100% veganas e sustentáveis, sem comprometer qualidade ou durabilidade. Movimento ganha força entre tatuadores conscientes.",
          category: "Inovação",
          tags: ["vegano", "sustentável", "inovação", "qualidade"],
          source: "Eco Ink Magazine",
          author: "Carlos Mendoza",
          readTime: "6 min"
        },
        {
          title: "Cuidados Pós-Tatuagem: Guia Atualizado 2025",
          excerpt: "Novos produtos e técnicas de cicatrização revolucionam o pós-procedimento. Especialistas revelam protocolos atualizados para garantir melhor resultado e cicatrização.",
          category: "Cuidados",
          tags: ["cuidados", "cicatrização", "produtos", "protocolo"],
          source: "Tattoo Care Brasil",
          author: "Dra. Ana Ferreira",
          readTime: "8 min"
        },
        {
          title: "Tatuagens 3D: Arte que Salta da Pele",
          excerpt: "Técnicas avançadas de sombreado e perspectiva criam ilusões óticas impressionantes. Artistas brasileiros se destacam no cenário mundial com trabalhos inovadores.",
          category: "Estilos",
          tags: ["3d", "ilusão", "perspectiva", "sombreado"],
          source: "3D Ink Brasil",
          author: "Pedro Oliveira",
          readTime: "5 min"
        },
        {
          title: "Mercado de Tatuagem Cresce 30% no Brasil",
          excerpt: "Setor movimenta bilhões e cria milhares de empregos. Profissionalização aumenta e cursos técnicos se multiplicam pelo país, elevando qualidade do mercado.",
          category: "Mercado",
          tags: ["mercado", "crescimento", "profissionalização", "economia"],
          source: "Business Tattoo",
          author: "Marina Santos",
          readTime: "7 min"
        },
        {
          title: "Laser Removal: Tecnologia Avança no Brasil",
          excerpt: "Equipamentos de última geração chegam ao país com menor dor e melhores resultados. Procedimento se torna mais acessível e eficiente para remoção segura.",
          category: "Tecnologia",
          tags: ["laser", "remoção", "tecnologia", "segurança"],
          source: "Laser Tech BR",
          author: "Dr. João Santos",
          readTime: "6 min"
        }
      ]
    }

    // Processar e preparar para salvar
    const processedNews = generatedNews.map((news: any, index: number) => ({
      ...news,
      id: Date.now() + index,
      publishedAt: new Date().toISOString(),
      views: Math.floor(Math.random() * 2000) + 100,
      image: `/placeholder.svg?height=200&width=300&text=${encodeURIComponent(news.title.substring(0, 20))}`,
      url: "#",
      createdAt: Timestamp.now(),
      generatedBy: genAI ? 'gemini' : 'fallback'
    }))

    // Tentar salvar no Firebase
    const savedNews = []
    try {
      const tendenciasRef = collection(db, 'tendencias')
      for (const news of processedNews) {
        try {
          const docRef = await addDoc(tendenciasRef, news)
          savedNews.push({ id: docRef.id, ...news })
        } catch (docError) {
          console.error('❌ Erro ao salvar documento individual:', docError)
          // Adicionar com ID temporário se falhar
          savedNews.push({ id: `temp-${Date.now()}-${Math.random()}`, ...news })
        }
      }
      console.log('💾 Tendências processadas:', savedNews.length, '| Salvas no Firebase:', savedNews.filter(n => !n.id.startsWith('temp-')).length)
    } catch (saveError) {
      console.error('❌ Erro geral ao salvar no Firebase:', saveError)
      // Retornar dados mesmo sem salvar no Firebase
      processedNews.forEach((news: any, index: number) => {
        savedNews.push({ id: `fallback-${Date.now()}-${index}`, ...news })
      })
      console.log('📋 Usando IDs temporários para todos os itens')
    }

    console.log('✅ Geração concluída com sucesso!')

    return NextResponse.json({ 
      tendencias: savedNews,
      generated: true,
      timestamp: new Date().toISOString(),
      source: genAI ? 'gemini' : 'fallback',
      firebaseSaved: savedNews.some(n => !n.id.startsWith('temp-') && !n.id.startsWith('fallback-'))
    })

  } catch (error) {
    console.error('💥 Erro geral na API:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Endpoint para forçar atualização manual
    const url = new URL(request.url)
    url.searchParams.set('forceUpdate', 'true')
    
    return GET(new NextRequest(url))
  } catch (error) {
    console.error('Erro ao forçar atualização:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
