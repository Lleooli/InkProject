#!/usr/bin/env node

console.log('🧪 Testando configuração do WhatsApp Bot...\n');

// Teste 1: Verificar se as dependências estão instaladas
const requiredPackages = [
  'whatsapp-web.js',
  'qrcode-terminal', 
  'node-cron',
  'ollama'
];

console.log('📦 Verificando dependências...');
let allPackagesInstalled = true;

for (const pkg of requiredPackages) {
  try {
    require.resolve(pkg);
    console.log(`✅ ${pkg}`);
  } catch (error) {
    console.log(`❌ ${pkg} - FALTANDO`);
    allPackagesInstalled = false;
  }
}

if (!allPackagesInstalled) {
  console.log('\n❌ Algumas dependências estão faltando!');
  console.log('Execute: npm install whatsapp-web.js qrcode-terminal node-cron ollama');
  process.exit(1);
}

// Teste 2: Verificar se o Ollama está disponível
console.log('\n🧠 Verificando Ollama...');
const { exec } = require('child_process');

exec('ollama --version', (error, stdout, stderr) => {
  if (error) {
    console.log('⚠️  Ollama não está instalado ou não está no PATH');
    console.log('📥 Instale em: https://ollama.ai/download');
    console.log('Ou execute: winget install Ollama.Ollama (Windows)');
  } else {
    console.log(`✅ Ollama encontrado: ${stdout.trim()}`);
    
    // Verificar se o modelo está baixado
    exec('ollama list', (error, stdout, stderr) => {
      if (stdout.includes('llama3.2:1b')) {
        console.log('✅ Modelo llama3.2:1b está disponível');
      } else {
        console.log('⚠️  Modelo llama3.2:1b não encontrado');
        console.log('📥 Execute: ollama pull llama3.2:1b');
      }
    });
  }
});

// Teste 3: Verificar estrutura de arquivos
console.log('\n📁 Verificando arquivos...');
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'lib/whatsapp-bot.ts',
  'lib/whatsapp-scheduler.ts',
  'app/api/whatsapp/route.ts',
  'types/whatsapp-bot.d.ts'
];

for (const file of requiredFiles) {
  if (fs.existsSync(path.join(process.cwd(), file))) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - FALTANDO`);
  }
}

console.log('\n🎉 Verificação concluída!');
console.log('\n📋 Próximos passos:');
console.log('1. Certifique-se que o Ollama está rodando: ollama serve');
console.log('2. Acesse Configurações > WhatsApp no sistema');
console.log('3. Configure seu número e clique em "Iniciar Bot"');
console.log('4. Escaneie o QR Code que aparecerá no terminal');
console.log('\n🤖 Bot pronto para uso!');
