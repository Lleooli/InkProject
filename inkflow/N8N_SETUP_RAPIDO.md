# 🚀 Setup Rápido n8n para WhatsApp Bot

## ⚡ Instalação Rápida (5 minutos)

### 1. **Instalar n8n**
```bash
# Opção 1: Instalar globalmente
npm install n8n -g

# Opção 2: Docker (mais fácil)
docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n
```

### 2. **Iniciar n8n**
```bash
n8n start
```

### 3. **Acessar Interface**
- Abra: `http://localhost:5678`
- Crie usuário admin
- Pronto! 🎉

## 📱 Configurar WhatsApp Business API

### **Opção 1: Meta for Developers (Oficial)**
1. Acesse: `developers.facebook.com`
2. Crie app WhatsApp Business
3. Configure webhook: `https://seu-n8n.com/webhook/whatsapp`
4. Copie Token de Acesso

### **Opção 2: Evolution API (Mais Fácil)**
```bash
# Instalar Evolution API
git clone https://github.com/EvolutionAPI/evolution-api.git
cd evolution-api
npm install
npm run start:prod
```

- Acesse: `http://localhost:8080`
- Crie instância WhatsApp
- Escaneie QR Code
- Pronto para usar com n8n!

## 🔗 Conectar com InkFlow

### **Endpoints já criados:**
- `GET /api/n8n/agendamentos` - Buscar agendamentos
- `POST /api/n8n/leads` - Salvar leads
- `GET /api/n8n/clientes` - Lista de clientes
- `GET /api/n8n/config` - Configurações do estúdio

### **Testar APIs:**
```bash
# Testar configurações
curl http://localhost:3000/api/n8n/config

# Testar agendamentos
curl http://localhost:3000/api/n8n/agendamentos?data=2024-01-15

# Salvar lead
curl -X POST http://localhost:3000/api/n8n/leads \
  -H "Content-Type: application/json" \
  -d '{"phone":"+5511999999999","nome":"João","interesse":"Tatuagem braço"}'
```

## 🎯 Primeiro Fluxo (10 minutos)

### **1. Criar Workflow**
- Nome: "WhatsApp Atendimento Básico"
- Trigger: WhatsApp Business Trigger

### **2. Nodes Básicos:**
```
WhatsApp Trigger → Switch (Análise) → WhatsApp Send
```

### **3. Configurar Switch:**
- Condição 1: `{{$json.body.toLowerCase()}}` contém `preço`
- Condição 2: `{{$json.body.toLowerCase()}}` contém `agendar`
- Default: Resposta padrão

### **4. Respostas:**
- **Preço:** Template de tabela de preços
- **Agendar:** "Que legal! Me conte sua ideia..."
- **Default:** "Olá! Como posso ajudar? Digite 'preço' para ver valores"

## 🔥 Templates Prontos

### **Importar no n8n:**
```json
{
  "name": "WhatsApp InkFlow Basic",
  "nodes": [
    {
      "parameters": {
        "options": {}
      },
      "name": "WhatsApp Business Trigger",
      "type": "n8n-nodes-base.whatsAppBusinessTrigger",
      "position": [240, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.body.toLowerCase()}}",
              "operation": "contains",
              "value2": "preço"
            }
          ]
        }
      },
      "name": "Check Preço",
      "type": "n8n-nodes-base.switch",
      "position": [460, 300]
    }
  ]
}
```

## 🎯 Próximos Passos

1. ✅ **Instalar n8n** (5 min)
2. ✅ **Configurar WhatsApp** (10 min)  
3. ✅ **Criar primeiro fluxo** (10 min)
4. 🔄 **Testar com seu número** (5 min)
5. 🚀 **Expandir automações** (conforme necessário)

## 💡 Vantagens Imediatas

- ✅ **Sem código** - Interface visual
- ✅ **Mudanças em tempo real** - Edita e salva
- ✅ **Histórico completo** - Log de todas execuções
- ✅ **Integrações prontas** - 400+ apps conectados
- ✅ **Escalável** - Do básico ao avançado

---

## 🔥 **Resultado:**
**Em 30 minutos você terá um bot WhatsApp profissional funcionando!**

Muito mais simples que manter código, e infinitamente mais flexível! 🚀
