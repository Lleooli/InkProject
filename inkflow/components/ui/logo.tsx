"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
  textClassName?: string
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-8 h-8", 
  lg: "w-12 h-12"
}

const textSizeClasses = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl"
}

export function Logo({ size = "md", showText = true, className, textClassName }: LogoProps) {
  const { theme } = useTheme()
  
  // Usar logo dourada para tema escuro, logo normal para tema claro
  const logoSrc = theme === 'dark' ? '/logo-gold.svg' : '/logo.svg'
  
  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        <Image
          src={logoSrc}
          alt="InkFlow Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span className={cn(
          "font-bold text-primary tracking-tight",
          textSizeClasses[size],
          textClassName
        )}>
          InkFlow
        </span>
      )}
    </div>
  )
}
