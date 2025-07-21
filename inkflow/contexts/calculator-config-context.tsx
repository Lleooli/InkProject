"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface ComplexityOption {
  id: string
  value: string
  label: string
  multiplier: number
}

export interface BodyPartOption {
  id: string
  value: string
  label: string
  multiplier: number
}

export interface MaterialCosts {
  needleCost: number
  inkCost: number
  gloveCost: number
  filmCost: number
  ointmentCost: number
  otherCosts: number
}

export interface CalculatorConfig {
  hourlyRate: number
  profitMargin: number
  materialCosts: MaterialCosts
  complexityOptions: ComplexityOption[]
  bodyPartOptions: BodyPartOption[]
}

interface CalculatorConfigContextType {
  config: CalculatorConfig
  updateConfig: (newConfig: Partial<CalculatorConfig>) => void
  addComplexityOption: (option: Omit<ComplexityOption, 'id'>) => void
  updateComplexityOption: (id: string, option: Partial<ComplexityOption>) => void
  removeComplexityOption: (id: string) => void
  addBodyPartOption: (option: Omit<BodyPartOption, 'id'>) => void
  updateBodyPartOption: (id: string, option: Partial<BodyPartOption>) => void
  removeBodyPartOption: (id: string) => void
  resetToDefaults: () => void
}

const defaultConfig: CalculatorConfig = {
  hourlyRate: 80,
  profitMargin: 30,
  materialCosts: {
    needleCost: 0.5,
    inkCost: 2,
    gloveCost: 5,
    filmCost: 0.3,
    ointmentCost: 0.8,
    otherCosts: 10,
  },
  complexityOptions: [
    { id: "1", value: "linhas-finas", label: "Linhas Finas", multiplier: 1.0 },
    { id: "2", value: "preenchimento", label: "Preenchimento", multiplier: 1.3 },
    { id: "3", value: "colorido", label: "Colorido", multiplier: 1.6 },
    { id: "4", value: "realismo", label: "Realismo", multiplier: 2.0 },
    { id: "5", value: "cobertura", label: "Cobertura", multiplier: 1.8 },
  ],
  bodyPartOptions: [
    { id: "1", value: "braco", label: "Braço", multiplier: 1.0 },
    { id: "2", value: "perna", label: "Perna", multiplier: 1.0 },
    { id: "3", value: "costas", label: "Costas", multiplier: 1.2 },
    { id: "4", value: "peito", label: "Peito", multiplier: 1.1 },
    { id: "5", value: "pescoco", label: "Pescoço", multiplier: 1.5 },
    { id: "6", value: "mao", label: "Mão", multiplier: 1.4 },
    { id: "7", value: "pe", label: "Pé", multiplier: 1.3 },
  ],
}

const CalculatorConfigContext = createContext<CalculatorConfigContextType | undefined>(undefined)

export function CalculatorConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<CalculatorConfig>(defaultConfig)

  // Carregar configurações do localStorage na inicialização
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('calculator-config')
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig))
      }
    } catch (error) {
      console.error('Erro ao carregar configurações da calculadora:', error)
    }
  }, [])

  // Salvar configurações no localStorage sempre que mudarem
  useEffect(() => {
    try {
      localStorage.setItem('calculator-config', JSON.stringify(config))
    } catch (error) {
      console.error('Erro ao salvar configurações da calculadora:', error)
    }
  }, [config])

  const updateConfig = (newConfig: Partial<CalculatorConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }))
  }

  const addComplexityOption = (option: Omit<ComplexityOption, 'id'>) => {
    const newId = Date.now().toString()
    setConfig(prev => ({
      ...prev,
      complexityOptions: [...prev.complexityOptions, { ...option, id: newId }]
    }))
  }

  const updateComplexityOption = (id: string, option: Partial<ComplexityOption>) => {
    setConfig(prev => ({
      ...prev,
      complexityOptions: prev.complexityOptions.map(item =>
        item.id === id ? { ...item, ...option } : item
      )
    }))
  }

  const removeComplexityOption = (id: string) => {
    setConfig(prev => ({
      ...prev,
      complexityOptions: prev.complexityOptions.filter(item => item.id !== id)
    }))
  }

  const addBodyPartOption = (option: Omit<BodyPartOption, 'id'>) => {
    const newId = Date.now().toString()
    setConfig(prev => ({
      ...prev,
      bodyPartOptions: [...prev.bodyPartOptions, { ...option, id: newId }]
    }))
  }

  const updateBodyPartOption = (id: string, option: Partial<BodyPartOption>) => {
    setConfig(prev => ({
      ...prev,
      bodyPartOptions: prev.bodyPartOptions.map(item =>
        item.id === id ? { ...item, ...option } : item
      )
    }))
  }

  const removeBodyPartOption = (id: string) => {
    setConfig(prev => ({
      ...prev,
      bodyPartOptions: prev.bodyPartOptions.filter(item => item.id !== id)
    }))
  }

  const resetToDefaults = () => {
    setConfig(defaultConfig)
  }

  return (
    <CalculatorConfigContext.Provider value={{
      config,
      updateConfig,
      addComplexityOption,
      updateComplexityOption,
      removeComplexityOption,
      addBodyPartOption,
      updateBodyPartOption,
      removeBodyPartOption,
      resetToDefaults,
    }}>
      {children}
    </CalculatorConfigContext.Provider>
  )
}

export function useCalculatorConfig() {
  const context = useContext(CalculatorConfigContext)
  if (context === undefined) {
    throw new Error('useCalculatorConfig deve ser usado dentro de um CalculatorConfigProvider')
  }
  return context
}
