import { collection, addDoc, doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "./firebase"

// Dados iniciais para as coleções
export async function initializeFirestoreCollections() {
  console.log("Iniciando criação das coleções no Firestore...")

  try {
    // 1. Criar coleção de clientes
    console.log("Criando clientes...")
    const clientsData = [
      {
        name: "Ana Silva",
        email: "ana.silva@email.com",
        phone: "(11) 99999-1111",
        status: "ativo",
        createdAt: serverTimestamp(),
        notes: "Cliente regular, prefere tatuagens pequenas",
        address: "São Paulo, SP"
      },
      {
        name: "Carlos Santos",
        email: "carlos.santos@email.com",
        phone: "(11) 99999-2222",
        status: "ativo",
        createdAt: serverTimestamp(),
        notes: "Interessado em tatuagem grande nas costas",
        address: "São Paulo, SP"
      },
      {
        name: "Maria Oliveira",
        email: "maria.oliveira@email.com",
        phone: "(11) 99999-3333",
        status: "ativo",
        createdAt: serverTimestamp(),
        notes: "Primeira tatuagem, bem ansiosa",
        address: "São Paulo, SP"
      },
      {
        name: "João Pedro",
        email: "joao.pedro@email.com",
        phone: "(11) 99999-4444",
        status: "inativo",
        createdAt: serverTimestamp(),
        notes: "Cliente antigo, não vem há meses",
        address: "São Paulo, SP"
      }
    ]

    for (const client of clientsData) {
      await addDoc(collection(db, "clients"), client)
    }

    // 2. Criar coleção de agendamentos
    console.log("Criando agendamentos...")
    const appointmentsData = [
      {
        clientName: "Ana Silva",
        clientPhone: "(11) 99999-1111",
        date: new Date(2025, 6, 22, 14, 0), // 22 de julho de 2025, 14:00
        duration: 120,
        type: "Tatuagem pequena",
        status: "confirmado",
        description: "Rosa no pulso",
        price: 250,
        createdAt: serverTimestamp()
      },
      {
        clientName: "Carlos Santos",
        clientPhone: "(11) 99999-2222",
        date: new Date(2025, 6, 22, 16, 30), // 22 de julho de 2025, 16:30
        duration: 180,
        type: "Tatuagem grande",
        status: "pendente",
        description: "Dragão nas costas - sessão 1",
        price: 800,
        createdAt: serverTimestamp()
      },
      {
        clientName: "Maria Oliveira",
        clientPhone: "(11) 99999-3333",
        date: new Date(2025, 6, 21, 10, 0), // Hoje, 10:00
        duration: 90,
        type: "Primeira tatuagem",
        status: "confirmado",
        description: "Borboleta no ombro",
        price: 180,
        createdAt: serverTimestamp()
      },
      {
        clientName: "João Pedro",
        clientPhone: "(11) 99999-4444",
        date: new Date(2025, 6, 25, 15, 0), // 25 de julho de 2025, 15:00
        duration: 240,
        type: "Retoque",
        status: "agendado",
        description: "Retoque em tatuagem antiga",
        price: 150,
        createdAt: serverTimestamp()
      }
    ]

    for (const appointment of appointmentsData) {
      await addDoc(collection(db, "appointments"), appointment)
    }

    // 3. Criar coleção de estoque/inventário
    console.log("Criando itens de estoque...")
    const inventoryData = [
      {
        name: "Tinta Preta",
        brand: "Intenze",
        category: "tintas",
        quantity: 5,
        unit: "frascos",
        minimumStock: 3,
        price: 45.90,
        supplier: "Tattoo Supply",
        location: "Prateleira A1",
        createdAt: serverTimestamp()
      },
      {
        name: "Agulhas RL 07",
        brand: "Cheyenne",
        category: "agulhas",
        quantity: 2,
        unit: "caixas",
        minimumStock: 5,
        price: 120.00,
        supplier: "Pro Tattoo",
        location: "Gaveta B2",
        createdAt: serverTimestamp()
      },
      {
        name: "Luvas Nitrilo",
        brand: "Supermax",
        category: "higiene",
        quantity: 0,
        unit: "caixas",
        minimumStock: 2,
        price: 35.00,
        supplier: "Med Supply",
        location: "Armário C1",
        createdAt: serverTimestamp()
      },
      {
        name: "Filme Protetor",
        brand: "Nexcare",
        category: "cuidados",
        quantity: 15,
        unit: "rolos",
        minimumStock: 5,
        price: 12.50,
        supplier: "Farmácia Central",
        location: "Prateleira A2",
        createdAt: serverTimestamp()
      },
      {
        name: "Máquina Rotativa",
        brand: "Bishop",
        category: "equipamentos",
        quantity: 2,
        unit: "unidades",
        minimumStock: 1,
        price: 2500.00,
        supplier: "Tattoo Pro Equipment",
        location: "Estação Principal",
        createdAt: serverTimestamp()
      }
    ]

    for (const item of inventoryData) {
      await addDoc(collection(db, "inventory"), item)
    }

    // 4. Criar coleção de movimentações de estoque
    console.log("Criando movimentações de estoque...")
    const stockMovementsData = [
      {
        itemName: "Tinta Preta",
        type: "entrada",
        quantity: 10,
        reason: "Compra inicial",
        date: serverTimestamp(),
        userId: "admin",
        notes: "Estoque inicial da loja"
      },
      {
        itemName: "Agulhas RL 07",
        type: "saida",
        quantity: 3,
        reason: "Uso em tatuagem",
        date: serverTimestamp(),
        userId: "admin",
        notes: "Usado na tatuagem da Ana Silva"
      },
      {
        itemName: "Luvas Nitrilo",
        type: "saida",
        quantity: 2,
        reason: "Uso diário",
        date: serverTimestamp(),
        userId: "admin",
        notes: "Estoque zerado - precisa repor"
      }
    ]

    for (const movement of stockMovementsData) {
      await addDoc(collection(db, "stockMovements"), movement)
    }

    // 5. Criar coleção de portfólio
    console.log("Criando itens do portfólio...")
    const portfolioData = [
      {
        title: "Rosa Realista",
        description: "Tatuagem de rosa em estilo realista no antebraço",
        category: "realismo",
        style: "Realista",
        size: "Média",
        location: "Antebraço",
        duration: 180,
        imageUrl: "", // URL será adicionada posteriormente
        tags: ["rosa", "realismo", "flor", "antebraço"],
        clientName: "Cliente Anônimo",
        date: serverTimestamp(),
        featured: true,
        price: 450
      },
      {
        title: "Mandala Geométrica",
        description: "Mandala com padrões geométricos complexos",
        category: "geometrico",
        style: "Geométrico",
        size: "Grande",
        location: "Costas",
        duration: 300,
        imageUrl: "",
        tags: ["mandala", "geometrico", "costas", "detalhado"],
        clientName: "Cliente Anônimo",
        date: serverTimestamp(),
        featured: true,
        price: 800
      },
      {
        title: "Leão Tribal",
        description: "Leão em estilo tribal no braço",
        category: "tribal",
        style: "Tribal",
        size: "Média",
        location: "Braço",
        duration: 240,
        imageUrl: "",
        tags: ["leao", "tribal", "braco", "animal"],
        clientName: "Cliente Anônimo",
        date: serverTimestamp(),
        featured: false,
        price: 350
      }
    ]

    for (const portfolio of portfolioData) {
      await addDoc(collection(db, "portfolio"), portfolio)
    }

    // 6. Criar coleção de pagamentos
    console.log("Criando registros de pagamentos...")
    const paymentsData = [
      {
        clientName: "Ana Silva",
        amount: 250,
        method: "pix",
        status: "confirmado",
        date: new Date(2025, 6, 21, 14, 30), // Hoje
        description: "Pagamento tatuagem rosa no pulso",
        appointmentId: "", // Será vinculado posteriormente
        createdAt: serverTimestamp()
      },
      {
        clientName: "Maria Oliveira",
        amount: 180,
        method: "dinheiro",
        status: "confirmado",
        date: new Date(2025, 6, 20, 11, 0), // Ontem
        description: "Pagamento primeira tatuagem",
        appointmentId: "",
        createdAt: serverTimestamp()
      },
      {
        clientName: "Carlos Santos",
        amount: 400,
        method: "cartao",
        status: "pendente",
        date: new Date(2025, 6, 19, 16, 0), // Anteontem
        description: "Sinal para tatuagem grande - sessão 1",
        appointmentId: "",
        createdAt: serverTimestamp()
      }
    ]

    for (const payment of paymentsData) {
      await addDoc(collection(db, "payments"), payment)
    }

    console.log("✅ Todas as coleções foram criadas com sucesso!")
    console.log("📊 Dados criados:")
    console.log(`- ${clientsData.length} clientes`)
    console.log(`- ${appointmentsData.length} agendamentos`)
    console.log(`- ${inventoryData.length} itens de estoque`)
    console.log(`- ${stockMovementsData.length} movimentações de estoque`)
    console.log(`- ${portfolioData.length} itens do portfólio`)
    console.log(`- ${paymentsData.length} registros de pagamentos`)

    return {
      success: true,
      message: "Firestore inicializado com sucesso!",
      collections: {
        clients: clientsData.length,
        appointments: appointmentsData.length,
        inventory: inventoryData.length,
        stockMovements: stockMovementsData.length,
        portfolio: portfolioData.length,
        payments: paymentsData.length
      }
    }

  } catch (error) {
    console.error("Erro ao inicializar Firestore:", error)
    return {
      success: false,
      error: error,
      message: "Erro ao inicializar o Firestore"
    }
  }
}

// Função para verificar se as coleções existem
export async function checkFirestoreCollections() {
  try {
    const { getDocs } = await import("firebase/firestore")
    const collections = ["clients", "appointments", "inventory", "stockMovements", "portfolio", "payments"]
    const status: Record<string, number> = {}
    
    for (const collectionName of collections) {
      const snapshot = await getDocs(collection(db, collectionName))
      status[collectionName] = snapshot.size
    }
    
    return status
  } catch (error) {
    console.error("Erro ao verificar coleções:", error)
    return null
  }
}
