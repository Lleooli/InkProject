"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { parseDate } from "@/lib/date-utils"
import {
  Monitor,
  Smartphone,
  Tablet,
  Chrome,
  ChromeIcon as Firefox,
  AppleIcon as Safari,
  Globe,
  LogOut,
  Shield,
  Clock,
  MapPin,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export function ActiveSessions() {
  const { activeSessions, currentSessionId, logoutFromDevice, logoutFromAllDevices } = useAuth()
  const { toast } = useToast()

  const getDeviceIcon = (deviceInfo: any) => {
    if (deviceInfo.isMobile) {
      return <Smartphone className="h-4 w-4" />
    }
    if (deviceInfo.platform?.includes("iPad")) {
      return <Tablet className="h-4 w-4" />
    }
    return <Monitor className="h-4 w-4" />
  }

  const getBrowserIcon = (browser: string) => {
    switch (browser.toLowerCase()) {
      case "chrome":
        return <Chrome className="h-4 w-4" />
      case "firefox":
        return <Firefox className="h-4 w-4" />
      case "safari":
        return <Safari className="h-4 w-4" />
      default:
        return <Globe className="h-4 w-4" />
    }
  }

  const handleLogoutDevice = async (sessionId: string) => {
    try {
      await logoutFromDevice(sessionId)
      toast({
        title: "Sessão encerrada",
        description: "O dispositivo foi desconectado com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível encerrar a sessão.",
        variant: "destructive",
      })
    }
  }

  const handleLogoutAllDevices = async () => {
    try {
      await logoutFromAllDevices()
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado de todos os dispositivos.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível fazer logout de todos os dispositivos.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Sessões Ativas</span>
            </CardTitle>
            <CardDescription>Gerencie os dispositivos conectados à sua conta</CardDescription>
          </div>
          {activeSessions.length > 1 && (
            <Button variant="destructive" size="sm" onClick={handleLogoutAllDevices}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair de Todos
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeSessions.map((session) => {
            const isCurrentSession = session.id === currentSessionId
            const lastActivity = parseDate(session.lastActivity)

            return (
              <div
                key={session.id}
                className={`p-4 border rounded-lg ${isCurrentSession ? "border-primary bg-primary/5" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center space-x-2">
                      {getDeviceIcon(session.deviceInfo)}
                      {getBrowserIcon(session.deviceInfo.browser)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">
                          {session.deviceInfo.browser} em {session.deviceInfo.os}
                        </h4>
                        {isCurrentSession && <Badge variant="default">Atual</Badge>}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            Última atividade:{" "}
                            {formatDistanceToNow(lastActivity, {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>
                          Login:{" "}
                          {formatDistanceToNow(parseDate(session.loginTime), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                        {session.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{session.location}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {session.deviceInfo.isMobile ? "Dispositivo móvel" : "Desktop"} • {session.deviceInfo.platform}
                      </div>
                    </div>
                  </div>
                  {!isCurrentSession && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLogoutDevice(session.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )
          })}

          {activeSessions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma sessão ativa encontrada</p>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-primary mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-medium">Dicas de Segurança</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Sempre faça logout de dispositivos públicos ou compartilhados</li>
                <li>• Se você não reconhece uma sessão, encerre-a imediatamente</li>
                <li>• Use "Sair de Todos" se suspeitar de acesso não autorizado</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
