import { NextRequest, NextResponse } from "next/server"
import { collection, addDoc, query, orderBy, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET() {
  try {
    const postsQuery = query(
      collection(db, "networkingPosts"),
      orderBy("createdAt", "desc")
    )
    
    const snapshot = await getDocs(postsQuery)
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Erro ao buscar posts:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userName, userAvatar, content, imageUrl } = body

    if (!userId || !userName || !content) {
      return NextResponse.json(
        { error: "Dados obrigatórios ausentes" },
        { status: 400 }
      )
    }

    const newPost = {
      userId,
      userName,
      userAvatar: userAvatar || null,
      content,
      imageUrl: imageUrl || null,
      createdAt: new Date(),
      likes: [],
      comments: []
    }

    const docRef = await addDoc(collection(db, "networkingPosts"), newPost)
    
    return NextResponse.json({ 
      id: docRef.id,
      ...newPost 
    }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar post:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { postId, action, userId, userName, content } = body

    if (!postId || !action || !userId) {
      return NextResponse.json(
        { error: "Dados obrigatórios ausentes" },
        { status: 400 }
      )
    }

    const postRef = doc(db, "networkingPosts", postId)

    if (action === "like") {
      // Toggle like
      await updateDoc(postRef, {
        likes: arrayUnion(userId)
      })
    } else if (action === "unlike") {
      await updateDoc(postRef, {
        likes: arrayRemove(userId)
      })
    } else if (action === "comment") {
      if (!userName || !content) {
        return NextResponse.json(
          { error: "Nome do usuário e conteúdo são obrigatórios para comentários" },
          { status: 400 }
        )
      }

      const newComment = {
        id: Date.now().toString(),
        userId,
        userName,
        content,
        createdAt: new Date()
      }

      await updateDoc(postRef, {
        comments: arrayUnion(newComment)
      })
    } else {
      return NextResponse.json(
        { error: "Ação inválida" },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao atualizar post:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
