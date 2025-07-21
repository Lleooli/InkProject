/**
 * Utilitários para manipulação de datas com Firestore
 */

/**
 * Converte qualquer valor de data para um objeto Date válido
 * Lida com Timestamps do Firestore, objetos serializados e strings
 */
export function parseDate(dateValue: any): Date {
  if (!dateValue) return new Date()
  
  // Se é um Timestamp do Firestore
  if (dateValue && typeof dateValue.toDate === 'function') {
    return dateValue.toDate()
  }
  
  // Se é um objeto com seconds (Timestamp serializado)
  if (dateValue && typeof dateValue === 'object' && dateValue.seconds) {
    return new Date(dateValue.seconds * 1000)
  }
  
  // Se é uma string ou número, tenta converter
  const parsed = new Date(dateValue)
  if (!isNaN(parsed.getTime())) {
    return parsed
  }
  
  // Se nada funcionou, retorna a data atual
  console.warn('Data inválida recebida:', dateValue)
  return new Date()
}

/**
 * Verifica se uma data é válida
 */
export function isValidDate(date: any): boolean {
  try {
    const parsed = parseDate(date)
    return !isNaN(parsed.getTime())
  } catch {
    return false
  }
}
