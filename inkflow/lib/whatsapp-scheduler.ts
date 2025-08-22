import * as cron from 'node-cron';
import { WhatsAppBot } from './whatsapp-bot';

interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  date: string;
  time: string;
  service: string;
}

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

export class WhatsAppScheduler {
  private bot: WhatsAppBot | null = null;
  private config: BotConfig;
  private reminderJob: cron.ScheduledTask | null = null;
  private promotionJob: cron.ScheduledTask | null = null;

  constructor(bot: WhatsAppBot, config: BotConfig) {
    this.bot = bot;
    this.config = config;
    this.setupScheduledTasks();
  }

  private setupScheduledTasks() {
    // Lembretes diários às 9h
    this.reminderJob = cron.schedule('0 9 * * *', async () => {
      await this.sendDailyReminders();
    });

    // Promoções semanais (segunda-feira às 10h)
    this.promotionJob = cron.schedule('0 10 * * 1', async () => {
      await this.sendWeeklyPromotions();
    });

    // Para inicialmente
    this.reminderJob.stop();
    this.promotionJob.stop();
  }

  private async sendDailyReminders() {
    try {
      console.log('📅 Enviando lembretes diários...');
      
      // Aqui você integraria com sua API de agendamentos
      const todayAppointments = await this.getTodayAppointments();
      
      for (const appointment of todayAppointments) {
        // Usar template configurável ou fallback
        const reminderMessage = this.config.reminderTemplate && this.config.reminderTemplate.trim() !== ''
          ? this.config.reminderTemplate
              .replace('{nome}', appointment.clientName)
              .replace('{horario}', appointment.time)
              .replace('{servico}', appointment.service)
          : `🎨 Oi ${appointment.clientName}! 

Lembrete do seu agendamento hoje às ${appointment.time} para ${appointment.service}.

📍 Nos vemos no estúdio!
Qualquer dúvida, é só responder. 😊`;

        // Enviar mensagem (implementação dependeria da integração)
        console.log(`Lembrete para ${appointment.clientName}: ${appointment.clientPhone}`);
      }
      
    } catch (error) {
      console.error('Erro ao enviar lembretes:', error);
    }
  }

  private async sendWeeklyPromotions() {
    try {
      console.log('🔥 Enviando promoções semanais...');
      
      const promotionMessage = `🔥 PROMOÇÃO DA SEMANA! 🔥

⚡ 30% OFF em tatuagens pequenas (até 5cm)
🎨 20% OFF na segunda tatuagem
✨ Fineline especial: R$ 120

📅 Válido até sexta-feira!
📱 Responda aqui para agendar!

#TatuagemPromoção #InkFlow`;

      // Aqui você pegaria a lista de clientes ativos
      const activeClients = await this.getActiveClients();
      
      for (const client of activeClients) {
        console.log(`Promoção para ${client.name}: ${client.phone}`);
      }
      
    } catch (error) {
      console.error('Erro ao enviar promoções:', error);
    }
  }

  private async getTodayAppointments(): Promise<Appointment[]> {
    // Integração com sua API de agendamentos
    // Por enquanto, retorna exemplo
    return [
      {
        id: '1',
        clientName: 'João Silva',
        clientPhone: '+5511999999999',
        date: new Date().toISOString().split('T')[0],
        time: '14:00',
        service: 'Tatuagem fineline'
      }
    ];
  }

  private async getActiveClients(): Promise<{name: string, phone: string}[]> {
    // Integração com sua base de clientes
    // Por enquanto, retorna exemplo
    return [
      {
        name: 'Maria Santos',
        phone: '+5511888888888'
      }
    ];
  }

  public startScheduledTasks() {
    console.log('⏰ Iniciando tarefas agendadas...');
    this.reminderJob?.start();
    this.promotionJob?.start();
  }

  public stopScheduledTasks() {
    console.log('⏸️ Parando tarefas agendadas...');
    this.reminderJob?.stop();
    this.promotionJob?.stop();
  }

  public destroy() {
    this.stopScheduledTasks();
    this.reminderJob?.destroy();
    this.promotionJob?.destroy();
  }
}
