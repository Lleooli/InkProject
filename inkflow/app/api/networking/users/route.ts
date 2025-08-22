import { NextRequest, NextResponse } from "next/server"
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const search = searchParams.get("search")

    let usersQuery = query(collection(db, "users"))
    
    // Se especificado, excluir o próprio usuário da lista
    if (userId) {
      usersQuery = query(
        collection(db, "users"),
        where("__name__", "!=", userId)
      )
    }
    
    const snapshot = await getDocs(usersQuery)
    let users: any[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    // Filtrar por pesquisa se fornecida
    if (search) {
      const searchLower = search.toLowerCase()
      users = users.filter((user: any) => 
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.bio?.toLowerCase().includes(searchLower) ||
        user.specialties?.some((spec: string) => 
          spec.toLowerCase().includes(searchLower)
        )
      )
    }

    // Filtrar apenas usuários que permitem perfil público
    users = users.filter((user: any) => user.publicProfile !== false)
    
    return NextResponse.json({ users })
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: "ID do usuário é obrigatório" },
        { status: 400 }
      )
    }

    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    const userData = { id: userSnap.id, ...userSnap.data() }
    
    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error("Erro ao buscar usuário:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
