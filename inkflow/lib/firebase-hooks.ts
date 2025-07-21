"use client"

import { useState, useEffect } from "react"
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"
import { useAuth } from "@/contexts/auth-context"

// Hook para clientes
export function useClients() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Consulta simples sem índice composto
    const q = collection(db, "clients")

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setClients(clientsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const addClient = async (clientData: any) => {
    await addDoc(collection(db, "clients"), {
      ...clientData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
  }

  const updateClient = async (clientId: string, clientData: any) => {
    await updateDoc(doc(db, "clients", clientId), {
      ...clientData,
      updatedAt: Timestamp.now(),
    })
  }

  const deleteClient = async (clientId: string) => {
    await deleteDoc(doc(db, "clients", clientId))
  }

  return { clients, loading, addClient, updateClient, deleteClient }
}

// Hook para agendamentos
export function useAppointments() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Consulta simples sem índice composto
    const q = collection(db, "appointments")

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appointmentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setAppointments(appointmentsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const addAppointment = async (appointmentData: any) => {
    await addDoc(collection(db, "appointments"), {
      ...appointmentData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
  }

  const updateAppointment = async (appointmentId: string, appointmentData: any) => {
    await updateDoc(doc(db, "appointments", appointmentId), {
      ...appointmentData,
      updatedAt: Timestamp.now(),
    })
  }

  const deleteAppointment = async (appointmentId: string) => {
    await deleteDoc(doc(db, "appointments", appointmentId))
  }

  return { appointments, loading, addAppointment, updateAppointment, deleteAppointment }
}

// Hook para portfólio
export function usePortfolio() {
  const [portfolioItems, setPortfolioItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const q = query(collection(db, "portfolio"), where("userId", "==", user.uid), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const portfolioData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setPortfolioItems(portfolioData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const addPortfolioItem = async (itemData: any) => {
    if (!user) return

    await addDoc(collection(db, "portfolio"), {
      ...itemData,
      userId: user.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
  }

  const updatePortfolioItem = async (itemId: string, itemData: any) => {
    await updateDoc(doc(db, "portfolio", itemId), {
      ...itemData,
      updatedAt: Timestamp.now(),
    })
  }

  const deletePortfolioItem = async (itemId: string) => {
    await deleteDoc(doc(db, "portfolio", itemId))
  }

  return { portfolioItems, loading, addPortfolioItem, updatePortfolioItem, deletePortfolioItem }
}

// Hook para estoque
export function useStock() {
  const [stockItems, setStockItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const q = query(collection(db, "stock"), where("userId", "==", user.uid), orderBy("name", "asc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const stockData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setStockItems(stockData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const addStockItem = async (itemData: any) => {
    if (!user) return

    await addDoc(collection(db, "stock"), {
      ...itemData,
      userId: user.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
  }

  const updateStockItem = async (itemId: string, itemData: any) => {
    await updateDoc(doc(db, "stock", itemId), {
      ...itemData,
      updatedAt: Timestamp.now(),
    })
  }

  const deleteStockItem = async (itemId: string) => {
    await deleteDoc(doc(db, "stock", itemId))
  }

  return { stockItems, loading, addStockItem, updateStockItem, deleteStockItem }
}

// Hook para movimentações de estoque
export function useStockMovements() {
  const [movements, setMovements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const q = query(collection(db, "stockMovements"), where("userId", "==", user.uid), orderBy("date", "desc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const movementsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setMovements(movementsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const addMovement = async (movementData: any) => {
    if (!user) return

    await addDoc(collection(db, "stockMovements"), {
      ...movementData,
      userId: user.uid,
      createdAt: Timestamp.now(),
    })
  }

  return { movements, loading, addMovement }
}

// Hook para inventário (alias para estoque)
export function useInventory() {
  return useStock()
}

// Hook para pagamentos/ganhos
export function usePayments() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const q = query(collection(db, "payments"), where("userId", "==", user.uid), orderBy("date", "desc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const paymentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setPayments(paymentsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const addPayment = async (paymentData: any) => {
    if (!user) return

    await addDoc(collection(db, "payments"), {
      ...paymentData,
      userId: user.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
  }

  const updatePayment = async (paymentId: string, paymentData: any) => {
    await updateDoc(doc(db, "payments", paymentId), {
      ...paymentData,
      updatedAt: Timestamp.now(),
    })
  }

  const deletePayment = async (paymentId: string) => {
    await deleteDoc(doc(db, "payments", paymentId))
  }

  return { payments, loading, addPayment, updatePayment, deletePayment }
}
