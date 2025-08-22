#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function setupTendenciasIA() {
  console.log('🎨 Configuração das Tendências\n');
  console.log('ℹ️  As funcionalidades de IA foram temporariamente desabilitadas.\n');
  console.log('✅ A aba de Tendências agora funciona com dados estáticos locais.\n');
  
  console.log('🚀 Funcionalidades ativas:');
  console.log('   • Conteúdo estático de alta qualidade');
  console.log('   • Interface totalmente funcional'); 
  console.log('   • Botão para embaralhar conteúdo');
  console.log('   • Busca por título e tags');
  console.log('   • Compartilhamento via WhatsApp');
  
  console.log('\n📂 Arquivos de IA movidos para: disabled-features/');
  console.log('📖 Para reativar IA no futuro, consulte: disabled-features/README.md');
  
  console.log('\n✨ Nenhuma configuração adicional necessária!');
  console.log('🔗 Acesse a aba "Tendências" no app para ver o resultado.');
  
  rl.close();
}

// Verificar se está sendo executado diretamente
if (require.main === module) {
  setupTendenciasIA().catch(console.error);
}

module.exports = { setupTendenciasIA };
