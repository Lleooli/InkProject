import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"
import { CalculatorConfigProvider } from "@/contexts/calculator-config-context"
import { ProtectedRoute } from "@/components/protected-route"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "InkFlow - Assistente Completo para Tatuadores",
  description: "Gerencie seu estúdio de tatuagem com facilidade",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <CalculatorConfigProvider>
              <ProtectedRoute>{children}</ProtectedRoute>
              <Toaster />
            </CalculatorConfigProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
