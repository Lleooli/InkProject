import { doc, setDoc, getDoc, deleteDoc, collection, query, where, getDocs, onSnapshot } from "firebase/firestore"
import { db } from "./firebase"
import type { User } from "firebase/auth"

export interface UserSession {
  id: string
  userId: string
  deviceInfo: {
    userAgent: string
    platform: string
    browser: string
    os: string
    isMobile: boolean
  }
  loginTime: Date
  lastActivity: Date
  ipAddress?: string
  location?: string
  isActive: boolean
}

// Gerar ID único para a sessão
export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Obter informações do dispositivo
export function getDeviceInfo() {
  const userAgent = navigator.userAgent
  const platform = navigator.platform

  // Detectar browser
  let browser = "Unknown"
  if (userAgent.includes("Chrome")) browser = "Chrome"
  else if (userAgent.includes("Firefox")) browser = "Firefox"
  else if (userAgent.includes("Safari")) browser = "Safari"
  else if (userAgent.includes("Edge")) browser = "Edge"

  // Detectar OS
  let os = "Unknown"
  if (platform.includes("Win")) os = "Windows"
  else if (platform.includes("Mac")) os = "macOS"
  else if (platform.includes("Linux")) os = "Linux"
  else if (userAgent.includes("Android")) os = "Android"
  else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) os = "iOS"

  // Detectar se é mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)

  return {
    userAgent,
    platform,
    browser,
    os,
    isMobile,
  }
}

// Criar nova sessão
export async function createSession(user: User, sessionId: string): Promise<void> {
  const deviceInfo = getDeviceInfo()

  const sessionData: UserSession = {
    id: sessionId,
    userId: user.uid,
    deviceInfo,
    loginTime: new Date(),
    lastActivity: new Date(),
    isActive: true,
  }

  await setDoc(doc(db, "userSessions", sessionId), sessionData)
}

// Atualizar atividade da sessão
export async function updateSessionActivity(sessionId: string): Promise<void> {
  const sessionRef = doc(db, "userSessions", sessionId)
  await setDoc(
    sessionRef,
    {
      lastActivity: new Date(),
      isActive: true,
    },
    { merge: true },
  )
}

// Obter todas as sessões ativas do usuário
export async function getUserActiveSessions(userId: string): Promise<UserSession[]> {
  const q = query(collection(db, "userSessions"), where("userId", "==", userId), where("isActive", "==", true))

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ ...doc.data() }) as UserSession)
}

// Encerrar sessão específica
export async function terminateSession(sessionId: string): Promise<void> {
  await deleteDoc(doc(db, "userSessions", sessionId))
}

// Encerrar todas as sessões do usuário (exceto a atual)
export async function terminateAllOtherSessions(userId: string, currentSessionId: string): Promise<void> {
  const sessions = await getUserActiveSessions(userId)

  const promises = sessions
    .filter((session) => session.id !== currentSessionId)
    .map((session) => terminateSession(session.id))

  await Promise.all(promises)
}

// Encerrar todas as sessões do usuário (incluindo a atual)
export async function terminateAllSessions(userId: string): Promise<void> {
  const sessions = await getUserActiveSessions(userId)

  const promises = sessions.map((session) => terminateSession(session.id))
  await Promise.all(promises)
}

// Verificar se a sessão ainda é válida
export async function isSessionValid(sessionId: string): Promise<boolean> {
  const sessionDoc = await getDoc(doc(db, "userSessions", sessionId))

  if (!sessionDoc.exists()) return false

  const session = sessionDoc.data() as UserSession
  return session.isActive
}

// Listener para mudanças nas sessões do usuário
export function onSessionsChange(userId: string, callback: (sessions: UserSession[]) => void) {
  const q = query(collection(db, "userSessions"), where("userId", "==", userId), where("isActive", "==", true))

  return onSnapshot(q, (snapshot) => {
    const sessions = snapshot.docs.map((doc) => ({ ...doc.data() }) as UserSession)
    callback(sessions)
  })
}
