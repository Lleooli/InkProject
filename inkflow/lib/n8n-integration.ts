// n8n-integration.ts - APIs para integrar n8n com InkFlow

import { NextRequest, NextResponse } from 'next/server';

// GET /api/n8n/agendamentos - Buscar agendamentos do dia
export async function GET_agendamentos(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const data = url.searchParams.get('data') || new Date().toISOString().split('T')[0];
    
    // Buscar agendamentos do Firebase/Firestore
    // Substitua pela sua lógica de busca
    const agendamentos = [
      {
        cliente_nome: "João Silva",
        cliente_phone: "+5511999999999",
        data: data,
        horario: "14:00",
        tipo_tatuagem: "Fineline braço",
        observacoes: "Cliente preferiu horário da tarde"
      },
      {
        cliente_nome: "Maria Santos", 
        cliente_phone: "+5511888888888",
        data: data,
        horario: "16:30",
        tipo_tatuagem: "Tatuagem colorida perna",
        observacoes: "Primeira tatuagem"
      }
    ];
    
    return NextResponse.json({
      success: true,
      data: data,
      agendamentos: agendamentos
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST /api/n8n/leads - Salvar novo lead do WhatsApp
export async function POST_leads(request: NextRequest) {
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
    
    // Salvar no Firebase/Firestore
    const novoLead = {
      phone: phone,
      nome: nome || 'Não informado',
      interesse: interesse,
      tamanho: tamanho || 'Não informado',
      local_corpo: local || 'Não informado', 
      orcamento_estimado: orcamento || 0,
      origem: origem || 'WhatsApp Bot',
      data_criacao: new Date().toISOString(),
      status: 'novo',
      conversas: []
    };
    
    // Aqui você salvaria no seu banco de dados
    console.log('Novo lead:', novoLead);
    
    return NextResponse.json({
      success: true,
      message: 'Lead salvo com sucesso',
      lead_id: Date.now(), // Substitua pelo ID real do banco
      data: novoLead
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// GET /api/n8n/clientes - Lista de clientes para campanhas
export async function GET_clientes(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const ativo = url.searchParams.get('ativo') !== 'false';
    const limite = parseInt(url.searchParams.get('limite') || '50');
    
    // Buscar clientes ativos
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
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// GET /api/n8n/config - Configurações do estúdio para n8n
export async function GET_config() {
  try {
    // Pegar configurações salvas no sistema
    const config = {
      studio: {
        nome: "InkFlow Studio",
        endereco: "Rua das Tatuagens, 123 - São Paulo/SP",
        telefone: "+5511999999999",
        horario_funcionamento: "Segunda a Sexta: 9h às 18h, Sábado: 9h às 14h",
        instagram: "@inkflow_studio"
      },
      precos: {
        pequena: { min: 150, max: 250, descricao: "até 5cm" },
        media: { min: 300, max: 600, descricao: "5-15cm" },
        grande: { min: 700, max: 1500, descricao: "15cm+" }
      },
      especialidades: [
        "Fineline",
        "Realismo",
        "Colorida", 
        "Blackwork",
        "Tradicional"
      ],
      horarios_disponiveis: [
        "Segunda 14h", "Segunda 16h",
        "Terça 10h", "Terça 14h", "Terça 16h",
        "Quarta 10h", "Quarta 14h",
        "Quinta 10h", "Quinta 16h",
        "Sexta 14h", "Sexta 16h"
      ],
      templates: {
        boas_vindas: "Olá! 👋 Bem-vindo ao InkFlow Studio! 🎨\n\nComo posso ajudar você hoje?\n\n• Ver preços 💰\n• Fazer orçamento 📝\n• Agendar horário 📅\n• Falar com tatuador 👨‍🎨",
        
        precos: "💰 TABELA DE PREÇOS\n\n🎨 Tatuagens:\n• Pequena (até 5cm): R$ 150 - R$ 250\n• Média (5-15cm): R$ 300 - R$ 600\n• Grande (15cm+): R$ 700+\n\n✨ Especialidades:\n• Fineline: +R$ 50\n• Realismo: +R$ 100\n• Colorida: +R$ 100\n\nPara orçamento personalizado, me conte sua ideia! 😊",
        
        coleta_dados: "Olá! 😊 Que legal que quer fazer uma tatuagem! 🎨\n\nPara eu preparar seu orçamento personalizado, me conta:\n\n1️⃣ Qual sua ideia? (desenho, frase, símbolo...)\n2️⃣ Tamanho aproximado? (ex: 5cm, tamanho da mão...)\n3️⃣ Onde no corpo? (braço, perna, costas...)\n4️⃣ Que estilo prefere? (fineline, colorida, realismo...)\n\nPode mandar tudo de uma vez! 📝",
        
        promocao_semanal: "🔥 PROMOÇÃO DA SEMANA! 🔥\n\n⚡ 30% OFF em tatuagens pequenas (até 5cm)\n🎨 20% OFF na segunda tatuagem\n✨ Fineline especial: R$ 120\n\n📅 Válido até sexta-feira!\n📱 Responda aqui para agendar!"
      }
    };
    
    return NextResponse.json({
      success: true,
      config: config
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST /api/n8n/conversas - Salvar histórico de conversas
export async function POST_conversas(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, mensagem_cliente, mensagem_bot, contexto } = body;
    
    const conversa = {
      phone: phone,
      timestamp: new Date().toISOString(),
      mensagem_cliente: mensagem_cliente,
      mensagem_bot: mensagem_bot,
      contexto: contexto || 'geral',
      origem: 'n8n_whatsapp'
    };
    
    // Salvar no histórico de conversas
    console.log('Nova conversa:', conversa);
    
    return NextResponse.json({
      success: true,
      message: 'Conversa salva',
      conversa_id: Date.now()
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// Função utilitária para calcular orçamento
export function calcularOrcamento(dados) {
  const { tamanho, estilo, local, complexidade } = dados;
  
  let preco_base = 200; // Preço base
  
  // Ajustar por tamanho
  if (tamanho.includes('pequen') || tamanho.includes('5cm')) {
    preco_base = 150;
  } else if (tamanho.includes('medi') || tamanho.includes('10cm')) {
    preco_base = 350;
  } else if (tamanho.includes('grand') || tamanho.includes('15cm')) {
    preco_base = 700;
  }
  
  // Ajustar por estilo
  if (estilo?.includes('fineline')) {
    preco_base += 50;
  } else if (estilo?.includes('realismo')) {
    preco_base += 100;
  } else if (estilo?.includes('colorida')) {
    preco_base += 100;
  }
  
  // Ajustar por local (alguns locais são mais difíceis)
  if (local?.includes('costela') || local?.includes('pé')) {
    preco_base += 50;
  }
  
  return {
    preco_minimo: preco_base,
    preco_maximo: preco_base * 1.5,
    tempo_estimado: `${Math.ceil(preco_base / 150)} sessões`
  };
}
