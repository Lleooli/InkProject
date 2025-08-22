// app/api/n8n/config/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // TODO: Pegar configurações reais do sistema
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
    console.error('Erro ao buscar configurações:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
