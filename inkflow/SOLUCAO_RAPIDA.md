# 🚀 Guia Rápido: Resolver Erros das Tendências

## ✅ Passos para Corrigir

### 1. **Atualizar Regras do Firestore**
```bash
# No Firebase Console:
# 1. Acesse https://console.firebase.google.com/
# 2. Selecione seu projeto
# 3. Vá em "Firestore Database" > "Regras"
# 4. Substitua o conteúdo pelas regras atualizadas do arquivo firestore.rules
# 5. Clique em "Publicar"
```

### 2. **Configurar Variáveis de Ambiente**
```bash
# Crie o arquivo .env.local na raiz do projeto:
GEMINI_API_KEY=sua_chave_do_gemini_aqui
CRON_SECRET=string_aleatoria_segura
```

### 3. **Obter Chave do Gemini**
1. Acesse: https://makersuite.google.com/app/apikey
2. Faça login com Google
3. Crie uma API Key
4. Copie e cole no .env.local

### 4. **Testar Configuração**
```bash
# Execute no terminal:
npm run setup-tendencias
```

### 5. **Reiniciar Servidor**
```bash
# Pare o servidor (Ctrl+C) e execute:
npm run dev
```

## 🔧 Verificação Rápida

### Teste a API de Diagnóstico:
```
GET http://localhost:3001/api/debug/config
```

### Teste a API de Tendências:
```
GET http://localhost:3001/api/tendencias
```

## 🐛 Problemas Comuns

### ❌ Erro 500 (Internal Server Error)
- **Causa**: GEMINI_API_KEY não configurada
- **Solução**: Configurar chave no .env.local

### ❌ Permission Denied (Firebase)
- **Causa**: Regras do Firestore muito restritivas
- **Solução**: Atualizar firestore.rules (já feito)

### ❌ Failed to Load Resource
- **Causa**: Servidor não rodando ou erro na API
- **Solução**: Reiniciar servidor e verificar logs

## 📱 Estado Atual

A implementação agora funciona com **fallback inteligente**:

1. ✅ **Tenta usar Gemini** (se configurado)
2. ✅ **Usa dados estáticos** (se Gemini falhar)
3. ✅ **Tenta salvar no Firebase** (se possível)
4. ✅ **Funciona sem Firebase** (se necessário)
5. ✅ **Exibe dados sempre** (mesmo com erros)

## 🎯 Resultado Esperado

Após seguir os passos:
- ✅ Tendências carregam automaticamente
- ✅ Botão "Atualizar" funciona
- ✅ Dados salvos no Firebase (se configurado)
- ✅ Fallback funciona sem configuração
