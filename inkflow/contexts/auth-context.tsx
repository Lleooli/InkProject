"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useRef } from "react"
import { type User, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import {
  generateSessionId,
  createSession,
  updateSessionActivity,
  terminateAllSessions,
  terminateSession,
  isSessionValid,
  onSessionsChange,
  type UserSession,
} from "@/lib/session-manager"

interface AuthContextType {
  user: User | null
  userProfile: any
  loading: boolean
  currentSessionId: string | null
  activeSessions: UserSession[]
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  logoutFromAllDevices: () => Promise<void>
  logoutFromDevice: (sessionId: string) => Promise<void>
  updateUserProfile: (data: any) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [activeSessions, setActiveSessions] = useState<UserSession[]>([])

  const activityTimerRef = useRef<NodeJS.Timeout>()
  const sessionValidationRef = useRef<NodeJS.Timeout>()

  // Atualizar atividade da sessão periodicamente
  useEffect(() => {
    if (currentSessionId && user) {
      // Atualizar atividade a cada 30 segundos
      activityTimerRef.current = setInterval(() => {
        updateSessionActivity(currentSessionId)
      }, 30000)

      // Verificar validade da sessão a cada minuto
      sessionValidationRef.current = setInterval(async () => {
        const isValid = await isSessionValid(currentSessionId)
        if (!isValid) {
          // Sessão foi encerrada remotamente, fazer logout local
          await handleRemoteLogout()
        }
      }, 60000)

      return () => {
        if (activityTimerRef.current) clearInterval(activityTimerRef.current)
        if (sessionValidationRef.current) clearInterval(sessionValidationRef.current)
      }
    }
  }, [currentSessionId, user])

  // Monitorar sessões ativas
  useEffect(() => {
    if (!user) return

    const unsubscribe = onSessionsChange(user.uid, (sessions) => {
      setActiveSessions(sessions)
    })

    return unsubscribe
  }, [user])

  // Logout remoto (quando sessão é encerrada de outro dispositivo)
  const handleRemoteLogout = async () => {
    if (activityTimerRef.current) clearInterval(activityTimerRef.current)
    if (sessionValidationRef.current) clearInterval(sessionValidationRef.current)

    setUser(null)
    setUserProfile(null)
    setCurrentSessionId(null)
    setActiveSessions([])

    // Não chamar signOut do Firebase para evitar conflitos
    // O usuário será redirecionado para login automaticamente
  }

  useEffect(() => {
    if (!auth) return

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Verificar se já temos uma sessão ativa
        if (!currentSessionId) {
          const sessionId = generateSessionId()
          setCurrentSessionId(sessionId)
          await createSession(user, sessionId)
        }

        // Buscar perfil do usuário no Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          setUserProfile(userDoc.data())
        } else {
          // Criar perfil inicial se não existir
          const initialProfile = {
            name: user.displayName || "",
            email: user.email || "",
            photoURL: user.photoURL || "",
            createdAt: new Date(),
            studio: "",
            phone: "",
            address: "",
            bio: "",
            instagram: "",
            website: "",
          }
          await setDoc(doc(db, "users", user.uid), initialProfile)
          setUserProfile(initialProfile)
        }
      } else {
        setUserProfile(null)
        setCurrentSessionId(null)
        setActiveSessions([])
      }

      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [currentSessionId])

  const signInWithGoogle = async () => {
    if (!auth) {
      throw new Error("Firebase auth não está disponível")
    }

    const provider = new GoogleAuthProvider()
    provider.addScope("email")
    provider.addScope("profile")

    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      // Criar nova sessão
      const sessionId = generateSessionId()
      setCurrentSessionId(sessionId)
      await createSession(user, sessionId)

      // Verificar se é o primeiro login e criar/atualizar perfil
      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName || "",
          email: user.email || "",
          photoURL: user.photoURL || "",
          createdAt: new Date(),
          studio: "",
          phone: "",
          address: "",
          bio: "",
          instagram: "",
          website: "",
        })
      }
    } catch (error) {
      console.error("Erro no login com Google:", error)
      throw error
    }
  }

  const logout = async () => {
    if (currentSessionId) {
      await terminateSession(currentSessionId)
    }

    if (activityTimerRef.current) clearInterval(activityTimerRef.current)
    if (sessionValidationRef.current) clearInterval(sessionValidationRef.current)

    if (auth) {
      await signOut(auth)
    }
  }

  const logoutFromAllDevices = async () => {
    if (!user) return

    // Encerrar todas as sessões
    await terminateAllSessions(user.uid)

    if (activityTimerRef.current) clearInterval(activityTimerRef.current)
    if (sessionValidationRef.current) clearInterval(sessionValidationRef.current)

    if (auth) {
      await signOut(auth)
    }
  }

  const logoutFromDevice = async (sessionId: string) => {
    await terminateSession(sessionId)
  }

  const updateUserProfile = async (data: any) => {
    if (!user) return

    await setDoc(
      doc(db, "users", user.uid),
      {
        ...userProfile,
        ...data,
        updatedAt: new Date(),
      },
      { merge: true },
    )

    setUserProfile({ ...userProfile, ...data })
  }

  const value = {
    user,
    userProfile,
    loading,
    currentSessionId,
    activeSessions,
    signInWithGoogle,
    logout,
    logoutFromAllDevices,
    logoutFromDevice,
    updateUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
