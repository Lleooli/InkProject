import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Verificar se a requisição tem a chave de autorização correta (para segurança)
    const authHeader = request.headers.get('authorization')
    const expectedAuth = process.env.CRON_SECRET || 'default-secret'
    
    if (authHeader !== `Bearer ${expectedAuth}`) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Chamar a API de tendências para gerar novo conteúdo
    const baseUrl = request.url.replace('/api/cron/daily-trends', '')
    const response = await fetch(`${baseUrl}/api/tendencias?forceUpdate=true`, {
      method: 'GET',
    })

    if (!response.ok) {
      throw new Error('Erro ao gerar tendências diárias')
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: 'Tendências diárias geradas com sucesso',
      count: data.tendencias?.length || 0,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erro no cron job diário:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao executar cron job diário',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Permitir POST também para flexibilidade
  return GET(request)
}
