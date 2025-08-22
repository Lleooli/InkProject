import { NextRequest, NextResponse } from "next/server"
import { collection, addDoc, query, where, getDocs, doc, updateDoc, arrayUnion, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "ID do usuário é obrigatório" },
        { status: 400 }
      )
    }

    const chatsQuery = query(
      collection(db, "privateChats"),
      where("participants", "array-contains", userId)
    )
    
    const snapshot = await getDocs(chatsQuery)
    const chats = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return NextResponse.json({ chats })
  } catch (error) {
    console.error("Erro ao buscar chats:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { participants, senderId, senderName, content } = body

    if (!participants || participants.length !== 2 || !senderId || !senderName || !content) {
      return NextResponse.json(
        { error: "Dados obrigatórios ausentes" },
        { status: 400 }
      )
    }

    // Verificar se já existe um chat entre os participantes
    const existingChatsQuery = query(
      collection(db, "privateChats"),
      where("participants", "array-contains", participants[0])
    )
    
    const existingSnapshot = await getDocs(existingChatsQuery)
    let existingChat: any = null
    
    existingSnapshot.forEach(doc => {
      const data = doc.data()
      if (data.participants.includes(participants[1])) {
        existingChat = { id: doc.id, ...data }
      }
    })

    const newMessage = {
      id: Date.now().toString(),
      senderId,
      senderName,
      content,
      createdAt: new Date()
    }

    if (existingChat) {
      // Adicionar mensagem ao chat existente
      const chatRef = doc(db, "privateChats", existingChat.id)
      await updateDoc(chatRef, {
        messages: arrayUnion(newMessage),
        lastMessage: content,
        lastMessageAt: new Date()
      })

      // Verificar se deve enviar notificação por email (apenas se não há mensagens anteriores)
      const shouldNotify = !existingChat.messages || existingChat.messages.length === 0
      if (shouldNotify) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/networking/notifications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              senderId,
              recipientId: participants.find((id: string) => id !== senderId),
              messageContent: content,
              chatId: existingChat.id
            })
          })
        } catch (notificationError) {
          console.error("Erro ao enviar notificação:", notificationError)
          // Não falhar a criação da mensagem por causa da notificação
        }
      }
      
      return NextResponse.json({ 
        chatId: existingChat.id,
        message: newMessage
      })
    } else {
      // Criar novo chat
      const newChat = {
        participants,
        messages: [newMessage],
        lastMessage: content,
        lastMessageAt: new Date()
      }

      const docRef = await addDoc(collection(db, "privateChats"), newChat)

      // Enviar notificação por email para primeira mensagem
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/networking/notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId,
            recipientId: participants.find((id: string) => id !== senderId),
            messageContent: content,
            chatId: docRef.id
          })
        })
      } catch (notificationError) {
        console.error("Erro ao enviar notificação:", notificationError)
        // Não falhar a criação da mensagem por causa da notificação
      }
      
      return NextResponse.json({ 
        chatId: docRef.id,
        message: newMessage
      }, { status: 201 })
    }
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { chatId, senderId, senderName, content } = body

    if (!chatId || !senderId || !senderName || !content) {
      return NextResponse.json(
        { error: "Dados obrigatórios ausentes" },
        { status: 400 }
      )
    }

    const newMessage = {
      id: Date.now().toString(),
      senderId,
      senderName,
      content,
      createdAt: new Date()
    }

    const chatRef = doc(db, "privateChats", chatId)
    await updateDoc(chatRef, {
      messages: arrayUnion(newMessage),
      lastMessage: content,
      lastMessageAt: new Date()
    })

    return NextResponse.json({ message: newMessage })
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
