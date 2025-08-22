import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Smartphone, CheckCircle, QrCode } from "lucide-react";

interface QRCodeDisplayProps {
  isVisible: boolean;
  onConnect?: () => void;
}

export function QRCodeDisplay({ isVisible, onConnect }: QRCodeDisplayProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setQrCode(null);
      setConnected(false);
      return;
    }

    const checkQRCode = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get-qr' })
        });
        const result = await response.json();
        
        if (result.success && result.qrCode) {
          setQrCode(result.qrCode);
          setLoading(false);
        } else if (result.success && !result.qrCode) {
          // Verificar se já está conectado
          const statusResponse = await fetch('/api/whatsapp');
          const statusResult = await statusResponse.json();
          
          if (statusResult.running && !statusResult.qrCode) {
            setConnected(true);
            setLoading(false);
            onConnect?.();
          }
        }
      } catch (error) {
        console.error('Erro ao buscar QR Code:', error);
        setLoading(false);
      }
    };

    // Verificar QR Code imediatamente
    checkQRCode();

    // Verificar a cada 2 segundos
    const interval = setInterval(checkQRCode, 2000);

    return () => clearInterval(interval);
  }, [isVisible, onConnect]);

  if (!isVisible) return null;

  if (connected) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2 text-green-700">
            <CheckCircle className="h-8 w-8" />
            <div className="text-center">
              <h3 className="font-semibold text-lg">WhatsApp Conectado! 🎉</h3>
              <p className="text-sm">Seu bot está ativo e respondendo mensagens.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading || !qrCode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QrCode className="h-5 w-5" />
            <span>Conectando WhatsApp</span>
          </CardTitle>
          <CardDescription>Aguarde o QR Code ser gerado...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
              <p className="text-sm text-muted-foreground">
                Inicializando conexão com WhatsApp...
              </p>
              <Badge variant="outline">Aguarde</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Smartphone className="h-5 w-5" />
          <span>Escanear QR Code</span>
        </CardTitle>
        <CardDescription>
          Use seu WhatsApp para escanear o código abaixo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <img 
                src={qrCode} 
                alt="QR Code do WhatsApp"
                className="w-64 h-64"
              />
            </div>
          </div>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <h4 className="font-medium text-foreground">Como conectar:</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>Abra o WhatsApp no seu celular</li>
              <li>Vá em <strong>Menu (⋮)</strong> → <strong>Dispositivos conectados</strong></li>
              <li>Toque em <strong>"Conectar um dispositivo"</strong></li>
              <li>Escaneie o QR Code acima</li>
            </ol>
          </div>
          
          <div className="flex items-center justify-center">
            <Badge variant="secondary" className="animate-pulse">
              Aguardando conexão...
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
