"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Mail, Send, CheckCircle, XCircle, AlertCircle } from "lucide-react"

export function EmailTestComponent() {
  const [isLoading, setIsLoading] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [emailStatus, setEmailStatus] = useState<null | "success" | "error">(null)
  const { toast } = useToast()

  const testEmailConfiguration = async () => {
    if (!testEmail) {
      toast({
        title: "Email obrigatório",
        description: "Digite um email para testar o envio",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    setEmailStatus(null)

    try {
      const response = await fetch('/api/networking/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: "test-sender",
          recipientId: "test-recipient", 
          messageContent: "Esta é uma mensagem de teste do sistema de notificações do InkFlow.",
          testMode: true,
          testEmail: testEmail
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setEmailStatus("success")
        toast({
          title: "Email de teste enviado!",
          description: `Verifique a caixa de entrada de ${testEmail}`,
        })
      } else {
        setEmailStatus("error")
        toast({
          title: "Erro ao enviar email",
          description: result.error || "Verifique as configurações de email",
          variant: "destructive"
        })
      }
    } catch (error) {
      setEmailStatus("error")
      toast({
        title: "Erro de conexão",
        description: "Não foi possível testar o email. Verifique sua conexão.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = () => {
    switch (emailStatus) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Mail className="w-5 h-5" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Teste de Notificações por Email
        </CardTitle>
        <CardDescription>
          Teste se as configurações de email estão funcionando corretamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-email">Email para teste</Label>
          <Input
            id="test-email"
            type="email"
            placeholder="seu@email.com"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
          />
        </div>

        <Button 
          onClick={testEmailConfiguration}
          disabled={isLoading || !testEmail}
          className="w-full"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Enviar Email de Teste
            </>
          )}
        </Button>

        <div className="text-sm text-muted-foreground space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Para configurar o email:</p>
              <ol className="list-decimal list-inside space-y-1 mt-1">
                <li>Configure EMAIL_USER e EMAIL_PASS no arquivo .env.local</li>
                <li>Para Gmail, use uma senha de app específica</li>
                <li>Verifique se a verificação em duas etapas está ativada</li>
                <li>Teste o envio usando este formulário</li>
              </ol>
            </div>
          </div>
        </div>

        {emailStatus === "success" && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              ✅ Email enviado com sucesso! O sistema de notificações está funcionando.
            </p>
          </div>
        )}

        {emailStatus === "error" && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              ❌ Erro ao enviar email. Verifique as configurações no arquivo .env.local
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
