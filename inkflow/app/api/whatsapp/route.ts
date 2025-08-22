import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppBot } from '@/lib/whatsapp-bot';
import { WhatsAppScheduler } from '@/lib/whatsapp-scheduler';
import QRCode from 'qrcode';

let botInstance: WhatsAppBot | null = null;
let schedulerInstance: WhatsAppScheduler | null = null;
let currentQRCode: string | null = null;

export async function POST(request: NextRequest) {
  try {
    // Verificar se tem body para fazer parse
    const body = await request.text();
    if (!body || body.trim() === '') {
      return NextResponse.json({ 
        success: false, 
        message: 'Dados não enviados' 
      });
    }

    let parsedData;
    try {
      parsedData = JSON.parse(body);
    } catch (parseError) {
      return NextResponse.json({ 
        success: false, 
        message: 'Dados inválidos enviados' 
      });
    }

    const { action, config } = parsedData;

    switch (action) {
      case 'start':
        if (botInstance) {
          return NextResponse.json({ 
            success: false, 
            message: 'Bot já está rodando' 
          });
        }

        if (!config?.phone) {
          return NextResponse.json({ 
            success: false, 
            message: 'Número do WhatsApp é obrigatório nas configurações' 
          });
        }

        botInstance = new WhatsAppBot(config);
        
        // Configurar callback de QR Code
        botInstance.setQRCallback((qr: string) => {
          QRCode.toDataURL(qr, { width: 256 })
            .then(dataUrl => {
              currentQRCode = dataUrl;
            })
            .catch(err => console.error('Erro ao gerar QR Code:', err));
        });
        
        await botInstance.start();
        
        // Inicia o scheduler para tarefas automáticas
        schedulerInstance = new WhatsAppScheduler(botInstance, config);
        schedulerInstance.startScheduledTasks();
        
        return NextResponse.json({ 
          success: true, 
          message: 'Bot iniciado! Aguarde o QR Code aparecer.' 
        });

      case 'stop':
        if (!botInstance) {
          return NextResponse.json({ 
            success: false, 
            message: 'Bot não está rodando' 
          });
        }

        await botInstance.stop();
        botInstance = null;
        currentQRCode = null;
        
        if (schedulerInstance) {
          schedulerInstance.destroy();
          schedulerInstance = null;
        }
        
        return NextResponse.json({ 
          success: true, 
          message: 'Bot parado com sucesso' 
        });

      case 'status':
        return NextResponse.json({ 
          success: true, 
          running: botInstance !== null,
          qrCode: currentQRCode,
          message: botInstance ? 'Bot está rodando' : 'Bot está parado'
        });

      case 'get-qr':
        return NextResponse.json({
          success: true,
          qrCode: currentQRCode,
          hasQR: currentQRCode !== null
        });

      case 'update-config':
        if (!botInstance) {
          return NextResponse.json({ 
            success: false, 
            message: 'Bot não está rodando' 
          });
        }

        botInstance.updateConfig(config);
        return NextResponse.json({ 
          success: true, 
          message: 'Configurações atualizadas' 
        });

      default:
        return NextResponse.json({ 
          success: false, 
          message: 'Ação inválida' 
        });
    }
  } catch (error) {
    console.error('Erro na API do WhatsApp:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    running: botInstance !== null,
    qrCode: currentQRCode,
    message: botInstance ? 'Bot está rodando' : 'Bot está parado'
  });
}
