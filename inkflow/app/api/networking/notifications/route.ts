import { NextRequest, NextResponse } from "next/server"
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { sendFirstMessageNotification, isFirstMessageBetweenUsers } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { senderId, recipientId, messageContent, chatId, testMode, testEmail } = body

    // Modo de teste para verificar configurações de email
    if (testMode) {
      if (!testEmail) {
        return NextResponse.json(
          { error: "Email de teste é obrigatório" },
          { status: 400 }
        )
      }

      const emailResult = await sendFirstMessageNotification(
        testEmail,
        "Usuário de Teste",
        "Sistema InkFlow",
        "sistema@inkflow.com",
        messageContent || "Esta é uma mensagem de teste do sistema de notificações.",
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      )

      if (emailResult.success) {
        return NextResponse.json({
          success: true,
          message: "Email de teste enviado com sucesso",
          messageId: emailResult.messageId
        })
      } else {
        return NextResponse.json(
          { error: "Falha ao enviar email de teste", details: emailResult.error },
          { status: 500 }
        )
      }
    }

    if (!senderId || !recipientId || !messageContent) {
      return NextResponse.json(
        { error: "Dados obrigatórios ausentes" },
        { status: 400 }
      )
    }

    // Buscar informações do remetente
    const senderDoc = await getDoc(doc(db, "users", senderId))
    if (!senderDoc.exists()) {
      return NextResponse.json(
        { error: "Remetente não encontrado" },
        { status: 404 }
      )
    }
    const senderData = senderDoc.data()

    // Buscar informações do destinatário
    const recipientDoc = await getDoc(doc(db, "users", recipientId))
    if (!recipientDoc.exists()) {
      return NextResponse.json(
        { error: "Destinatário não encontrado" },
        { status: 404 }
      )
    }
    const recipientData = recipientDoc.data()

    // Verificar se o destinatário permite notificações por email
    if (recipientData.networkingNotifications === false || recipientData.emailNotifications === false) {
      return NextResponse.json(
        { message: "Usuário não permite notificações por email" },
        { status: 200 }
      )
    }

    // Buscar todas as mensagens existentes entre os dois usuários
    const chatsQuery = query(
      collection(db, "privateChats"),
      where("participants", "array-contains", senderId)
    )
    
    const chatsSnapshot = await getDocs(chatsQuery)
    let existingMessages: any[] = []
    
    chatsSnapshot.forEach(doc => {
      const chatData = doc.data()
      if (chatData.participants.includes(recipientId)) {
        existingMessages = existingMessages.concat(chatData.messages || [])
      }
    })

    // Verificar se é a primeira mensagem entre os usuários
    const isFirstMessage = isFirstMessageBetweenUsers(senderId, recipientId, existingMessages)
    
    if (!isFirstMessage) {
      return NextResponse.json(
        { message: "Não é a primeira mensagem, notificação não enviada" },
        { status: 200 }
      )
    }

    // Enviar notificação por email
    const emailResult = await sendFirstMessageNotification(
      recipientData.email,
      recipientData.displayName || recipientData.name || "Usuário",
      senderData.displayName || senderData.name || "Usuário",
      senderData.email,
      messageContent,
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    )

    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        message: "Notificação por email enviada com sucesso",
        messageId: emailResult.messageId
      })
    } else {
      return NextResponse.json(
        { error: "Falha ao enviar email", details: emailResult.error },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error("Erro ao processar notificação:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
