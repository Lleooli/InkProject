# 🤖 WhatsApp Bot para InkFlow

Bot automático e inteligente para atendimento via WhatsApp integrado ao sistema InkFlow.

## ✨ Recursos

### 🧠 **Inteligência Artificial**
- **IA Gratuita**: Usa Ollama com modelo `llama3.2:1b` (roda localmente)
- **Conversas Naturais**: Entende perguntas complexas sobre tatuagens
- **Contexto Inteligente**: Lembra da conversa e coleta informações gradualmente

### 💬 **Respostas Automáticas**
- **Preços**: Tabela de valores automática
- **Horários**: Mostra agenda disponível
- **Localização**: Endereço e como chegar
- **Portfólio**: Links para Instagram e trabalhos

### 📋 **Orçamentos Inteligentes**
- Coleta informações automaticamente:
  - Ideia da tatuagem
  - Tamanho desejado
  - Local no corpo
  - Estilo preferido
- Gera orçamento personalizado
- Facilita agendamento

### ⏰ **Automações**
- **Lembretes Diários** (9h): Para clientes com agendamento
- **Promoções Semanais** (segunda 10h): Campanhas automáticas
- **Atendimento 24/7**: Nunca perde um cliente

## 🚀 Como Configurar

### 1. **Instalar Dependências da IA**
```bash
npm run setup-whatsapp
```

### 2. **Configurar no Sistema**
1. Acesse **Configurações** → **WhatsApp**
2. Configure seu número: `+55 11 99999-9999`
3. Personalize os templates de mensagem
4. Clique em **"Iniciar Bot"**

### 3. **Conectar WhatsApp**
1. Aguarde o QR Code aparecer no terminal
2. Abra WhatsApp no celular
3. Vá em **Dispositivos Conectados**
4. Escaneie o QR Code
5. ✅ Bot ativo!

## 📱 Como Funciona

### **Para Clientes:**
```
Cliente: "Oi, quero fazer uma tatuagem"

Bot: "Olá! 😊 Que legal que quer fazer uma tatuagem! 🎨

Para eu preparar seu orçamento personalizado, me conta:

1️⃣ Qual sua ideia? (desenho, frase, símbolo...)
2️⃣ Tamanho aproximado? (ex: 5cm, tamanho da mão...)
3️⃣ Onde no corpo? (braço, perna, costas...)
4️⃣ Que estilo prefere? (fineline, colorida, realismo...)

Pode mandar tudo de uma vez ou ir respondendo aos poucos! 📝"
```

### **Comandos Rápidos:**
- `"preço"` → Tabela de preços
- `"horário"` → Agenda disponível  
- `"endereço"` → Localização do estúdio
- `"portfólio"` → Links dos trabalhos

### **IA Avançada:**
O bot usa IA para conversas naturais:
```
Cliente: "Quanto custa uma tattoo pequena no braço, estilo fineline?"

Bot: "Uma tatuagem fineline pequena no braço fica entre R$ 150-250! 🎨

Fineline é uma das nossas especialidades! Para um orçamento exato, me manda:
• Qual a ideia específica?
• Tamanho em cm?

Posso fazer um desenho personalizado! 😊"
```

## ⚙️ Configurações Avançadas

### **Templates Personalizáveis:**
- **Novo Agendamento**: Primeira mensagem para coleta
- **Lembrete**: Enviado 1 dia antes do agendamento
- **Orçamento**: Formato da proposta final

### **Integração com Sistema:**
- Usa dados das **Configurações** (nome, estúdio, endereço)
- Pode integrar com **Agenda** para horários reais
- Acessa **Portfólio** para mostrar trabalhos

## 🛠️ Resolução de Problemas

### **Bot não inicia:**
1. Verifique se o Ollama está instalado: `ollama --version`
2. Baixe o modelo: `ollama pull llama3.2:1b`
3. Configure o número corretamente

### **QR Code não aparece:**
1. Feche outros WhatsApp Web abertos
2. Reinicie o bot
3. Aguarde uns minutos

### **IA não responde:**
1. Verifique se Ollama está rodando: `ollama serve`
2. Teste o modelo: `ollama run llama3.2:1b "teste"`

### **Mensagens não chegam:**
1. Verifique conexão da internet
2. WhatsApp Web deve estar conectado
3. Número deve ter +código do país

## 📊 Estatísticas

O bot automaticamente:
- ✅ Responde **24/7** sem parar
- ✅ Coleta leads e organiza informações
- ✅ Envia lembretes automáticos
- ✅ Faz campanhas de marketing
- ✅ Nunca "esquece" de responder
- ✅ Mantém tom profissional sempre

## 🔒 Segurança

- **Dados Locais**: IA roda no seu computador
- **WhatsApp Oficial**: Usa API oficial do WhatsApp
- **Sem Custos**: Completamente gratuito
- **Privacidade**: Conversas não são enviadas para terceiros

---

**🎨 Transforme seu atendimento em uma máquina de vendas automática!**
