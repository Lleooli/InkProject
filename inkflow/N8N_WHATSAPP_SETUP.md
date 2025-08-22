# 🚀 WhatsApp Bot com n8n - Guia Completo

## 🎯 Por que n8n é Melhor?

- ✅ **Interface Visual** - Arrastar e soltar
- ✅ **Sem Programação** - Configuração visual
- ✅ **Integrações Prontas** - WhatsApp, OpenAI, Webhooks
- ✅ **Fácil Manutenção** - Mudanças em tempo real
- ✅ **Escalabilidade** - Múltiplos fluxos automáticos

## 📋 Pré-requisitos

### 1. **WhatsApp Business API**
- Conta no **Meta for Developers**
- Número verificado do WhatsApp Business
- Token de acesso da API

### 2. **n8n Self-Hosted** (Gratuito)
```bash
# Instalar n8n globalmente
npm install n8n -g

# Ou usar Docker
docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n
```

### 3. **OpenAI API** (Opcional - para IA)
- Conta OpenAI com créditos
- API Key do ChatGPT

## 🛠️ Setup Inicial

### 1. **Iniciar n8n**
```bash
n8n start
```
- Acesse: `http://localhost:5678`
- Crie sua conta administrativa

### 2. **Configurar Credenciais**

#### **WhatsApp Business API:**
- Nome: `WhatsApp Business`
- Access Token: `seu_token_aqui`
- Phone Number ID: `seu_phone_id`

#### **OpenAI (Opcional):**
- Nome: `OpenAI`
- API Key: `sk-...`

#### **Webhook InkFlow:**
- Nome: `InkFlow API`
- URL Base: `http://localhost:3000/api`
- Headers: `Authorization: Bearer seu_token`

## 🔄 Fluxos Principais

### **1. Atendimento Automático**

```
Trigger: WhatsApp → Análise de Texto → Respostas Condicionais
```

**Nodes:**
1. **WhatsApp Business Trigger**
   - Evento: `Mensagem Recebida`
   - Webhook URL será gerado automaticamente

2. **Switch Node** (Análise de texto)
   ```
   Condição 1: {{$json.text}} contém "preço"
   Condição 2: {{$json.text}} contém "agendar"
   Condição 3: {{$json.text}} contém "horário"
   Default: Enviar para IA
   ```

3. **WhatsApp Send Message** (para cada condição)
   - Preços: Template de tabela de preços
   - Agendamento: Iniciar coleta de dados
   - Horários: Mostrar disponibilidade
   - IA: Processar com ChatGPT

### **2. Coleta de Dados para Orçamento**

```
Pergunta 1 → Aguarda Resposta → Pergunta 2 → ... → Gera Orçamento
```

**Fluxo:**
1. **Set Node** - Inicializar sessão
2. **WhatsApp Send** - "Qual sua ideia de tatuagem?"
3. **Wait for Webhook** - Aguardar resposta
4. **WhatsApp Send** - "Qual tamanho aproximado?"
5. **Wait for Webhook** - Aguardar resposta
6. **Function Node** - Calcular preço
7. **WhatsApp Send** - Enviar orçamento
8. **HTTP Request** - Salvar lead no InkFlow

### **3. Lembretes Automáticos**

```
Cron (9h) → Buscar Agendamentos → Filtrar Hoje → Enviar Lembretes
```

**Nodes:**
1. **Cron Trigger**
   - Horário: `0 9 * * *` (9h todo dia)

2. **HTTP Request** - Buscar agendamentos
   ```
   GET /api/agenda
   Filtro: data = hoje
   ```

3. **Split Node** - Separar cada agendamento

4. **WhatsApp Send Message**
   ```
   🎨 Oi {{$json.cliente_nome}}!
   
   Lembrete do seu agendamento hoje às {{$json.horario}} 
   para {{$json.tipo_tatuagem}}.
   
   📍 Nos vemos no estúdio!
   Qualquer dúvida, é só responder. 😊
   ```

### **4. Campanhas Automáticas**

```
Cron (Segunda 10h) → Buscar Clientes → Enviar Promoção
```

**Nodes:**
1. **Cron Trigger**
   - Horário: `0 10 * * 1` (Segunda 10h)

2. **HTTP Request** - Buscar lista de clientes
   ```
   GET /api/clientes
   Filtro: ativo = true
   ```

3. **WhatsApp Send Message**
   ```
   🔥 PROMOÇÃO DA SEMANA! 🔥
   
   ⚡ 30% OFF em tatuagens pequenas (até 5cm)
   🎨 20% OFF na segunda tatuagem
   ✨ Fineline especial: R$ 120
   
   📅 Válido até sexta-feira!
   📱 Responda aqui para agendar!
   ```

### **5. IA Inteligente (ChatGPT)**

```
Mensagem → Contexto → ChatGPT → Resposta Personalizada
```

**Nodes:**
1. **Function Node** - Preparar contexto
   ```javascript
   const context = `
   Você é um assistente de um estúdio de tatuagem chamado ${workflow.studioName}.
   
   Informações do estúdio:
   - Especialidades: ${workflow.especialidades}
   - Preços: Pequenas R$150-250, Médias R$300-600
   - Horários: ${workflow.horarios}
   - Localização: ${workflow.endereco}
   
   Cliente perguntou: "${$json.text}"
   
   Responda como tatuador profissional, seja prestativo e inclua call-to-action para agendar.
   `;
   
   return [{ json: { prompt: context } }];
   ```

2. **OpenAI Chat Model**
   - Model: `gpt-3.5-turbo`
   - Prompt: `{{$json.prompt}}`
   - Max Tokens: 150

3. **WhatsApp Send Message**
   - Text: `{{$json.message.content}}`

## 🔌 Integração com InkFlow

### **Webhooks do InkFlow**

Criar endpoints na sua API para n8n:

1. **GET /api/n8n/agendamentos**
   ```json
   {
     "agendamentos": [
       {
         "cliente_nome": "João",
         "cliente_phone": "+5511999999999",
         "data": "2024-01-15",
         "horario": "14:00",
         "tipo_tatuagem": "Fineline braço"
       }
     ]
   }
   ```

2. **POST /api/n8n/leads**
   ```json
   {
     "phone": "+5511999999999",
     "nome": "Maria",
     "interesse": "Tatuagem colorida",
     "tamanho": "10cm",
     "local": "braço",
     "orcamento": 450
   }
   ```

3. **GET /api/n8n/clientes**
   ```json
   {
     "clientes": [
       {
         "nome": "Ana",
         "phone": "+5511888888888",
         "ultima_visita": "2024-01-01"
       }
     ]
   }
   ```

## 📊 Templates de Mensagens

### **Template: Preços**
```
💰 TABELA DE PREÇOS

🎨 Tatuagens:
• Pequena (até 5cm): R$ 150 - R$ 250
• Média (5-15cm): R$ 300 - R$ 600  
• Grande (15cm+): R$ 700+

✨ Especialidades:
• Fineline: R$ 200 - R$ 400
• Realismo: R$ 400 - R$ 800
• Colorida: R$ 350 - R$ 700

Para orçamento personalizado, me conte sua ideia! 😊
```

### **Template: Coleta de Dados**
```
Olá! 😊 Que legal que quer fazer uma tatuagem! 🎨

Para eu preparar seu orçamento personalizado, me conta:

1️⃣ Qual sua ideia? (desenho, frase, símbolo...)
2️⃣ Tamanho aproximado? (ex: 5cm, tamanho da mão...)
3️⃣ Onde no corpo? (braço, perna, costas...)
4️⃣ Que estilo prefere? (fineline, colorida, realismo...)

Pode mandar tudo de uma vez! 📝
```

### **Template: Orçamento**
```
🎨 ORÇAMENTO PERSONALIZADO

📋 Sua tatuagem:
• Ideia: {{$json.ideia}}
• Tamanho: {{$json.tamanho}}
• Local: {{$json.local}}
• Estilo: {{$json.estilo}}

💰 Valor: R$ {{$json.preco}}
⏱️ Tempo estimado: {{$json.tempo}}

📅 Quer agendar? Temos estes horários disponíveis:
• Segunda 14h
• Quarta 10h
• Sexta 16h

Responda com o horário que prefere! 😊
```

## 🚀 Deploy e Produção

### **n8n Cloud** (Recomendado)
- Vai em `n8n.cloud`
- Plano gratuito: 5.000 execuções/mês
- Plano pago: €20/mês (execuções ilimitadas)

### **Self-Hosted (VPS)**
```bash
# Docker Compose
version: '3.8'
services:
  n8n:
    image: n8nio/n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=sua_senha
    volumes:
      - ~/.n8n:/home/node/.n8n
```

### **Monitoramento**
- **Logs**: Built-in no n8n
- **Alertas**: Email quando fluxo falha
- **Métricas**: Dashboard de execuções

## 🎯 Resultados Esperados

- ✅ **Atendimento 24h** automático
- ✅ **Zero cliente perdido** por demora
- ✅ **Orçamentos automáticos** em 2 minutos
- ✅ **Lembretes automáticos** de agendamentos
- ✅ **Campanhas regulares** para fidelização
- ✅ **Leads organizados** no sistema
- ✅ **Analytics completo** de conversas

## 📈 Próximos Passos

1. **Instalar n8n** localmente
2. **Configurar WhatsApp Business API**
3. **Criar primeiro fluxo** (atendimento básico)
4. **Testar integração** com InkFlow
5. **Adicionar IA** (ChatGPT)
6. **Implementar automações** (lembretes/campanhas)
7. **Deploy produção** (n8n.cloud)

---

## 🔥 **Vantagem Gigante do n8n:**

**Com o código:** Toda mudança = programar + deploy
**Com n8n:** Mudança em tempo real, interface visual, sem código!

**Exemplo:** Quer mudar texto da promoção?
- **Código:** Editar arquivo → Commit → Deploy (15 min)
- **n8n:** Clica no node → Edita texto → Salva (30 segundos)

**Seu estúdio vai ter um sistema de vendas automático profissional! 🚀**
