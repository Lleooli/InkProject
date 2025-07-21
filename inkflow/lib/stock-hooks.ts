import { useState, useEffect } from 'react'
import { useStock } from './firebase-hooks-user'

export interface StockItem {
  id: string
  name: string
  category: string
  brand: string
  quantity: number
  unitPrice: number
  minStock: number
  maxStock: number
  supplier: string
  location: string
  description: string
  createdAt?: any
  updatedAt?: any
}

export function useStockItemsByCategory(category: string) {
  const { stockItems, loading } = useStock()
  const [filteredItems, setFilteredItems] = useState<StockItem[]>([])

  useEffect(() => {
    if (stockItems && category) {
      const filtered = stockItems.filter((item: StockItem) => 
        item.category === category && item.quantity > 0
      )
      setFilteredItems(filtered)
    } else {
      setFilteredItems([])
    }
  }, [stockItems, category])

  return { items: filteredItems, loading }
}

export function useAvailableNeedles() {
  const { stockItems, loading } = useStock()
  const [needles, setNeedles] = useState<StockItem[]>([])

  useEffect(() => {
    if (stockItems) {
      const availableNeedles = stockItems.filter((item: StockItem) => 
        item.category === 'agulhas' && item.quantity > 0
      )
      setNeedles(availableNeedles)
    }
  }, [stockItems])

  return { needles, loading }
}
