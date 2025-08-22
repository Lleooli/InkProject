import nodemailer from 'nodemailer'

// Configuração do transportador de email
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // ou outro provedor
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })
}

// Template de email para primeira mensagem
const getFirstMessageEmailTemplate = (
  recipientName: string,
  senderName: string,
  senderEmail: string,
  messagePreview: string,
  appUrl: string
) => {
  return {
    subject: `Nova mensagem de ${senderName} no InkFlow`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">📨 Nova Mensagem!</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Olá, ${recipientName}!</h2>
          
          <p style="font-size: 16px; margin: 20px 0;">
            Você recebeu uma nova mensagem de <strong>${senderName}</strong> (${senderEmail}) no InkFlow.
          </p>
          
          <div style="background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px;">
            <p style="margin: 0; font-style: italic; color: #666;">
              "${messagePreview.length > 100 ? messagePreview.substring(0, 100) + '...' : messagePreview}"
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${appUrl}/networking?tab=messages" 
               style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              Ver Mensagem Completa
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <div style="font-size: 14px; color: #666;">
            <p><strong>Sobre o remetente:</strong></p>
            <p>Esta é a primeira mensagem que ${senderName} está enviando para você. Você pode responder diretamente pela plataforma InkFlow.</p>
            
            <p style="margin-top: 20px;">
              <strong>🎨 InkFlow - Sua plataforma completa para tatuadores</strong><br>
              Conecte-se, compartilhe e faça networking com outros profissionais da área.
            </p>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; font-size: 12px; color: #999; text-align: center;">
            <p>Este email foi enviado automaticamente pelo sistema InkFlow.</p>
            <p>Se você não deseja mais receber estas notificações, acesse suas <a href="${appUrl}/configuracoes" style="color: #667eea;">configurações</a>.</p>
          </div>
        </div>
      </div>
    `,
    text: `
      Nova mensagem no InkFlow!
      
      Olá, ${recipientName}!
      
      Você recebeu uma nova mensagem de ${senderName} (${senderEmail}) no InkFlow.
      
      Mensagem: "${messagePreview}"
      
      Esta é a primeira mensagem que ${senderName} está enviando para você.
      
      Acesse ${appUrl}/networking para ver a mensagem completa e responder.
      
      ---
      InkFlow - Sua plataforma completa para tatuadores
    `
  }
}

// Função para enviar email de primeira mensagem
export async function sendFirstMessageNotification(
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  senderEmail: string,
  messageContent: string,
  appUrl: string = 'http://localhost:3000'
) {
  try {
    const transporter = createTransporter()
    
    const emailTemplate = getFirstMessageEmailTemplate(
      recipientName,
      senderName,
      senderEmail,
      messageContent,
      appUrl
    )
    
    const mailOptions = {
      from: `"InkFlow" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log('Email de primeira mensagem enviado:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Erro ao enviar email de primeira mensagem:', error)
    return { success: false, error: String(error) }
  }
}

// Função para verificar se é a primeira mensagem entre dois usuários
export function isFirstMessageBetweenUsers(
  senderId: string,
  recipientId: string,
  existingMessages: any[]
): boolean {
  // Verifica se já existe alguma mensagem entre os dois usuários
  const hasExistingConversation = existingMessages.some(message => 
    (message.senderId === senderId && message.recipientId === recipientId) ||
    (message.senderId === recipientId && message.recipientId === senderId)
  )
  
  return !hasExistingConversation
}

// Função para configurar as variáveis de ambiente necessárias
export function getEmailConfigStatus() {
  return {
    configured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
    user: process.env.EMAIL_USER ? '✓ Configurado' : '✗ Não configurado',
    pass: process.env.EMAIL_PASS ? '✓ Configurado' : '✗ Não configurado'
  }
}
