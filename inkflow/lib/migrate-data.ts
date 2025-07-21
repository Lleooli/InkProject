import { collection, doc, updateDoc, getDocs } from "firebase/firestore"
import { db } from "./firebase"

// Script para migrar dados existentes para incluir userId
export async function migrateDataToUser(userId: string) {
  console.log("Iniciando migração de dados para o usuário:", userId)
  
  try {
    const collections = [
      "clients",
      "appointments", 
      "inventory",
      "stockMovements",
      "portfolio",
      "payments"
    ]
    
    let totalUpdated = 0
    
    for (const collectionName of collections) {
      console.log(`Migrando coleção: ${collectionName}`)
      const snapshot = await getDocs(collection(db, collectionName))
      let collectionUpdated = 0
      
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data()
        
        // Se não tem userId, adicionar o userId atual
        if (!data.userId) {
          await updateDoc(doc(db, collectionName, docSnapshot.id), {
            userId: userId,
            updatedAt: new Date()
          })
          collectionUpdated++
          totalUpdated++
        }
      }
      
      console.log(`✅ ${collectionName}: ${collectionUpdated} documentos atualizados`)
    }
    
    console.log(`🎉 Migração concluída! Total: ${totalUpdated} documentos atualizados`)
    
    return {
      success: true,
      totalUpdated,
      message: `${totalUpdated} registros foram associados ao seu usuário`
    }
    
  } catch (error) {
    console.error("Erro na migração:", error)
    return {
      success: false,
      error,
      message: "Erro ao migrar dados para o usuário"
    }
  }
}

// Função para verificar quantos dados não têm userId
export async function checkUnassignedData() {
  try {
    const collections = [
      "clients",
      "appointments", 
      "inventory",
      "stockMovements",
      "portfolio",
      "payments"
    ]
    
    const results: Record<string, { total: number; unassigned: number }> = {}
    
    for (const collectionName of collections) {
      const snapshot = await getDocs(collection(db, collectionName))
      const total = snapshot.size
      let unassigned = 0
      
      snapshot.forEach((doc) => {
        if (!doc.data().userId) {
          unassigned++
        }
      })
      
      results[collectionName] = { total, unassigned }
    }
    
    return results
  } catch (error) {
    console.error("Erro ao verificar dados não atribuídos:", error)
    return null
  }
}
