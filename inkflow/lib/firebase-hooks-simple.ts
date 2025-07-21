"use client"

import { useState, useEffect } from "react"
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"

// Hook simples para clientes (sem filtros complexos)
export function useClients() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "clients"), (snapshot) => {
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

// Hook simples para agendamentos
export function useAppointments() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "appointments"), (snapshot) => {
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

// Hook simples para portfólio
export function usePortfolio() {
  const [portfolioItems, setPortfolioItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "portfolio"), (snapshot) => {
      const portfolioData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setPortfolioItems(portfolioData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const addPortfolioItem = async (itemData: any) => {
    await addDoc(collection(db, "portfolio"), {
      ...itemData,
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

// Hook simples para estoque
export function useStock() {
  const [stockItems, setStockItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "inventory"), (snapshot) => {
      const stockData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setStockItems(stockData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const addStockItem = async (itemData: any) => {
    await addDoc(collection(db, "inventory"), {
      ...itemData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
  }

  const updateStockItem = async (itemId: string, itemData: any) => {
    await updateDoc(doc(db, "inventory", itemId), {
      ...itemData,
      updatedAt: Timestamp.now(),
    })
  }

  const deleteStockItem = async (itemId: string) => {
    await deleteDoc(doc(db, "inventory", itemId))
  }

  return { stockItems, loading, addStockItem, updateStockItem, deleteStockItem }
}

// Hook simples para movimentações de estoque
export function useStockMovements() {
  const [movements, setMovements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "stockMovements"), (snapshot) => {
      const movementsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setMovements(movementsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const addMovement = async (movementData: any) => {
    await addDoc(collection(db, "stockMovements"), {
      ...movementData,
      createdAt: Timestamp.now(),
    })
  }

  return { movements, loading, addMovement }
}

// Hook simples para pagamentos
export function usePayments() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "payments"), (snapshot) => {
      const paymentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setPayments(paymentsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const addPayment = async (paymentData: any) => {
    await addDoc(collection(db, "payments"), {
      ...paymentData,
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

// Hook para inventário (alias para estoque)
export function useInventory() {
  return useStock()
}
