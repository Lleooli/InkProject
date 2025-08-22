"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useInView } from "react-intersection-observer"
import CountUp from "react-countup"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/ui/logo"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { 
  Loader2, 
  Calendar,
  Users,
  Calculator,
  Package,
  MessageSquare,
  TrendingUp,
  Camera,
  Settings,
  Star,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Zap,
  Heart,
  Shield,
  Clock,
  DollarSign,
  Play,
  ChevronDown,
  Globe,
  Smartphone,
  BarChart3,
  Target,
  Rocket,
  Award,
  Eye,
  MousePointer
} from "lucide-react"

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showLanding, setShowLanding] = useState(true)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const { signInWithGoogle } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Intersection observer para animações
  const [heroRef, heroInView] = useInView({ threshold: 0.3, triggerOnce: true })
  const [featuresRef, featuresInView] = useInView({ threshold: 0.2, triggerOnce: true })
  const [benefitsRef, benefitsInView] = useInView({ threshold: 0.2, triggerOnce: true })
  const [statsRef, statsInView] = useInView({ threshold: 0.3, triggerOnce: true })

  // Animação do cursor
  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", updateMousePosition)
    return () => window.removeEventListener("mousemove", updateMousePosition)
  }, [])

  // Rotação automática dos depoimentos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleGoogleSignIn = async () => {
    setIsLoading(true)

    try {
      await signInWithGoogle()
      toast({
        title: "Login realizado!",
        description: "Bem-vindo ao InkFlow!",
      })
      router.push("/")
    } catch (error: any) {
      console.error("Erro no login:", error)
      toast({
        title: "Erro no login",
        description: "Não foi possível fazer login com Google. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    {
      icon: Calendar,
      title: "Agenda Inteligente",
      description: "Gerencie seus agendamentos com lembretes automáticos via WhatsApp",
      color: "from-blue-500 to-cyan-500",
      delay: 0.1
    },
    {
      icon: Users,
      title: "Gestão de Clientes",
      description: "Histórico completo, preferências e comunicação direta",
      color: "from-purple-500 to-pink-500",
      delay: 0.2
    },
    {
      icon: Calculator,
      title: "Calculadora de Orçamentos",
      description: "Preços personalizados baseados em tamanho, complexidade e estilo",
      color: "from-green-500 to-emerald-500",
      delay: 0.3
    },
    {
      icon: Package,
      title: "Controle de Estoque",
      description: "Monitore materiais e receba alertas de reposição",
      color: "from-orange-500 to-red-500",
      delay: 0.4
    },
    {
      icon: MessageSquare,
      title: "WhatsApp Bot 24/7",
      description: "Vendedor automático que nunca dorme, captura leads e agenda horários",
      color: "from-primary to-yellow-500",
      delay: 0.5
    },
    {
      icon: Camera,
      title: "Portfólio Digital",
      description: "Organize seus trabalhos e impressione novos clientes",
      color: "from-indigo-500 to-blue-500",
      delay: 0.6
    },
    {
      icon: TrendingUp,
      title: "Relatórios & Métricas",
      description: "Acompanhe ganhos, performance e crescimento do estúdio",
      color: "from-teal-500 to-green-500",
      delay: 0.7
    },
    {
      icon: Settings,
      title: "Configurações Avançadas",
      description: "Personalize templates, preços e automatizações",
      color: "from-gray-500 to-slate-500",
      delay: 0.8
    }
  ]

  const benefits = [
    {
      icon: Zap,
      title: "Aumente suas Vendas",
      description: "Bot do WhatsApp trabalha 24/7 capturando leads e convertendo em agendamentos",
      stat: "300%",
      statLabel: "Aumento médio",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: Clock,
      title: "Economize Tempo",
      description: "Automação de lembretes, orçamentos e follow-ups com clientes",
      stat: "80%",
      statLabel: "Menos tempo manual",
      color: "from-blue-400 to-purple-500"
    },
    {
      icon: DollarSign,
      title: "Maximize Lucros",
      description: "Precificação inteligente e controle total dos custos operacionais",
      stat: "45%",
      statLabel: "Aumento na margem",
      color: "from-green-400 to-emerald-500"
    },
    {
      icon: Heart,
      title: "Clientes Satisfeitos",
      description: "Experiência profissional desde o primeiro contato até o pós-venda",
      stat: "98%",
      statLabel: "Satisfação",
      color: "from-pink-400 to-red-500"
    }
  ]

  const testimonials = [
    {
      name: "Ricardo Silva",
      studio: "Black Ink Studio",
      rating: 5,
      text: "Triplicou meus agendamentos! O bot do WhatsApp funciona enquanto durmo.",
      avatar: "RS",
      location: "São Paulo, SP"
    },
    {
      name: "Ana Costa",
      studio: "Ink & Art",
      rating: 5,
      text: "Nunca mais perdi um cliente por demora na resposta. Sistema incrível!",
      avatar: "AC",
      location: "Rio de Janeiro, RJ"
    },
    {
      name: "Carlos Mendes",
      studio: "Steel Tattoo",
      rating: 5,
      text: "Organização total! Agenda, estoque, clientes... tudo em um lugar só.",
      avatar: "CM",
      location: "Belo Horizonte, MG"
    },
    {
      name: "Marina Santos",
      studio: "Art & Soul",
      rating: 5,
      text: "Meu faturamento dobrou em 3 meses. O sistema paga por si só!",
      avatar: "MS",
      location: "Curitiba, PR"
    }
  ]

  const stats = [
    { number: 500, suffix: "+", label: "Estúdios Ativos", icon: Award },
    { number: 50000, suffix: "+", label: "Agendamentos", icon: Calendar },
    { number: 95, suffix: "%", label: "Satisfação", icon: Heart },
    { number: 24, suffix: "/7", label: "Suporte", icon: Shield }
  ]

  // Animações
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  }

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const floatingAnimation = {
    y: [0, -20, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
  }

  if (!showLanding) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-background p-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md shadow-2xl border-2 border-primary/20">
            <CardHeader className="text-center space-y-4">
              <motion.div 
                className="mx-auto w-20 h-20 bg-primary rounded-full flex items-center justify-center p-4"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Logo size="lg" showText={false} />
              </motion.div>
              <div>
                <CardTitle className="text-3xl font-bold text-primary">InkFlow</CardTitle>
                <CardDescription className="text-lg mt-2">Assistente Completo para Tatuadores</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Bem-vindo de volta!</h3>
                <p className="text-muted-foreground">Acesse seu painel de controle.</p>
              </div>

              <Button 
                onClick={handleGoogleSignIn} 
                className="w-full h-12 text-base relative overflow-hidden group" 
                disabled={isLoading} 
                size="lg"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/40"
                  animate={{ x: [-100, 100] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Entrar com Google
              </Button>

              <div className="text-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowLanding(true)}
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  ← Voltar para página inicial
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground space-y-2">
                <p>
                  Ao continuar, você concorda com nossos{" "}
                  <a href="#" className="underline hover:text-primary">Termos de Uso</a>{" "}
                  e{" "}
                  <a href="#" className="underline hover:text-primary">Política de Privacidade</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Cursor animado */}
      <motion.div
        className="fixed w-6 h-6 bg-primary/20 rounded-full pointer-events-none z-50 mix-blend-difference"
        animate={{ x: mousePosition.x - 12, y: mousePosition.y - 12 }}
        transition={{ duration: 0.1 }}
      />

      {/* Partículas de fundo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/10 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: 0 
            }}
            animate={{ 
              y: [null, -100],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.header 
        className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div 
              className="w-10 h-10 bg-primary rounded-full flex items-center justify-center"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Logo size="sm" showText={false} />
            </motion.div>
            <span className="text-2xl font-bold text-primary">InkFlow</span>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={() => setShowLanding(false)} className="bg-primary hover:bg-primary/90">
              Fazer Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative py-20 px-4 text-center bg-gradient-to-br from-primary/5 via-background to-primary/10 overflow-hidden"
      >
        {/* Formas geométricas de fundo */}
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full"
          animate={floatingAnimation}
          transition={{ delay: 0 }}
        />
        <motion.div
          className="absolute top-40 right-20 w-16 h-16 bg-primary/5 rotate-45"
          animate={floatingAnimation}
          transition={{ delay: 1 }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-12 h-12 bg-primary/15 rounded-full"
          animate={floatingAnimation}
          transition={{ delay: 2 }}
        />

        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto"
            variants={staggerChildren}
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                <Sparkles className="mr-1 h-3 w-3" />
                Sistema Completo de Gestão
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
              variants={fadeInUp}
            >
              Transforme Seu Estúdio em uma{" "}
              <motion.span 
                className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                Máquina de Vendas
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
              variants={fadeInUp}
            >
              O <strong>InkFlow</strong> é o sistema completo que todo tatuador profissional precisa. 
              Gerencie clientes, agenda, estoque e tenha um vendedor automático no WhatsApp trabalhando 24/7.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
              variants={fadeInUp}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg h-14 relative overflow-hidden group"
                  onClick={() => setShowLanding(false)}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                    animate={{ x: [-100, 300] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  Começar Agora - Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
              <motion.div 
                className="flex items-center text-sm text-muted-foreground"
                whileHover={{ scale: 1.05 }}
              >
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Sem cartão de crédito
              </motion.div>
            </motion.div>
            
            {/* Stats animadas */}
            <motion.div 
              ref={statsRef}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
              variants={staggerChildren}
            >
              {stats.map((stat, index) => (
                <motion.div 
                  key={index}
                  className="text-center group"
                  variants={fadeInUp}
                  whileHover={{ scale: 1.1, y: -5 }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <stat.icon className="h-8 w-8 text-primary mb-2" />
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {statsInView && (
                      <CountUp
                        end={stat.number}
                        duration={2.5}
                        suffix={stat.suffix}
                      />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="h-6 w-6 text-primary" />
        </motion.div>
      </section>

      {/* Benefits Section */}
      <section 
        ref={benefitsRef}
        className="py-20 px-4 relative"
      >
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 60 }}
            animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              Por que Escolher o InkFlow?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Desenvolvido especificamente para tatuadores que querem profissionalizar e escalar seus negócios
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
            variants={staggerChildren}
            initial="hidden"
            animate={benefitsInView ? "visible" : "hidden"}
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 h-full hover:shadow-2xl transition-all border-2 hover:border-primary/20 group relative overflow-hidden">
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${benefit.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                  />
                  <div className="flex items-start space-x-4 relative z-10">
                    <motion.div 
                      className={`bg-gradient-to-br ${benefit.color} p-3 rounded-lg text-white`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <benefit.icon className="h-6 w-6" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {benefit.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">{benefit.description}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`text-2xl font-bold bg-gradient-to-r ${benefit.color} bg-clip-text text-transparent`}>
                          {benefit.stat}
                        </span>
                        <span className="text-sm text-muted-foreground">{benefit.statLabel}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        ref={featuresRef}
        className="py-20 px-4 bg-muted/30 relative"
      >
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 60 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              Todas as Ferramentas que Você Precisa
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Sistema completo e integrado para gerenciar cada aspecto do seu estúdio
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerChildren}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                custom={feature.delay}
                whileHover={{ scale: 1.05, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 h-full hover:shadow-2xl transition-all border-2 hover:border-primary/20 group relative overflow-hidden">
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  />
                  <div className="text-center relative z-10">
                    <motion.div 
                      className={`bg-gradient-to-br ${feature.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <feature.icon className="h-8 w-8" />
                    </motion.div>
                    <h3 className="text-lg font-semibold mb-3 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              O que Nossos Clientes Dizem
            </h2>
            <p className="text-xl text-muted-foreground">
              Tatuadores profissionais que transformaram seus estúdios com o InkFlow
            </p>
          </motion.div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
              >
                <Card className="p-8 hover:shadow-2xl transition-all border-2 border-primary/20">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-4">
                      {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        </motion.div>
                      ))}
                    </div>
                    <blockquote className="text-2xl font-medium mb-6 text-muted-foreground italic">
                      "{testimonials[currentTestimonial].text}"
                    </blockquote>
                    <div className="flex items-center justify-center space-x-4">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                        {testimonials[currentTestimonial].avatar}
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">{testimonials[currentTestimonial].name}</div>
                        <div className="text-sm text-muted-foreground">{testimonials[currentTestimonial].studio}</div>
                        <div className="text-xs text-muted-foreground">{testimonials[currentTestimonial].location}</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Indicators */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-primary' : 'bg-muted'
                  }`}
                  onClick={() => setCurrentTestimonial(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary to-primary/80 text-white relative overflow-hidden">
        {/* Elementos decorativos */}
        <motion.div
          className="absolute top-10 left-10 w-20 h-20 border-2 border-white/20 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-16 h-16 border-2 border-white/20"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Pronto para Revolucionar Seu Estúdio?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Junte-se a centenas de tatuadores que já transformaram seus negócios com o InkFlow
            </p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg h-14 relative overflow-hidden group"
                  onClick={() => setShowLanding(false)}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0"
                    animate={{ x: [-100, 300] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  Começar Gratuitamente
                  <Rocket className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>
            <motion.div 
              className="flex items-center justify-center text-sm opacity-75"
              whileHover={{ scale: 1.05 }}
            >
              <Shield className="mr-2 h-4 w-4" />
              Seus dados estão seguros e protegidos
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t bg-background">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="flex items-center justify-center space-x-2 mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div 
                className="w-8 h-8 bg-primary rounded-full flex items-center justify-center"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Logo size="sm" showText={false} />
              </motion.div>
              <span className="text-xl font-bold text-primary">InkFlow</span>
            </motion.div>
            <p className="text-muted-foreground mb-4">
              O sistema completo para tatuadores profissionais
            </p>
            <div className="text-sm text-muted-foreground space-x-4">
              <motion.a href="#" className="hover:text-primary transition-colors" whileHover={{ scale: 1.05 }}>
                Termos de Uso
              </motion.a>
              <span>•</span>
              <motion.a href="#" className="hover:text-primary transition-colors" whileHover={{ scale: 1.05 }}>
                Política de Privacidade
              </motion.a>
              <span>•</span>
              <motion.a href="#" className="hover:text-primary transition-colors" whileHover={{ scale: 1.05 }}>
                Suporte
              </motion.a>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}
