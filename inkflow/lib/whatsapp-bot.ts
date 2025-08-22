import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import QRCode from 'qrcode';
import { Ollama } from 'ollama';

interface BotConfig {
  studioName: string;
  ownerName: string;
  phone: string;
  address: string;
  instagram: string;
  appointmentTemplate: string;
  reminderTemplate: string;
  quoteTemplate: string;
}

interface ConversationContext {
  stage: 'initial' | 'collecting_info' | 'completed';
  data: {
    idea?: string;
    size?: string;
    location?: string;
    style?: string;
    date?: string;
  };
}

export class WhatsAppBot {
  private client: Client;
  private config: BotConfig;
  private conversations: Map<string, ConversationContext> = new Map();
  private ollama: Ollama;
  private onQRCode?: (qr: string) => void;

  constructor(config: BotConfig, onQRCode?: (qr: string) => void) {
    this.config = config;
    this.onQRCode = onQRCode;
    this.ollama = new Ollama({ host: 'http://localhost:11434' });
    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: 'inkflow-bot'
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.client.on('qr', (qr) => {
      console.log('🔗 QR Code gerado!');
      
      // Se há callback, chama ele (para interface web)
      if (this.onQRCode) {
        this.onQRCode(qr);
      } else {
        // Fallback: mostra no console
        console.log('Acesse WhatsApp Web para escanear o QR Code');
        console.log('QR Data:', qr);
      }
    });

    this.client.on('ready', () => {
      console.log('🤖 Bot WhatsApp conectado e pronto!');
    });

    this.client.on('message', async (message) => {
      if (message.fromMe) return; // Ignora mensagens próprias
      
      try {
        await this.handleMessage(message);
      } catch (error) {
        console.error('Erro ao processar mensagem:', error);
        await message.reply('❌ Ops! Algo deu errado. Tente novamente em alguns instantes.');
      }
    });

    this.client.on('disconnected', (reason) => {
      console.log('❌ Bot desconectado:', reason);
    });
  }

  private async handleMessage(message: Message) {
    const contact = await message.getContact();
    const userId = contact.id.user;
    const messageText = message.body.toLowerCase().trim();

    // Ignorar mensagens de grupos
    if (message.from.includes('@g.us')) return;

    console.log(`📱 Mensagem de ${contact.name || contact.pushname}: ${message.body}`);

    // Comandos rápidos
    if (await this.handleQuickCommands(message, messageText)) {
      return;
    }

    // Sistema de conversa inteligente
    await this.handleConversation(message, userId, messageText);
  }

  private async handleQuickCommands(message: Message, text: string): Promise<boolean> {
    // Preços
    if (text.includes('preço') || text.includes('valor') || text.includes('custo')) {
      await message.reply(`💰 *TABELA DE PREÇOS*

🎨 *Tatuagens:*
• Pequena (até 5cm): R$ 150 - R$ 250
• Média (5-15cm): R$ 300 - R$ 600
• Grande (15cm+): R$ 700+

⏱️ *Sessões:*
• 1ª hora: R$ 200
• Horas adicionais: R$ 150/h

📝 Para orçamento personalizado, me conte:
• Sua ideia
• Tamanho desejado
• Local no corpo

Responda que eu faço seu orçamento! 😊`);
      return true;
    }

    // Horários
    if (text.includes('horário') || text.includes('agenda') || text.includes('disponível')) {
      await message.reply(`📅 *HORÁRIOS DISPONÍVEIS*

🗓️ *Esta semana:*
• Segunda: 14h às 18h
• Terça: 09h às 17h
• Quarta: 14h às 18h
• Quinta: 09h às 17h
• Sexta: 09h às 16h

📱 Para agendar, me diga:
• Que tipo de tatuagem
• Tamanho aproximado
• Sua preferência de dia/horário

Vou verificar a disponibilidade! 🎨`);
      return true;
    }

    // Localização
    if (text.includes('endereço') || text.includes('local') || text.includes('onde')) {
      await message.reply(`📍 *NOSSO ESTÚDIO*

🏢 ${this.config.studioName}
📮 ${this.config.address}

🚗 *Como chegar:*
• Metrô mais próximo: [Estação]
• Ônibus: Linhas [números]
• Uber/99: Deixe no endereço acima

📱 Qualquer dúvida, é só chamar! 😊`);
      return true;
    }

    // Portfolio
    if (text.includes('portfólio') || text.includes('portfolio') || text.includes('trabalho')) {
      await message.reply(`🎨 *NOSSO PORTFÓLIO*

📸 Confira nossos trabalhos:
• Instagram: ${this.config.instagram}

✨ *Especialidades:*
• Fineline e delicadas
• Realismo
• Coloridas
• Lettering
• Geométricas

Que estilo te interessa? 😊`);
      return true;
    }

    return false;
  }

  private async handleConversation(message: Message, userId: string, text: string) {
    let context = this.conversations.get(userId) || {
      stage: 'initial',
      data: {}
    };

    // Saudações e início de conversa
    if (text.includes('oi') || text.includes('olá') || text.includes('bom dia') || 
        text.includes('boa tarde') || text.includes('boa noite') || context.stage === 'initial') {
      
      if (text.includes('agendar') || text.includes('tatuagem') || text.includes('orçamento')) {
        context.stage = 'collecting_info';
        this.conversations.set(userId, context);
        
        // Usar template configurável ou fallback
        const appointmentMessage = this.config.appointmentTemplate && this.config.appointmentTemplate.trim() !== ''
          ? this.config.appointmentTemplate
          : `Olá! 😊 Que legal que quer fazer uma tatuagem! 🎨

Para eu preparar seu orçamento personalizado, me conta:

1️⃣ *Qual sua ideia?* (desenho, frase, símbolo...)
2️⃣ *Tamanho aproximado?* (ex: 5cm, tamanho da mão...)
3️⃣ *Onde no corpo?* (braço, perna, costas...)
4️⃣ *Que estilo prefere?* (fineline, colorida, realismo...)

Pode mandar tudo de uma vez ou ir respondendo aos poucos! 📝`;

        await message.reply(appointmentMessage);
        return;
      }
    }

    // Coleta de informações para orçamento
    if (context.stage === 'collecting_info') {
      await this.collectTattooInfo(message, context, text);
      this.conversations.set(userId, context);
      return;
    }

    // IA para conversas gerais
    await this.handleWithAI(message, text);
  }

  private async collectTattooInfo(message: Message, context: ConversationContext, text: string) {
    // Detecta informações na mensagem
    const info = context.data;
    let updates = 0;

    // Detecta ideia/conceito
    if (!info.idea && (text.includes('desenho') || text.includes('frase') || text.includes('símbolo') || 
        text.includes('nome') || text.includes('animal') || text.includes('flor'))) {
      info.idea = text;
      updates++;
    }

    // Detecta tamanho
    if (!info.size && (text.includes('cm') || text.includes('pequen') || text.includes('grand') || 
        text.includes('médi') || text.includes('mão') || text.includes('braço'))) {
      info.size = text;
      updates++;
    }

    // Detecta localização
    if (!info.location && (text.includes('braço') || text.includes('perna') || text.includes('costa') || 
        text.includes('pescoço') || text.includes('mão') || text.includes('pé'))) {
      info.location = text;
      updates++;
    }

    // Detecta estilo
    if (!info.style && (text.includes('fineline') || text.includes('colorid') || text.includes('realismo') || 
        text.includes('geométric') || text.includes('letter') || text.includes('aquarel'))) {
      info.style = text;
      updates++;
    }

    // Verifica se tem informações suficientes
    const hasEnoughInfo = info.idea && info.size && info.location;

    if (hasEnoughInfo) {
      // Gera orçamento
      const quote = await this.generateQuote(info);
      await message.reply(quote);
      
      await message.reply(`✅ Gostou do orçamento? 

Para agendar, responda:
• Que dia prefere?
• Período: manhã ou tarde?

📱 Ou me chama para tirar dúvidas! 😊`);
      
      context.stage = 'completed';
    } else if (updates > 0) {
      // Pede informações que ainda faltam
      const missing = [];
      if (!info.idea) missing.push('sua ideia');
      if (!info.size) missing.push('o tamanho');
      if (!info.location) missing.push('onde no corpo');
      
      await message.reply(`Perfeito! 👍 Anotei aqui.

Ainda preciso saber: ${missing.join(', ')}.

Pode mandar! 📝`);
    } else {
      // Não conseguiu extrair info, usa IA
      await this.handleWithAI(message, text);
    }
  }

  private async generateQuote(info: any): Promise<string> {
    // Lógica simples de precificação
    let basePrice = 200;
    let timeEstimate = '2-3 horas';

    // Ajusta preço por tamanho
    if (info.size.includes('pequen') || info.size.includes('5cm')) {
      basePrice = 150;
      timeEstimate = '1-2 horas';
    } else if (info.size.includes('grand') || info.size.includes('20cm')) {
      basePrice = 400;
      timeEstimate = '4-6 horas';
    }

    // Ajusta por complexidade
    if (info.style?.includes('realismo') || info.style?.includes('colorid')) {
      basePrice += 100;
      timeEstimate = '3-5 horas';
    }

    // Usar o template configurável se disponível
    if (this.config.quoteTemplate && this.config.quoteTemplate.trim() !== '') {
      return this.config.quoteTemplate
        .replace('{tamanho}', info.size || 'Médio')
        .replace('{estilo}', info.style || 'Tradicional')
        .replace('{local}', info.location || 'Conforme escolhido')
        .replace('{tempo}', timeEstimate)
        .replace('{valor}', basePrice.toString())
        .replace('{ideia}', info.idea || 'Conforme descrito');
    }

    // Template padrão como fallback
    return `💉 *ORÇAMENTO PERSONALIZADO* 💉

🎨 *Sua tatuagem:*
• Ideia: ${info.idea || 'Conforme descrito'}
• Tamanho: ${info.size || 'Médio'}
• Local: ${info.location || 'Conforme escolhido'}
• Estilo: ${info.style || 'Tradicional'}

⏱️ *Tempo estimado:* ${timeEstimate}
💰 *Valor:* R$ ${basePrice}

✨ *Incluso:*
• Desenho personalizado
• Materiais esterilizados
• Acompanhamento pós-tatuagem

📱 *Para agendar:* Me diga sua preferência de data! 🗓️`;
  }

  private async handleWithAI(message: Message, text: string) {
    try {
      const systemPrompt = `Você é o assistente do estúdio de tatuagem ${this.config.studioName}, do tatuador ${this.config.ownerName}.

Informações do estúdio:
- Nome: ${this.config.studioName}
- Endereço: ${this.config.address}
- Instagram: ${this.config.instagram}

Seu papel:
- Seja amigável, profissional e entusiasmado com tatuagens
- Responda dúvidas sobre tatuagens, cuidados, preços
- Sempre incentive o cliente a agendar
- Use emojis moderadamente
- Mantenha respostas concisas (máximo 200 caracteres)
- Se não souber algo específico, peça para entrar em contato diretamente

Contexto: Cliente enviou "${text}"`;

      const response = await this.ollama.chat({
        model: 'llama3.2:1b', // Modelo leve e gratuito
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        options: {
          temperature: 0.7,
          top_p: 0.9
        }
      });

      const aiResponse = response.message.content.trim();
      
      // Limita tamanho da resposta
      const finalResponse = aiResponse.length > 500 ? 
        aiResponse.substring(0, 497) + '...' : aiResponse;

      await message.reply(finalResponse);
      
    } catch (error) {
      console.error('Erro na IA:', error);
      
      // Fallback para resposta padrão
      await message.reply(`Oi! 😊 Sou o assistente do ${this.config.studioName}!

Para orçamentos, diga: "quero fazer uma tatuagem"
Para horários: "quais os horários disponíveis"
Para preços: "quanto custa uma tatuagem"

Como posso te ajudar? 🎨`);
    }
  }

  public async start() {
    console.log('🚀 Iniciando bot WhatsApp...');
    await this.client.initialize();
  }

  public async stop() {
    console.log('🛑 Parando bot WhatsApp...');
    await this.client.destroy();
  }

  public updateConfig(newConfig: Partial<BotConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  public setQRCallback(callback: (qr: string) => void) {
    this.onQRCode = callback;
  }
}
