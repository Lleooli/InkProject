"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Home,
  Calendar,
  Calculator,
  ImageIcon,
  TrendingUp,
  Users,
  Settings,
  Menu,
  X,
  Package,
  LogOut,
  User,
  Shield,
  Smartphone,
  Ticket,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, userProfile, logout, logoutFromAllDevices, activeSessions } = useAuth()
  const pathname = usePathname()
  
  const currentPage = pathname || "/"

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Agenda", href: "/agenda", icon: Calendar },
    { name: "Calculadora", href: "/calculadora", icon: Calculator },
    { name: "Portfólio", href: "/portfolio", icon: ImageIcon },
    { name: "Tendências", href: "/tendencias", icon: TrendingUp },
    { name: "Clientes", href: "/clientes", icon: Users },
    { name: "Estoque", href: "/estoque", icon: Package },
    { name: "Cupons", href: "/cupons", icon: Ticket },
    { name: "Configurações", href: "/configuracoes", icon: Settings },
    // Temporário - para inicialização do Firestore
    { name: "Inicializar DB", href: "/init-firestore", icon: Settings },
  ]

  const getPageTitle = () => {
    const route = navigation.find(item => item.href === currentPage)
    return route ? route.name : "Dashboard"
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  const handleLogoutAllDevices = async () => {
    try {
      await logoutFromAllDevices()
    } catch (error) {
      console.error("Erro ao fazer logout de todos os dispositivos:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", sidebarOpen ? "block" : "hidden")}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed left-0 top-0 h-full w-64 bg-card border-r">
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className="text-xl font-bold text-primary">InkFlow</h1>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = currentPage === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <Card className="flex flex-col flex-1 min-h-0 border-r rounded-none">
          <div className="flex items-center h-16 px-4 border-b">
            <h1 className="text-xl font-bold text-primary">InkFlow</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = currentPage === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <Button 
                    variant={isActive ? "secondary" : "ghost"} 
                    className="w-full justify-start"
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </Card>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <h2 className="text-lg font-semibold">{getPageTitle()}</h2>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6 ml-auto">
              {/* Indicador de sessões múltiplas */}
              {activeSessions.length > 1 && (
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Smartphone className="h-4 w-4" />
                  <span>{activeSessions.length} dispositivos</span>
                </div>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      {user?.photoURL ? (
                        <img
                          src={user.photoURL || "/placeholder.svg"}
                          alt={user.displayName || "Avatar"}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <AvatarFallback>
                          {user?.displayName
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "U"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.displayName || userProfile?.name || "Usuário"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      {activeSessions.length > 1 && (
                        <p className="text-xs leading-none text-primary">{activeSessions.length} sessões ativas</p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Sessões Ativas</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair deste dispositivo</span>
                  </DropdownMenuItem>
                  {activeSessions.length > 1 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Smartphone className="mr-2 h-4 w-4" />
                          <span>Sair de todos os dispositivos</span>
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Sair de todos os dispositivos?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação irá desconectar você de todos os dispositivos onde está logado, incluindo este.
                            Você precisará fazer login novamente em todos os dispositivos.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleLogoutAllDevices}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Sair de Todos
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
