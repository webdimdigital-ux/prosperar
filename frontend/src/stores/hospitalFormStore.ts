import { create } from 'zustand'

export interface HospitalFormFields {
  name: string
  cnpj: string
  address: string
  city: string
  state: string
  phone: string
  email: string
  status: string
  password: string
}

export type HospitalFormErrors = Partial<Record<keyof HospitalFormFields, string>>

interface HospitalFormStore {
  fields: HospitalFormFields
  errors: HospitalFormErrors
  editId: string | null
  isOpen: boolean
  setField: <K extends keyof HospitalFormFields>(key: K, value: HospitalFormFields[K]) => void
  open: (initial?: Partial<HospitalFormFields>, editId?: string | null) => void
  close: () => void
  validate: () => boolean
}

const empty: HospitalFormFields = {
  name: '',
  cnpj: '',
  address: '',
  city: '',
  state: '',
  phone: '',
  email: '',
  status: 'active',
  password: '',
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

function isValidCnpj(v: string) {
  return v.replace(/\D/g, '').length >= 14
}

export const useHospitalFormStore = create<HospitalFormStore>((set, get) => ({
  fields: { ...empty },
  errors: {},
  editId: null,
  isOpen: false,

  setField: (key, value) =>
    set(s => ({
      fields: { ...s.fields, [key]: value },
      errors: { ...s.errors, [key]: undefined },
    })),

  open: (initial = {}, editId = null) =>
    set({ isOpen: true, editId, fields: { ...empty, ...initial }, errors: {} }),

  close: () => set({ isOpen: false, editId: null, fields: { ...empty }, errors: {} }),

  validate: () => {
    const { fields, editId } = get()
    const errs: HospitalFormErrors = {}

    if (!fields.name.trim()) errs.name = 'Nome é obrigatório'
    if (!fields.cnpj.trim()) errs.cnpj = 'CNPJ é obrigatório'
    else if (!isValidCnpj(fields.cnpj)) errs.cnpj = 'CNPJ deve ter 14 dígitos'
    if (!fields.email.trim()) errs.email = 'E-mail é obrigatório (usado no login)'
    else if (!isValidEmail(fields.email)) errs.email = 'E-mail inválido'
    if (!editId && !fields.password.trim()) errs.password = 'Senha é obrigatória'
    else if (fields.password && fields.password.length < 6) errs.password = 'Mínimo 6 caracteres'

    set({ errors: errs })
    return Object.keys(errs).length === 0
  },
}))
