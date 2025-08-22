import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const checks = {
      timestamp: new Date().toISOString(),
      gemini_api_key: {
        configured: !!process.env.GEMINI_API_KEY,
        length: process.env.GEMINI_API_KEY?.length || 0,
        starts_with: process.env.GEMINI_API_KEY?.substring(0, 10) || 'não configurada'
      },
      cron_secret: {
        configured: !!process.env.CRON_SECRET,
        length: process.env.CRON_SECRET?.length || 0
      },
      firebase_config: {
        api_key: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        project_id: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        auth_domain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
      }
    }

    return NextResponse.json({
      status: 'OK',
      message: 'Diagnóstico da configuração',
      checks,
      recommendations: generateRecommendations(checks)
    })

  } catch (error) {
    return NextResponse.json(
      { 
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

function generateRecommendations(checks: any): string[] {
  const recommendations: string[] = []

  if (!checks.gemini_api_key.configured) {
    recommendations.push('Configure GEMINI_API_KEY no arquivo .env.local')
  }

  if (!checks.cron_secret.configured) {
    recommendations.push('Configure CRON_SECRET no arquivo .env.local')
  }

  if (!checks.firebase_config.api_key) {
    recommendations.push('Configure as variáveis do Firebase')
  }

  if (recommendations.length === 0) {
    recommendations.push('Todas as configurações estão OK!')
  }

  return recommendations
}
