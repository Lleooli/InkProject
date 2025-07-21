"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"

interface UserAvatarProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function UserAvatar({ size = "md", className = "" }: UserAvatarProps) {
  const { user } = useAuth()

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {user?.photoURL ? (
        <img
          src={user.photoURL || "/placeholder.svg"}
          alt={user.displayName || "Avatar"}
          className={`${sizeClasses[size]} rounded-full object-cover`}
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
  )
}
