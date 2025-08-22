#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🤖 Configurando IA gratuita (Ollama) para o WhatsApp Bot...\n');

const isWindows = process.platform === 'win32';
const installCommand = isWindows 
  ? 'winget install Ollama.Ollama'
  : 'curl -fsSL https://ollama.ai/install.sh | sh';

console.log('📦 Etapa 1: Instalando Ollama...');
console.log(`Comando: ${installCommand}\n`);

exec(installCommand, (error, stdout, stderr) => {
  if (error) {
    console.log('⚠️  Ollama pode já estar instalado ou precisa ser instalado manualmente.');
    console.log('📥 Baixe em: https://ollama.ai/download\n');
  } else {
    console.log('✅ Ollama instalado com sucesso!\n');
  }

  console.log('🧠 Etapa 2: Baixando modelo de IA (llama3.2:1b - ~1.3GB)...');
  console.log('Este processo pode demorar alguns minutos...\n');

  exec('ollama pull llama3.2:1b', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Erro ao baixar modelo. Execute manualmente:');
      console.log('ollama pull llama3.2:1b\n');
    } else {
      console.log('✅ Modelo de IA baixado com sucesso!\n');
    }

    console.log('🚀 Configuração concluída!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Acesse as Configurações no sistema');
    console.log('2. Vá na aba "WhatsApp"');
    console.log('3. Configure seu número');
    console.log('4. Clique em "Iniciar Bot"');
    console.log('5. Escaneie o QR Code que aparecerá no terminal');
    console.log('\n🎉 Seu bot estará pronto para responder mensagens automaticamente!');
  });
});
