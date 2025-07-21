"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Database, CheckCircle, AlertCircle, Play, User } from "lucide-react"
import { initializeFirestoreCollections, checkFirestoreCollections } from "@/lib/init-firestore"
import { migrateDataToUser, checkUnassignedData } from "@/lib/migrate-data"
import { useAuth } from "@/contexts/auth-context"

export default function InitFirestorePage() {
  const [loading, setLoading] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [checking, setChecking] = useState(false)
  const [status, setStatus] = useState<{
    success?: boolean
    message?: string
    collections?: Record<string, number>
    error?: any
  } | null>(null)
  const [collectionsStatus, setCollectionsStatus] = useState<Record<string, number> | null>(null)
  const [unassignedData, setUnassignedData] = useState<Record<string, { total: number; unassigned: number }> | null>(null)
  
  const { user } = useAuth()

  const handleInitializeFirestore = async () => {
    setLoading(true)
    setStatus(null)
    
    try {
      const result = await initializeFirestoreCollections()
      setStatus(result)
    } catch (error) {
      setStatus({
        success: false,
        error,
        message: "Erro inesperado ao inicializar Firestore"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckCollections = async () => {
    setChecking(true)
    try {
      const [collectionsResult, unassignedResult] = await Promise.all([
        checkFirestoreCollections(),
        checkUnassignedData()
      ])
      setCollectionsStatus(collectionsResult)
      setUnassignedData(unassignedResult)
    } catch (error) {
      console.error("Erro ao verificar coleções:", error)
      setCollectionsStatus(null)
      setUnassignedData(null)
    } finally {
      setChecking(false)
    }
  }

  const handleMigrateData = async () => {
    if (!user) {
      setStatus({
        success: false,
        message: "Usuário não autenticado. Faça login para migrar dados."
      })
      return
    }

    setMigrating(true)
    try {
      const result = await migrateDataToUser(user.uid)
      setStatus(result)
      // Atualizar status após migração
      handleCheckCollections()
    } catch (error) {
      setStatus({
        success: false,
        error,
        message: "Erro inesperado ao migrar dados"
      })
    } finally {
      setMigrating(false)
    }
  }

  const collections = [
    { key: "clients", name: "Clientes", description: "Informações dos clientes" },
    { key: "appointments", name: "Agendamentos", description: "Consultas e sessões marcadas" },
    { key: "inventory", name: "Estoque", description: "Itens e materiais" },
    { key: "stockMovements", name: "Movimentações", description: "Entrada e saída de estoque" },
    { key: "portfolio", name: "Portfólio", description: "Trabalhos realizados" },
    { key: "payments", name: "Pagamentos", description: "Transações financeiras" }
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Database className="h-8 w-8" />
          Inicialização do Firestore
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Esta página permite inicializar as coleções do Firebase Firestore com dados de exemplo 
          para testar todas as funcionalidades do sistema InkFlow.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Status das Coleções */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Status das Coleções
            </CardTitle>
            <CardDescription>
              Verifique quais coleções existem no Firestore
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleCheckCollections} 
              disabled={checking}
              variant="outline"
              className="w-full"
            >
              {checking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Verificar Coleções"
              )}
            </Button>

            {collectionsStatus && (
              <div className="space-y-2">
                {collections.map((collection) => (
                  <div key={collection.key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{collection.name}</p>
                      <p className="text-sm text-muted-foreground">{collection.description}</p>
                    </div>
                    <Badge variant={collectionsStatus[collection.key] > 0 ? "default" : "secondary"}>
                      {collectionsStatus[collection.key] || 0} items
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Migração de Dados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Migrar Dados
            </CardTitle>
            <CardDescription>
              Associe dados existentes ao seu usuário
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!user ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium">Login necessário</p>
                    <p>Você precisa estar logado para migrar dados.</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {unassignedData && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Dados não associados:</p>
                    {Object.entries(unassignedData).map(([key, data]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span>{collections.find(c => c.key === key)?.name || key}</span>
                        <span className={data.unassigned > 0 ? "text-orange-600" : "text-green-600"}>
                          {data.unassigned}/{data.total}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <Button 
                  onClick={handleMigrateData} 
                  disabled={migrating}
                  variant="outline"
                  className="w-full"
                >
                  {migrating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Migrando...
                    </>
                  ) : (
                    "Migrar Dados para Meu Usuário"
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Inicialização */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Inicializar Dados
            </CardTitle>
            <CardDescription>
              Crie dados de exemplo nas coleções do Firestore
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Atenção:</p>
                  <p>Esta ação irá adicionar dados de exemplo ao seu Firestore. Execute apenas uma vez.</p>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleInitializeFirestore} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Inicializando Firestore...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Inicializar Firestore
                </>
              )}
            </Button>

            {status && (
              <div className={`p-4 border rounded-lg ${
                status.success 
                  ? "bg-green-50 border-green-200" 
                  : "bg-red-50 border-red-200"
              }`}>
                <div className="flex items-start space-x-2">
                  {status.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className={`text-sm ${
                    status.success ? "text-green-800" : "text-red-800"
                  }`}>
                    <p className="font-medium">
                      {status.success ? "Sucesso!" : "Erro"}
                    </p>
                    <p>{status.message}</p>
                    {status.collections && (
                      <div className="mt-2">
                        <p className="font-medium">Dados criados:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          {Object.entries(status.collections).map(([key, count]) => (
                            <li key={key}>
                              {collections.find(c => c.key === key)?.name || key}: {count} registros
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Dados que serão criados</CardTitle>
          <CardDescription>
            Resumo dos dados de exemplo que serão adicionados ao Firestore
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">👥 Clientes (4 registros)</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Ana Silva - Ativo</li>
                <li>• Carlos Santos - Ativo</li>
                <li>• Maria Oliveira - Ativo</li>
                <li>• João Pedro - Inativo</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">📅 Agendamentos (4 registros)</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Hoje: Maria Oliveira</li>
                <li>• Amanhã: Ana Silva</li>
                <li>• Amanhã: Carlos Santos</li>
                <li>• 25/07: João Pedro</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">📦 Estoque (5 itens)</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Tintas e pigmentos</li>
                <li>• Agulhas e equipamentos</li>
                <li>• Material de higiene</li>
                <li>• Alguns com estoque baixo</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">🎨 Portfólio (3 trabalhos)</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Rosa Realista</li>
                <li>• Mandala Geométrica</li>
                <li>• Leão Tribal</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">💳 Pagamentos (3 registros)</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• R$ 250 - PIX</li>
                <li>• R$ 180 - Dinheiro</li>
                <li>• R$ 400 - Cartão (pendente)</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">📊 Movimentações (3 registros)</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Entrada de tinta preta</li>
                <li>• Saída de agulhas</li>
                <li>• Saída de luvas (zerou)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
