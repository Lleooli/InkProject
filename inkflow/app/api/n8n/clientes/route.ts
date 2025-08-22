// app/api/n8n/clientes/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const ativo = url.searchParams.get('ativo') !== 'false';
    const limite = parseInt(url.searchParams.get('limite') || '50');
    
    // TODO: Buscar clientes reais do Firebase/Firestore
    const clientes = [
      {
        nome: "Ana Costa",
        phone: "+5511777777777",
        ultima_visita: "2024-01-10",
        total_tatuagens: 3,
        valor_total_gasto: 1200,
        preferencias: ["fineline", "colorida"]
      },
      {
        nome: "Carlos Oliveira",
        phone: "+5511666666666", 
        ultima_visita: "2024-01-05",
        total_tatuagens: 1,
        valor_total_gasto: 300,
        preferencias: ["realismo"]
      }
    ];
    
    const clientesFiltrados = ativo ? 
      clientes.filter(c => new Date(c.ultima_visita) > new Date('2023-01-01')) : 
      clientes;
    
    return NextResponse.json({
      success: true,
      total: clientesFiltrados.length,
      clientes: clientesFiltrados.slice(0, limite)
    });
    
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
