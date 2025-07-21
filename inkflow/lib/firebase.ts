import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"
import { getStorage } from "firebase/storage"

/* --- Config ----- */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Verificar se todas as configurações estão presentes
if (typeof window !== "undefined") {
  const missingConfigs = Object.entries(firebaseConfig)
    .filter(([key, value]) => !value)
    .map(([key]) => key)
  
  if (missingConfigs.length > 0) {
    console.error("Configurações Firebase ausentes:", missingConfigs)
  }
}

/* --- Singleton App --- */
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig)

/* --- Services --- */
export const db = getFirestore(app)
export const storage = getStorage(app)

/*  
 | Auth só deve existir no client.
 | Nos Server Components ele será undefined - 
 | quem usar deve checar ou garantir "use client".
*/
export const auth: Auth | undefined = typeof window !== "undefined" ? getAuth(app) : undefined

export default app
