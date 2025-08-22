# Tendências com IA - Configuração

## Visão Geral

A funcionalidade de Tendências agora é alimentada por IA (Google Gemini) e gera automaticamente conteúdo diário sobre o mundo das tatuagens, incluindo notícias, técnicas, inovações e tendências do mercado.

## Configuração

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env.local`:

```bash
# Google Generative AI (Gemini)
GEMINI_API_KEY=sua_chave_do_gemini_aqui

# Cron Job Security (opcional)
CRON_SECRET=uma_string_secreta_aleatoria
```

### 2. Obter Chave do Gemini

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Faça login com sua conta Google
3. Crie uma nova API Key
4. Copie a chave e adicione ao arquivo `.env.local`

### 3. Configuração do Firebase

Certifique-se de que as regras do Firestore permitem leitura e escrita na coleção `tendencias`:

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tendencias/{document} {
      allow read, write: if true; // Ajuste conforme sua lógica de autenticação
    }
  }
}
```

## Funcionalidades

### Geração Automática de Conteúdo

- **Frequência**: Diariamente
- **Conteúdo**: 6 notícias/tendências por geração
- **Temas**: Técnicas, estilos, inovações, cuidados, mercado, sustentabilidade
- **Idioma**: Português brasileiro

### APIs Disponíveis

#### 1. Buscar/Gerar Tendências
```
GET /api/tendencias
```
- Retorna tendências existentes do dia ou gera novas se não existirem
- Query params:
  - `forceUpdate=true`: Força geração de novo conteúdo

#### 2. Atualização Manual
```
POST /api/tendencias
```
- Força geração de novo conteúdo

#### 3. Cron Job Diário
```
GET /api/cron/daily-trends
```
- Header: `Authorization: Bearer ${CRON_SECRET}`
- Para ser chamado por serviços de cron (Vercel Cron, etc.)

### Interface do Usuário

- **Indicador de IA**: Badge especial para conteúdo gerado por IA
- **Botão de Atualização**: Permite regenerar conteúdo manualmente
- **Estados de Loading**: Indicadores visuais durante carregamento
- **Busca**: Filtro por título e tags
- **Compartilhamento**: WhatsApp integration

## Automatização Diária

### Opção 1: Vercel Cron Jobs

1. Adicione ao `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/daily-trends",
      "schedule": "0 6 * * *"
    }
  ]
}
```

### Opção 2: GitHub Actions

1. Crie `.github/workflows/daily-trends.yml`:
```yaml
name: Daily Trends Update

on:
  schedule:
    - cron: '0 6 * * *' # 6:00 AM UTC daily

jobs:
  update-trends:
    runs-on: ubuntu-latest
    steps:
      - name: Call API
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-domain.com/api/cron/daily-trends
```

### Opção 3: Serviços Externos

Use serviços como:
- **Zapier**: Webhook agendado
- **IFTTT**: Trigger temporal
- **UptimeRobot**: Monitor com webhook

## Estrutura de Dados

### Tendência (Firebase Document)

```typescript
interface Tendencia {
  id: string
  title: string           // Título da notícia
  excerpt: string         // Resumo (2-3 linhas)
  category: string        // Categoria (Tendências, Inovação, etc.)
  tags: string[]          // Array de tags
  source: string          // Nome da fonte
  author: string          // Nome do autor
  readTime: string        // Tempo de leitura estimado
  publishedAt: string     // Data de publicação
  views: number           // Número de visualizações
  image: string           // URL da imagem
  url: string             // Link externo
  createdAt: Timestamp    // Timestamp de criação
  generatedBy: 'gemini'   // Indicador de origem
}
```

## Customização

### Modificar Prompt da IA

Edite o arquivo `/app/api/tendencias/route.ts` e altere a variável `prompt` para customizar:
- Número de notícias geradas
- Temas específicos
- Estilo de escrita
- Categorias
- Formato de saída

### Adicionar Novos Campos

1. Atualize a interface `Tendencia` em `/hooks/use-tendencias.ts`
2. Modifique o prompt na API para incluir os novos campos
3. Atualize o componente para exibir os novos dados

## Monitoramento e Debug

### Logs

Os logs estão disponíveis nos seguintes locais:
- Console do navegador (desenvolvimento)
- Vercel Functions Logs (produção)
- Firebase Console (dados salvos)

### Troubleshooting

1. **Erro de API Key**: Verifique se `GEMINI_API_KEY` está correta
2. **Erro de Parsing**: A IA pode retornar formato inválido ocasionalmente
3. **Erro de Firebase**: Verifique regras de segurança
4. **Cron não funciona**: Verifique `CRON_SECRET` e configuração

## Custos

### Google Gemini API
- **Free tier**: 60 requests/minute
- **Custo**: Varia conforme uso
- **Estimativa**: ~$0.01-0.05 por dia (6 notícias diárias)

### Firebase
- **Firestore**: Operações de leitura/escrita
- **Hosting**: Tráfego de imagens

## Próximos Passos

1. **Cache**: Implementar cache Redis para reduzir chamadas
2. **Imagens**: Gerar imagens com IA (DALL-E, Midjourney)
3. **Categorização**: IA para auto-categorização
4. **Personalização**: Tendências baseadas no perfil do usuário
5. **Analytics**: Tracking de engajamento com tendências
