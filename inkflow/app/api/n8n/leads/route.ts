// app/api/n8n/leads/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, nome, interesse, tamanho, local, orcamento, origem } = body;
    
    // Validar dados obrigatórios
    if (!phone || !interesse) {
      return NextResponse.json({
        success: false,
        error: 'Phone e interesse são obrigatórios'
      }, { status: 400 });
    }
    
    // TODO: Salvar no Firebase/Firestore
    const novoLead = {
      phone: phone,
      nome: nome || 'Não informado',
      interesse: interesse,
      tamanho: tamanho || 'Não informado',
      local_corpo: local || 'Não informado', 
      orcamento_estimado: orcamento || 0,
      origem: origem || 'WhatsApp Bot n8n',
      data_criacao: new Date().toISOString(),
      status: 'novo'
    };
    
    console.log('Novo lead do n8n:', novoLead);
    
    return NextResponse.json({
      success: true,
      message: 'Lead salvo com sucesso',
      lead_id: Date.now(),
      data: novoLead
    });
    
  } catch (error) {
    console.error('Erro ao salvar lead:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
