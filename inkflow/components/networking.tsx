"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { 
  MessageCircle, 
  Send, 
  Heart, 
  MessageSquare, 
  User, 
  Users,
  Search,
  Plus,
  Image as ImageIcon,
  UserPlus
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  where,
  getDocs,
  getDoc
} from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Post {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  imageUrl?: string
  createdAt: any
  likes: string[]
  comments: Comment[]
}

interface Comment {
  id: string
  userId: string
  userName: string
  content: string
  createdAt: any
}

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  bio?: string
  specialties?: string[]
  allowPrivateMessages: boolean
}

interface PrivateMessage {
  id: string
  participants: string[]
  messages: Message[]
  lastMessage?: string
  lastMessageAt: any
}

interface Message {
  id: string
  senderId: string
  senderName: string
  content: string
  createdAt: any
}

export function Networking() {
  const { user, userProfile } = useAuth()
  const { toast } = useToast()
  const [posts, setPosts] = useState<Post[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [newPostContent, setNewPostContent] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("feed")
  const [commentInputs, setCommentInputs] = useState<{[key: string]: string}>({})
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [privateChats, setPrivateChats] = useState<PrivateMessage[]>([])
  const [activeChat, setActiveChat] = useState<PrivateMessage | null>(null)
  const [newMessage, setNewMessage] = useState("")

  // Carregar posts do feed
  useEffect(() => {
    const postsQuery = query(
      collection(db, "networkingPosts"),
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[]
      setPosts(postsData)
    })

    return () => unsubscribe()
  }, [])

  // Carregar usuários
  useEffect(() => {
    const loadUsers = async () => {
      try {
        // Primeiro, tentar carregar usuários reais do Firestore
        const usersQuery = query(collection(db, "users"))
        const snapshot = await getDocs(usersQuery)
        let usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as User[]
        
        // Se não houver usuários reais, criar dados de exemplo
        if (usersData.length === 0 || usersData.filter(u => u.id !== user?.uid).length === 0) {
          usersData = [
            {
              id: "exemplo1",
              name: "Maria Silva",
              email: "maria@exemplo.com",
              avatar: "",
              bio: "Tatuadora especializada em tatuagens delicadas e fineline. 5 anos de experiência no ramo.",
              specialties: ["Fineline", "Delicado", "Minimalista"],
              allowPrivateMessages: true
            },
            {
              id: "exemplo2", 
              name: "João Santos",
              email: "joao@exemplo.com",
              avatar: "",
              bio: "Especialista em realismo e retratos. Trabalho com técnicas tradicionais e modernas.",
              specialties: ["Realismo", "Retratos", "Preto e Cinza"],
              allowPrivateMessages: true
            },
            {
              id: "exemplo3",
              name: "Ana Costa",
              email: "ana@exemplo.com", 
              avatar: "",
              bio: "Old school e traditional tattoos. Apaixonada por designs clássicos americanos.",
              specialties: ["Old School", "Traditional", "Cores Vibrantes"],
              allowPrivateMessages: false
            },
            {
              id: "exemplo4",
              name: "Pedro Oliveira", 
              email: "pedro@exemplo.com",
              avatar: "",
              bio: "Blackwork e geometric designs. Criação de peças únicas e autorais.",
              specialties: ["Blackwork", "Geometric", "Pontilhismo"],
              allowPrivateMessages: true
            }
          ]
        }
        
        setUsers(usersData.filter(u => u.id !== user?.uid))
      } catch (error) {
        console.error("Erro ao carregar usuários:", error)
        // Em caso de erro, usar dados de exemplo
        const exampleUsers = [
          {
            id: "exemplo1",
            name: "Maria Silva",
            email: "maria@exemplo.com",
            avatar: "",
            bio: "Tatuadora especializada em tatuagens delicadas e fineline.",
            specialties: ["Fineline", "Delicado", "Minimalista"],
            allowPrivateMessages: true
          },
          {
            id: "exemplo2",
            name: "João Santos", 
            email: "joao@exemplo.com",
            avatar: "",
            bio: "Especialista em realismo e retratos.",
            specialties: ["Realismo", "Retratos"],
            allowPrivateMessages: true
          }
        ]
        setUsers(exampleUsers)
      }
    }

    if (user) {
      loadUsers()
    }
  }, [user])

  // Carregar chats privados
  useEffect(() => {
    if (!user) return

    const chatsQuery = query(
      collection(db, "privateChats"),
      where("participants", "array-contains", user.uid)
    )

    const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      const chatsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PrivateMessage[]
      setPrivateChats(chatsData)
    })

    return () => unsubscribe()
  }, [user])

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !user || !userProfile) return

    try {
      await addDoc(collection(db, "networkingPosts"), {
        userId: user.uid,
        userName: userProfile.displayName || user.email,
        userAvatar: userProfile.photoURL,
        content: newPostContent,
        createdAt: new Date(),
        likes: [],
        comments: []
      })
      setNewPostContent("")
    } catch (error) {
      console.error("Erro ao criar post:", error)
    }
  }

  const handleLikePost = async (postId: string) => {
    if (!user) return

    const postRef = doc(db, "networkingPosts", postId)
    const post = posts.find(p => p.id === postId)
    
    if (post?.likes.includes(user.uid)) {
      await updateDoc(postRef, {
        likes: arrayRemove(user.uid)
      })
    } else {
      await updateDoc(postRef, {
        likes: arrayUnion(user.uid)
      })
    }
  }

  const handleAddComment = async (postId: string) => {
    const commentText = commentInputs[postId]
    if (!commentText?.trim() || !user || !userProfile) return

    const newComment = {
      id: Date.now().toString(),
      userId: user.uid,
      userName: userProfile.displayName || user.email,
      content: commentText,
      createdAt: new Date()
    }

    const postRef = doc(db, "networkingPosts", postId)
    await updateDoc(postRef, {
      comments: arrayUnion(newComment)
    })

    setCommentInputs(prev => ({ ...prev, [postId]: "" }))
  }

  const handleStartPrivateChat = async (targetUser: User) => {
    if (!user || !userProfile) return

    try {
      // Verificar se já existe um chat entre os usuários
      const existingChat = privateChats.find(chat => 
        chat.participants.includes(targetUser.id)
      )

      if (existingChat) {
        setActiveChat(existingChat)
        setActiveTab("messages")
        toast({
          title: "Conversa encontrada",
          description: `Redirecionando para a conversa com ${targetUser.name}`,
        })
        return
      }

      // Criar novo chat
      const newChat = {
        participants: [user.uid, targetUser.id],
        messages: [],
        lastMessage: "",
        lastMessageAt: new Date()
      }

      const chatRef = await addDoc(collection(db, "privateChats"), newChat)
      const chatData = { id: chatRef.id, ...newChat } as PrivateMessage
      
      // Adicionar o novo chat à lista local para atualização imediata da UI
      setPrivateChats(prev => [...prev, chatData])
      setActiveChat(chatData)
      setActiveTab("messages")
      
      toast({
        title: "Conversa iniciada",
        description: `Você pode agora conversar com ${targetUser.name}`,
      })
    } catch (error) {
      console.error("Erro ao iniciar conversa:", error)
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a conversa. Tente novamente.",
        variant: "destructive"
      })
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !userProfile || !activeChat) return

    const message = {
      id: Date.now().toString(),
      senderId: user.uid,
      senderName: userProfile.displayName || user.email,
      content: newMessage,
      createdAt: new Date()
    }

    const chatRef = doc(db, "privateChats", activeChat.id)
    await updateDoc(chatRef, {
      messages: arrayUnion(message),
      lastMessage: newMessage,
      lastMessageAt: new Date()
    })

    setNewMessage("")
  }

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.specialties?.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const getOtherParticipant = (chat: PrivateMessage) => {
    if (!chat?.participants || !user?.uid) return null
    const otherUserId = chat.participants.find(id => id !== user.uid)
    return users.find(u => u.id === otherUserId) || null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Networking</h1>
        <Badge variant="secondary">
          <Users className="w-4 h-4 mr-1" />
          {users.length} Tatuadores
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="community">Comunidade</TabsTrigger>
          <TabsTrigger value="messages">Mensagens</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-6">
          {/* Criar novo post */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Compartilhar com a comunidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Compartilhe suas experiências, dicas ou trabalhos..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-between items-center">
                <Button variant="outline" size="sm">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Adicionar Imagem
                </Button>
                <Button onClick={handleCreatePost} disabled={!newPostContent.trim()}>
                  <Send className="w-4 h-4 mr-2" />
                  Publicar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Feed de posts */}
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar>
                      <AvatarImage src={post.userAvatar} />
                      <AvatarFallback>
                        {post.userName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{post.userName}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(post.createdAt?.toDate() || new Date(), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </span>
                      </div>
                      <p className="mt-2 text-foreground">{post.content}</p>
                    </div>
                  </div>

                  {post.imageUrl && (
                    <div className="mb-4">
                      <img 
                        src={post.imageUrl} 
                        alt="Post" 
                        className="w-full max-h-96 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-3 border-t">
                    <Button
                      variant={post.likes.includes(user?.uid || "") ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handleLikePost(post.id)}
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      {post.likes.length}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {post.comments.length}
                    </Button>
                  </div>

                  {/* Comentários */}
                  {post.comments.length > 0 && (
                    <div className="mt-4 space-y-3 border-t pt-3">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">
                              {comment.userName?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <span className="font-medium text-sm">{comment.userName}</span>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Adicionar comentário */}
                  <div className="flex gap-2 mt-3">
                    <Input
                      placeholder="Adicionar comentário..."
                      value={commentInputs[post.id] || ""}
                      onChange={(e) => setCommentInputs(prev => ({
                        ...prev,
                        [post.id]: e.target.value
                      }))}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleAddComment(post.id)
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleAddComment(post.id)}
                      disabled={!commentInputs[post.id]?.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="community" className="space-y-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tatuadores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{user.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.email}
                      </p>
                      {user.bio && (
                        <p className="text-sm mt-2 line-clamp-2">{user.bio}</p>
                      )}
                      {user.specialties && user.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {user.specialties.slice(0, 2).map((specialty, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                          {user.specialties.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{user.specialties.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <User className="w-4 h-4 mr-1" />
                          Ver Perfil
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Perfil de {user.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-16 h-16">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback className="text-lg">
                                {user.name?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-lg font-semibold">{user.name}</h3>
                              <p className="text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          {user.bio && (
                            <div>
                              <h4 className="font-medium mb-2">Sobre</h4>
                              <p className="text-sm">{user.bio}</p>
                            </div>
                          )}
                          {user.specialties && user.specialties.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Especialidades</h4>
                              <div className="flex flex-wrap gap-2">
                                {user.specialties.map((specialty, index) => (
                                  <Badge key={index} variant="outline">
                                    {specialty}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    {(user.allowPrivateMessages !== false) && (
                      <Button 
                        size="sm"
                        onClick={() => handleStartPrivateChat(user)}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Chat
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Lista de chats */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Conversas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {privateChats.map((chat) => {
                  const otherUser = getOtherParticipant(chat)
                  if (!otherUser) return null
                  
                  return (
                    <div
                      key={chat.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        activeChat?.id === chat.id ? "bg-primary/10" : "hover:bg-muted"
                      }`}
                      onClick={() => setActiveChat(chat)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={otherUser?.avatar} />
                          <AvatarFallback>
                            {otherUser?.name?.charAt(0)?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{otherUser?.name || "Usuário desconhecido"}</h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {chat.lastMessage || "Sem mensagens"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                }).filter(Boolean)}
                {privateChats.length === 0 && (
                  <div className="text-center text-muted-foreground py-8 space-y-2">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma conversa ainda</p>
                    <p className="text-xs">
                      Vá para a aba Comunidade e clique em "Chat" para iniciar uma conversa
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chat ativo */}
            <Card className="lg:col-span-2">
              {activeChat ? (
                <>
                  <CardHeader className="border-b">
                    <CardTitle className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={getOtherParticipant(activeChat)?.avatar} />
                        <AvatarFallback>
                          {getOtherParticipant(activeChat)?.name?.charAt(0)?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      {getOtherParticipant(activeChat)?.name || "Usuário desconhecido"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-96 overflow-y-auto p-4 space-y-3">
                      {activeChat.messages?.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.senderId === user?.uid ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                              message.senderId === user?.uid
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {message.createdAt && formatDistanceToNow(
                                message.createdAt?.toDate ? message.createdAt.toDate() : new Date(message.createdAt), {
                                addSuffix: true,
                                locale: ptBR
                              })}
                            </p>
                          </div>
                        </div>
                      )) || []}
                      {(!activeChat.messages || activeChat.messages.length === 0) && (
                        <div className="text-center text-muted-foreground py-8">
                          <p>Nenhuma mensagem ainda</p>
                          <p className="text-sm">Seja o primeiro a enviar uma mensagem!</p>
                        </div>
                      )}
                    </div>
                    <div className="border-t p-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Digite sua mensagem..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleSendMessage()
                            }
                          }}
                        />
                        <Button 
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Selecione uma conversa para começar
                  </p>
                </CardContent>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
