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
  Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"
import { useAuth } from "@/contexts/auth-context"

// Hook para clientes com filtragem por usuário
export function useClients() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setClients([])
      setLoading(false)
      return
    }

    // Consulta filtrando apenas por userId (sem orderBy para evitar índice composto)
    const q = query(collection(db, "clients"), where("userId", "==", user.uid))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      // Ordenar no cliente para evitar índice composto
      clientsData.sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
        return dateB.getTime() - dateA.getTime()
      })
      
      setClients(clientsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const addClient = async (clientData: any) => {
    if (!user) throw new Error("Usuário não autenticado")

    await addDoc(collection(db, "clients"), {
      ...clientData,
      userId: user.uid,
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

// Hook para agendamentos com filtragem por usuário
export function useAppointments() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setAppointments([])
      setLoading(false)
      return
    }

    const q = query(collection(db, "appointments"), where("userId", "==", user.uid))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appointmentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      // Ordenar no cliente por data
      appointmentsData.sort((a: any, b: any) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date || 0)
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date || 0)
        return dateA.getTime() - dateB.getTime()
      })
      
      setAppointments(appointmentsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const addAppointment = async (appointmentData: any) => {
    if (!user) throw new Error("Usuário não autenticado")

    await addDoc(collection(db, "appointments"), {
      ...appointmentData,
      userId: user.uid,
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

// Hook para portfólio com filtragem por usuário
export function usePortfolio() {
  const [portfolioItems, setPortfolioItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setPortfolioItems([])
      setLoading(false)
      return
    }

    const q = query(collection(db, "portfolio"), where("userId", "==", user.uid))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const portfolioData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      // Ordenar no cliente por data de criação
      portfolioData.sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
        return dateB.getTime() - dateA.getTime()
      })
      
      setPortfolioItems(portfolioData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const addPortfolioItem = async (itemData: any) => {
    if (!user) throw new Error("Usuário não autenticado")

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

// Hook para estoque com filtragem por usuário
export function useStock() {
  const [stockItems, setStockItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setStockItems([])
      setLoading(false)
      return
    }

    const q = query(collection(db, "inventory"), where("userId", "==", user.uid))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const stockData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      // Ordenar no cliente por nome
      stockData.sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""))
      
      setStockItems(stockData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const addStockItem = async (itemData: any) => {
    if (!user) throw new Error("Usuário não autenticado")

    await addDoc(collection(db, "inventory"), {
      ...itemData,
      userId: user.uid,
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

// Hook para movimentações de estoque com filtragem por usuário
export function useStockMovements() {
  const [movements, setMovements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setMovements([])
      setLoading(false)
      return
    }

    const q = query(collection(db, "stockMovements"), where("userId", "==", user.uid))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const movementsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      // Ordenar no cliente por data
      movementsData.sort((a: any, b: any) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date || 0)
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date || 0)
        return dateB.getTime() - dateA.getTime()
      })
      
      setMovements(movementsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const addMovement = async (movementData: any) => {
    if (!user) throw new Error("Usuário não autenticado")

    await addDoc(collection(db, "stockMovements"), {
      ...movementData,
      userId: user.uid,
      createdAt: Timestamp.now(),
    })
  }

  return { movements, loading, addMovement }
}

// Hook para pagamentos com filtragem por usuário
export function usePayments() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setPayments([])
      setLoading(false)
      return
    }

    const q = query(collection(db, "payments"), where("userId", "==", user.uid))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const paymentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      // Ordenar no cliente por data
      paymentsData.sort((a: any, b: any) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date || 0)
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date || 0)
        return dateB.getTime() - dateA.getTime()
      })
      
      setPayments(paymentsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const addPayment = async (paymentData: any) => {
    if (!user) throw new Error("Usuário não autenticado")

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

// Hook para orçamentos com filtragem por usuário
export function useQuotes() {
  const [quotes, setQuotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setQuotes([])
      setLoading(false)
      return
    }

    const q = query(collection(db, "quotes"), where("userId", "==", user.uid))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const quotesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      // Ordenar no cliente por data
      quotesData.sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
        return dateB.getTime() - dateA.getTime()
      })
      
      setQuotes(quotesData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const addQuote = async (quoteData: any) => {
    if (!user) throw new Error("Usuário não autenticado")

    const docRef = await addDoc(collection(db, "quotes"), {
      ...quoteData,
      userId: user.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    
    return { id: docRef.id, ...quoteData }
  }

  const updateQuote = async (quoteId: string, quoteData: any) => {
    await updateDoc(doc(db, "quotes", quoteId), {
      ...quoteData,
      updatedAt: Timestamp.now(),
    })
  }

  const deleteQuote = async (quoteId: string) => {
    await deleteDoc(doc(db, "quotes", quoteId))
  }

  return { quotes, loading, addQuote, updateQuote, deleteQuote }
}

// Hook para inventário (alias para estoque)
export function useInventory() {
  return useStock()
}

// Hook para cupons
export function useCoupons() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setCoupons([])
      setLoading(false)
      return
    }

    const q = query(collection(db, "coupons"), where("userId", "==", user.uid))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const couponsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      // Ordenar por data de criação
      couponsData.sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
        return dateB.getTime() - dateA.getTime()
      })
      
      setCoupons(couponsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const addCoupon = async (couponData: any) => {
    const docRef = await addDoc(collection(db, "coupons"), {
      ...couponData,
      userId: user?.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    
    return { id: docRef.id, ...couponData }
  }

  const updateCoupon = async (couponId: string, couponData: any) => {
    await updateDoc(doc(db, "coupons", couponId), {
      ...couponData,
      updatedAt: Timestamp.now(),
    })
  }

  const incrementCouponUsage = async (couponId: string) => {
    const couponRef = doc(db, "coupons", couponId)
    const coupon = coupons?.find(c => c.id === couponId)
    if (coupon) {
      await updateDoc(couponRef, {
        usageCount: (coupon.usageCount || 0) + 1,
        updatedAt: Timestamp.now(),
      })
    }
  }

  const deleteCoupon = async (couponId: string) => {
    await deleteDoc(doc(db, "coupons", couponId))
  }

  return { coupons, loading, addCoupon, updateCoupon, incrementCouponUsage, deleteCoupon }
}
