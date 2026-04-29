import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ''
  if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
}

export function validateCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false
  const calc = (factor: number) => {
    let sum = 0
    for (let i = 0; i < factor - 1; i++) sum += parseInt(digits[i]) * (factor - i)
    const remainder = (sum * 10) % 11
    return remainder >= 10 ? 0 : remainder
  }
  return calc(10) === parseInt(digits[9]) && calc(11) === parseInt(digits[10])
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/** Formats typed digits into DD/MM/AAAA */
export function formatDateMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

/** Returns YYYY-MM-DD if valid DD/MM/AAAA, otherwise '' */
export function parseDateMask(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length !== 8) return ''
  const day = parseInt(digits.slice(0, 2))
  const month = parseInt(digits.slice(2, 4))
  const year = parseInt(digits.slice(4))
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) return ''
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return ''
  return format(new Date(value), 'dd/MM/yyyy')
}

export function friendlyError(err: unknown): string {
  if (!(err instanceof Error)) return 'Ocorreu um erro inesperado.'
  const msg = err.message.toLowerCase()
  if (msg.includes('unauthenticated') || msg.includes('unauthorized') || msg.includes('permissão'))
    return 'Você não tem permissão para esta ação.'
  if (msg.includes('already') && msg.includes('email'))
    return 'Este e-mail já está cadastrado.'
  if (msg.includes('not found'))
    return 'Registro não encontrado.'
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch'))
    return 'Erro de conexão. Verifique sua internet e tente novamente.'
  if (msg.includes('invalid credentials') || msg.includes('these credentials'))
    return 'E-mail ou senha inválidos.'
  if (msg.includes('validation'))
    return 'Verifique os dados preenchidos e tente novamente.'
  return err.message
}
