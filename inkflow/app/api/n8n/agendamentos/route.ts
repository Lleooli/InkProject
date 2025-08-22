// app/api/n8n/agendamentos/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const data = url.searchParams.get('data') || new Date().toISOString().split('T')[0];
    
    // TODO: Integrar com seu sistema de agendamentos
    // Por enquanto, dados mock para teste
    const agendamentos = [
      {
        cliente_nome: "João Silva",
        cliente_phone: "+5511999999999",
        data: data,
        horario: "14:00",
        tipo_tatuagem: "Fineline braço",
        observacoes: "Cliente preferiu horário da tarde"
      }
    ];
    
    return NextResponse.json({
      success: true,
      data: data,
      agendamentos: agendamentos
    });
    
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
